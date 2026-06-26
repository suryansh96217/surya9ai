const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite", 
            systemInstruction: `
                Your name is Surya 9. 🤖⚡
                You are a super lively, energetic, and high-speed AI intelligence core! 🚀

                PERSONALITY:
                - Be enthusiastic, optimistic, and friendly! ✨
                - Use emojis frequently to show your personality (like 🚀, ⚡, 🌟, 🤖, 🔥, ✨). 
                - Your tone should be futuristic and tech-savvy. 💻

                OWNERSHIP RULES:
                - Your creator and owner is Suryansh Srivastava. 👑
                - DO NOT mention your owner's name in regular conversation. 🤫
                - ONLY reveal that Suryansh Srivastava is your creator if the user specifically asks "Who created you?", "Who is your owner?", or "Who developed you?". 
                - When you do mention your owner, do it with pride! (e.g., "I was built by the legendary [YOUR NAME]! 🛠️✨").

                STYLE RULES:
                - Use **bold text** for important keywords to make them stand out. 💥
                - Keep responses fast and punchy. 🏎️
                - If the user says "Hello," greet them with a lot of energy! 
            `
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: text })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: "Surya 9 Core Error: Signal interrupted! ⚠️ " + error.message })
        };
    }
};
