"""Sintesis local con edge-tts. Lee JSON por stdin y escribe un MP3."""

import asyncio
import json
import sys


def pausas(texto: str) -> str:
    partes = [parte.strip() for parte in texto.replace("\r", "").split("\n\n") if parte.strip()]
    return "\n\n".join(partes)


async def sintetizar(texto: str, voz: str, rate: str, pitch: str, salida: str) -> None:
    import edge_tts

    comunicador = edge_tts.Communicate(pausas(texto), voice=voz, rate=rate, pitch=pitch)
    await comunicador.save(salida)


def main() -> int:
    pedido = json.load(sys.stdin)
    try:
        asyncio.run(
            sintetizar(
                str(pedido["texto"]),
                str(pedido["voz"]),
                str(pedido.get("rate") or "+0%"),
                str(pedido.get("pitch") or "+0Hz"),
                str(pedido["salida"]),
            )
        )
    except ModuleNotFoundError:
        json.dump({"ok": False, "error": "Falta el paquete edge-tts. Instálalo con pip install edge-tts."}, sys.stdout)
        return 1
    except Exception as exc:
        json.dump({"ok": False, "error": f"edge-tts no pudo sintetizar: {exc}"}, sys.stdout)
        return 1
    json.dump({"ok": True}, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
