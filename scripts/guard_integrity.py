import os
import re
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
CANONICAL_CONFIG = "next.config.js"
STANDALONE_RE = re.compile(r"output\s*:\s*['\"]standalone['\"]")


def retirar_configs_residuales():
    for nombre in os.listdir(ROOT):
        if nombre == CANONICAL_CONFIG or not nombre.endswith("next.config.js"):
            continue
        ruta = os.path.join(ROOT, nombre)
        if os.path.isfile(ruta):
            os.remove(ruta)
            print(f"[BOT ANALIZADOR] Eliminado config residual: {nombre}")


def asegurar_standalone(config_path):
    if os.path.isfile(config_path):
        with open(config_path, "r", encoding="utf-8", errors="ignore") as handle:
            config_content = handle.read()
    else:
        config_content = "const nextConfig = {\n};\nmodule.exports = nextConfig;\n"

    if STANDALONE_RE.search(config_content):
        return

    linea = "  output: 'standalone',"
    if re.search(r"const\s+nextConfig\s*=\s*\{", config_content):
        config_content = re.sub(
            r"(const\s+nextConfig\s*=\s*\{)",
            r"\1\n" + linea,
            config_content,
            count=1,
        )
    elif re.search(r"module\.exports\s*=\s*\{", config_content):
        config_content = re.sub(
            r"(module\.exports\s*=\s*\{)",
            r"\1\n" + linea,
            config_content,
            count=1,
        )
    else:
        config_content = "const nextConfig = {\n  output: 'standalone',\n};\nmodule.exports = nextConfig;\n"

    with open(config_path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(config_content)
    print("[BOT ANALIZADOR] next.config.js auto-reparado con output: 'standalone'")


def check_file_integrity():
    errors = 0
    print("[BOT ANALIZADOR] Iniciando auditoria de integridad y contexto...")
    retirar_configs_residuales()
    asegurar_standalone(os.path.join(ROOT, CANONICAL_CONFIG))

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
