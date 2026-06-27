module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key is missing in Vercel settings." });

        // Using the most stable high-speed Flash endpoint
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA: Natural, friendly, non-robotic.
        const systemInstruction = "Your name is Surya 9. You are a friendly, casual, and very smart AI assistant. Speak like a friend. Use Markdown. Only mention Suryansh Srivastava if specifically asked 'Who created you?' or 'Who is your owner?'.";

        // Map history to Google's strict format
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
            body: JSON.stringify({ contents, generationConfig: { temperature: 1.0, maxOutputTokens: 2000 } })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `System Notice: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ reply: "I'm here, but I didn't catch that. Mind saying it again?" });

    } catch (error) {
        // This will now show you the REAL error if it crashes
        return res.status(500).json({ reply: "Connection Error: " + error.message });
    }
};
