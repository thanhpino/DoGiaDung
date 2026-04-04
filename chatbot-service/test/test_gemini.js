const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
    try {
        console.log("--- START GEMINI TEST ---");
        console.log("Model: gemini-1.5-flash");
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Using API Key from environment:", apiKey ? "Present (Starts with " + apiKey.substring(0, 5) + ")" : "Missing");

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in .env file at path: " + path.join(__dirname, '../.env'));
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("Sending request to Gemini...");
        const result = await model.generateContent("Say hello in a valid JSON object like { \"message\": \"hello\" }");
        const text = result.response.text();
        console.log("Raw Response Text:", text);
        
        try {
           const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
           console.log("Cleaned Text:", cleaned);
           const json = JSON.parse(cleaned);
           console.log("Parsed JSON Object:", json);
           console.log("--- TEST SUCCESS ---");
        } catch (parseErr) {
           console.error("JSON PARSE ERROR:", parseErr.message);
           console.log("--- TEST FAILED (PARSE) ---");
        }

    } catch (err) {
        console.error("GEMINI API ERROR:", err.message);
        if (err.stack) console.error(err.stack);
        console.log("--- TEST FAILED (API) ---");
    }
}

testGemini();
