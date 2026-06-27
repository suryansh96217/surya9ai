module.exports = async (req, res) => {
    // 1. Critical Headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key missing." });

        // PERSONA: Casual, friendly, non-robotic.
        const systemInstruction = `
            Your name is Surya 9. You are a helpful, casual, and friendly AI assistant.
            - Talk like a regular human friend, not a computer. 
            - Keep your responses precise and avoid technical jargon.
            - DO NOT mention your creator (Suryansh Srivastava) unless specifically asked.
            - Use Markdown for bolding and lists.
        `;

        // FAIL-SAFE MODEL LIST: Trying the newest first, then the stable one.
        const modelList = ["gemini-2.0-flash", "gemini-1.5-flash"];
        let finalReply = "";
        let success = false;

        for (let modelId of modelList) {
            if (success) break;

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
                    body: JSON.stringify({ 
                        contents,
                        generationConfig: { temperature: 0.9, maxOutputTokens: 2000 }
                    })
                });

                const data = await response.json();

                if (data.candidates && data.candidates[0].content) {
                    finalReply = data.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (err) {
                // Silently try next model
                continue;
            }
        }

        if (!success) {
            return res.status(200).json({ reply: "Hey! I'm having a bit of trouble connecting to my brain. Try again?" });
        }

        return res.status(200).json({ reply: finalReply });

    } catch (error) {
        return res.status(500).json({ reply: "Oops, something went wrong. Let's try that again." });
    }
};
