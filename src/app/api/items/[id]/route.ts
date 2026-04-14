import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Await the params Promise
    const { id } = await params;

    // Make sure user owns the item
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    if (existingItem.reporterEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    const updatedItem = await Item.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Await the params Promise
    const { id } = await params;

    // Make sure user owns the item
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    if (existingItem.reporterEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await Item.findByIdAndDelete(id);

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
