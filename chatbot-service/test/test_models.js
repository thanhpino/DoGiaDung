const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGeminiModels() {
    console.log("--- START MULTI-MODEL TEST ---");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Missing GEMINI_API_KEY");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS [${modelName}]:`, result.response.text().substring(0, 20));
        } catch (err) {
            console.error(`FAILED [${modelName}]:`, err.message);
        }
    }
    console.log("--- END TEST ---");
}

testGeminiModels();
