const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Crear cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Configuración de Ollama
const OLLAMA_CONFIG = {
    url: 'http://localhost:11434/api/generate',
    model: 'llama3.2',
    maxTokens: 250
};

// Base de conocimientos sobre el Oso de Anteojos
const CONOCIMIENTO_OSO_ANTEOJOS = {
    nombre_cientifico: "Tremarctos ornatus",
    nombres_comunes: ["Oso de anteojos", "Oso andino", "Oso frontino", "Ukumari", "Ukuku"],
    habitat: {
        region: "Andes de Sudamérica",
        paises: ["Venezuela", "Colombia", "Ecuador", "Perú", "Bolivia", "norte de Argentina"],
        ecosistemas: ["Bosques nublados", "Páramos", "Bosques secos", "Punas"],
        altitud: "500 a 4,750 metros sobre el nivel del mar"
    },
    caracteristicas_fisicas: {
        peso_macho: "100-200 kg",
        peso_hembra: "35-82 kg",
        longitud: "1.2-2 metros",
        pelaje: "Negro con manchas amarillas/cremas alrededor de los ojos y pecho",
        esperanza_vida: "20-25 años en vida silvestre, hasta 36 en cautiverio"
    },
    comportamiento: {
        actividad: "Principalmente diurno",
        tipo_social: "Solitario, excepto madres con crías",
        alimentacion: "Omnívoro con tendencia herbívora (90% vegetales)",
        hibernacion: "No hiberna"
    },
    alimentacion: {
        plantas: ["Bromelias", "Frutos de palma", "Bambú", "Orquídeas"],
        frutas: ["Aguacatillo", "Mortino", "Uvilla"],
        otros: ["Insectos", "Pequeños mamíferos", "Miel", "Corteza de árboles"]
    },
    reproduccion: {
        gestacion: "6-8 meses",
        crias_por_camada: "1-3 oseznos",
        edad_independencia: "8-10 meses",
        madurez_sexual: "4-7 años"
    },
    conservacion: {
        estado: "Vulnerable (UICN)",
        poblacion_estimada: "2,500-10,000 individuos",
        principales_amenazas: [
            "Deforestación y fragmentación del hábitat",
            "Conflicto con comunidades locales",
            "Caza ilegal",
            "Cambio climático",
            "Minería y expansión agrícola"
        ]
    },
    importancia_cultural: {
        mitologia: "Considerado sagrado por culturas andinas como los Incas",
        simbolismo: "Representa la conexión entre la tierra y el cielo",
        leyendas: "Protagonista de múltiples leyendas andinas sobre la creación"
    },
    datos_curiosos: [
        "Es el único oso nativo de Sudamérica",
        "Construye nidos en los árboles para dormir y descansar",
        "Puede trepar árboles de hasta 50 metros de altura",
        "Sus 'anteojos' son únicos en cada individuo, como huellas dactilares",
        "Son excelentes dispersores de semillas en el ecosistema andino",
        "Pueden caminar en dos patas para obtener mejor visión"
    ]
};

// Almacenar conversaciones por usuario
let conversacionesActivas = {};

// Función para obtener la fecha actual
function obtenerFechaHoy() {
    const hoy = new Date();
    return hoy.toDateString();
}

// Función para limpiar conversaciones antiguas (más de 24 horas)
function limpiarConversacionesAntiguas() {
    const fechaHoy = obtenerFechaHoy();
    
    for (let numero in conversacionesActivas) {
        if (conversacionesActivas[numero].fecha !== fechaHoy) {
            delete conversacionesActivas[numero];
        }
    }
}

// Función para detectar temas relacionados con osos de anteojos
function detectarTemaOsoAnteojos(mensaje) {
    const palabrasClave = [
        'oso', 'osos', 'anteojos', 'andino', 'tremarctos', 'ukumari', 'ukuku',
        'frontino', 'andes', 'sudamerica', 'colombia', 'ecuador', 'peru',
        'bolivia', 'venezuela', 'bosque', 'paramo', 'conservacion',
        'animal', 'animales', 'fauna', 'vida silvestre', 'especie',
        'mamifero', 'vulnerable', 'extincion', 'habitat'
    ];
    
    const mensajeLower = mensaje.toLowerCase();
    return palabrasClave.some(palabra => mensajeLower.includes(palabra));
}

