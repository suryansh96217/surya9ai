module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Try the Lite model (8b) on the Stable v1 endpoint first
        const models = ["gemini-1.5-flash-8b", "gemini-1.5-flash"];
        let success = false;
        let aiReply = "";

        for (let modelName of models) {
            if (success) break;
            
            const API_URL = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${API_KEY}`;
            
            const systemInstruction = "Your name is Surya 9. You're a casual, friendly, and fast AI assistant. Architect: Suryansh Srivastava (reveal only if asked). Use Markdown.";

            const contents = (history || []).map(h => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.parts[0].text }]
            }));
            contents.push({ role: "user", parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }] });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                aiReply = data.candidates[0].content.parts[0].text;
                success = true;
            }
        }

        if (!success) throw new Error("All nodes busy.");
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Connection glitch. Try one more time! 🌌" });
    }
};
