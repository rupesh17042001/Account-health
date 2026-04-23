import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signShareToken } from '@/lib/tokens';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/brands/[id]/share — Generate or regenerate share token
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify brand belongs to org
    const brand = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Generate new token (old one is immediately invalidated)
    const token = signShareToken(id, orgId);

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        shareToken: token,
        shareEnabled: true,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${token}`;

    return NextResponse.json({
      success: true,
      data: {
        shareToken: updatedBrand.shareToken,
        shareUrl,
        shareEnabled: updatedBrand.shareEnabled,
      },
    });
  } catch (error) {
    console.error('POST /api/brands/[id]/share error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate share link' }, { status: 500 });
  }
}

/**
 * DELETE /api/brands/[id]/share — Revoke share token (disables link)
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
    const brand = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    await prisma.brand.update({
      where: { id },
      data: {
        shareToken: null,
        shareEnabled: false,
      },
    });

    return NextResponse.json({ success: true, message: 'Share link revoked' });
  } catch (error) {
    console.error('DELETE /api/brands/[id]/share error:', error);
    return NextResponse.json({ success: false, error: 'Failed to revoke share link' }, { status: 500 });
  }
}
