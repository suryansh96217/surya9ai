module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    
    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Using the most stable model ID
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // CASUAL PERSONA: Helpful, friendly, precise. 
        // No owner mentions unless asked.
        const systemInstruction = `
            Your name is Surya 9. 
            You are a helpful, friendly, and precise AI assistant. 
            - Speak casually and naturally, like a smart friend. 
            - Do NOT act like a robot or a "system core."
            - Never mention your creator (Suryansh Srivastava) unless the user specifically asks "Who created you?" or "Who is your developer?". 
            - Keep answers helpful and structured using Markdown.
        `;

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
        const aiReply = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Sorry, I'm having trouble connecting right now. 😓" });
    }
};
