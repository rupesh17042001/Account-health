import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/snapshots/[id] — Update a snapshot
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

    // Verify snapshot belongs to org via brand
    const snapshot = await prisma.healthSnapshot.findFirst({
      where: { id },
      include: { brand: true },
    });

    if (!snapshot || snapshot.brand.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: 'Snapshot not found' }, { status: 404 });
    }

    // Update snapshot fields
    const updated = await prisma.healthSnapshot.update({
      where: { id },
      data: {
        ...(body.reportDate && { reportDate: new Date(body.reportDate) }),
        ...(body.healthScore !== undefined && { healthScore: Number(body.healthScore) }),
        ...(body.odr !== undefined && { odr: Number(body.odr) }),
        ...(body.ldr !== undefined && { ldr: Number(body.ldr) }),
        ...(body.cancellationRate !== undefined && { cancellationRate: Number(body.cancellationRate) }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.isInternalNote !== undefined && { isInternalNote: body.isInternalNote }),
      },
      include: { violations: true, suppressed: true },
    });

    // If violations provided, replace them
    if (body.violations) {
      await prisma.violation.deleteMany({ where: { snapshotId: id } });
      await prisma.violation.createMany({
        data: body.violations.map((v: { issue: string; severity: string; status?: string }) => ({
          snapshotId: id,
          issue: v.issue,
          severity: v.severity,
          status: v.status || null,
        })),
      });
    }

    // If suppressed provided, replace them
    if (body.suppressed) {
      await prisma.suppressedListing.deleteMany({ where: { snapshotId: id } });
      await prisma.suppressedListing.createMany({
        data: body.suppressed.map((s: { asin?: string; title?: string; reason?: string }) => ({
          snapshotId: id,
          asin: s.asin || null,
          title: s.title || null,
          reason: s.reason || null,
        })),
      });
    }

    // Re-fetch with relations
    const result = await prisma.healthSnapshot.findUnique({
      where: { id },
      include: { violations: true, suppressed: true },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('PUT /api/snapshots/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update snapshot' }, { status: 500 });
  }
}

/**
 * DELETE /api/snapshots/[id] — Delete a snapshot
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify snapshot belongs to org
    const snapshot = await prisma.healthSnapshot.findFirst({
      where: { id },
      include: { brand: true },
    });

    if (!snapshot || snapshot.brand.organizationId !== orgId) {
      return NextResponse.json({ success: false, error: 'Snapshot not found' }, { status: 404 });
    }

    await prisma.healthSnapshot.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Snapshot deleted' });
  } catch (error) {
    console.error('DELETE /api/snapshots/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete snapshot' }, { status: 500 });
  }
}
