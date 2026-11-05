import json
import os
import re

json_path = os.path.join("data", "inventario_thetrip.json")
if not os.path.exists(json_path):
    print(f"No se encontro {json_path}")
    exit(1)

with open(json_path, "r", encoding="utf-8") as f:
    catalogo = json.load(f)

es_lista = isinstance(catalogo, list)
items = catalogo if es_lista else catalogo.get("productos", catalogo.get("items", []))

# Mapa de fotos individuales por sabor
mapa_fotos = {
    "chocolate": "/uploads/bluntwrapxxlblackchocolate21024x1024.webp",
    "berries": "/uploads/bluntwrapxxlblueberry31024x1024.webp",
    "mora": "/uploads/bluntwrapxxlblueberry31024x1024.webp",
    "crema batida": "/uploads/bluntwrapxxlwhippedcream11024x1024.webp",
    "whipped": "/uploads/bluntwrapxxlwhippedcream11024x1024.webp",
    "fresa kiwi": "/uploads/bluntwrapxxlstrawberrykiwi11024x1024.webp",
    "strawberry": "/uploads/bluntwrapxxlstrawberrykiwi11024x1024.webp",
    "frutas": "/uploads/bluntwrapxxlfruitpunch21024x1024.webp",
    "ponche": "/uploads/bluntwrapxxlfruitpunch21024x1024.webp",
    "punch": "/uploads/bluntwrapxxlfruitpunch21024x1024.webp",
    "uva": "/uploads/bluntwrapxxlgrape31024x1024.webp",
    "grape": "/uploads/bluntwrapxxlgrape31024x1024.webp",
    "kreepy": "/uploads/bluntwrapxxlkreepy31024x1024.webp",
    "mango": "/uploads/bluntwrapxxlmango31024x1024.webp",
    "melon": "/uploads/bluntwrapxxlmenlon33e77f445_fb38_434e_8980_459f0e9e0a641024x1024.webp",
    "pina": "/uploads/bluntwrapxxlpinapple31024x1024.webp",
    "piña": "/uploads/bluntwrapxxlpinapple31024x1024.webp",
    "pineapple": "/uploads/bluntwrapxxlpinapple31024x1024.webp",
    "zero": "/uploads/bluntwrapxxlzero31296x.webp",
    "natural": "/uploads/bluntwrapxxlzero31296x.webp"
}

def resolver_foto(nombre):
    nom = nombre.lower()
    for sabor, ruta in mapa_fotos.items():
        if sabor in nom:
            return ruta
    return "/uploads/img20240724201421955.webp"

blunts_a_30 = 0
triples_abajo = 0

for item in items:
    nombre = item.get("nombre", "")
    nom_lower = nombre.lower()
    
    # Caso 1: Blunts individuales -> Precio fijo $30
    if "sobre individual" in nom_lower or ("blunt" in nom_lower and "caja" not in nom_lower and "display" not in nom_lower and "preventa" not in nom_lower):
        item["precio"] = 30.0
        item["precio_venta"] = 30.0
        item["imagen"] = resolver_foto(nombre)
        blunts_a_30 += 1
        
    # Caso 2: Cajas, Displays y productos de abajo (Preventa) -> Margen triple (costo * 3)
    else:
        costo = float(item.get("costo") or item.get("costo_interno") or 0)
        if costo > 0:
            precio_triple = round(costo * 3, 2)
            item["precio"] = precio_triple
            item["precio_venta"] = precio_triple
            triples_abajo += 1
        item["imagen"] = resolver_foto(nombre)

    # Actualizar variantes internas si existen
    if "variantes" in item and isinstance(item["variantes"], list):
        for var in item["variantes"]:
            var_nom = var.get("nombre", var.get("sabor", ""))
            var["imagen"] = resolver_foto(var_nom)

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(catalogo, f, indent=2, ensure_ascii=False)

print(f"Listo: {blunts_a_30} blunts fijados en $30.00 | {triples_abajo} productos inferiores actualizados a margen triple.")
