import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import ItemReport from '@/models/ItemReport';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const rl = checkRateLimit(`report:${session.user.email}`, { windowMs: 60 * 60_000, max: 5 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many reports submitted. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { itemId, reason } = body;

    if (!itemId || !reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json({ success: false, error: 'Valid item ID and reason are required' }, { status: 400 });
    }

    await connectToDatabase();

    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    const report = await ItemReport.create({
      itemId,
      reporterEmail: session.user.email,
      reason: reason.trim(),
    });

    const adminEmail = process.env.EMAIL_USER;
    if (adminEmail) {
      const adminEmailText = `
An item has been flagged by a user on Lost N Found.

Item Title: ${item.title}
Item ID: ${item._id}
Reported By: ${session.user.email}

Reason for flagging:
"${reason.trim()}"

Please review this item in the database or admin dashboard.
      `.trim();

      await sendEmail({
        to: adminEmail,
        subject: `[Lost N Found] Action Required: Item Flagged - ${item.title}`,
        text: adminEmailText,
      });
    }

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
