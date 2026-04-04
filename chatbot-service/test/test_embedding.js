const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env' });

async function testEmbedding() {
    try {
        console.log("--- START EMBEDDING TEST ---");
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        
        console.log("Sending request to Gemini Embedding...");
        const result = await model.embedContent("Hello world");
        console.log("Embedding length:", result.embedding.values.length);
        console.log("--- TEST SUCCESS ---");
    } catch (err) {
        console.error("EMBEDDING API ERROR:", err.message);
        console.log("--- TEST FAILED ---");
    }
}

testEmbedding();
