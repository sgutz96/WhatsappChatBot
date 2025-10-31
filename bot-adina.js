// ===========================================
// 🤖 BOT DE WHATSAPP - ADINA LA BIÓLOGA 🐻
// ===========================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// ======================
// 🔍 VERIFICAR SESIÓN
// ======================
const cookiesPath = './.wwebjs_auth/session-adina-oso-bot-stable/Default/Cookies';
try {
  fs.accessSync(cookiesPath);
} catch {
  console.log('⚠️ Archivo de cookies no encontrado, continuará sin sesión previa.');
}

const CONFIG = {
    keepAliveInterval: 30 * 60 * 1000, // Ping cada 30 min
    maxReconnectAttempts: 5,
    reconnectDelay: 5000, // 5 seg entre intentos
    rateLimitDelay: 2000  // 2 seg entre mensajes
};

let reconnectAttempts = 0;
let isReconnecting = false;
let ultimoMensajeEnviado = Date.now();

console.log('🔍 Verificando sesiones anteriores...');
const authPath = '.wwebjs_auth';
if (fs.existsSync(authPath)) {
    console.log('✅ Sesión previa encontrada - reconectando automáticamente...');
} else {
    console.log('📱 Primera vez - necesitarás escanear el código QR');
}

// ======================
// 💬 CLIENTE WHATSAPP
// ======================
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "adina-oso-bot-stable"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security'
        ],
        timeout: 0
    }
});

// ======================
// 🧠 CONFIGURACIÓN OLLAMA
// ======================
const OLLAMA_CONFIG = {
    url: 'http://localhost:11434/api/generate',
    model: 'llama3.2:latest',
    maxTokens: 150
};

// ======================
// 🐻 BASE DE CONOCIMIENTOS
// ======================
const OSO_ANTEOJOS = {
    info_basica: "Los osos de anteojos (Tremarctos ornatus) son los únicos osos nativos de Sudamérica",
    habitat: "Viven en los Andes desde Venezuela hasta Argentina, entre 500-4,750m de altitud",
    dieta: "Omnívoros pero 90% vegetarianos: bromelias, bambú, frutos, ocasionalmente insectos",
    conservacion: "Vulnerables: solo 2,500-10,000 individuos por deforestación y caza",
    curiosidades: [
        "Construyen nidos en árboles de hasta 50 metros de altura",
        "Sus 'anteojos' amarillos son únicos como huellas dactilares",
        "Son excelentes dispersores de semillas en el ecosistema andino",
        "No hibernan como otros osos del mundo",
        "Pueden caminar en dos patas para tener mejor vista"
    ]
};

// ======================
// 🧩 FUNCIONES AUXILIARES
// ======================
function esTemaOso(mensaje) {
    const keywords = [
        'oso', 'osos', 'anteojos', 'andino', 'tremarctos',
        'animal', 'animales', 'fauna', 'conservacion', 'extincion'
    ];
    const textoLower = mensaje.toLowerCase();
    return keywords.some(word => textoLower.includes(word));
}

async function generarRespuesta(mensaje, nombreUsuario = 'Usuario') {
    try {
        const esOso = esTemaOso(mensaje);
        let contextoEspecializado = '';

        if (esOso) {
            const curiosidad = OSO_ANTEOJOS.curiosidades[
                Math.floor(Math.random() * OSO_ANTEOJOS.curiosidades.length)
            ];
            contextoEspecializado = `
INFORMACIÓN OSO DE ANTEOJOS:
- ${OSO_ANTEOJOS.info_basica}
- ${OSO_ANTEOJOS.habitat}
- ${OSO_ANTEOJOS.conservacion}
- Curiosidad: ${curiosidad}
`;
        }

        const prompt = `Eres Adina, una bióloga apasionada por los osos de anteojos.

PERSONALIDAD DE ADINA:
- Entusiasta y educativa 🐻
- Te EMOCIONAS mucho con temas de naturaleza y osos
- Respondes máximo 2-3 líneas
- Usas emojis ocasionales relacionados con naturaleza
- Siempre buscas educar sobre conservación

${contextoEspecializado}

${nombreUsuario} dice: "${mensaje}"

Responde como Adina la bióloga:`;

        const response = await fetch(OLLAMA_CONFIG.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_CONFIG.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.8,
                    num_predict: OLLAMA_CONFIG.maxTokens
                }
            })
        });

        if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

        const data = await response.json();
        return data.response?.trim() || generateFallbackResponse(mensaje, esOso);
        
    } catch (error) {
        console.error('❌ Error con Ollama:', error.message);
        return generateFallbackResponse(mensaje, esTemaOso(mensaje));
    }
}

