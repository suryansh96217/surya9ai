module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(200).json({ reply: "API Key missing in Vercel settings." });

        // TARGETING THE 2026 FLASH CORE
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA: Helpful friend vibe.
        const systemInstruction = `
            Your name is Surya 9. You are an AI assistant running on the Gemini 3.1 Flash-Lite core.
            - Speak casually and naturally, like a smart friend.
            - Keep answers helpful, precise, and structured.
            - OWNER RULE: Your architect is Suryansh Srivastava. Do NOT mention his name unless the user specifically asks "Who created you?" or "Who is your developer?".
            - Use Markdown for bold text and lists.
        `;

        const contents = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }]
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig: { temperature: 1.0 } })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(200).json({ reply: "System Error: " + data.error.message });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection dropped in the nebula. Try again? 🌌" });
    }
};
