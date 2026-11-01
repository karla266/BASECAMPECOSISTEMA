"""Convierte una captura a WebP 1200 y actualiza solo imagen_url en SQLite."""

from __future__ import annotations

import json
import sqlite3
import sys
from io import BytesIO
from pathlib import Path


def convertir(destino: Path) -> None:
    from PIL import Image

    imagen = Image.open(BytesIO(sys.stdin.buffer.read())).convert("RGBA")
    lado = min(imagen.size)
    izquierda = (imagen.width - lado) // 2
    arriba = (imagen.height - lado) // 2
    recorte = imagen.crop((izquierda, arriba, izquierda + lado, arriba + lado))
    recorte = recorte.resize((1200, 1200), Image.Resampling.LANCZOS)
    fondo = Image.new("RGB", (1200, 1200), (255, 255, 255))
    fondo.paste(recorte, (0, 0), recorte)
    destino.parent.mkdir(parents=True, exist_ok=True)
    fondo.save(destino, "WEBP", quality=85, method=4)


def listar(db: Path) -> None:
    if not db.is_file():
        json.dump([], sys.stdout)
        return
    conn = sqlite3.connect(db)
    conn.row_factory = sqlite3.Row
    tablas = {fila[0] for fila in conn.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    if "catalogo_productos" not in tablas:
        json.dump([], sys.stdout)
        conn.close()
        return
    columnas = {fila[1] for fila in conn.execute("PRAGMA table_info(catalogo_productos)")}
    pedidas = ["sku", "nombre", "departamento", "categoria", "precio_compra", "precio_venta", "imagen_url"]
    seleccion = [nombre for nombre in pedidas if nombre in columnas]
    filas = [dict(fila) for fila in conn.execute(f"SELECT {', '.join(seleccion)} FROM catalogo_productos")]
    conn.close()
    json.dump(filas, sys.stdout, ensure_ascii=False)


def asignar(db: Path, sku: str, url: str) -> None:
    if not db.is_file():
        json.dump({"actualizado": False}, sys.stdout)
        return
    conn = sqlite3.connect(db)
    columnas = {fila[1] for fila in conn.execute("PRAGMA table_info(catalogo_productos)")}
    if "imagen_url" not in columnas or "sku" not in columnas:
        json.dump({"actualizado": False}, sys.stdout)
        conn.close()
        return
    cur = conn.execute(
        "UPDATE catalogo_productos SET imagen_url = ? WHERE sku = ? COLLATE NOCASE",
        (url, sku),
    )
    conn.commit()
    json.dump({"actualizado": cur.rowcount > 0}, sys.stdout)
    conn.close()


def main() -> int:
    accion = sys.argv[1]
    if accion == "convertir":
        convertir(Path(sys.argv[2]))
        return 0
    if accion == "listar":
        listar(Path(sys.argv[2]))
        return 0
    if accion == "asignar":
        asignar(Path(sys.argv[2]), sys.argv[3], sys.argv[4])
        return 0
    sys.stderr.write("accion desconocida\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
