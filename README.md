# 🐻 Adina — Bot Educativo de WhatsApp sobre el Oso de Anteojos

**Descripción**

Adina es un bot de WhatsApp creado con `whatsapp-web.js` y Ollama (modelo local) que responde como una bióloga conservacionista apasionada por el *Tremarctos ornatus* (oso de anteojos). Está diseñado para ofrecer respuestas cortas, amables y educativas, usando una base de conocimientos integrada sobre la especie.

---

## ✨ Características

* Respuestas en español, estilo "Adina" (bióloga apasionada).
* Contexto conversacional por usuario (historial limitado a los últimos 10 mensajes).
* Detección de temas relacionados con osos de anteojos para personalizar respuestas.
* Integración con Ollama (modelo local `llama3.2`).
* Almacenamiento temporal de conversaciones (se limpian cada 24 horas).
* Gestión de autenticación con `LocalAuth` para WhatsApp.

---

## 🧾 Requisitos previos

* Node.js **v18+** (se recomienda v18 o superior — Node debe incluir `fetch` nativo).\

  > Nota: si usas Node < 18, instala `node-fetch` o actualiza Node.
* npm (v8+ recomendado)
* Ollama (instalado y con permisos para descargar modelos)
* WhatsApp en un teléfono para escanear el QR
* Conexión a internet para instalar dependencias y para descargar el modelo la primera vez

---

## 📁 Estructura sugerida del proyecto

```
bot-adina/
├─ bot-adina.js           # Código principal del bot (archivo que compartiste)
├─ package.json
├─ package-lock.json
└─ README.md
```

---

## 🚀 Instalación rápida

Abre una terminal y crea el proyecto:

```bash
mkdir bot-adina
cd bot-adina
npm init -y
```

Instala dependencias necesarias:

```bash
npm install whatsapp-web.js qrcode-terminal puppeteer
```

> Si tu Node no incluye `fetch`, instala `node-fetch` y ajusta el `require`/import en `bot-adina.js`.

Copia tu archivo `bot-adina.js` (el código que compartiste) dentro de la carpeta del proyecto.

---

## 🧠 Configuración y uso de Ollama (modelo local)

1. Instala Ollama siguiendo las instrucciones oficiales ([https://ollama.ai](https://ollama.ai)).
2. Descarga el modelo que usarás (ejemplo `llama3.2`):

```bash
ollama pull llama3.2
```

3. Inicia el servidor de Ollama **antes** de ejecutar el bot:

```bash
ollama serve
```

Verás en consola una línea similar a:

```
time=... level=INFO msg="Listening on 127.0.0.1:11434"
```

4. En el archivo `bot-adina.js` asegúrate de que `OLLAMA_CONFIG.url` apunte a `http://localhost:11434/api/generate` y que `model` corresponda al nombre del modelo descargado (por ejemplo `llama3.2`).

---

## ▶️ Ejecutar Adina

Con Ollama corriendo (`ollama serve`) y estando en la carpeta del proyecto, ejecuta:

```bash
node bot-adina.js
```

Verás un QR en consola. Abre WhatsApp en tu teléfono → **Dispositivos vinculados** → **Vincular dispositivo** y escanea el QR.

En consola deberías ver mensajes como:

```
🐻 ¡Adina la Bióloga está lista para educar sobre osos de anteojos!
```

---

## 💬 Uso — ejemplos de mensajes

* "¿Dónde viven los osos de anteojos?"
* "Cuéntame una curiosidad sobre los osos andinos"
* "¿Están en peligro?"

Adina responderá con mensajes cortos (2–4 líneas), a veces incluyendo emojis y siempre con un enfoque conservacionista.

---

## 🔧 Configuración importante y recomendaciones

* **Node version**: recomendamos Node v18+ para usar `fetch` nativo. Si usas Node 14/16, instala `node-fetch`.
* **Puppeteer**: `whatsapp-web.js` puede necesitar `puppeteer` para emular el navegador. Si hay problemas en servidores Linux, revisa dependencias de Chrome/Chromium.
* **LocalAuth**: la carpeta de `LocalAuth` (por defecto `./.local-auth`) guardará credenciales para evitar re-escanear el QR.
* **Ollama**: si recibes errores 4xx/5xx al llamar a la API, confirma que `ollama serve` está corriendo y que el `model` existe.

---

## 🐞 Solución de problemas (troubleshooting)

* **No aparece el QR**: confirma permisos de Puppeteer y que no haya procesos previos bloqueando el navegador.
* **`auth_failure` en consola**: borra credenciales antiguas o revisa que el teléfono tenga conexión y no haya limitaciones en la cuenta.
* **Errores al conectar con Ollama**: verifica `ollama serve`, el puerto `11434` y el nombre del modelo (`llama3.2` exactamente).
* **Respuestas vacías o JSON inválido**: revisa que la petición al endpoint `/api/generate` sea correcta; en algunos entornos Ollama puede cambiar rutas o requerir auth.

---

## 🔐 Privacidad y seguridad

* Adina utiliza `LocalAuth` para mantener la sesión de WhatsApp localmente. No subas la carpeta de credenciales a repositorios públicos.
* Si vas a publicar el repo en GitHub, añade `.local-auth/` (o la carpeta donde LocalAuth guarde datos) a `.gitignore`.

Ejemplo de `.gitignore`:

```
.node_modules/
.local-auth/
.env
```

---

## 🧩 Mejoras y personalización sugeridas

* Añadir variables de entorno para `OLLAMA_CONFIG` en un `.env` (por ejemplo usar `dotenv`).
* Guardar historiales en una base de datos ligera (SQLite) si quieres persistencia más allá de 24 horas.
* Añadir tests unitarios para las funciones de detección (`detectarTemaOsoAnteojos`, `obtenerInfoRelevante`).
* Añadir manejo de streaming desde Ollama para respuestas más rápidas.

---

## 🤝 Contribuciones

Si quieres contribuir:

1. Haz fork del repositorio.
2. Crea una rama con tu feature: `git checkout -b feature/mi-cambio`.
3. Envía un PR con descripción clara de los cambios.

---

## 📜 Licencia

Este proyecto se publica bajo la licencia **MIT**. Puedes usarlo y adaptarlo libremente, pero por favor atribuye la fuente cuando sea posible.

---

## ✉️ Contacto

Si necesitas ayuda con la instalación o quieres que te prepare un `README.md` listo para subir a GitHub (o un ZIP del proyecto), dímelo y lo preparo.

¡Gracias por crear a Adina — la naturaleza te lo agradecerá! 🌿🐻
