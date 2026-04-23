import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        snapshots: {
          orderBy: { reportDate: 'desc' },
          include: { violations: true, suppressed: true },
        },
      },
    });

    const rows: string[] = [];
    const headers = [
      'Brand', 'Report Date', 'Health Score', 'ODR %', 'LDR %',
      'Cancellation %', 'Violations', 'Suppressed', 'Notes',
    ];
    rows.push(headers.map(h => `"${h}"`).join(','));

    for (const brand of brands) {
      for (const snap of brand.snapshots) {
        const violationList = snap.violations
          .map(v => `${v.severity}: ${v.issue}`).join('; ');
        const suppressedList = snap.suppressed
          .map(s => `${s.asin || 'N/A'} - ${s.reason || ''}`).join('; ');
        rows.push([
          `"${brand.name}"`,
          `"${new Date(snap.reportDate).toLocaleDateString()}"`,
          snap.healthScore,
          Number(snap.odr),
          Number(snap.ldr),
          Number(snap.cancellationRate),
          `"${violationList}"`,
          `"${suppressedList}"`,
          `"${(snap.notes || '').replace(/"/g, '""')}"`,
        ].join(','));
      }
    }

    const csv = rows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="health-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
