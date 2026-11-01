import os
import sys

FORBIDDEN_WORDS = ["tiara", "juguetes", "papeleria madera"]
FORBIDDEN_EXTERNAL_LINKS = ["mercadolibre.com", "articulo.mercadolibre", "wa.me"]
CRITICAL_FILES = [
    "context/CartContext.tsx",
    "components/CartDrawer.tsx",
    "app/checkout/page.tsx",
    "app/api/checkout/route.ts",
]
SCAN_DIRS = ["app/thetrip", "components/thetrip", "components/chat", "app/checkout"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def check_file_integrity():
    errors = 0
    print("[BOT ANALIZADOR] Iniciando auditoria de integridad y contexto...")
    config = os.path.join(ROOT, "next.config.js")
    if not os.path.exists(config):
        print("ERROR: Falta next.config.js")
        errors += 1
    else:
        with open(config, "r", encoding="utf-8", errors="ignore") as handle:
            contenido = handle.read().replace(" ", "")
            if "output:'standalone'" not in contenido and 'output:"standalone"' not in contenido:
                print("ERROR: next.config.js perdio output standalone.")
                errors += 1

    for path in CRITICAL_FILES:
        if not os.path.exists(os.path.join(ROOT, path)):
            print(f"ERROR: Archivo esencial faltante: {path}")
            errors += 1

    for scan_dir in SCAN_DIRS:
        base = os.path.join(ROOT, scan_dir)
        if not os.path.isdir(base):
            continue
        for root, _, files in os.walk(base):
            for file in files:
                if not file.endswith((".tsx", ".ts", ".js")):
                    continue
                full_path = os.path.join(root, file)
                with open(full_path, "r", encoding="utf-8", errors="ignore") as handle:
                    content = handle.read().lower()
                relativo = os.path.relpath(full_path, ROOT)
                for link in FORBIDDEN_EXTERNAL_LINKS:
                    if link in content:
                        print(f"FUGA DETECTADA: Enlace saliente '{link}' en {relativo}. Todo debe ir a /checkout.")
                        errors += 1
                for word in FORBIDDEN_WORDS:
                    if word in content:
                        print(f"CONTAMINACION DETECTADA: Palabra prohibida '{word}' en {relativo}.")
                        errors += 1

    if errors > 0:
        print(f"\n[BOT ANALIZADOR] Auditoria fallida ({errors} anomalias). Correccion requerida.")
        sys.exit(1)
    print("[BOT ANALIZADOR] Integridad verificada. Sin fugas a Mercado Libre ni regresiones de contexto.")


if __name__ == "__main__":
    check_file_integrity()
