import os
import json
import calendar
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

BANCO_MANANA = [
    {"tema": "Art. 16 Constitucional y Revisiones Arbitrarias", "tipo": "Legalidad"},
    {"tema": "Trámite Gratuito COFEPRIS y Negativa Ficta", "tipo": "Amparo"},
    {"tema": "Diferencia entre Posesión Simple y Suministro", "tipo": "Marco Penal"},
    {"tema": "El Modelo Tetecala y las Asambleas Comunitarias", "tipo": "Activismo"},
    {"tema": "El Caso Oaxaca y la Regulación Municipal en Parques", "tipo": "Vía Municipal"},
    {"tema": "Protocolo de Grabación en Video ante Servidores Públicos", "tipo": "Derechos"}
]

BANCO_TARDE = [
    {"tema": "Vidrio de Borosilicato Médico vs Metales Tóxicos", "tipo": "Cristalería"},
    {"tema": "Vaporización de Convección: Eficiencia Térmica", "tipo": "Tecnología"},
    {"tema": "Control de Olores con Bolsas de Carbón Activado", "tipo": "Accesorios"},
    {"tema": "Mantenimiento y Curado de Blunt Wraps Naturales", "tipo": "Parafernalia"},
    {"tema": "Grinders de Aluminio Anodizado de 4 Piezas", "tipo": "Herramientas"},
    {"tema": "Control de Humedad con Sobres Boveda 62%", "tipo": "Conservación"}
]

BANCO_NOCHE = [
    {"tema": "Vuelo Tándem en Fortín: Certificación APPI", "tipo": "Parapente"},
    {"tema": "Ascenso Seguro al Pico de Orizaba: Equipo Técnico", "tipo": "Senderismo"},
    {"tema": "Comunidad Basecamp: Punto de Encuentro y Café", "tipo": "Lifestyle"},
    {"tema": "Clima y Condiciones de Vuelo en las Altas Montañas", "tipo": "Aventura"},
    {"tema": "Red de Mensajería Local 'De Volada' y Entregas Discretas", "tipo": "Alianzas"}
]

def compilar_mes(anio=None, mes=None):
    ahora = datetime.now()
    anio = anio or ahora.year
    mes = mes or ahora.month
    
    _, dias_en_mes = calendar.monthrange(anio, mes)
    nombre_mes = calendar.month_name[mes]
    archivo_destino = os.path.join(DATA_DIR, f"cola_mensual_{anio}_{mes:02d}.json")

    publicaciones = []
    
    for dia in range(1, dias_en_mes + 1):
        fecha_str = f"{anio}-{mes:02d}-{dia:02d}"
        
        # Mañana (08:30)
        item_m = BANCO_MANANA[(dia - 1) % len(BANCO_MANANA)]
        publicaciones.append({
            "id": f"{fecha_str}_0830",
            "fecha": fecha_str,
            "hora": "08:30",
            "turno": "mañana",
            "pilar": "Movimiento Canabico Orizaba",
            "tema": item_m["tema"],
            "tipo": item_m["tipo"],
            "url_referencia": "https://www.Basecamp420.com",
            "telefono": "2727258748",
            "estado": "pendiente",
            "publicado_at": None
        })

        # Tarde (14:00)
        item_t = BANCO_TARDE[(dia - 1) % len(BANCO_TARDE)]
        publicaciones.append({
            "id": f"{fecha_str}_1400",
            "fecha": fecha_str,
            "hora": "14:00",
            "turno": "tarde",
            "pilar": "The Trip Smoke Shop",
            "tema": item_t["tema"],
            "tipo": item_t["tipo"],
            "url_referencia": "https://www.Basecamp420.com/thetrip",
            "telefono": "2727258748",
            "estado": "pendiente",
            "publicado_at": None
        })

        # Noche (20:30)
        item_n = BANCO_NOCHE[(dia - 1) % len(BANCO_NOCHE)]
        publicaciones.append({
            "id": f"{fecha_str}_2030",
            "fecha": fecha_str,
            "hora": "20:30",
            "turno": "noche",
            "pilar": "Basecamp 420 Aventura",
            "tema": item_n["tema"],
            "tipo": item_n["tipo"],
            "url_referencia": "https://www.Basecamp420.com/parapente",
            "telefono": "2727258748",
            "estado": "pendiente",
            "publicado_at": None
        })

    payload = {
        "anio": anio,
        "mes": mes,
        "total_dias": dias_en_mes,
        "total_publicaciones": len(publicaciones),
        "generado_el": ahora.isoformat(),
        "cola": publicaciones
    }

    with open(archivo_destino, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"[OK] Calendario para {nombre_mes} {anio} generado exitosamente.")
    print(f"[OK] Total: {len(publicaciones)} publicaciones creadas en: {archivo_destino}")

if __name__ == "__main__":
    compilar_mes()
