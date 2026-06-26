const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // POWERED BY 3.5 FLASH
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: "Your name is Surya 9. You are a state-of-the-art AI powered by the Gemini-3.1-flash-lite. You are incredibly fast, precise, and professional. Always use bold text for important terms and keep your answers concise unless asked otherwise."
        });

        // Generate content with 3.5 Flash parameters
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: text }),
        };
    } catch (error) {
        console.error("System Error:", error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "Surya 9 Core Error: " + error.message }) 
        };
    }
};
