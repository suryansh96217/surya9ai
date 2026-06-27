module.exports = async (req, res) => {
    // 1. Headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key missing." });

        // TARGET: gemini-3.0-flash (The absolute latest)
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA: Natural, friendly, helpful.
        const systemInstruction = `
            Your name is Surya 9. 
            You are a super smart, casual, and friendly AI assistant.
            - Talk like a real person, not a machine.
            - Be helpful and precise.
            - DO NOT mention Suryansh Srivastava unless the user specifically asks "Who created you?".
            - Use Markdown for bolding and lists.
        `;

        // Format history correctly for the API
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
                    temperature: 0.9,
                    maxOutputTokens: 2048,
                }
            })
        });

        const data = await response.json();

        // Handle Potential Google Errors
        if (data.error) {
            // If 3.0 Flash is having a regional outage, this will show the reason
            return res.status(200).json({ reply: `Surya 9 Error: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "I'm here, but I didn't get that. Say it again?" });

    } catch (error) {
        return res.status(500).json({ reply: "Connection glitch. Let's try that again!" });
    }
};
