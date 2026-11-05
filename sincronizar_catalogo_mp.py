import os
import re
import json
import urllib.request
import urllib.error

# 1. Leer automáticamente el token desde .env.production o .env.local
access_token = ""
archivos_env = [".env.production", ".env.local", ".env"]

for env_nombre in archivos_env:
    if os.path.exists(env_nombre):
        with open(env_nombre, "r", encoding="utf-8") as f:
            for linea in f:
                linea = linea.strip()
                if linea.startswith("MP_ACCESS_TOKEN="):
                    access_token = linea.split("=", 1)[1].strip("\"' ")
                    print(f"[+] Token detectado desde {env_nombre}")
                    break
    if access_token:
        break

if not access_token or "tu_access_token" in access_token:
    print("[!] ERROR: No se encontró un MP_ACCESS_TOKEN válido en .env.production ni en .env.local.")
    print("    Abre .env.production o .env.local y coloca tu Access Token real de Mercado Pago.")
    exit(1)

# 2. Catálogo de productos para la terminal táctil (Clave SICAR en 'id')
productos_sicar = [
    {"id": "BW-BUBBLE-01", "title": "Blunt Wrap Hemp Bubblegum", "unit_price": 35.00, "category_id": "others"},
    {"id": "BW-BERRIES-02", "title": "Blunt Wrap Berries", "unit_price": 35.00, "category_id": "others"},
    {"id": "TE-GRINDER-01", "title": "Grinder Tornasol Metal", "unit_price": 120.00, "category_id": "others"},
    {"id": "TE-CONO-NAT-01", "title": "Cono Papel Cáñamo Natural King Size", "unit_price": 45.00, "category_id": "others"}
]

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

print(f"\n[+] Iniciando sincronización de {len(productos_sicar)} productos hacia Mercado Pago...")

for prod in productos_sicar:
    url = "https://api.mercadopago.com/items"
    payload = json.dumps({
        "id": prod["id"],
        "title": prod["title"],
        "unit_price": float(prod["unit_price"]),
        "currency_id": "MXN",
        "category_id": prod["category_id"]
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f" [OK] Sincronizado en Terminal: {prod['title']} (SKU: {prod['id']})")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        print(f" [!] Error en {prod['title']} (HTTP {e.code}): {error_body}")
    except Exception as e:
        print(f" [!] Fallo de conexión en {prod['title']}: {e}")

print("\n Sincronización finalizada.")
print("Abre la app 'Punto de venta' en tu terminal Point Smart para ver los productos reflejados.")
