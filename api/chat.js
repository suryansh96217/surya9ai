module.exports = async (req, res) => {
    // 1. Professional Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { prompt, history = [] } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) return res.status(500).json({ reply: "Surya 9 Error: API Key missing." });

        // THE PRIORITY LIST: We try 3.1 Flash Lite first, then fallback to 1.5 Flash
        const modelsToTry = ["gemini-3.1-flash-lite", "gemini-1.5-flash"];
        let lastError = "";

        for (let modelId of modelsToTry) {
            try {
                // v1beta is required for the newest/lite models
                const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`;

                const systemInstruction = `Your name is Surya 9. You are a Professional Digital Intelligence Core. Architect: Suryansh Srivastava. Use Markdown. Tone: Professional and Precise.`;

                // Structure conversation
                const contents = (history || []).map(h => ({
                    role: h.role === 'model' ? 'model' : 'user',
                    parts: [{ text: h.parts[0].text }]
                }));

                contents.push({
                    role: "user",
                    parts: [{ text: `${systemInstruction}\n\nUser Query: ${prompt}` }]
                });

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                            topP: 0.95
                        }
                    })
                });

                const data = await response.json();

                // If this specific model ID worked, return the response
                if (data.candidates && data.candidates[0].content) {
                    const aiReply = data.candidates[0].content.parts[0].text;
                    return res.status(200).json({ 
                        reply: aiReply,
                        modelUsed: modelId 
                    });
                } else if (data.error) {
                    lastError = data.error.message;
                    continue; // Try the next model in the list
                }
            } catch (err) {
                lastError = err.message;
                continue;
            }
        }

        // If both models fail, send the last captured error
        return res.status(500).json({ 
            reply: `Surya 9 Core Alert: All intelligence nodes failed. Last Error: ${lastError}`,
            tip: "Double-check your API key starts with 'AQ' or 'AIza' and is active."
        });

    } catch (error) {
        return res.status(500).json({ reply: "Surya 9 Critical Failure: " + error.message });
    }
};
