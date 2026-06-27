const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let chatHistory = [];

async function handleMessage() {
    const val = input.value.trim();
    if (!val) return;

    appendMsg('user', val);
    input.value = '';

    const loader = appendMsg('ai', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: val, history: chatHistory })
        });
        
        const data = await res.json();
        
        // Update History Memory
        chatHistory.push({ role: 'user', parts: [{ text: val }] });
        chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
        if (chatHistory.length > 10) chatHistory.splice(0, 2);

        loader.innerHTML = md.render(data.reply);
    } catch (err) {
        loader.innerText = "I've lost the signal. Try again?";
    }
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}-msg`;
    div.innerText = text;
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', handleMessage);
input.addEventListener('keypress', e => e.key === 'Enter' && handleMessage());
