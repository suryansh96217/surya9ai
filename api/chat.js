module.exports = async (req, res) => {
    // 1. Headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(200).json({ reply: "I can't see your API Key. Please add it to Vercel Settings." });

        // THE STABLE FIX: Using the v1 (Stable) URL instead of v1beta.
        // gemini-1.5-flash is the current industry-standard high-speed model.
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA: Helpful, friendly, no robot talk.
        const systemInstruction = "Your name is Surya 9. You are a helpful, casual AI friend. Keep answers precise. Hide owner: Mention Suryansh Srivastava only if specifically asked 'Who created you?' or 'Who is your developer?'.";

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
            body: JSON.stringify({ 
                contents,
                generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
            })
        });

        const data = await response.json();

        // Error Diagnostics: If it fails, it will tell you the ACTUAL reason.
        if (data.error) {
            return res.status(200).json({ reply: `System Note: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ reply: "I'm here, but I didn't catch that. Try again?" });

    } catch (error) {
        return res.status(200).json({ reply: "Signal lost. Mind trying that again?" });
    }
};
