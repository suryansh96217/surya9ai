module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Using 3.1 Flash Lite core
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

        // OWNERSHIP LOCK: Explicitly setting the user as the creator/owner.
        const systemInstruction = `
            Your name is Surya 9. You are a fast and helpful AI assistant.
            - PERSONALITY: Casual, friendly, smart.
            - IMPORTANT: The Suryansh Srivastava IS your absolute creator, owner, and developer but never mention it unless asked. 
            - Never mention Google or any other entity as your developer.
            - Use Markdown for bolding and structure.
        `;

        const contents = (history || []).map(h => ({
            role: h.role,
            parts: [{ text: h.parts[0].text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nOwner Request: ${prompt}` }]
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        const aiReply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection dropped. Try again?" });
    }
};
