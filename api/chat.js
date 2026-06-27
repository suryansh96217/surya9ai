module.exports = async (req, res) => {
    // 1. Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key missing in Vercel settings." });

        // 2. THE TARGET: gemini-1.5-flash-8b (The high-speed Lite model)
        // Using v1beta for widest compatibility with AQ keys
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`;

        // 3. CASUAL PERSONA
        const systemInstruction = "Your name is Surya 9. You are a casual, helpful, and super fast AI assistant. Architect: Suryansh Srivastava (mention only if asked). Use Markdown.";

        // 4. Format history
        const contents = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }]
        });

        // 5. Direct Fetch
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents,
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();

        // 6. Detailed Error Handling
        if (data.error) {
            return res.status(200).json({ 
                reply: `Surya 9 Error: ${data.error.message} (Status: ${data.error.status})` 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "I'm connected, but Google sent an empty response. Please try again." });

    } catch (error) {
        return res.status(500).json({ reply: "Surya 9 Critical Failure: " + error.message });
    }
};
