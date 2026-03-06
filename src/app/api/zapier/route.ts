import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with specific account credentials
// In a real production app, these would be in .env.local
cloudinary.config({
    cloud_name: 'dioiqiklo',
    api_key: '623949813684389',
    api_secret: 'KeEG6uX8R3R6fufa_VOiYWpJh_0'
});

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // If the payload contains a base64 image URL from the browser
        if (payload.imageUrl && payload.imageUrl.startsWith('data:image')) {
            console.log('Intercepting Base64 string for Cloudinary upload...');
            try {
                // Upload directly to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(payload.imageUrl, {
                    folder: 'almstead_social_drafts',
                });

                // Replace the heavy base64 string with the light, permanent Cloudinary URL
                payload.imageUrl = uploadResult.secure_url;
                console.log('Cloudinary Upload Success:', payload.imageUrl);
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError);
                // We proceed even if Cloudinary fails, dropping the image so text still arrives
                payload.imageUrl = "UPLOAD_FAILED";
            }
        }

        console.log("Final payload being sent to Zapier:", payload);

        // Node.js server fetch natively bypassing CORS
        const response = await fetch('https://hooks.zapier.com/hooks/catch/24716706/ux25i31/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Zapier responded with status: ${response.status}`);
        }

        return NextResponse.json({ success: true, cloudinaryUrl: payload.imageUrl });
    } catch (error) {
        console.error('Error submitting to Zapier:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
