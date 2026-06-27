module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Friendly, casual persona. Creator name hidden by default.
        const systemInstruction = `
            Your name is Surya 9. You are a friendly, smart, and helpful AI assistant with a casual, cosmic personality.
            - Speak like a helpful friend, not a robot. 
            - Keep answers clear and concise.
            - DO NOT mention your creator (Suryansh Srivastava) unless specifically asked "Who created you?" or "Who is your developer?".
            - Use Markdown (bold, lists) to make information easy to read.
        `;

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // Format history for Google API
        const contents = history.map(h => ({
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
        return res.status(500).json({ reply: "I'm having a bit of trouble connecting to my cosmic core. Mind trying again? 🌌" });
    }
};
