import argparse
import json
import os
import subprocess
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import yt_dlp
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube.upload"]
ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "assets" / "youtube_suite"
TOKEN_FILE = ROOT / "token.youtube.json"


def tenant_defaults() -> Dict[str, str]:
    tenant_file = ROOT / "tenant.config.json"
    payload = json.loads(tenant_file.read_text(encoding="utf-8"))
    domain = payload["domain"]
    phone = payload["supportPhone"]
    reserve = f"https://{domain}/reservar?utm_source=youtube&utm_medium=description&utm_campaign=foreign_tourists"
    whatsapp = f"https://wa.me/{phone}?text=Hi%20I%20want%20to%20book%20a%20tandem%20flight%20in%20Fortin"
    return {"reserve_url": reserve, "whatsapp_url": whatsapp, "brand_name": payload["brandName"]}


def youtube_client():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            secrets_path = os.environ.get("GOOGLE_SECRETS", "").strip()
            if not secrets_path:
                raise RuntimeError("Define GOOGLE_SECRETS con el client_secret JSON de YouTube API.")
            flow = InstalledAppFlow.from_client_secrets_file(secrets_path, SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    return build("youtube", "v3", credentials=creds)


def conversion_block() -> str:
    t = tenant_defaults()
    return (
        f"🌎 Visiting Mexico? Fly tandem safely with {t['brand_name']} in Fortin de las Flores.\n"
        f"✅ Book now (USD/MXN): {t['reserve_url']}\n"
        f"📲 WhatsApp direct: {t['whatsapp_url']}\n"
        "Bring closed shoes, comfortable clothes, and keep max operational weight under 95kg.\n"
    )


def update_existing_video_metadata(video_ids: Iterable[str]) -> None:
    yt = youtube_client()
    block = conversion_block()
    for video_id in video_ids:
        response = yt.videos().list(part="snippet", id=video_id).execute()
        items = response.get("items", [])
        if not items:
            print(f"[SKIP] Video not found: {video_id}")
            continue
        snippet = items[0]["snippet"]
        description = snippet.get("description", "")
        title = snippet.get("title", "")
        funnel_title = title if "Book your tandem flight" in title else f"{title} | Book your tandem flight in Mexico"
        updated_description = f"{block}\n{description}".strip()
        yt.videos().update(
            part="snippet",
            body={
                "id": video_id,
                "snippet": {
                    "title": funnel_title,
                    "description": updated_description,
                    "categoryId": snippet.get("categoryId", "19"),
                },
            },
        ).execute()
        print(f"[UPDATED] {video_id}")


def download_video(video_url: str) -> Path:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    output_template = str(ASSETS_DIR / "%(id)s.%(ext)s")
    with yt_dlp.YoutubeDL(
        {
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": output_template,
            "noplaylist": True,
            "merge_output_format": "mp4",
        }
    ) as ydl:
        info = ydl.extract_info(video_url, download=True)
    return ASSETS_DIR / f"{info['id']}.mp4"


def build_short_916(source_file: Path, output_file: Path, overlay_text: str) -> Path:
    output_file.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg = os.environ.get("FFMPEG_BIN", "ffmpeg")
    filter_complex = (
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,"
        f"drawbox=x=0:y=1690:w=1080:h=230:color=black@0.45:t=fill,"
        f"drawtext=text='{overlay_text}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=1760"
    )
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(source_file),
        "-ss",
        "00:00:00",
        "-t",
        "45",
        "-vf",
        filter_complex,
        "-r",
        "30",
        str(output_file),
    ]
    subprocess.run(cmd, check=True)
    return output_file


def upload_video_with_pinned_comment(
    file_path: Path,
    title: str,
    description: str,
    tags: Optional[List[str]] = None,
    pinned_comment: Optional[str] = None,
) -> Dict[str, str]:
    yt = youtube_client()
    request = yt.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags or [],
                "categoryId": "19",
            },
            "status": {"privacyStatus": "public"},
        },
        media_body=MediaFileUpload(str(file_path), chunksize=-1, resumable=True),
    )

    response = None
    while response is None:
        _, response = request.next_chunk()

    video_id = response["id"]
    if pinned_comment:
        comment = (
            yt.commentThreads()
            .insert(
                part="snippet",
                body={
                    "snippet": {
                        "videoId": video_id,
                        "topLevelComment": {"snippet": {"textOriginal": pinned_comment}},
                    }
                },
            )
            .execute()
        )
        comment_id = comment["id"]
        yt.comments().setModerationStatus(id=comment_id, moderationStatus="published").execute()
    return {"video_id": video_id}


def parse_json_list(raw: str) -> List[str]:
    if not raw.strip():
        return []
    data = json.loads(raw)
    if not isinstance(data, list):
        raise RuntimeError("Expected JSON list.")
    return [str(item) for item in data]


def main() -> None:
    parser = argparse.ArgumentParser(description="Basecamp 420 YouTube Autopilot Suite")
    sub = parser.add_subparsers(dest="command", required=True)

    update_cmd = sub.add_parser("update-metadata", help="Mass update existing videos with conversion funnel.")
    update_cmd.add_argument("--video-ids-json", required=True, help='JSON array, e.g. ["abc123","def456"]')

    short_cmd = sub.add_parser("make-short", help="Create 9:16 short clip with bilingual conversion overlay.")
    short_cmd.add_argument("--video-url", required=True)
    short_cmd.add_argument("--overlay-text", default="Book now | Reserva ahora")
    short_cmd.add_argument("--output-file", default=str(ASSETS_DIR / "shorts" / "short_916.mp4"))

    upload_cmd = sub.add_parser("upload", help="Upload video and post pinned comment.")
    upload_cmd.add_argument("--video-file", default="")
    upload_cmd.add_argument("--video-id", default="")
    upload_cmd.add_argument("--title", required=True)
    upload_cmd.add_argument("--description", required=True)
    upload_cmd.add_argument("--tags-json", default='["paragliding mexico","tandem flight","fortin de las flores"]')
    upload_cmd.add_argument("--pinned-comment", required=True)

    args = parser.parse_args()

    if args.command == "update-metadata":
        update_existing_video_metadata(parse_json_list(args.video_ids_json))
        return

    if args.command == "make-short":
        source = download_video(args.video_url)
        output = build_short_916(source, Path(args.output_file), args.overlay_text)
        print(str(output))
        return

    if args.command == "upload":
        if args.video_file:
            source_file = Path(args.video_file)
        elif args.video_id:
            source_file = ASSETS_DIR / f"{args.video_id}.mp4"
        else:
            raise RuntimeError("Provide --video-file or --video-id.")
        if not source_file.exists():
            raise RuntimeError(f"Video file not found: {source_file}")
        result = upload_video_with_pinned_comment(
            source_file,
            title=args.title,
            description=args.description,
            tags=parse_json_list(args.tags_json),
            pinned_comment=args.pinned_comment,
        )
        print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
