const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

async function askSurya() {
    const val = input.value.trim();
    if (!val) return;

    appendMsg('user-msg', val);
    input.value = '';

    const loader = appendMsg('ai-msg', 'Consulting Gemini 3.5 Flash...');

    try {
        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt: val })
        });
        const data = await res.json();
        loader.innerText = data.reply;
    } catch {
        loader.innerText = "System Failure: Connection lost.";
    }
}

function appendMsg(type, text) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', askSurya);
input.addEventListener('keypress', e => e.key === 'Enter' && askSurya());
