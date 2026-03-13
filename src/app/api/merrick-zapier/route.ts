import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // imageUrls should now be an array of Cloudinary URLs (already uploaded by the client)
        // Join them into a single string for Zapier simplicity
        if (payload.imageUrls && Array.isArray(payload.imageUrls)) {
            payload.imageUrl = payload.imageUrls.join(', ');
            delete payload.imageUrls;
        }

        console.log("Final payload being sent to Merrick's Zapier:", payload);

        // New Zapier link for "Send to Merrick"
        const response = await fetch('https://hooks.zapier.com/hooks/catch/24716706/uxxn08x/', {
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
        console.error('Error submitting to Merrick Zapier:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
