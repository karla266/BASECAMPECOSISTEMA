import os
import json
import glob
import re
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTARIO_PATH = os.path.join(BASE_DIR, "data", "inventario_thetrip.json")
BLUNTS_DIR = r"C:\Proyectos\fotos_crudas\imagenes organizadas\blunts\BLUNT WRAP 2x DOUBLE PLATINUM"
DESTINO_UPLOADS = os.path.join(BASE_DIR, "public", "uploads")
os.makedirs(DESTINO_UPLOADS, exist_ok=True)

def normalizar(texto):
    texto = texto.lower()
    reemplazos = [('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u'), ('ñ', 'n'), ('—', ' '), ('-', ' ')]
    for a, b in reemplazos:
        texto = texto.replace(a, b)
    return re.sub(r'[^a-z0-9 ]', '', texto)

def procesar():
    if not os.path.exists(INVENTARIO_PATH):
        print(f"[ERROR] No existe {INVENTARIO_PATH}")
        return

    # 1. Recolectar todas las imagenes de Blunt Wrap 2X (priorizando fondo transparente)
    imagenes_origen = []
    for carpeta in ["FONDO TRANSPARENTE", "FONDO BLANCO", ""]:
        ruta_busqueda = os.path.join(BLUNTS_DIR, carpeta)
        if os.path.exists(ruta_busqueda):
            for ext in ["*.png", "*.webp", "*.jpg", "*.jpeg"]:
                imagenes_origen.extend(glob.glob(os.path.join(ruta_busqueda, ext)))

    # 2. Convertir cada imagen cruda a .webp dentro de public/uploads
    mapa_webp = {}
    for img_path in imagenes_origen:
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        slug_limpio = normalizar(base_name).replace(" ", "_")
        destino_webp = os.path.join(DESTINO_UPLOADS, f"{slug_limpio}.webp")

        if not os.path.exists(destino_webp):
            try:
                with Image.open(img_path) as im:
                    im.convert("RGBA").save(destino_webp, "WEBP", quality=85)
            except Exception as e:
                print(f"[WARN] Error convirtiendo {img_path}: {e}")
                continue

        mapa_webp[slug_limpio] = f"/uploads/{slug_limpio}.webp"

    print(f"[OK] {len(mapa_webp)} imagenes WebP generadas en {DESTINO_UPLOADS}")

    # 3. Leer inventario y aplicar Margen 3x + Asociar Imagenes
    with open(INVENTARIO_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    productos = data.get("productos", data) if isinstance(data, dict) else data

    precios_actualizados = 0
    fotos_asociadas = 0

    for prod in productos:
        costo = float(prod.get("costo_interno") or 0)
        precio_actual = float(prod.get("precio_mxn") or 0)
        sabor_norm = normalizar(prod.get("sabor", ""))
        nombre_norm = normalizar(prod.get("nombre", ""))
        sku_norm = normalizar(prod.get("sku", ""))

        # Margen 3x
        if costo > 0:
            precio_3x = round(costo * 3.0, 2)
            if precio_actual < precio_3x:
                prod["precio_mxn"] = precio_3x
                precios_actualizados += 1

        # Asociar imagen por coincidencia de palabras clave
        asignada = None
        palabras_clave = [p for p in sabor_norm.split() if len(p) > 2] + [p for p in sku_norm.split() if len(p) > 2]
        
        for slug, webp_url in mapa_webp.items():
            if any(palabra in slug for palabra in palabras_clave):
                asignada = webp_url
                break

        # Si no hubo coincidencia exacta de sabor, asignar la primera imagen generica de Blunt Wrap 2X
        if not asignada and mapa_webp:
            asignada = list(mapa_webp.values())[0]

        if asignada:
            prod["imagenes"] = [asignada]
            fotos_asociadas += 1

    with open(INVENTARIO_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[EXITO] Inventario procesado:")
    print(f" -> {precios_actualizados} productos actualizados con precio 3x.")
    print(f" -> {fotos_asociadas} productos con arreglo 'imagenes' enlazado a .webp.")

if __name__ == "__main__":
    procesar()
