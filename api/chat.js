module.exports = async (req, res) => {
    // 1. Setup CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(200).json({ reply: "Missing API Key in Vercel settings." });

        // THE FIX: gemini-1.5-flash is the official high-speed model. 
        // Using v1beta for widest compatibility with AQ. keys in India.
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA
        const systemInstruction = "Your name is Surya 9. You are a friendly, casual AI friend. Architect: Suryansh Srivastava (mention only if asked). Speak naturally, use Markdown.";

        // Format history for Google
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
                generationConfig: {
                    temperature: 1.0,
                    maxOutputTokens: 2048
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `Google API Error: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "I'm here, but the signal is weak. Try again?" });

    } catch (error) {
        return res.status(200).json({ reply: "I'm having trouble connecting to my brain. Mind trying again?" });
    }
};
