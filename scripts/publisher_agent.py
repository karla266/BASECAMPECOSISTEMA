import os
import re

def leer_buffer_local_o_drive(filepath):
    """Lee el archivo de búfer y extrae las publicaciones estructuradas."""
    if not os.path.exists(filepath):
        print(f"No se encontró el archivo en la ruta: {filepath}")
        return []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        contenido = f.read()
        
    # Extraer bloques de publicaciones por día o semana
    semanas = contenido.split('## Semana')
    return semanas

def validar_enlaces_web_first(texto):
    """Garantiza que las llamadas a la acción apunten al ecosistema web y no a WhatsApp."""
    # Reemplaza cualquier enlace externo de chat por las rutas de conversión interna
    texto_optimizado = re.sub(r'https?://wa\.me/\d+', 'https://www.basecamp420.com/checkout', texto)
    return texto_optimizado

if __name__ == "__main__":
    ruta_buffer = "bufer_30_dias_basecamp420.md"
    datos_buffer = leer_buffer_local_o_drive(ruta_buffer)
    print(f"Búfer cargado correctamente. Se procesaron {len(datos_buffer)} secciones.")