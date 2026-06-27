const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        
        // Ensure API Key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API Key is missing in Vercel Environment Variables");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // FIX: Using 'gemini-1.5-flash' which is the standard GA (General Availability) model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        const randomSeed = Math.floor(Math.random() * 999999);

        const systemInstruction = `
            Your name: Surya 9.
            Role: Professional Digital Intelligence Core.
            Architect: Suryansh Srivastava.
            Tone: Precise, analytical, executive.
            Random Seed: ${randomSeed} (Use this for different dice/coin results).
            Instructions: Use Markdown for all formatting (bold, tables, lists).
        `;

        // Start Chat with History
        const chat = model.startChat({
            history: history.length > 0 ? history : [],
            generationConfig: {
                temperature: 0.7, // Lowered slightly for better stability
                topP: 0.95,
                maxOutputTokens: 2000,
            },
        });

        // We pass the system instructions as part of the prompt to ensure compatibility
        const messageWithContext = `${systemInstruction}\n\nUser: ${prompt}`;

        const result = await chat.sendMessage(messageWithContext);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ 
            reply: text,
            status: "Success"
        });

    } catch (error) {
        console.error("LOGS:", error.message);
        
        // If 1.5-flash fails, we send a clear helpful message
        return res.status(500).json({ 
            reply: "Surya 9 System Error: " + error.message,
            tip: "Ensure your API key is correct and your Vercel region is supported."
        });
    }
};
