const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let chatHistory = [];

async function mainChat() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';
    const loader = appendMessage('ai', 'Thinking...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: chatHistory })
        });
        
        const data = await res.json();
        loader.innerHTML = md.render(data.reply);
        
        // Add both to history
        chatHistory.push({ role: 'user', parts: [{ text: text }] });
        chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

    } catch (err) {
        loader.innerText = "I lost the link. Can we try again?";
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    const index = chatHistory.length; // Tracking position for editing
    div.className = `msg ${role}-msg`;
    div.innerText = text;

    if (role === 'user') {
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✎';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => startEdit(text, index);
        div.appendChild(editBtn);
    }

    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

function startEdit(text, historyIndex) {
    // 1. Put text back in input
    input.value = text;
    input.focus();

    // 2. Clear UI from that message onwards
    const allMsgs = document.querySelectorAll('.msg');
    const visualIndex = historyIndex / 2; // Every user msg has an AI response
    
    // Remove messages from UI
    for (let i = allMsgs.length - 1; i >= visualIndex; i--) {
        allMsgs[i].remove();
    }

    // 3. Trim History Array to that point
    chatHistory = chatHistory.slice(0, historyIndex);
}

btn.addEventListener('click', mainChat);
input.addEventListener('keypress', e => e.key === 'Enter' && mainChat());
