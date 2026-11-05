import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

def procesar_cola_activa():
    ahora = datetime.now()
    archivo_mes = os.path.join(DATA_DIR, f"cola_mensual_{ahora.year}_{ahora.month:02d}.json")
    
    if not os.path.exists(archivo_mes):
        print(f"[WARN] No hay calendario mensual activo para {ahora.year}-{ahora.month:02d}.")
        return

    with open(archivo_mes, "r", encoding="utf-8") as f:
        datos = json.load(f)

    hoy_str = ahora.strftime("%Y-%m-%d")
    hora_actual_minutos = ahora.hour * 60 + ahora.minute

    actualizados = 0
    for item in datos["cola"]:
        if item["fecha"] == hoy_str and item["estado"] == "pendiente":
            h_obj, m_obj = map(int, item["hora"].split(":"))
            hora_target_minutos = h_obj * 60 + m_obj

            if 0 <= (hora_actual_minutos - hora_target_minutos) <= 30:
                print(f"[PUBLICANDO] Disparando: [{item['pilar']}] {item['tema']}")
                item["estado"] = "publicado"
                item["publicado_at"] = ahora.isoformat()
                actualizados += 1

    if actualizados > 0:
        with open(archivo_mes, "w", encoding="utf-8") as f:
            json.dump(datos, f, indent=2, ensure_ascii=False)
        print(f"[INFO] {actualizados} post(s) marcados como publicados.")
    else:
        print("[INFO] Sin publicaciones pendientes en la ventana horaria actual.")

if __name__ == "__main__":
    procesar_cola_activa()