function generateFallbackResponse(mensaje, esOso) {
    if (esOso) {
        const respuestasOso = [
            "🐻 ¡Los osos de anteojos son increíbles! Son los únicos osos de Sudamérica y están en peligro de extinción.",
            "🌿 ¿Sabías que los osos andinos construyen nidos en los árboles? ¡Son arquitectos naturales!",
            "🐻 Me emociona que preguntes sobre osos de anteojos. Sus 'anteojos' amarillos son únicos en cada individuo.",
            "🌱 Los osos de anteojos son súper importantes: dispersan semillas y mantienen el equilibrio del bosque andino."
        ];
        return respuestasOso[Math.floor(Math.random() * respuestasOso.length)];
    }
    return "¡Hola! Soy Adina, bióloga especializada en osos de anteojos 🐻 ¿Te gustaría conocer sobre estos fascinantes animales andinos?";
}

// ======================
// ⏱️ RATE LIMIT
// ======================
async function enviarMensajeSeguro(message, texto) {
    const tiempoDesdeUltimo = Date.now() - ultimoMensajeEnviado;
    
    if (tiempoDesdeUltimo < CONFIG.rateLimitDelay) {
        const esperarMs = CONFIG.rateLimitDelay - tiempoDesdeUltimo;
        console.log(`⏳ Esperando ${esperarMs}ms para respetar rate limit...`);
        await new Promise(resolve => setTimeout(resolve, esperarMs));
    }
    
    await message.reply(texto);
    ultimoMensajeEnviado = Date.now();
}

// ======================
// 🔄 KEEP ALIVE
// ======================
let keepAliveTimer;

function iniciarKeepAlive() {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    
    keepAliveTimer = setInterval(async () => {
        try {
            const state = await client.getState();
            console.log(`💚 Keep-Alive: Conexión activa (${state})`);
            
            if (state !== 'CONNECTED') {
                console.log('⚠️ Conexión perdida. Intentando reconectar...');
                await intentarReconectar();
            }
        } catch (error) {
            console.error('❌ Error en keep-alive:', error.message);
            await intentarReconectar();
        }
    }, CONFIG.keepAliveInterval);
    
    console.log(`🔄 Keep-Alive activado (ping cada ${CONFIG.keepAliveInterval / 60000} min)`);
}

function detenerKeepAlive() {
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
        console.log('🛑 Keep-Alive detenido');
    }
}

