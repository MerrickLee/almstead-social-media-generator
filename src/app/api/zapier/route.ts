import { NextResponse } from 'next/server';
import { savePost } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        const payload = await req.json();

        // Keep original array for DB storage before joining for Zapier
        const originalImageUrls = [...(payload.imageUrls || [])];

        // imageUrls should now be an array of Cloudinary URLs (already uploaded by the client)
        // Join them into a single string for Zapier simplicity
        if (payload.imageUrls && Array.isArray(payload.imageUrls)) {
            payload.imageUrl = payload.imageUrls.join(', ');
            delete payload.imageUrls;
        }

        console.log("Final payload being sent to Zapier:", payload);

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

        // Log to database
        await savePost({
            text: payload.text || "",
            image_urls: originalImageUrls,
            pillar: payload.pillar || null,
            author_email: session?.user?.email || "unknown",
            author_name: session?.user?.name || null,
            workflow: "standard"
        });

        return NextResponse.json({ success: true, cloudinaryUrl: payload.imageUrl });
    } catch (error) {
        console.error('Error submitting to Zapier:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
