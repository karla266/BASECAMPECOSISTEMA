import os
import json
import glob
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTARIO_PATH = os.path.join(BASE_DIR, "data", "inventario_thetrip.json")
FOTOS_DIR = r"C:\Proyectos\fotos_thetrip"
PUBLIC_UPLOADS = os.path.join(BASE_DIR, "public", "uploads")
os.makedirs(PUBLIC_UPLOADS, exist_ok=True)

def sanear_inventario():
    if not os.path.exists(INVENTARIO_PATH):
        print(f"[ERROR] No existe {INVENTARIO_PATH}")
        return

    with open(INVENTARIO_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    productos = data.get("productos", data) if isinstance(data, dict) else data

    precios_actualizados = 0
    fotos_actualizadas = 0

    for prod in productos:
        costo = float(prod.get("costo_interno") or 0)
        precio_actual = float(prod.get("precio_mxn") or 0)
        sku = str(prod.get("sku", "")).strip()
        sabor = str(prod.get("sabor", "")).strip().lower()
        nombre = str(prod.get("nombre", "")).strip().lower()

        # 1. Regla 3x (Margen 300%): Precio = Costo * 3
        if costo > 0:
            precio_3x = round(costo * 3.0, 2)
            if precio_actual < precio_3x:
                prod["precio_mxn"] = precio_3x
                precios_actualizados += 1

        # 2. Localizar y asociar imagen original en formato .webp
        # Busqueda recursiva por SKU, primer termino de sabor o nombre en C:\Proyectos
        termino_sabor = sabor.split("/")[0].strip() if "/" in sabor else sabor
        coincidencias = []
        if os.path.exists(FOTOS_DIR):
            coincidencias = (
                glob.glob(os.path.join(FOTOS_DIR, f"*{sku}*.webp")) or
                glob.glob(os.path.join(FOTOS_DIR, f"*{termino_sabor}*.webp")) or
                glob.glob(os.path.join(FOTOS_DIR, f"*{sku}*.png")) or
                glob.glob(os.path.join(FOTOS_DIR, "**", f"*{sku}*.webp"), recursive=True)
            )

        if coincidencias:
            archivo_origen = coincidencias[0]
            nombre_archivo = os.path.basename(archivo_origen)
            destino_local = os.path.join(PUBLIC_UPLOADS, nombre_archivo)
            
            # Copiar a public/uploads para preview local inmediato
            if not os.path.exists(destino_local):
                try:
                    shutil.copy2(archivo_origen, destino_local)
                except Exception:
                    pass
            
            ruta_publica = f"/uploads/{nombre_archivo}"
        else:
            # Ruta canonica limpia para servir desde shared_uploads
            nombre_limpio = sku.lower().replace("-", "_") + ".webp"
            ruta_publica = f"/uploads/{nombre_limpio}"

        # 3. Inyectar la propiedad exacta que consume CatalogoPreVenta.tsx: producto.imagenes?.[0]
        prod["imagenes"] = [ruta_publica]
        fotos_actualizadas += 1

    with open(INVENTARIO_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"[OK] Saneamiento completado en {INVENTARIO_PATH}:")
    print(f" -> {precios_actualizados} productos con precio 3x actualizado.")
    print(f" -> {fotos_actualizadas} productos con arreglo 'imagenes' inyectado.")

if __name__ == "__main__":
    sanear_inventario()