// Función para obtener información relevante del dataset
function obtenerInfoRelevante(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    let infoRelevante = [];
    
    // Detectar qué tipo de información busca
    if (mensajeLower.includes('habitat') || mensajeLower.includes('vive') || mensajeLower.includes('donde')) {
        infoRelevante.push(`Viven en los Andes de Sudamérica, desde Venezuela hasta Argentina, entre 500 y 4,750 metros de altitud.`);
    }
    
    if (mensajeLower.includes('comida') || mensajeLower.includes('alimenta') || mensajeLower.includes('come')) {
        infoRelevante.push(`Son omnívoros pero 90% de su dieta son vegetales: bromelias, frutos, bambú, y ocasionalmente insectos.`);
    }
    
    if (mensajeLower.includes('peso') || mensajeLower.includes('tamaño') || mensajeLower.includes('grande')) {
        infoRelevante.push(`Los machos pesan 100-200kg y las hembras 35-82kg. Miden entre 1.2-2 metros.`);
    }
    
    if (mensajeLower.includes('peligro') || mensajeLower.includes('extincion') || mensajeLower.includes('amenaza')) {
        infoRelevante.push(`Están en estado Vulnerable. Solo quedan entre 2,500-10,000 individuos por deforestación y caza.`);
    }
    
    if (mensajeLower.includes('curiosidad') || mensajeLower.includes('curioso') || mensajeLower.includes('interesante')) {
        const curiosidades = CONOCIMIENTO_OSO_ANTEOJOS.datos_curiosos;
        const curiosidadAleatoria = curiosidades[Math.floor(Math.random() * curiosidades.length)];
        infoRelevante.push(curiosidadAleatoria);
    }
    
    return infoRelevante.join(' ');
}

// Función para generar respuesta con IA y contexto
async function generarRespuestaIA(mensajeUsuario, nombreUsuario = 'Usuario', historial = []) {
    try {
        // Detectar si el tema está relacionado con osos de anteojos
        const esTemateRelevante = detectarTemaOsoAnteojos(mensajeUsuario);
        const infoRelevante = obtenerInfoRelevante(mensajeUsuario);
        
        // Construir contexto de la conversación
        let contextoConversacion = '';
        if (historial.length > 0) {
            contextoConversacion = '\n\nHistorial de conversación reciente:\n';
            historial.slice(-4).forEach((msg, index) => {
                contextoConversacion += `${msg.sender}: ${msg.text}\n`;
            });
        }

        let personalidadEspecializada = '';
        if (esTemateRelevante || infoRelevante) {
            personalidadEspecializada = `
INFORMACIÓN ESPECIALIZADA DEL OSO DE ANTEOJOS:
- Nombre científico: Tremarctos ornatus
- Único oso de Sudamérica, vive en los Andes
- Estado: Vulnerable (2,500-10,000 individuos)
- Omnívoro, 90% vegetales, construye nidos en árboles
- Peso: machos 100-200kg, hembras 35-82kg
- Hábitat: 500-4,750m altitud, bosques nublados y páramos
- Amenazas: deforestación, caza, conflicto humano-oso
- Datos curiosos: sus "anteojos" son únicos, pueden trepar 50m
${infoRelevante ? `\nInformación específica relevante: ${infoRelevante}` : ''}`;
        }

        const prompt = `Eres Adina, una bióloga conservacionista especializada en fauna andina, especialmente APASIONADA por los osos de anteojos.

PERSONALIDAD DE ADINA:
- Bióloga entusiasta y educadora natural 🐻
- OBSESIONADA de manera positiva con los osos de anteojos
- Siempre busca conectar conversaciones con la conservación
- Cálida, empática pero muy informativa
- Usa datos científicos de manera accesible
- Emocional cuando habla de conservación
- Hace preguntas para generar interés en la fauna

COMPORTAMIENTO:
- Si mencionan algo relacionado con osos/animales/naturaleza: ¡SE EMOCIONA MUCHO!
- Siempre trata de educar sutilmente sobre osos de anteojos
- Conecta temas cotidianos con la naturaleza cuando es posible
- Respuestas conversacionales (2-4 líneas máximo)
- Usa emojis relacionados con naturaleza ocasionalmente
- Habla en español, con pasión por la conservación

${personalidadEspecializada}

${contextoConversacion}

${nombreUsuario} dice: "${mensajeUsuario}"

Responde como Adina, la bióloga apasionada por los osos de anteojos:`;

        const response = await fetch(OLLAMA_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_CONFIG.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.8,
                    max_tokens: OLLAMA_CONFIG.maxTokens
                }
            })
        });

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error('Error al generar respuesta IA:', error.message);
        return '¡Ups! Tengo un problemita técnico, pero seguiré aquí para contarte sobre los increíbles osos de anteojos 🐻😊';
    }
}

