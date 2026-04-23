import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getOrgIdFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSpApiClient, fetchSalesAndTrafficReport, fetchInventoryReport } from '@/lib/sp-api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const orgId = getOrgIdFromSession(session);
    
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 1. Get the brand and ensure it has SP-API credentials configured
    const brand = await prisma.brand.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    if (!brand.spApiRefreshToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'SP-API Refresh Token is not configured for this brand.' 
      }, { status: 400 });
    }

    // 2. Initialize the SP-API Client
    const client = getSpApiClient(brand.spApiRefreshToken, (brand.awsRegion as any) || 'eu');
    
    // Default to a marketplace
    const marketplaceId = 'A21TJRUUN4KGV'; // India Marketplace ID as an example

    // 3. Define date range (Last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    const dataStartTime = start.toISOString();
    const dataEndTime = end.toISOString();

    // 4. Fetch the reports concurrently
    const [rawReport, inventoryList] = await Promise.all([
      fetchSalesAndTrafficReport(client, marketplaceId, dataStartTime, dataEndTime),
      fetchInventoryReport(client, marketplaceId)
    ]);

    // 5. Parse and upsert the data into Prisma
    let insertedSalesCount = 0;
    
    if (rawReport.salesAndTrafficByDate) {
      for (const day of rawReport.salesAndTrafficByDate) {
        const dateStr = day.date; // e.g. "2023-10-01"
        const salesDate = new Date(dateStr);
        
        const orderedProductSales = day.salesByDate?.orderedProductSales?.amount || 0;
        const unitsOrdered = day.salesByDate?.unitsOrdered || 0;
        const totalOrderItems = day.salesByDate?.totalOrderItems || 0;
        
        const sessions = day.trafficByDate?.sessions || 0;
        const pageViews = day.trafficByDate?.pageViews || 0;
        const buyBoxPercentage = day.trafficByDate?.buyBoxPercentage || 0;
        
        // Protect against divide by zero
        const conversionRate = sessions > 0 ? (unitsOrdered / sessions) * 100 : 0;

        await prisma.salesAndTraffic.upsert({
          where: { brandId_date: { brandId: brand.id, date: salesDate } },
          update: { orderedProductSales, unitsOrdered, totalOrderItems, sessions, pageViews, buyBoxPercentage, conversionRate },
          create: { brandId: brand.id, date: salesDate, orderedProductSales, unitsOrdered, totalOrderItems, sessions, pageViews, buyBoxPercentage, conversionRate }
        });
        insertedSalesCount++;
      }
    }

    // 6. Upsert Inventory data
    let insertedInventoryCount = 0;
    const snapshotDate = new Date(); // Use current time for the inventory snapshot

    if (inventoryList && inventoryList.length > 0) {
      for (const item of inventoryList) {
        if (!item['sku'] || !item['asin']) continue;
        
        const inboundQty = 
          (Number(item['afn-inbound-working-quantity']) || 0) + 
          (Number(item['afn-inbound-shipped-quantity']) || 0) + 
          (Number(item['afn-inbound-receiving-quantity']) || 0);

        await prisma.inventory.upsert({
          where: { brandId_sku_snapshotDate: { brandId: brand.id, sku: item['sku'], snapshotDate: snapshotDate } },
          update: {
            asin: item['asin'],
            title: item['product-name'] || '',
            fulfillableQuantity: Number(item['afn-fulfillable-quantity']) || 0,
            inboundQuantity: inboundQty,
            reservedQuantity: Number(item['afn-reserved-quantity']) || 0,
            unfulfillableQuantity: Number(item['afn-unsellable-quantity']) || 0,
            snapshotDate: snapshotDate
          },
          create: {
            brandId: brand.id,
            sku: item['sku'],
            asin: item['asin'],
            title: item['product-name'] || '',
            fulfillableQuantity: Number(item['afn-fulfillable-quantity']) || 0,
            inboundQuantity: inboundQty,
            reservedQuantity: Number(item['afn-reserved-quantity']) || 0,
            unfulfillableQuantity: Number(item['afn-unsellable-quantity']) || 0,
            snapshotDate: snapshotDate
          }
        });
        insertedInventoryCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synchronized ${insertedSalesCount} days of Sales & Traffic data and ${insertedInventoryCount} inventory SKUs.`
    });

  } catch (error: any) {
    console.error('POST /api/brands/[id]/sync-sp-api error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to sync SP-API data' 
    }, { status: 500 });
  }
}
