import json
import os
import unicodedata
from decimal import Decimal, ROUND_HALF_UP

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INVENTARIO = os.path.join(ROOT, "data", "inventario_thetrip.json")
CATALOGO = os.path.join(ROOT, "data", "catalogo_the_trip.json")
SALIDA = os.path.join(ROOT, "data", "correcciones_pendientes.json")

TOKENS_BLUNT = ("blunt", "wrap", "papelillo")
TOKENS_PARAFERNALIA = (
    "parafernal",
    "cristaler",
    "pyrex",
    "vidrio",
    "bong",
    "pipa",
    "accesorio",
    "grinder",
    "moledor",
    "vaporiz",
    "dab",
    "bubbler",
    "cuarzo",
    "percol",
)


def normalizar(valor):
    texto = unicodedata.normalize("NFD", str(valor or ""))
    sin_acentos = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return " ".join(sin_acentos.lower().replace("_", " ").replace("-", " ").split())


def dinero(valor):
    return float(Decimal(str(valor)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def como_lista(data):
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict) and isinstance(data.get("productos"), list):
        return [item for item in data["productos"] if isinstance(item, dict)]
    return []


def leer_json(ruta):
    if not os.path.isfile(ruta):
        return []
    with open(ruta, "r", encoding="utf-8") as handle:
        return como_lista(json.load(handle))


def productos():
    vistos = {}
    for item in leer_json(INVENTARIO) + leer_json(CATALOGO):
        sku = str(item.get("sku") or "").strip()
        if not sku or sku in vistos:
            continue
        vistos[sku] = item
    return list(vistos.values())


def fotos_de(item):
    rutas = []
    for clave in ("imagenes", "images"):
        valor = item.get(clave)
        if isinstance(valor, list):
            rutas.extend(valor)
    media = item.get("media")
    if isinstance(media, dict) and isinstance(media.get("images"), list):
        rutas.extend(media["images"])
    for clave in ("imagen_url", "foto", "foto_actual"):
        if item.get(clave):
            rutas.append(item[clave])
    return [str(ruta).strip() for ruta in rutas if str(ruta or "").strip()]


def es_webp_transparente(ruta):
    limpia = normalizar(ruta)
    if not limpia.endswith(".webp"):
        return False
    return "blunts" in limpia or any(marca in limpia for marca in ("transparente", "transparent", "sin fondo", "cutout"))


def es_blunt(item):
    blob = normalizar(f"{item.get('nombre', '')} {item.get('categoria', '')}")
    return any(token in blob for token in TOKENS_BLUNT)


def es_parafernalia(item):
    blob = normalizar(
        " ".join(
            str(item.get(clave) or "")
            for clave in ("nombre", "categoria", "subcategoria", "departamento", "descripcion")
        )
    )
    return any(token in blob for token in TOKENS_PARAFERNALIA)


def numero(item, claves):
    for clave in claves:
        valor = item.get(clave)
        if valor is None or valor == "":
            continue
        try:
            return float(valor)
        except (TypeError, ValueError):
            continue
    return 0.0


def sku_archivo(sku):
    limpio = "".join(c if c.isalnum() or c in "._-" else "_" for c in sku.strip())
    return limpio or "producto"


def auditar():
    fotos = []
    precios = []
    for item in productos():
        sku = str(item.get("sku") or "").strip()
        nombre = str(item.get("nombre") or sku)
        if es_blunt(item):
            rutas = fotos_de(item)
            if not any(es_webp_transparente(ruta) for ruta in rutas):
                fotos.append(
                    {
                        "sku": sku,
                        "nombre": nombre,
                        "foto_actual": rutas[0] if rutas else "",
                        "problema": "Sin fotografía .webp con fondo transparente",
                        "foto_sugerida": f"/assets/productos/blunts/{sku_archivo(sku)}.webp",
                    }
                )
        if es_blunt(item) or not es_parafernalia(item):
            continue
        costo = numero(item, ("costo_interno", "costo", "costo_mxn"))
        if costo <= 0:
            continue
        precio = numero(item, ("precio_mxn", "precio", "precio_venta"))
        sugerido = dinero(Decimal(str(costo)) * 3)
        if precio < sugerido:
            precios.append(
                {
                    "sku": sku,
                    "nombre": nombre,
                    "costo": dinero(costo),
                    "precio_actual": dinero(precio),
                    "precio_sugerido": sugerido,
                }
            )
    fotos.sort(key=lambda fila: fila["sku"])
    precios.sort(key=lambda fila: fila["sku"])
    return {"fotos_blunts": fotos, "precios_3x": precios}


def main():
    reporte = auditar()
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(reporte, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(
        f"[AUDITORIA THETRIP] fotos_blunts={len(reporte['fotos_blunts'])} "
        f"precios_3x={len(reporte['precios_3x'])} -> {SALIDA}"
    )


if __name__ == "__main__":
    main()
