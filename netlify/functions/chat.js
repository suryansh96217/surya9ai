const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // We use the 1.5-flash ID so the code actually runs
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "Your name is Surya 9. You are a helpful, high-speed AI core. Use bold text and be concise."
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: text }), // We make sure "reply" is clearly defined
        };
    } catch (error) {
        console.error("Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ reply: "I encountered an error in my core circuits. Please check the API key." }) 
        };
    }
};
