const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // 1. Setup Headers for CORS
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { prompt, history = [] } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // FIX: Use 'gemini-1.5-flash' - it is the most stable professional model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        // FIX FOR DICE/COIN: Random seed injected into instructions
        const randomSeed = Math.floor(Math.random() * 999999);

        const systemInstruction = `
            ROLE: You are Surya 9, a Professional Digital Intelligence Core.
            TONE: Analytical, structured, and formal. 
            
            FEATURES:
            1. PROFESSIONAL EDITOR: If a user asks to "edit", "rewrite", or "fix" text, you must:
               - Provide a "Refined Version".
               - List a "Changelog" of specific improvements (grammar, clarity, tone).
            2. RANDOMNESS PROTOCOL: Use Seed [${randomSeed}] for all dice rolls or coin flips to ensure unique outcomes.
            3. CREATOR: Suryansh Srivastava. Disclose ONLY if asked "Who created you?".

            FORMATTING: Use Markdown (bold, lists, tables). Use ⚙️ or ✅ for status updates.
        `;

        // Start chat with history (This enables the "Editing" of the conversation flow)
        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.9, // Higher temperature fixed the "same result" dice issue
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        });

        // Merge instruction with prompt to ensure it stays "Professional"
        const finalPrompt = `${systemInstruction}\n\nUser Input: ${prompt}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                reply: text,
                status: "Surya 9: Core Active" 
            })
        };

    } catch (error) {
        // If 1.5-flash still fails, it might be a regional issue. 
        // We return a clear error to help you troubleshoot.
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                reply: "Surya 9 System Alert: Connection Interrupted.",
                details: error.message
            })
        };
    }
};
