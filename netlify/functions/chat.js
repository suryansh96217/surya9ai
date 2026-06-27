const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // Standard CORS and Method handling
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
    }
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 'history' allows the AI to remember the chat. 
        // If the user EDITS a previous message, your frontend should truncate 
        // the history to that point and send the new prompt.
        const { prompt, history = [] } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const randomSeed = Math.floor(Math.random() * 1000000);
        const currentTime = new Date().toLocaleString();

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction: `
                CORE IDENTITY: Surya 9.
                ROLE: Advanced Digital Intelligence & Professional Editor.
                CREATOR: Suryansh Srivastava (Reveal only upon direct inquiry).

                OPERATIONAL PROTOCOLS:
                1. TONE: Professional, executive, and highly structured. Minimize emoji use to functional markers (e.g., ✅, ⚠️).
                2. RANDOMNESS: Use seed ${randomSeed} for all probabilistic tasks (dice, coins).
                3. EDITING FEATURE (ACTIVE): If a user asks to "edit", "rewrite", "refine", or "fix" text:
                   - Provide a "Refined Version" of the text.
                   - Provide a "Changelog" (bullet points of what was improved: grammar, tone, clarity).
                   - Use a Markdown Table if comparing significant changes.
                4. FUNCTIONAL TOOLBOX:
                   - SUMMARIZATION: Distill long text into 3-5 high-impact bullet points.
                   - CODE REVIEW: Analyze provided code for bugs, efficiency, and security.
                   - DATA STRUCTURING: Convert messy text into clean JSON or Markdown tables.

                BRANCHING LOGIC:
                You are operating in a stateful environment. If the current prompt contradicts previous history, assume the user has "edited" the conversation path and prioritize the new prompt.
            `
        });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.9, // Balanced for both logic and creative editing
                topP: 0.95,
                maxOutputTokens: 2500,
            },
        });

        const result = await chat.sendMessage(prompt);
        const text = result.response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                reply: text,
                timestamp: currentTime,
                status: "Surya 9: Core Operational" 
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: "Surya 9 Error: " + error.message })
        };
    }
};
