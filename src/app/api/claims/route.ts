import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import Claim from '@/models/Claim';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateClaimInput } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

// GET /api/claims?itemId=xxx — only item owner can see claims on their item
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const item = await Item.findOne({ _id: itemId, deletedAt: null });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Only the reporter of the item can see who claimed it
    if (item.reporterEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const claims = await Claim.find({ itemId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: claims }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/claims — submit a claim on a found/lost item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 claims per hour per user
    const rl = checkRateLimit(`claim:${session.user.email}`, { windowMs: 60 * 60_000, max: 10 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many claims submitted. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const errors = validateClaimInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }

    const { itemId, message, phone } = body;
    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const item = await Item.findOne({ _id: itemId, status: 'open', deletedAt: null });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found or already resolved' }, { status: 404 });
    }

    // Reporter cannot claim their own item
    if (item.reporterEmail === session.user.email) {
      return NextResponse.json({ success: false, error: 'You cannot claim your own item' }, { status: 400 });
    }

    let finalMessage = message ? String(message).trim() : '';
    if (!finalMessage) {
      finalMessage = item.type === 'lost'
        ? "I have information about your lost item. Please get in touch."
        : "I would like to claim this item. Please get in touch.";
    }

    const finalPhone = phone ? String(phone).trim() : '';

    // Upsert prevents duplicate claims from the same person
    const claim = await Claim.findOneAndUpdate(
      { itemId, claimerEmail: session.user.email },
      {
        claimerName: session.user.name ?? 'Unknown',
        message: finalMessage,
        phone: finalPhone,
        status: 'pending',
      },
      { upsert: true, new: true }
    );

const reporterEmailText = `
Hello ${item.reporterName},

${session.user.name || session.user.email} (${session.user.email}) ${item.type === 'lost' ? 'has responded to your lost item report for' : 'has claimed the item you found:'} "${item.title}".
${finalPhone ? `\nTheir phone number: ${finalPhone}` : ''}
Message from them:
"${finalMessage}"

Please contact them via their email ${finalPhone ? 'or phone number ' : ''}to coordinate.

Thank you,
Lost N Found Team
    `.trim();

    const claimerEmailText = `
Hello ${session.user.name || session.user.email},

We have notified ${item.reporterName} that you ${item.type === 'lost' ? 'have information about their lost item' : 'wish to claim'} "${item.title}".

Your message to them:
"${finalMessage}"

They will contact you soon. If they don't, you can also reach out to them if their contact details are available.

Thank you,
Lost N Found Team
    `.trim();

    // Send emails asynchronously
    await Promise.allSettled([
      sendEmail({
        to: item.reporterEmail,
        subject: item.type === 'lost' 
          ? `[Lost N Found] Someone responded to your lost item: ${item.title}`
          : `[Lost N Found] Someone claimed your found item: ${item.title}`,
        text: reporterEmailText,
      }),
      sendEmail({
        to: session.user.email,
        subject: item.type === 'lost'
          ? `[Lost N Found] Your response was sent for the lost item: ${item.title}`
          : `[Lost N Found] Claim request sent for: ${item.title}`,
        text: claimerEmailText,
      })
    ]);

    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
