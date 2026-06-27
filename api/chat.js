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

        if (!API_KEY) {
            return res.status(500).json({ reply: "Surya 9 Error: API Key is missing in Vercel settings." });
        }

        // Using v1beta for maximum compatibility with AQ. keys
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const systemInstruction = "Your name is Surya 9. You are a friendly, smart, and helpful cosmic AI guide. Architect: Suryansh Srivastava. Speak casually and use Markdown.";

        // 2. Format history strictly for Google's expectations
        let contents = [];
        
        // Add previous conversation if it exists
        if (Array.isArray(history) && history.length > 0) {
            contents = history.map(h => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.parts[0].text }]
            }));
        }

        // 3. Add the current prompt with the System Instruction
        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser Query: ${prompt}` }]
        });

        // 4. Execute Fetch
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: contents,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2000
                }
            })
        });

        const data = await response.json();

        // 5. Check for Google-side errors
        if (data.error) {
            console.error("Google API Error:", data.error.message);
            return res.status(200).json({ reply: `Surya 9 Alert: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "I reached the core, but no data was returned. Try again?" });

    } catch (error) {
        console.error("Internal Server Error:", error.message);
        return res.status(500).json({ reply: "Surya 9 Critical Error: " + error.message });
    }
};
