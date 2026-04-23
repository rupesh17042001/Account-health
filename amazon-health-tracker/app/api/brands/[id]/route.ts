import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/brands/[id] — Get a single brand
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const brand = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
      include: {
        snapshots: {
          orderBy: { reportDate: 'desc' },
          include: { violations: true, suppressed: true },
        },
        sales: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 days
        },
        inventory: {
          orderBy: { snapshotDate: 'desc' },
          take: 100,
        }
      },
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('GET /api/brands/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch brand' }, { status: 500 });
  }
}

/**
 * PUT /api/brands/[id] — Update brand metadata
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify brand belongs to org
    const existing = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.sellerId !== undefined && { sellerId: body.sellerId }),
        ...(body.color && { color: body.color }),
        ...(body.spApiRefreshToken !== undefined && { spApiRefreshToken: body.spApiRefreshToken }),
        ...(body.spApiClientId !== undefined && { spApiClientId: body.spApiClientId }),
        ...(body.spApiClientSecret !== undefined && { spApiClientSecret: body.spApiClientSecret }),
        ...(body.awsRegion !== undefined && { awsRegion: body.awsRegion }),
      },
    });

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('PUT /api/brands/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update brand' }, { status: 500 });
  }
}

/**
 * DELETE /api/brands/[id] — Delete a brand and all its data
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify brand belongs to org
    const existing = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('DELETE /api/brands/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete brand' }, { status: 500 });
  }
}
