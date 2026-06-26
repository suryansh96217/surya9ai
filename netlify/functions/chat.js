const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Setting model to Gemini 3.5 Flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash"
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: response.text() }),
        };
    } catch (error) {
        console.error("3.5 Flash Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "Error: Surya 9 core failed to process the request." }) 
        };
    }
};