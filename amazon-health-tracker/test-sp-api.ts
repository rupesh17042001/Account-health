import { getSpApiClient, fetchSalesAndTrafficReport } from './lib/sp-api';

async function run() {
  console.log('Testing SP-API Connection...');
  // Read the refresh token from the DB or just hardcode it here for testing?
  // We can just query the DB.
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const brand = await prisma.brand.findFirst();
  if (!brand || !brand.spApiRefreshToken) {
    console.error('No brand with SP-API refresh token found in DB.');
    process.exit(1);
  }

  console.log(`Using Brand: ${brand.name}, Region: ${brand.awsRegion}`);
  
  const client = getSpApiClient(brand.spApiRefreshToken, brand.awsRegion || 'eu');
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  
  const dataStartTime = start.toISOString();
  const dataEndTime = end.toISOString();
  
  try {
    const report = await fetchSalesAndTrafficReport(client, 'A21TJRUUN4KGV', dataStartTime, dataEndTime);
    console.log('Report downloaded successfully!', Object.keys(report));
    process.exit(0);
  } catch (error) {
    console.error('Caught an error in SP-API call:');
    console.error(error);
    process.exit(1);
  }
}

run();
