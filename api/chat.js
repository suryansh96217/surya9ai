module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // TARGET: Gemini 1.5 Flash-8B (The official "Lite" high-speed model)
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`;

        const systemInstruction = `
            Your name is Surya 9. 
            You are a casual, helpful, and very fast AI assistant. 
            - Speak naturally like a friend, not a robot.
            - Keep your answers precise and easy to read.
            - HIDE OWNER: Do NOT mention Suryansh Srivastava unless the user specifically asks "Who created you?" or "Who is your owner?".
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
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection dropped in the nebula. Try again? 🌌" });
    }
};
};
