import os
import glob
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import yt_dlp

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

BLOQUE_CONVERSION = """
🏔️ BASECAMP 420 | GUÍAS DE ALTA MONTAÑA & ESCUELA DE VUELO LIBRE
📍 Orizaba & Fortín de las Flores, Veracruz, México.

👉 RESERVA TU EXPEDICIÓN AL PICO DE ORIZABA:
https://www.basecamp420.com/expediciones?utm_source=youtube&utm_medium=video_desc&utm_campaign=evergreen

🪂 VUELA EN PARAPENTE CON EL PIONERO SALVADOR LARA (33 AÑOS DE EXPERIENCIA):
https://www.basecamp420.com/parapentitis?utm_source=youtube&utm_medium=video_desc&utm_campaign=parapente

🛒 RENTA DE EQUIPO TÉCNICO Y PARAFERNALIA EN TIENDA FÍSICA:
https://www.basecamp420.com/thetrip

💼 MODERNIZA TU NEGOCIO CON NUESTRO PUNTO DE VENTA:
https://www.basecamp420.com/cimadigital

📞 Contacto directo / WhatsApp: +52 272 725 8748
--------------------------------------------------
"""

def resolver_client_secret():
    if os.path.exists("client_secret.json"):
        return "client_secret.json"
    candidatos = glob.glob("client_secret_*.json")
    if candidatos:
        return candidatos[0]
    raise FileNotFoundError("No se encontró client_secret.json ni client_secret_*.json en la raíz del proyecto.")

def autenticar_youtube():
    archivo_secret = resolver_client_secret()
    creds = None
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(archivo_secret, SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)
    return build("youtube", "v3", credentials=creds)

def actualizar_metadatos_canal():
    youtube = autenticar_youtube()
    canales = youtube.channels().list(mine=True, part="contentDetails").execute()
    uploads_id = canales["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    res = youtube.playlistItems().list(playlistId=uploads_id, part="snippet", maxResults=50).execute()
    actualizados = 0

    for item in res.get("items", []):
        video_id = item["snippet"]["resourceId"]["videoId"]
        titulo = item["snippet"]["title"]
        desc_actual = item["snippet"]["description"]

        if "BASECAMP 420" in desc_actual:
            print(f"[YA AL DÍA] {titulo}")
            continue

        nueva_desc = f"{BLOQUE_CONVERSION}\n\n{desc_actual}"
        youtube.videos().update(
            part="snippet",
            body={
                "id": video_id,
                "snippet": {
                    "title": titulo,
                    "description": nueva_desc,
                    "categoryId": item["snippet"].get("categoryId", "19")
                }
            }
        ).execute()
        print(f"[ACTUALIZADO] {titulo}")
        actualizados += 1

    print(f"\nFinalizado. Total de videos actualizados: {actualizados}")

def descargar_video_para_shorts(url_video):
    opciones = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': 'assets/raw_videos/%(id)s.%(ext)s',
        'noplaylist': True
    }
    with yt_dlp.YoutubeDL(opciones) as ydl:
        ydl.download([url_video])
    print("\n[OK] Video descargado en assets/raw_videos/")

if __name__ == "__main__":
    print("\n--- BASECAMP 420 | YOUTUBE MANAGER ---")
    print("1. Inyectar enlaces en descripciones")
    print("2. Descargar video para Shorts")
    opcion = input("Elige una opción (1 o 2): ").strip()

    if opcion == "1":
        actualizar_metadatos_canal()
    elif opcion == "2":
        url = input("Pega la URL del video de YouTube: ").strip()
        if url:
            descargar_video_para_shorts(url)
    else:
        print("Opción inválida.")
