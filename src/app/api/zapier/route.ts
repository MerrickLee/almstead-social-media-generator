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

        // Support multiple images
        if (payload.imageUrls && Array.isArray(payload.imageUrls)) {
            console.log(`Intercepting ${payload.imageUrls.length} image(s) for Cloudinary...`);

            try {
                // Upload all Base64 strings concurrently
                const uploadPromises = payload.imageUrls.map(async (imgString: string) => {
                    if (imgString && imgString.startsWith('data:image')) {
                        const uploadResult = await cloudinary.uploader.upload(imgString, {
                            folder: 'almstead_social_drafts',
                        });
                        return uploadResult.secure_url;
                    }
                    return imgString; // return as-is if not base64
                });

                payload.imageUrls = await Promise.all(uploadPromises);
                console.log('Cloudinary Upload Success:', payload.imageUrls);
            } catch (uploadError) {
                console.error("Cloudinary bulk upload failed:", uploadError);
                // Fallback gracefully so text content still arrives
                payload.imageUrls = ["UPLOAD_FAILED"];
            }
        } // End of multiple image support

        // Map array down to a single string for Zapier simplicity
        // Check if imageUrls still exists before mapping
        if (payload.imageUrls && Array.isArray(payload.imageUrls)) {
            payload.imageUrl = payload.imageUrls.join(', ');
            delete payload.imageUrls;
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
