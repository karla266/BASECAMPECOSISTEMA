import argparse
import json
import os
from pathlib import Path
from typing import Optional
from urllib import error, parse, request

GRAPH_ENDPOINT = "https://graph.facebook.com/v19.0/me/feed"
TREPACERROS_OUTPUT = Path(__file__).resolve().parent.parent / "docs" / "PENDIENTE_TREPACERROS.txt"

DEFAULT_PAGE_COPY = (
    "Basecamp 420 ya abrió agenda para vuelos tándem y cursos APPI con respaldo técnico.\n"
    "Reserva tu vuelo web directo por $1,600 MXN o valida tu certificado de Mercado Libre por $2,800 MXN.\n"
    "Conoce fechas de formación y modalidades de pago en https://www.basecamp420.com/explore"
)

DEFAULT_TREPACERROS_COPY = (
    "🏔️ Comunidad Trepacerros Orizaba 2.0\n\n"
    "Equipo: ya quedó activa la convocatoria para vuelos y formación APPI con Basecamp 420 + Salvador Lara.\n"
    "Hay modalidad de reserva web para vuelo tándem en $1,600 MXN y también canje con certificado físico Mercado Libre de $2,800 MXN.\n"
    "Para quienes quieren avanzar a ruta técnica, ya está publicado el esquema de cursos APPI 2026-2027.\n\n"
    "👉 Información completa: https://www.basecamp420.com/explore\n"
    "👉 Reserva de vuelo: https://www.basecamp420.com/calendario\n\n"
    "Si alguien quiere armar grupo de montaña + vuelo, lo coordinamos por aquí."
)


def publish_to_mco_page(message: str, link: Optional[str] = None) -> dict:
    """
    Publica copy en la página oficial de Movimiento Canábico Orizaba.
    Usa endpoint canónico /me/feed con token de página para evitar error #100 por ID global.
    """
    token = os.environ.get("MCO_PAGE_ACCESS_TOKEN", "").strip()
    if not token:
        raise RuntimeError("Falta variable de entorno MCO_PAGE_ACCESS_TOKEN.")

    payload = {
        "message": message,
        "access_token": token,
    }
    if link:
        payload["link"] = link

    encoded_payload = parse.urlencode(payload).encode("utf-8")
    req = request.Request(GRAPH_ENDPOINT, data=encoded_payload, method="POST")

    try:
        with request.urlopen(req, timeout=20) as response:
            body = response.read().decode("utf-8")
    except error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Error HTTP al publicar en Meta: {details}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"No fue posible conectar con Meta Graph API: {exc.reason}") from exc

    parsed_response = json.loads(body)
    if "error" in parsed_response:
        raise RuntimeError(f"Meta Graph API devolvió error: {parsed_response['error']}")

    return parsed_response


def dispatch_trepacerros(copy_text: str, output_path: Path = TREPACERROS_OUTPUT) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(copy_text.strip() + "\n", encoding="utf-8")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Autopublicación Basecamp 420")
    parser.add_argument(
        "--canal",
        required=True,
        choices=("pagina-mco", "grupo-trepacerros"),
        help="Canal objetivo de publicación.",
    )
    parser.add_argument("--mensaje", default="", help="Copy personalizado.")
    parser.add_argument("--link", default="", help="Enlace opcional para publicación en página.")
    args = parser.parse_args()

    if args.canal == "pagina-mco":
        message = args.mensaje.strip() or DEFAULT_PAGE_COPY
        result = publish_to_mco_page(message=message, link=args.link.strip() or None)
        print(f"Publicación enviada correctamente. Post ID: {result.get('id', 'N/A')}")
        return

    copy_text = args.mensaje.strip() or DEFAULT_TREPACERROS_COPY
    output_file = dispatch_trepacerros(copy_text=copy_text)
    print(f"Copy listo para grupo Trepacerros en: {output_file}")


if __name__ == "__main__":
    main()
