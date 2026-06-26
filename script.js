const md = window.markdownit();
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

async function askSurya() {
    const val = input.value.trim();
    if (!val) return;

    // Show user message
    appendMsg('user-msg', val);
    input.value = '';

    // Create a loading bubble
    const loader = appendMsg('ai-msg', 'Syncing with 3.5 Flash core...');

    try {
        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt: val })
        });
        
        const data = await res.json();
        
        if (data && data.reply) {
            // Render the AI response with bold text support
            loader.innerHTML = md.render(data.reply);
        } else {
            loader.innerText = "Error: Signal lost. Please try again.";
        }

    } catch (err) {
        loader.innerText = "Connection Failed. Check your internet or API key.";
    }
}

function appendMsg(type, text) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerHTML = text; 
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

btn.addEventListener('click', askSurya);
input.addEventListener('keypress', e => e.key === 'Enter' && askSurya());
