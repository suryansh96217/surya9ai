const md = window.markdownit();
const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

async function askSurya() {
    const val = input.value.trim();
    if (!val) return;

    appendMsg('user-msg', val);
    input.value = '';
    const loader = appendMsg('ai-msg', 'Processing...');

    try {
        const res = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt: val })
        });
        
        const data = await res.json();
        
        // Safety Check: If reply exists, show it. If not, show the error.
        if (data && data.reply) {
            loader.innerHTML = md.render(data.reply);
        } else {
            loader.innerText = "Error: Surya 9 received an empty response.";
        }

    } catch (err) {
        loader.innerText = "Connection failed. Is the Netlify function running?";
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
