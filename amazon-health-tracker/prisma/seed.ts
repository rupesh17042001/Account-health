import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signShareToken } from '../lib/tokens';

type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.suppressedListing.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.healthSnapshot.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Amplicomm Agency',
      slug: 'amplicomm',
      logoUrl: null,
    },
  });
  console.log(`✅ Organization: ${org.name}`);

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@amplicomm.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const member = await prisma.user.create({
    data: {
      email: 'member@amplicomm.com',
      name: 'Team Member',
      password: hashedPassword,
      role: 'MEMBER',
      organizationId: org.id,
    },
  });
  console.log(`✅ Member: ${member.email}`);

  // 3. Create Brands
  const varroc = await prisma.brand.create({
    data: {
      name: 'Varroc',
      sellerId: 'A1VARROC123',
      color: '#ff6b2b',
      avatar: 'VA',
      organizationId: org.id,
      shareEnabled: true,
      shareToken: signShareToken('varroc-temp', org.id),
    },
  });

  const pilgrim = await prisma.brand.create({
    data: {
      name: 'Pilgrim',
      sellerId: 'A2PILGRIM456',
      color: '#3b82f6',
      avatar: 'PI',
      organizationId: org.id,
      shareEnabled: false,
    },
  });

  const studd = await prisma.brand.create({
    data: {
      name: 'Studd Muffyn',
      sellerId: 'A3STUDD789',
      color: '#8b5cf6',
      avatar: 'SM',
      organizationId: org.id,
      shareEnabled: true,
      shareToken: signShareToken('studd-temp', org.id),
    },
  });

  // Update share tokens with real brand IDs
  const varrocToken = signShareToken(varroc.id, org.id);
  const studdToken = signShareToken(studd.id, org.id);
  await prisma.brand.update({ where: { id: varroc.id }, data: { shareToken: varrocToken } });
  await prisma.brand.update({ where: { id: studd.id }, data: { shareToken: studdToken } });

  console.log(`✅ Brands: Varroc, Pilgrim, Studd Muffyn`);

  // 4. Create Snapshots (8 weeks each)
  const now = new Date();

  // Helper to generate weekly dates going back
  const weekDate = (weeksAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - weeksAgo * 7);
    return d;
  };

  // Varroc — improving trend
  const varrocScores = [58, 62, 65, 61, 68, 70, 69, 72];
  const varrocOdr = [1.2, 1.1, 1.0, 1.1, 0.9, 0.9, 0.8, 0.8];
  const varrocLdr = [4.8, 4.5, 4.2, 4.0, 3.8, 3.5, 3.3, 3.2];
  const varrocCancel = [2.8, 2.6, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9];

  for (let i = 0; i < 8; i++) {
    const isLatest = i === 7;
    await prisma.healthSnapshot.create({
      data: {
        brandId: varroc.id,
        reportDate: weekDate(7 - i),
        healthScore: varrocScores[i],
        odr: varrocOdr[i],
        ldr: varrocLdr[i],
        cancellationRate: varrocCancel[i],
        notes: isLatest ? 'ODR and LDR improving steadily. Continue monitoring Q2 inventory levels.' : null,
        isInternalNote: false,
        ...(isLatest ? {
          violations: {
            create: [
              { issue: 'Product authenticity complaint — SKU VAR-2847', severity: 'HIGH' as Severity, status: 'Under Review' },
              { issue: 'Late shipment notification threshold exceeded', severity: 'MEDIUM' as Severity, status: 'Resolved' },
            ],
          },
          suppressed: {
            create: [
              { asin: 'B09K3VHLP1', title: 'Varroc LED Headlight Assembly — Pulsar NS200', reason: 'Missing product image on white background' },
              { asin: 'B09K3WQRT2', title: 'Varroc Tail Light Unit — Honda Activa 6G', reason: 'Incomplete product description' },
            ],
          },
        } : {}),
      },
    });
  }
  console.log(`✅ Varroc: 8 snapshots`);

  // Pilgrim — consistently healthy
  const pilgrimScores = [82, 84, 85, 86, 87, 88, 89, 88];
  const pilgrimOdr = [0.4, 0.4, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
  const pilgrimLdr = [1.5, 1.4, 1.3, 1.2, 1.2, 1.1, 1.1, 1.1];
  const pilgrimCancel = [1.0, 0.9, 0.9, 0.8, 0.8, 0.8, 0.8, 0.8];

  for (let i = 0; i < 8; i++) {
    const isLatest = i === 7;
    await prisma.healthSnapshot.create({
      data: {
        brandId: pilgrim.id,
        reportDate: weekDate(7 - i),
        healthScore: pilgrimScores[i],
        odr: pilgrimOdr[i],
        ldr: pilgrimLdr[i],
        cancellationRate: pilgrimCancel[i],
        notes: isLatest ? 'Excellent performance across all metrics. Top-performing brand in portfolio.' : null,
        isInternalNote: isLatest,
      },
    });
  }
  console.log(`✅ Pilgrim: 8 snapshots`);

  // Studd Muffyn — critical, needs attention
  const studdScores = [52, 48, 45, 43, 40, 38, 39, 41];
  const studdOdr = [1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.4, 2.4];
  const studdLdr = [5.5, 5.8, 6.0, 6.2, 6.5, 6.8, 7.0, 6.8];
  const studdCancel = [3.0, 3.2, 3.3, 3.4, 3.5, 3.6, 3.5, 3.5];

  for (let i = 0; i < 8; i++) {
    const isLatest = i === 7;
    await prisma.healthSnapshot.create({
      data: {
        brandId: studd.id,
        reportDate: weekDate(7 - i),
        healthScore: studdScores[i],
        odr: studdOdr[i],
        ldr: studdLdr[i],
        cancellationRate: studdCancel[i],
        notes: isLatest ? 'Critical: Account at risk of suspension. Immediate action required on fulfillment pipeline.' : null,
        isInternalNote: false,
        ...(isLatest ? {
          violations: {
            create: [
              { issue: 'Inauthentic item policy violation — multiple ASINs flagged', severity: 'HIGH' as Severity, status: 'Action Required' },
              { issue: 'Account health rating below acceptable threshold', severity: 'HIGH' as Severity, status: 'Monitoring' },
            ],
          },
          suppressed: {
            create: [
              { asin: 'B0A1SM001', title: 'Studd Muffyn Face Wash — Charcoal 100ml', reason: 'Safety compliance document missing' },
              { asin: 'B0A1SM002', title: 'Studd Muffyn Hair Wax — Strong Hold 50g', reason: 'Ingredient list not in compliant format' },
              { asin: 'B0A1SM003', title: 'Studd Muffyn Beard Oil — 30ml', reason: 'Product image does not meet requirements' },
              { asin: 'B0A1SM004', title: 'Studd Muffyn Lip Balm — SPF 15', reason: 'Missing FDA registration number' },
            ],
          },
        } : {}),
      },
    });
  }
  console.log(`✅ Studd Muffyn: 8 snapshots`);

  // 5. Generate Automated SP-API Data (Sales & Inventory)
  const generateSalesAndInventory = async (brandId: string) => {
    // Sales for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      await prisma.salesAndTraffic.create({
        data: {
          brandId,
          date,
          orderedProductSales: Math.random() * 5000 + 1000,
          unitsOrdered: Math.floor(Math.random() * 50) + 10,
          totalOrderItems: Math.floor(Math.random() * 40) + 10,
          sessions: Math.floor(Math.random() * 500) + 100,
          pageViews: Math.floor(Math.random() * 1000) + 200,
          buyBoxPercentage: Math.random() * 20 + 80,
          conversionRate: Math.random() * 5 + 2,
        }
      });
    }

    // Inventory Snapshot (current)
    const skus = ['SKU-A1', 'SKU-B2', 'SKU-C3'];
    for (const sku of skus) {
      await prisma.inventory.create({
        data: {
          brandId,
          sku,
          asin: `B00${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          title: `Product ${sku}`,
          fulfillableQuantity: Math.floor(Math.random() * 500),
          inboundQuantity: Math.floor(Math.random() * 100),
          reservedQuantity: Math.floor(Math.random() * 50),
          unfulfillableQuantity: Math.floor(Math.random() * 10),
          snapshotDate: now,
        }
      });
    }
  };

  await generateSalesAndInventory(varroc.id);
  await generateSalesAndInventory(pilgrim.id);
  await generateSalesAndInventory(studd.id);
  console.log(`✅ SP-API Data: Sales and Inventory generated for all brands`);

  console.log('\n✨ Seed completed successfully!');
  console.log(`\n📋 Share URLs:`);
  console.log(`   Varroc:       ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${varrocToken}`);
  console.log(`   Studd Muffyn: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${studdToken}`);
  console.log(`\n🔑 Login:`);
  console.log(`   Admin:  admin@amplicomm.com / password123`);
  console.log(`   Member: member@amplicomm.com / password123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
