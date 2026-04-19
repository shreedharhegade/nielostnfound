import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const reporterEmail = searchParams.get('reporterEmail');
    const query: any = {};
    if (type) query.type = type;
    if (reporterEmail) {
      query.reporterEmail = reporterEmail;
    } else {
      // If fetching for the main dashboard (no specific reporter), hide resolved items
      query.status = 'open';
    }

    await connectToDatabase();
    const items = await Item.find(query).sort({ date: -1 });

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'lost' | 'found';
    const category = formData.get('category') as string;
    const location = formData.get('location') as string;
    const date = formData.get('date') as string;
    const phone = formData.get('phone') as string;
    const image = formData.get('image') as File;

    let imageUrl = '';

    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      
      try {
        imageUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'nielostnfound' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url as string);
            }
          );
          uploadStream.end(buffer);
        });
      } catch (err) {
        console.error("Cloudinary upload failed, fallback to none", err);
      }
    }

    const newItem = await Item.create({
      title,
      description,
      type,
      category,
      location,
      date: new Date(date),
      imageUrl,
      reporterEmail: session.user.email,
      reporterName: session.user.name,
      reporterPhone: phone || undefined,
      status: 'open'
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
