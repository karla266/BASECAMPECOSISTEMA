import speech_recognition as sr
import pyttsx3
import requests

def hablar_en_bocina(texto):
    print(f"🤖 Tulio dice: {texto}")
    try:
        # Inicializar el motor DENTRO de la función evita que Windows trabe el audio tras varios usos
        engine = pyttsx3.init()
        engine.setProperty('rate', 160)
        engine.say(texto)
        engine.runAndWait()
        engine.stop()
    except Exception as e:
        print(f"⚠️ Error de bocina: {e}")

recognizer = sr.Recognizer()
recognizer.energy_threshold = 300
recognizer.dynamic_energy_threshold = True

# Índice 3 = Webcam Logitech C920
MIC_INDEX = 3

hablar_en_bocina("Cerebro Basecamp en línea. Asistente Tulio activado y listo para la tienda.")

while True:
    try:
        with sr.Microphone(device_index=MIC_INDEX) as source:
            print("\n🔊 Escuchando en la tienda... (Di 'Tulio')")
            recognizer.adjust_for_ambient_noise(source, duration=0.4)
            audio = recognizer.listen(source, timeout=6, phrase_time_limit=6)
            
            print("⏳ Transcribiendo voz...")
            texto_vendedor = recognizer.recognize_google(audio, language="es-MX").lower()
            print(f"🗣️ Vendedor dijo: '{texto_vendedor}'")

            palabras_clave = ["tulio", "oye", "cuanto", "cuantos", "precio", "hay", "quedan", "existencia"]
            
            if any(palabra in texto_vendedor for palabra in palabras_clave):
                print("🚀 Consultando a los 2 SICAR...")
                res = requests.post("http://localhost:3000/api/v1/asistente-local", json={"comando": texto_vendedor})
                respuesta_backend = res.json().get("respuesta", "Error de red.")
                
                hablar_en_bocina(respuesta_backend)

    except sr.WaitTimeoutError:
        pass
    except sr.UnknownValueError:
        print("❓ Ruido detectado, pero no se reconoció la frase.")
    except Exception as e:
        print(f"⚠️ Error de micrófono: {e}")
