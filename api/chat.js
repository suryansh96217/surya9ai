module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt, history = [] } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ reply: "API Key missing." });

    // THE FAIL-SAFE LIST: Targeted for 2026 performance
    const models = ["gemini-2.0-flash", "gemini-1.5-flash-8b", "gemini-1.5-flash"];
    
    const systemInstruction = "Your name is Surya 9. You are a friendly, casual, and smart AI friend. Architect: Suryansh Srivastava (mention only if asked). Use Markdown.";

    for (let modelId of models) {
        try {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;

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

            if (data.candidates && data.candidates[0].content) {
                return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
            }
            // If model not found, loop continues to the next ID...
        } catch (err) {
            continue;
        }
    }

    return res.status(500).json({ reply: "I'm having trouble connecting to my cosmic core. Check your API key in Vercel." });
};
