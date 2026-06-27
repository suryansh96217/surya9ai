const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let history = [];

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    // Subtle loading bubble
    const loadingDiv = appendMessage('ai', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: history })
        });
        
        const data = await res.json();
        
        // Render Markdown
        loadingDiv.innerHTML = md.render(data.reply);
        
        // Update History
        history.push({ role: 'user', parts: [{ text: text }] });
        history.push({ role: 'model', parts: [{ text: data.reply }] });
        if (history.length > 10) history.shift();

    } catch (err) {
        loadingDiv.innerText = "I'm having a bit of trouble connecting. Try again?";
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}-msg`;
    div.innerText = text;
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());
