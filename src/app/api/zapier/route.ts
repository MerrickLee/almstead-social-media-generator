import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting to Zapier:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit' }, { status: 500 });
    }
}