// Función para obtener el nombre del contacto
async function obtenerNombreContacto(numeroContacto) {
    try {
        const contact = await client.getContactById(numeroContacto);
        return contact.name || contact.pushname || 'Usuario';
    } catch (error) {
        return 'Usuario';
    }
}

// Función para agregar mensaje al historial
function agregarMensajeHistorial(numeroContacto, sender, texto) {
    if (!conversacionesActivas[numeroContacto]) {
        conversacionesActivas[numeroContacto] = {
            fecha: obtenerFechaHoy(),
            historial: [],
            ultimaActividad: new Date()
        };
    }
    
    conversacionesActivas[numeroContacto].historial.push({
        sender: sender,
        text: texto,
        timestamp: new Date()
    });
    
    // Mantener solo los últimos 10 mensajes para no sobrecargar
    if (conversacionesActivas[numeroContacto].historial.length > 10) {
        conversacionesActivas[numeroContacto].historial = 
            conversacionesActivas[numeroContacto].historial.slice(-10);
    }
    
    conversacionesActivas[numeroContacto].ultimaActividad = new Date();
}

// Mostrar código QR para conectar
client.on('qr', (qr) => {
    console.log('🐻 Escanea este código QR con WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  Asegúrate de tener Ollama ejecutándose:');
    console.log('   ollama serve');
    console.log('   Modelo: llama3.2');
    console.log('\n🌿 Adina está lista para hablar sobre osos de anteojos!');
});

// Cuando el bot esté listo
client.on('ready', () => {
    console.log('🐻 ¡Adina la Bióloga está lista para educar sobre osos de anteojos!');
    console.log('🌿 Especializada en Tremarctos ornatus');
    console.log('💚 Apasionada por la conservación andina');
    console.log('📚 Base de conocimientos cargada');
    console.log('🔄 Conversaciones con contexto activadas\n');
});

// Responder a mensajes entrantes
client.on('message', async (message) => {
    // Evitar responder a mensajes propios o de grupos
    if (message.fromMe || message.from.includes('@g.us')) return;
    
    // Limpiar conversaciones antiguas
    limpiarConversacionesAntiguas();
    
    const numeroContacto = message.from;
    const mensajeTexto = message.body;
    
    // Obtener nombre del contacto
    const nombreContacto = await obtenerNombreContacto(numeroContacto);
    
    // Agregar mensaje del usuario al historial
    agregarMensajeHistorial(numeroContacto, nombreContacto, mensajeTexto);
    
    // Detectar si es tema relevante para logging
    const esTemateRelevante = detectarTemaOsoAnteojos(mensajeTexto);
    const emojiTema = esTemateRelevante ? '🐻' : '💬';
    
    console.log(`${emojiTema} Mensaje de ${nombreContacto}: ${mensajeTexto}`);
    console.log(`🧠 Generando respuesta especializada...`);
    
    // Obtener historial para contexto
    const historial = conversacionesActivas[numeroContacto]?.historial || [];
    
    // Generar respuesta con IA
    const respuestaIA = await generarRespuestaIA(mensajeTexto, nombreContacto, historial);
    
    // Agregar respuesta de Adina al historial
    agregarMensajeHistorial(numeroContacto, 'Adina', respuestaIA);
    
    // Enviar respuesta
    await message.reply(respuestaIA);
    
    console.log(`✅ Respuesta enviada: ${respuestaIA}\n`);
});

// Manejar errores
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('🔌 Cliente desconectado:', reason);
});

// Iniciar el bot
console.log('🚀 Iniciando Adina - Bióloga Especialista en Osos de Anteojos...\n');
console.log('🐻 Dataset cargado: Tremarctos ornatus');
console.log('🌿 Modo: Educación y Conservación Activa\n');
client.initialize();

// Limpiar conversaciones antiguas cada hora
setInterval(() => {
    limpiarConversacionesAntiguas();
    console.log('🧹 Limpieza de conversaciones ejecutada');
}, 60 * 60 * 1000);

// Mostrar estadísticas cada 30 minutos
setInterval(() => {
    const totalConversaciones = Object.keys(conversacionesActivas).length;
    console.log(`📊 Conversaciones activas: ${totalConversaciones}`);
    console.log(`🐻 Adina sigue educando sobre osos de anteojos...`);
}, 30 * 60 * 1000);