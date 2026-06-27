module.exports = async (req, res) => {
    // 1. CORS Headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key missing in Vercel settings." });

        // IMPORTANT: AQ. keys are very strict. We use the v1 stable endpoint.
        // We also use 'gemini-1.5-flash-latest' to ensure we get the currently active version.
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

        const systemInstruction = `Your name is Surya 9. Professional AI core. Architect: Suryansh Srivastava. Use Markdown.`;

        // Format history for the Google API
        const contents = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        // Add the current prompt
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

        // If Google returns an error, we display it clearly for debugging
        if (data.error) {
            return res.status(200).json({ 
                reply: `Surya 9 Error (${data.error.status}): ${data.error.message}` 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "Surya 9 Error: Empty response from core." });

    } catch (error) {
        return res.status(500).json({ reply: "Surya 9 Critical Failure: " + error.message });
    }
};
