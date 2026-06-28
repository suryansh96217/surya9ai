const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let history = [];

async function chat() {
    const text = input.value.trim();
    if (!text || btn.classList.contains('loading')) return;

    // 1. Enter Loading State
    const originalBtnText = btn.innerText;
    btn.innerText = "● ● ●";
    btn.classList.add('loading');
    btn.disabled = true;

    appendMsg('user', text);
    input.value = '';
    
    const loader = appendMsg('ai', 'Connecting to Antariksh...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: history })
        });
        
        const data = await res.json();
        
        // Render Response
        loader.innerHTML = md.render(data.reply);
        
        // Update Memory
        history.push({ role: 'user', parts: [{ text: text }] });
        history.push({ role: 'model', parts: [{ text: data.reply }] });
        if (history.length > 10) history.shift();

    } catch (err) {
        loader.innerText = "Signal lost in deep space. Retry?";
    } finally {
        // 2. Exit Loading State
        btn.innerText = originalBtnText;
        btn.classList.remove('loading');
        btn.disabled = false;
        input.focus();
    }
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    const index = history.length;
    div.className = `msg ${role}-msg`;
    div.innerText = text;

    if (role === 'user') {
        const edit = document.createElement('button');
        edit.innerHTML = '✎';
        edit.className = 'edit-btn';
        edit.onclick = () => {
            if (btn.classList.contains('loading')) return; // Prevent edit while loading
            input.value = text;
            input.focus();
            const all = document.querySelectorAll('.msg');
            const vIndex = index / 2;
            for (let i = all.length - 1; i >= vIndex; i--) all[i].remove();
            history = history.slice(0, index);
        };
        div.appendChild(edit);
    }

    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', chat);
input.addEventListener('keypress', e => e.key === 'Enter' && chat());
