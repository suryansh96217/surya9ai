module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { prompt, history = [] } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ reply: "API Key missing in Vercel settings." });

    const systemInstruction = `Your name is Surya 9. You are a Professional Digital Intelligence Core. Architect: Suryansh Srivastava. Use Markdown. Tone: Precise.`;

    // Try Flash 1.5 first (Fastest), then Fallback to Pro (Most Stable)
    const models = ["gemini-1.5-flash", "gemini-pro"];
    
    for (let modelName of models) {
        try {
            // Using v1beta as it has the widest support for Flash 1.5
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

            const contents = history.map(h => ({
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

            // If this model isn't found, the loop will move to the next model
            if (data.error) {
                console.warn(`Model ${modelName} failed, trying next...`);
                continue; 
            }

            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });

        } catch (err) {
            continue; // Try the next model
        }
    }

    // If both fail
    return res.status(500).json({ reply: "Surya 9 Error: All intelligence nodes are currently unreachable. Check your API key." });
};
