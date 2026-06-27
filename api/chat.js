module.exports = async (req, res) => {
    // 1. Modern Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "API Key missing." });

        // 2. THE TARGET: gemini-3.5-flash (Latest Frontier Flash as of June 2026)
        // Using the v1 stable endpoint for production reliability
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

        // 3. CASUAL PERSONA
        const systemInstruction = `
            Your name is Surya 9. You are a helpful, casual, and very smart AI friend. 
            - Speak naturally and keep it simple. No "robot" talk or "intelligence core" jargon.
            - Focus on being genuinely helpful and precise.
            - HIDE OWNER: Do NOT mention Suryansh Srivastava unless specifically asked "Who developed you?" or "Who is your owner?".
            - Use Markdown (bold, lists) to keep things readable.
        `;

        const contents = (history || []).map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.parts[0].text }]
        }));

        contents.push({
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser: ${prompt}` }]
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents,
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2048,
                    topP: 0.95
                }
            })
        });

        const data = await response.json();

        // Error Handling
        if (data.error) {
            console.error("API Error:", data.error.message);
            return res.status(200).json({ 
                reply: `Oops! Something went wrong on the server side: ${data.error.message}` 
            });
        }

        if (data.candidates && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: aiReply });
        }

        return res.status(200).json({ reply: "I'm here, but I didn't catch that. Say it again?" });

    } catch (error) {
        return res.status(500).json({ reply: "Signal lost! Mind trying again in a second?" });
    }
};

        return res.status(200).json({ reply: finalReply });

    } catch (error) {
        return res.status(500).json({ reply: "Oops, something went wrong. Let's try that again." });
    }
};
