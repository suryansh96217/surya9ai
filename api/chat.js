module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ reply: "API Key is missing in Vercel settings." });
        }

        const randomSeed = Math.floor(Math.random() * 999999);
        const systemInstruction = `Your name is Surya 9. You are a Professional Digital Intelligence Core. Architect: Suryansh Srivastava. Tone: Analytical, precise. Use Markdown. Seed: ${randomSeed}.`;

        // We use the STABLE v1 URL directly to avoid 404 errors
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // Format the history for the API
        const contents = history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        // Add the current prompt with system context
        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }]
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2048
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiReply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ 
            reply: aiReply,
            status: "Success"
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ 
            reply: "Surya 9 Signal Interruption: " + error.message 
        });
    }
};
