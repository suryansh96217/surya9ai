module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { prompt, history = [] } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ reply: "API Key missing." });

    // THE FAIL-SAFE LIST: These are the only two IDs that are 100% stable in India.
    const modelIds = ["gemini-1.5-flash", "gemini-pro"];
    
    const systemInstruction = "Your name is Surya 9. You're a friendly, casual, and fast AI assistant. Architect: Suryansh Srivastava (reveal only if asked). Use Markdown.";

    for (let modelName of modelIds) {
        try {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

            const contents = (history || []).map(h => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.parts[0].text }]
            }));
            contents.push({ role: "user", parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }] });

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents, generationConfig: { temperature: 0.8 } })
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                return res.status(200).json({ 
                    reply: data.candidates[0].content.parts[0].text 
                });
            }
            
            // If the model is "Not Found", the loop continues to 'gemini-pro'
            console.warn(`Model ${modelName} failed, trying fallback...`);
            
        } catch (err) {
            continue; 
        }
    }

    return res.status(500).json({ reply: "I'm having trouble connecting to my cosmic core. Please check your API key in Vercel." });
};
