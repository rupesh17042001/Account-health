import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify brand
    const brand = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!brand) return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });

    const sales = await prisma.salesAndTraffic.findMany({
      where: { brandId: id },
      orderBy: { date: 'asc' },
      take: 30, // Last 30 days
    });

    const inventory = await prisma.inventory.findMany({
      where: { brandId: id },
      orderBy: { snapshotDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: { sales, inventory } });
  } catch (error) {
    console.error('GET /api/brands/[id]/sp-api-data error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch SP-API data' }, { status: 500 });
  }
}
