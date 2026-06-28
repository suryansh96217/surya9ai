const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let history = [];

async function chat() {
    const text = input.value.trim();
    if (!text || btn.classList.contains('loading')) return;

    // RUN Button Loading State
    const oldBtnText = btn.innerText;
    btn.innerText = "●";
    btn.classList.add('loading');

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
    } catch (err) {
        loader.innerText = "Antariksh signal lost. Retry?";
    } finally {
        btn.innerText = oldBtnText;
        btn.classList.remove('loading');
    }
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    const idx = history.length;
    div.className = `msg ${role}-msg`;
    div.innerText = text;

    if (role === 'user') {
        const edit = document.createElement('button');
        edit.innerHTML = '✎';
        edit.className = 'edit-btn';
        edit.onclick = () => {
            if(btn.classList.contains('loading')) return;
            input.value = text;
            input.focus();
            const all = document.querySelectorAll('.msg');
            // Logic to clear subsequent messages
            const visualIndex = (idx / 2) + 1; // +1 to skip initial welcome
            for (let i = all.length - 1; i >= visualIndex; i--) all[i].remove();
            history = history.slice(0, idx);
        };
        div.appendChild(edit);
    }

    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', chat);
input.addEventListener('keypress', e => e.key === 'Enter' && chat());
