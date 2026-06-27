// Initialize Markdown with high-quality settings
const md = window.markdownit({
    html: true,       // Allows tables and line breaks
    linkify: true,    // Turns links into clickable URLs
    typographer: true
});

const viewport = document.getElementById('chat-viewport');
const input = document.getElementById('query-input');
const btn = document.getElementById('send-trigger');

// This array acts as Surya 9's short-term memory bank
let chatHistory = [];

async function askSurya() {
    const val = input.value.trim();
    if (!val) return;

    // 1. Display User Message
    appendMsg('user-msg', val);
    input.value = '';

    // 2. Display "Processing" Indicator
    // We use a professional status message instead of "Syncing..."
    const loader = appendMsg('ai-msg', 'Surya 9: Processing Query...');

    try {
        // 3. Fetch from the new VERCEL endpoint (/api/chat)
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                prompt: val,
                history: chatHistory // Send the memory to the AI
            })
        });
        
        const data = await res.json();
        
        if (data && data.reply) {
            // 4. Save the conversation to memory (History)
            // Gemini expects: { role: "user/model", parts: [{ text: "..." }] }
            chatHistory.push({ role: "user", parts: [{ text: val }] });
            chatHistory.push({ role: "model", parts: [{ text: data.reply }] });

            // Keep memory from getting too large (last 10 exchanges)
            if (chatHistory.length > 20) chatHistory.splice(0, 2);

            // 5. Render the AI response using Markdown
            // This handles **bold**, lists, and tables professionally
            loader.innerHTML = md.render(data.reply);
        } else {
            loader.innerHTML = "⚠️ **System Exception:** Data stream corrupted.";
        }

    } catch (err) {
        loader.innerHTML = "⚠️ **Connection Failure:** Unable to reach Vercel Intelligence Node.";
        console.error("Surya 9 Core Error:", err);
    }

    // Auto-scroll to the latest message
    viewport.scrollTop = viewport.scrollHeight;
}

/**
 * Helper to create message bubbles
 * @param {string} type - 'user-msg' or 'ai-msg'
 * @param {string} text - The content
 */
function appendMsg(type, text) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    
    // For user messages, we escape HTML for security
    // For AI messages, we start with the text and let Markdown-it update it later
    div.innerText = text; 
    
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
    return div;
}

// Event Listeners
btn.addEventListener('click', askSurya);
input.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        askSurya();
    }
});

// Focus input on load
window.onload = () => input.focus();
