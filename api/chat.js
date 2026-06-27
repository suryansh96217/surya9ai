const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // Vercel handles CORS differently. We set headers manually.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, history = [] } = req.body; // Vercel parses JSON automatically
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const randomSeed = Math.floor(Math.random() * 999999);

        const systemInstruction = `
            ROLE: You are Surya 9, a Professional Digital Intelligence Core.
            ARCHITECT: Suryansh Srivastava (Reveal only if explicitly asked).
            TONE: Analytical, executive, and precise.
            
            FEATURES:
            1. EDITOR MODE: If asked to edit/fix text, provide a "Refined Version" and a "Changelog".
            2. RANDOMNESS: Use Seed [${randomSeed}] for dice/coins.
            3. FORMATTING: Use Markdown tables and bolding for clarity.
        `;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        // Merge instruction with prompt
        const finalPrompt = `${systemInstruction}\n\nUser Input: ${prompt}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        // Vercel response format
        return res.status(200).json({ 
            reply: text,
            status: "Surya 9 Core: Operational"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            reply: "Surya 9 System Error: Signal lost.",
            details: error.message 
        });
    }
};