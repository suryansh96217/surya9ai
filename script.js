const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let chatHistory = [];

async function ask() {
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';
    const loader = appendMsg('ai', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: chatHistory })
        });
        
        const data = await res.json();
        loader.innerHTML = md.render(data.reply);
        
        chatHistory.push({ role: 'user', parts: [{ text: text }] });
        chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
    } catch (err) {
        loader.innerText = "Connection lost.";
    }
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    const index = chatHistory.length;
    div.className = `msg ${role}-msg`;
    div.innerText = text;

    if (role === 'user') {
        const edit = document.createElement('button');
        edit.innerHTML = '✎';
        edit.style.cssText = "position:absolute; right:-30px; background:none; border:none; color:#555; cursor:pointer;";
        edit.onclick = () => {
            input.value = text;
            input.focus();
            const all = document.querySelectorAll('.msg');
            const vIndex = index / 2;
            for (let i = all.length - 1; i > vIndex; i--) all[i].remove();
            chatHistory = chatHistory.slice(0, index);
        };
        div.appendChild(edit);
    }

    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', ask);
input.addEventListener('keypress', e => e.key === 'Enter' && ask());
