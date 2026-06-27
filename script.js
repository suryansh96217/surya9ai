const md = window.markdownit({ html: true, linkify: true });
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

let chatHistory = [];

async function handleMessage() {
    const val = input.value.trim();
    if (!val) return;

    // Show user message
    appendMsg('user', val);
    input.value = '';

    // Loading indicator
    const loader = appendMsg('ai', '...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: val, 
                history: chatHistory 
            })
        });
        
        const data = await res.json();
        
        if (data.reply) {
            // Update History for memory
            chatHistory.push({ role: 'user', parts: [{ text: val }] });
            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
            
            // Render Markdown
            loader.innerHTML = md.render(data.reply);
        } else {
            loader.innerText = "System returned an empty signal.";
        }
    } catch (err) {
        loader.innerText = "Connection lost. Please try again.";
    }
    
    viewport.scrollTop = viewport.scrollHeight;
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}-msg`;
    div.innerText = text;
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div; // Important: returns the element so we can update it later
}

btn.addEventListener('click', handleMessage);
input.addEventListener('keypress', e => e.key === 'Enter' && handleMessage());
