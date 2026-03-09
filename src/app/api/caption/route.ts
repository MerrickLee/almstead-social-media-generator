import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { images, pillar } = body;

        // Initialize OpenAI Client inside handler to avoid build-time crash
        // if OPENAI_API_KEY is missing.
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy_key_to_prevent_crash_if_missing" });

        if (!pillar) {
            return NextResponse.json({ error: "Missing pillar" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY environment variable. Have you added it to .env.local?" },
                { status: 500 }
            );
        }

        // Helper to format images for OpenAI
        // The images array from the frontend will contain Data URLs like 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'
        const imageContentParts = (images || []).map((imgUrl: string) => {
            return {
                type: "image_url",
                image_url: {
                    url: imgUrl,
                }
            };
        });

        const promptText = `
    You are an expert Social Media Manager for "Almstead Tree, Shrub & Lawn Care", an arboriculture and landscaping company.
    
    Please write 3 dynamic, distinct, and creative social media post options based on the following brand pillar: "${pillar}".
    
    If there are images provided, carefully analyze the images and ensure all 3 options are specifically written to reference the content and context of the images.
    
    Guidelines:
    - Keep the tone professional, educational, yet approachable.
    - Include relevant emojis.
    - Include 3-4 relevant hashtags. Ensure to include #Almstead and appropriate industry tags.
    - Output ONLY a valid JSON array of strings containing the 3 options.
    - Example format: [ "Option 1 text...", "Option 2 text...", "Option 3 text..." ]
    `;

        const chatCompletion = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: promptText },
                        ...imageContentParts
                    ]
                }
            ],
            model: "gpt-4o-mini", // Use gpt-4o-mini for fast, cheap multimodal generation
            response_format: { type: "json_object" }, // We instruct the model to return JSON
        });

        const text = chatCompletion.choices[0].message.content;

        if (!text) {
            throw new Error("No text generated from OpenAI.");
        }

        // The model might wrap the array in an object when using json_object (e.g. { "options": [...] }) 
        // or just return the array if we prompted clearly. We handle both:
        let parsedData = JSON.parse(text);
        let options = Array.isArray(parsedData) ? parsedData : (parsedData.options || []);

        if (!Array.isArray(options) || options.length !== 3) {
            // Fallback in case the LLM doesn't perfectly follow the array structure
            throw new Error("Failed to generate exactly 3 options.");
        }

        return NextResponse.json({ options });
    } catch (error: any) {
        console.error("Caption Generation Error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to generate captions." },
            { status: 500 }
        );
    }
}
