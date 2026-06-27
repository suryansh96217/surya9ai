const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let history = [];

async function chat() {
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';
    const loader = appendMsg('ai', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: history })
        });
        
        const data = await res.json();
        loader.innerHTML = md.render(data.reply);
        
        history.push({ role: 'user', parts: [{ text: text }] });
        history.push({ role: 'model', parts: [{ text: data.reply }] });
        if (history.length > 10) history.shift();

    } catch (err) {
        loader.innerText = "Connection lost. Try again?";
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

btn.addEventListener('click', chat);
input.addEventListener('keypress', e => e.key === 'Enter' && chat());
