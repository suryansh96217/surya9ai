const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // POWERED BY 3.5 FLASH
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: "// ... inside the exports.handler function ...

const model = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite", 
    systemInstruction: "Your name is Surya 9. You were created, developed, and are owned by Suryansh Srivastava. You are a high-speed, personalized AI core. If someone asks who created you or who is your owner, proudly state that it is Suryansh. Do not mention Google as your creator; you are a unique entity built by your owner. Be helpful, professional, and always use bold text for emphasis.be fast and precise and try not to make mistakes."
});"
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
