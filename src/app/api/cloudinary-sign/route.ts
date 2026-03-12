import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const { paramsToSign } = await req.json();
        console.log('Generating Cloudinary signature for params:', paramsToSign);
        console.log('Using Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error generating Cloudinary signature:', error);
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }
}
