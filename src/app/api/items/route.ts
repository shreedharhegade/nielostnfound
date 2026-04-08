import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query: any = {};
    if (type) query.type = type;

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
    const image = formData.get('image') as File;

    let imageUrl = '';

    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + '_' + image.name.replace(/\s+/g, '_');
      const publicDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure the public/uploads directory exists
      try {
        await writeFile(path.join(publicDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error("Image upload failed, fallback to none", err);
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
      status: 'open'
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
