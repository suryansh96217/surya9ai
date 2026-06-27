module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // THE SECRET SAUCE: v1beta + 1.5-flash-8b (This is the "Lite" core)
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`;

        const systemInstruction = "Your name is Surya 9. You're a friendly, casual, and helpful AI assistant. Speak like a friend, keep it simple. Only mention Suryansh Srivastava if specifically asked who created you. Use Markdown.";

        // Construct history
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
            body: JSON.stringify({ 
                contents,
                generationConfig: { temperature: 0.9, maxOutputTokens: 1500 }
            })
        });

        const data = await response.json();

        // Check if Google sent an error
        if (data.error) {
            return res.status(200).json({ reply: `Google API says: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ reply: "I'm here, but the signal is a bit weak. Try sending that again?" });

    } catch (error) {
        return res.status(500).json({ reply: "System Error: " + error.message });
    }
};
