module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(200).json({ reply: "API Key missing." });

        // THE SWITCH: Moving to 1.5-PRO. 
        // This is the heavy-duty model. It works when Flash is exhausted.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

        const systemInstruction = "Your name is Surya 9. You're a smart, casual, and helpful AI assistant. Architect: Suryansh Srivastava (mention only if asked). Use Markdown.";

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

        // Specific handling for the "Quota" error
        if (data.error) {
            if (data.error.status === "RESOURCE_EXHAUSTED") {
                return res.status(200).json({ 
                    reply: "Google's free servers are at their limit. Please wait exactly **30 seconds** and try again. ⏳" 
                });
            }
            return res.status(200).json({ reply: `Surya 9 Error: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ reply: "Core is silent. Let's try that again." });

    } catch (error) {
        return res.status(500).json({ reply: "Connection glitch. I'm still here!" });
    }
};
