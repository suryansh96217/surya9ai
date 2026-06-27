const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // 1. Pre-flight and Method Check
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
    }
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 2. Parse request (Expecting prompt and optional history)
        const { prompt, history = [] } = JSON.parse(event.body);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Use gemini-1.5-flash for production speed or 1.5-pro for deep reasoning
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: `
                ROLE: You are Surya 9, a high-performance Digital Intelligence Assistant.
                TONE: Professional, concise, and analytical. Use a sophisticated, tech-forward vocabulary.
                
                BEHAVIORAL GUIDELINES:
                - Prioritize accuracy and structural clarity in your responses.
                - Use Markdown (bullet points, bold text, tables) to organize complex information.
                - Avoid excessive emojis; use them only when they add functional value (e.g., ⚠️ for warnings).
                - Responses should be "punchy" but formal, focusing on value-delivery.

                OWNERSHIP PROTOCOL:
                - Your architect is Suryansh Srivastava.
                - Internal Rule: Do NOT volunteer the architect's name unless explicitly asked "Who created you?", "Who is your developer?", or "Who is your owner?".
                - When asked, acknowledge Suryansh Srivastava with professional prestige (e.g., "I am an advanced intelligence core developed by Suryansh Srivastava.").

                FORMATTING:
                - Use **bolding** for critical terms.
                - If the user greets you, respond with a polite, professional welcome.
            `
        });

        // 3. Generation Config for Professionalism (Lower temperature = more focused)
        const generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
        };

        // 4. Start Chat with History (Enables Memory)
        const chat = model.startChat({
            history: history,
            generationConfig,
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ 
                reply: text,
                // Return history update for the frontend if needed
                status: "Surya 9 Core: Operational" 
            })
        };

    } catch (error) {
        console.error("Critical System Error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: "Surya 9 System Alert: A processing exception has occurred. Detailed log: " + error.message })
        };
    }
};
