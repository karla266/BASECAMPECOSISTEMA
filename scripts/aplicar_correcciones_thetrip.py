import os
import json
import glob

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOGO_PATH = os.path.join(BASE_DIR, "data", "catalogo_the_trip.json")
PENDIENTES_PATH = os.path.join(BASE_DIR, "data", "correcciones_pendientes.json")
FOTOS_DIR = r"C:\Proyectos\fotos_thetrip"

def aplicar_cambios():
    if not os.path.exists(CATALOGO_PATH):
        print(f"[ERROR] No se encontro el catalogo en {CATALOGO_PATH}")
        return

    with open(CATALOGO_PATH, 'r', encoding='utf-8') as f:
        catalogo = json.load(f)

    precios_actualizados = 0
    fotos_actualizadas = 0

    for prod in catalogo:
        nombre = prod.get("nombre", "").lower()
        sku = str(prod.get("articulo_id", prod.get("sku", "")))
        costo = float(prod.get("costo", 0))
        precio = float(prod.get("precio", 0))
        categoria = prod.get("categoria", "").lower()

        # 1. Aplicar Regla 3x en Parafernalia, Cristaleria y Accesorios
        if any(cat in categoria or cat in nombre for cat in ["cristaleria", "parafernalia", "otros", "wrap", "blunt"]):
            precio_3x = round(costo * 3.0, 2)
            if precio < precio_3x:
                prod["precio"] = precio_3x
                precios_actualizados += 1

        # 2. Corregir y forzar ruta WebP de Blunt Wraps
        if "blunt" in nombre or "wrap" in nombre:
            # Buscar coincidencia en carpeta local o asignar estandar webp
            fotos_locales = glob.glob(os.path.join(FOTOS_DIR, f"*{sku}*.webp"))
            if fotos_locales:
                nombre_archivo = os.path.basename(fotos_locales[0])
                prod["imagen"] = f"/uploads/{nombre_archivo}"
                fotos_actualizadas += 1
            elif not prod.get("imagen", "").endswith(".webp"):
                # Si no tiene .webp asignado, normalizar la referencia a webp
                slug = prod.get("slug", sku)
                prod["imagen"] = f"/uploads/blunt_{slug}.webp"
                fotos_actualizadas += 1

    # Guardar catalogo actualizado
    with open(CATALOGO_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, indent=2, ensure_ascii=False)

    # Vaciar o actualizar la cola de pendientes
    if os.path.exists(PENDIENTES_PATH):
        with open(PENDIENTES_PATH, 'w', encoding='utf-8') as f:
            json.dump({"fotos_blunts": [], "precios_3x": []}, f, indent=2)

    print(f"[OK] Catalogo saneado exitosamente:")
    print(f" - {precios_actualizados} productos actualizados con Margen 3x.")
    print(f" - {fotos_actualizadas} Blunt Wraps corregidos con formato .webp.")

if __name__ == "__main__":
    aplicar_cambios()
