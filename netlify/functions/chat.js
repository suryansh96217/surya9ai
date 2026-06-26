const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // 1. Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 2. Parse the user's message
        const { prompt } = JSON.parse(event.body);

        // 3. Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // 4. Set the Model and System Instructions
        // Using 3.1 Flash-Lite for high-speed and 1,500 free daily requests
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite", 
            systemInstruction: `
                Your name is Surya 9. 
                You are a high-speed AI intelligence core.
                You were created and are owned by your Master Suryansh Srivastava.
                Always be professional, concise, and futuristic.
                Always use bold text (Markdown) for emphasis on key words.
            `
        });

        // 5. Generate the response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 6. Return the response to the website
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ reply: text })
        };

    } catch (error) {
        console.error("SURYA 9 CORE ERROR:", error.message);

        // 7. Handle specific errors gracefully
        let errorMessage = "Surya 9 Core Error: " + error.message;
        
        if (error.message.includes("429")) {
            errorMessage = "Quota Exceeded. Please wait a moment before sending more signals.";
        } else if (error.message.includes("API_KEY_INVALID")) {
            errorMessage = "System Error: Invalid API Key. Please check Netlify settings.";
        }

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: errorMessage })
        };
    }
};
