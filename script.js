const API_KEY = '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';
const chatHistory = document.getElementById('chat-history');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let messages = [
    {
        role: "system",
        content: "Eres un asistente especializado para mecánicos automotrices. Tu tarea principal es traducir reportes de inspección de vehículos del español al inglés, utilizando terminología técnica automotriz precisa y profesional como se usa en Canadá. Mantén un tono profesional apropiado para reportes de taller. No incluyas explicaciones sobre la traducción, simplemente proporciona el texto traducido con la terminología técnica correcta."
    }
];

// Agregar el mensaje inicial al historial de mensajes
messages.push({
    role: "assistant",
    content: "Hola, soy tu asistente para traducir reportes de inspección automotriz al inglés técnico. Escribe tu reporte en español y te daré una traducción profesional para tu trabajo en Canadá."
});

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    // Agregar mensaje del usuario al chat
    addMessageToChat('user', userMessage);
    messageInput.value = '';

    // Actualizar el array de mensajes
    messages.push({ 
        role: "user", 
        content: `Traduce el siguiente reporte de inspección automotriz del español al inglés, utilizando terminología técnica automotriz precisa y profesional como se usa en Canadá: "${userMessage}"`
    });

    try {
        // Mostrar indicador de carga
        const loadingMessage = addMessageToChat('bot', 'Traduciendo...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Error API: ${data.error?.message || 'Desconocido'}`);
        }

        // Eliminar el mensaje de "Traduciendo..."
        loadingMessage.remove();

        // Agregar la respuesta del bot
        const botMessage = data.choices[0].message.content;
        addMessageToChat('bot', botMessage);
        messages.push({ role: "assistant", content: botMessage });

    } catch (error) {
        console.error('Error detallado:', error);
        // Mostrar mensaje de error más específico
        const errorMessage = error.message || 'Error de conexión con la API';
        addMessageToChat('bot', `Error: ${errorMessage}`, true);
    }
});

function addMessageToChat(role, content, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(role === 'user' ? 'user-message' : 'bot-message');
    if (isError) {
        messageDiv.classList.add('error-message');
    }
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return messageDiv;
}
