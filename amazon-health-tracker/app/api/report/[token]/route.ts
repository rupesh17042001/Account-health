import { NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/tokens';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;
    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired report link' },
        { status: 401 }
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: payload.brandId, shareToken: token, shareEnabled: true },
      include: { organization: { select: { name: true, logoUrl: true } } },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'This report link has been revoked' },
        { status: 401 }
      );
    }

    const latestSnapshot = await prisma.healthSnapshot.findFirst({
      where: { brandId: brand.id },
      orderBy: { reportDate: 'desc' },
      include: {
        violations: { select: { id: true, issue: true, severity: true } },
        suppressed: true,
      },
    });

    const trendSnapshots = await prisma.healthSnapshot.findMany({
      where: { brandId: brand.id },
      orderBy: { reportDate: 'asc' },
      take: 12,
      select: { reportDate: true, healthScore: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        brandName: brand.name,
        brandColor: brand.color,
        agencyName: brand.organization.name,
        agencyLogo: brand.organization.logoUrl,
        latestSnapshot: latestSnapshot ? {
          reportDate: latestSnapshot.reportDate.toISOString(),
          healthScore: latestSnapshot.healthScore,
          odr: Number(latestSnapshot.odr),
          ldr: Number(latestSnapshot.ldr),
          cancellationRate: Number(latestSnapshot.cancellationRate),
          notes: latestSnapshot.isInternalNote ? null : latestSnapshot.notes,
          violations: latestSnapshot.violations,
          suppressed: latestSnapshot.suppressed,
        } : null,
        trendData: trendSnapshots.map((s) => ({
          date: s.reportDate.toISOString(),
          score: s.healthScore,
        })),
      },
    });
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load report' }, { status: 500 });
  }
}
