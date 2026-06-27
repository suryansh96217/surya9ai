const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    // 1. Headers for Vercel/CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Configuration Error: API Key missing." });
        }

        // 2. Initialize the AI with the STABLE API version (v1)
        // This stops the 404 v1beta error.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // We specify 'v1' explicitly here
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" }, 
            { apiVersion: 'v1' } 
        );

        const randomSeed = Math.floor(Math.random() * 999999);

        // 3. System Instructions (Included in the prompt for maximum compatibility)
        const systemInstruction = `
            Your name is Surya 9. You are a Professional Digital Intelligence Core.
            Architect: Suryansh Srivastava.
            Tone: Analytical, precise, and executive.
            Randomness Seed: ${randomSeed} (Use this to randomize dice/coin results).
            Formatting: Always use Markdown (bolding, tables, and lists) for structure.
        `;

        // 4. Start Chat
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        const finalPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ 
            reply: text,
            status: "Success"
        });

    } catch (error) {
        console.error("Internal Error:", error);
        
        // If gemini-1.5-flash STILL fails, try the absolute fallback 'gemini-pro'
        return res.status(500).json({ 
            reply: "Surya 9 Signal Interruption: " + error.message,
            suggestion: "Check if your API key is restricted to a specific region or if billing is disabled."
        });
    }
};
