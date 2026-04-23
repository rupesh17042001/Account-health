import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/brands/[id]/snapshots — Get all snapshots for a brand
 */
export async function GET(request: Request, { params }: RouteParams) {
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

    const snapshots = await prisma.healthSnapshot.findMany({
      where: { brandId: id },
      include: { violations: true, suppressed: true },
      orderBy: { reportDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: snapshots });
  } catch (error) {
    console.error('GET /api/brands/[id]/snapshots error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch snapshots' }, { status: 500 });
  }
}

/**
 * POST /api/brands/[id]/snapshots — Create a new health snapshot
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

    const body = await request.json();
    const { reportDate, healthScore, odr, ldr, cancellationRate, notes, isInternalNote, violations, suppressed } = body;

    if (healthScore === undefined || odr === undefined || ldr === undefined || cancellationRate === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const snapshot = await prisma.healthSnapshot.create({
      data: {
        brandId: id,
        reportDate: new Date(reportDate || new Date()),
        healthScore: Number(healthScore),
        odr: Number(odr),
        ldr: Number(ldr),
        cancellationRate: Number(cancellationRate),
        notes: notes || null,
        isInternalNote: isInternalNote || false,
        violations: {
          create: (violations || []).map((v: { issue: string; severity: string; status?: string }) => ({
            issue: v.issue,
            severity: v.severity,
            status: v.status || null,
          })),
        },
        suppressed: {
          create: (suppressed || []).map((s: { asin?: string; title?: string; reason?: string }) => ({
            asin: s.asin || null,
            title: s.title || null,
            reason: s.reason || null,
          })),
        },
      },
      include: { violations: true, suppressed: true },
    });

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('POST /api/brands/[id]/snapshots error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create snapshot' }, { status: 500 });
  }
}
