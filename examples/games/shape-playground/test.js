import { OpenAI } from 'openai';
import 'dotenv/config';

async function main() {
    const shapesClient = new OpenAI({
        apiKey: process.env.SHAPES_API_KEY,
        baseURL: "https://api.shapes.inc/v1",
    });

    try {
        const response = await shapesClient.chat.completions.create({
            model: "shapesinc/chatgptfour",
            messages: [{ role: "user", content: "Hello whats your name and what do you do explain in detail" }]
        });
        console.log(response);
        console.log(response.choices);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();