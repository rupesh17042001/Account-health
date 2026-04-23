import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBrandColor, getBrandAvatar } from '@/lib/colors';

/**
 * GET /api/brands — List all brands for the current user's org
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { snapshots: true } },
        snapshots: {
          orderBy: { reportDate: 'desc' },
          take: 1,
          include: {
            violations: true,
            suppressed: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('GET /api/brands error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch brands' }, { status: 500 });
  }
}

/**
 * POST /api/brands — Create a new brand
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sellerId } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    // Count existing brands for color assignment
    const brandCount = await prisma.brand.count({ where: { organizationId: orgId } });

    const brand = await prisma.brand.create({
      data: {
        name,
        sellerId: sellerId || null,
        color: getBrandColor(brandCount),
        avatar: getBrandAvatar(name),
        organizationId: orgId,
      },
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('POST /api/brands error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create brand' }, { status: 500 });
  }
}
