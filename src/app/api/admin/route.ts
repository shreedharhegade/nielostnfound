import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';
import Claim from '@/models/Claim';
import AdminLog from '@/models/AdminLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isAdmin } from '@/lib/adminAuth';

// GET /api/admin?view=analytics|items|logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') ?? 'items';

    await connectToDatabase();

    if (view === 'analytics') {
      const [
        totalItems,
        openItems,
        resolvedItems,
        expiredItems,
        totalClaims,
        byCategory,
        byType,
        recentActivity,
      ] = await Promise.all([
        Item.countDocuments({ deletedAt: null }),
        Item.countDocuments({ status: 'open', deletedAt: null }),
        Item.countDocuments({ status: 'resolved', deletedAt: null }),
        Item.countDocuments({ status: 'expired', deletedAt: null }),
        Claim.countDocuments(),
        Item.aggregate([
          { $match: { deletedAt: null } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Item.aggregate([
          { $match: { deletedAt: null } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        Item.aggregate([
          { $match: { deletedAt: null } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 14 },
        ]),
      ]);

      const resolutionRate = totalItems > 0
        ? Math.round((resolvedItems / totalItems) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          summary: { totalItems, openItems, resolvedItems, expiredItems, totalClaims, resolutionRate },
          byCategory,
          byType,
          recentActivity,
        },
      });
    }

    if (view === 'logs') {
      const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100);
      return NextResponse.json({ success: true, data: logs });
    }

    // Default: all items including deleted
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const PAGE_SIZE = 20;
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean();
    const total = await Item.countDocuments();

    await AdminLog.create({
      adminEmail: session.user.email,
      action: 'view_all',
      details: `Viewed items page ${page}`,
    });

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
