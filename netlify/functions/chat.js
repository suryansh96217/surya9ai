const md = window.markdownit(); // Initialize Markdown
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

async function askSurya() {
    const val = input.value.trim();
    if (!val) return;

    appendMsg('user-msg', val);
    input.value = '';
    const loader = appendMsg('ai-msg', 'Thinking...');

    try {
        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt: val })
        });
        const data = await res.json();
        
        // This line converts the ** into real BOLD text
        loader.innerHTML = md.render(data.reply);
    } catch {
        loader.innerText = "Error connecting to Surya 9 core.";
    }
}

function appendMsg(type, text) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = text; // Use innerHTML to allow Markdown
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', askSurya);
input.addEventListener('keypress', e => e.key === 'Enter' && askSurya());
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // This sets the AI personality
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            systemInstruction: "Your name is Surya . You are a helpful, high-speed AI assistant. Use bold text for emphasis and be concise."
        });

        const result = await model.generateContent(prompt);
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: result.response.text() }),
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