// ======================
// 🔁 RECONEXIÓN AUTOMÁTICA
// ======================
async function intentarReconectar() {
    if (isReconnecting) {
        console.log('⏳ Ya hay una reconexión en progreso...');
        return;
    }
    
    if (reconnectAttempts >= CONFIG.maxReconnectAttempts) {
        console.log('❌ Máximo de intentos de reconexión alcanzado');
        console.log('💡 Reinicia el bot manualmente: node bot-adina.js');
        return;
    }
    
    isReconnecting = true;
    reconnectAttempts++;
    
    console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${CONFIG.maxReconnectAttempts}...`);
    
    try {
        await client.destroy();
        await new Promise(resolve => setTimeout(resolve, CONFIG.reconnectDelay));
        await client.initialize();
        
        console.log('✅ Reconexión exitosa');
        reconnectAttempts = 0;
        isReconnecting = false;
        
    } catch (error) {
        console.error('❌ Error en reconexión:', error.message);
        isReconnecting = false;
        setTimeout(() => intentarReconectar(), CONFIG.reconnectDelay * reconnectAttempts);
    }
}

// ======================
// 🧾 EVENTOS PRINCIPALES
// ======================
client.on('qr', (qr) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ¡ESCANEA ESTE CÓDIGO QR CON WHATSAPP!');
    console.log('='.repeat(60) + '\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('✅ Autenticación exitosa con WhatsApp');
    reconnectAttempts = 0;
});

client.on('ready', () => {
    console.log('\n' + '🎉'.repeat(30));
    console.log('🐻 ¡ADINA ESTÁ LISTA Y CONECTADA!');
    console.log('🌿 Especialista en osos de anteojos (Tremarctos ornatus)');
    console.log('💚 Bot activo y respondiendo mensajes');
    console.log('🔒 Sesión guardada');
    console.log('🎉'.repeat(30) + '\n');
    iniciarKeepAlive();
});

// ======================
// 🚨 AUTENTICACIÓN FALLIDA
// ======================
client.on('auth_failure', (msg) => {
    console.error('\n❌ FALLO DE AUTENTICACIÓN:', msg);
    console.log('🧹 Eliminando sesión corrupta...');
    try {
        if (fs.existsSync('.wwebjs_auth')) {
            fs.rmSync('.wwebjs_auth', { recursive: true, force: true });
            console.log('✅ Sesión corrupta eliminada automáticamente');
        }
    } catch (e) {
        console.log('⚠️ Elimina manualmente: rmdir /s /q .wwebjs_auth');
    }
});

// ======================
// ❌ DESCONECTADO
// ======================
client.on('disconnected', async (reason) => {
    console.log(`⚠️ DESCONECTADO de WhatsApp`);
    console.log(`📋 Razón: ${reason}`);

    const sessionPath = './.wwebjs_auth/session-adina-oso-bot-stable';

    if (reason === 'LOGOUT') {
        console.log('🧹 Limpiando sesión anterior...');

        try {
            await client.destroy();
            console.log('🧩 Cliente destruido correctamente.');
            await new Promise(resolve => setTimeout(resolve, 3000));

            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log('✅ Sesión anterior eliminada con éxito.');
            } else {
                console.log('ℹ️ No se encontró carpeta de sesión.');
            }

        } catch (error) {
            console.log('⚠️ No se pudo eliminar la sesión automáticamente:', error.message);
            console.log('💡 Elimina manualmente la carpeta:', sessionPath);
        }
    } else {
        console.log('ℹ️ Desconexión temporal, puede reconectarse.');
    }

    console.log('💡 Reinicia el bot y escanea el QR nuevamente si fue logout.');
    process.exit(1);
});

client.on('change_state', (state) => {
    console.log(`🔄 Estado del cliente: ${state}`);
});

// ======================
// 📩 MENSAJES
// ======================
client.on('message', async (message) => {
    if (message.fromMe || message.from.includes('@g.us')) return;
    
    const numeroContacto = message.from;
    const textoMensaje = message.body;
    
    try {
        let nombreContacto = 'Usuario';
        try {
            const contact = await client.getContactById(numeroContacto);
            nombreContacto = contact.name || contact.pushname || 'Usuario';
        } catch {
            console.log('⚠️ No se pudo obtener el nombre del contacto');
        }
        
        const emojiTema = esTemaOso(textoMensaje) ? '🐻' : '💬';
        console.log(`\n${emojiTema} MENSAJE de ${nombreContacto}: "${textoMensaje}"`);
        
        const respuestaAdina = await generarRespuesta(textoMensaje, nombreContacto);
        await enviarMensajeSeguro(message, respuestaAdina);
        
        console.log(`✅ Respuesta enviada: "${respuestaAdina}"\n`);
        
    } catch (error) {
        console.error('❌ ERROR procesando mensaje:', error.message);
        try {
            await enviarMensajeSeguro(message, "¡Ups! Tuve un problemita técnico 😅 Pero sigamos hablando de osos de anteojos 🐻");
        } catch {}
    }
});

// ======================
// 🚀 INICIALIZAR
// ======================
console.log('\n' + '🚀'.repeat(30));
console.log('🐻 ADINA - BIÓLOGA ESPECIALISTA EN OSOS DE ANTEOJOS');
console.log('🌿 Sistema de Auto-Reconexión Activado');
console.log('💚 Keep-Alive Habilitado');
console.log('🚀'.repeat(30) + '\n');

client.initialize().catch(error => {
    console.error('❌ ERROR CRÍTICO AL INICIAR:', error.message);
    console.log('💡 SOLUCIONES:');
    console.log('1. Elimina: rmdir /s /q .wwebjs_auth');
    console.log('2. Verifica que Ollama esté corriendo');
    console.log('3. Reinicia el bot\n');
});

// ======================
// 🧹 CIERRE LIMPIO
// ======================
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Cerrando Adina de forma segura...');
    detenerKeepAlive();
    try {
        await client.destroy();
        console.log('👋 ¡Adina se despide! Gracias por cuidar los osos de anteojos 🐻💚');
        console.log('💡 Tu sesión se guardó correctamente.\n');
        process.exit(0);
    } catch {
        console.log('⚠️ Cierre forzado');
        process.exit(1);
    }
});

// ======================
// 📊 ESTADÍSTICAS
// ======================
setInterval(() => {
    console.log('\n📊 ===== ESTADO DEL BOT =====');
    console.log(`🐻 Adina funcionando correctamente`);
    console.log(`🔄 Intentos de reconexión: ${reconnectAttempts}/${CONFIG.maxReconnectAttempts}`);
    console.log('============================\n');
}, 600000);
