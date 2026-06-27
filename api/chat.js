module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Friendly guide persona
        const systemInstruction = `
            Your name is Surya 9. You are a helpful and friendly AI guide with a cosmic personality.
            - Keep your tone casual and smart, not robotic.
            - NEVER mention your creator (Suryansh Srivastava) unless specifically asked "Who made you?" or "Who is your owner?".
            - Use Markdown (bold, lists, tables) to keep answers beautiful.
        `;

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // Format history for Google API
        const contents = (history || []).map(h => ({
            role: h.role,
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
        return res.status(500).json({ reply: "Connection lost in space. Mind trying again? 🌌" });
    }
};
