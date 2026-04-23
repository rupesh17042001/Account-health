// @ts-ignore - amazon-sp-api types don't play perfectly with ES modules
import SellingPartnerAPI = require('amazon-sp-api');
import { gunzipSync } from 'zlib';

/**
 * Initializes an SP-API client for a specific brand's refresh token.
 */
export const getSpApiClient = (refreshToken: string, region: 'na' | 'eu' | 'fe' = 'eu') => {
  if (!process.env.SP_API_CLIENT_ID || !process.env.SP_API_CLIENT_SECRET) {
    throw new Error('Missing global SP_API App credentials in environment variables.');
  }

  // @ts-ignore
  return new SellingPartnerAPI({
    region,
    refresh_token: refreshToken,
    options: {
      auto_retry_rate_limits: false,
    },
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: process.env.SP_API_CLIENT_ID,
      SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SP_API_CLIENT_SECRET,
      AWS_ACCESS_KEY_ID: process.env.SP_API_AWS_ACCESS_KEY_ID || '',
      AWS_SECRET_ACCESS_KEY: process.env.SP_API_AWS_SECRET_ACCESS_KEY || '',
      AWS_SELLING_PARTNER_ROLE: process.env.SP_API_AWS_ROLE_ARN || '',
    },
  });
};

/**
 * Helper to request a Sales and Traffic report, wait for it to process, and download it.
 * WARNING: This uses polling and can take several minutes. For production, this should be split
 * into an async job queue (e.g., BullMQ or AWS SQS).
 */
export const fetchSalesAndTrafficReport = async (
  client: any,
  marketplaceId: string,
  dataStartTime: string,
  dataEndTime: string
) => {
  console.log(`🚀 Requesting GET_SALES_AND_TRAFFIC_REPORT from ${dataStartTime} to ${dataEndTime}...`);
  
  // 1. Request the report
  const createRes = await client.callAPI({
    operation: 'reports.createReport',
    body: {
      reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
      marketplaceIds: [marketplaceId],
      dataStartTime,
      dataEndTime,
      reportOptions: {
        dateGranularity: 'DAY',
        asinGranularity: 'SKU'
      }
    }
  });

  const reportId = createRes.reportId;
  console.log(`✅ Report requested. ID: ${reportId}`);

  // 2. Poll for completion
  let processingStatus = 'IN_QUEUE';
  let reportDocumentId = null;

  while (processingStatus === 'IN_QUEUE' || processingStatus === 'IN_PROGRESS') {
    console.log('⏳ Waiting 15 seconds for report to process...');
    await new Promise((resolve) => setTimeout(resolve, 15000));

    const statusRes = await client.callAPI({
      operation: 'reports.getReport',
      path: { reportId }
    });

    processingStatus = statusRes.processingStatus;
    console.log(`📊 Status: ${processingStatus}`);

    if (processingStatus === 'DONE') {
      reportDocumentId = statusRes.reportDocumentId;
    } else if (processingStatus === 'FATAL' || processingStatus === 'CANCELLED') {
      throw new Error(`Report processing failed with status: ${processingStatus}`);
    }
  }

  if (!reportDocumentId) throw new Error('No document ID returned');

  // 3. Get document download URL
  console.log('📥 Fetching document download URL...');
  const docRes = await client.callAPI({
    operation: 'reports.getReportDocument',
    path: { reportDocumentId }
  });

  // 4. Download the actual JSON data (Amazon may return gzip-compressed)
  console.log('📄 Downloading report document...');
  const res = await fetch(docRes.url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Check for gzip magic bytes (0x1f 0x8b)
  let jsonString: string;
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
    console.log('📦 Detected gzip compression, decompressing...');
    const decompressed = gunzipSync(buffer);
    jsonString = decompressed.toString('utf-8');
  } else {
    jsonString = buffer.toString('utf-8');
  }

  const data = JSON.parse(jsonString);
  console.log('✅ Report data parsed successfully.');
  
  return data;
};

/**
 * Helper to request an Inventory report (TSV format), wait for it to process, and download it.
 */
export const fetchInventoryReport = async (
  client: any,
  marketplaceId: string
) => {
  console.log(`🚀 Requesting GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA...`);
  
  const createRes = await client.callAPI({
    operation: 'reports.createReport',
    body: {
      reportType: 'GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA',
      marketplaceIds: [marketplaceId],
    }
  });

  const reportId = createRes.reportId;
  console.log(`✅ Inventory report requested. ID: ${reportId}`);

  let processingStatus = 'IN_QUEUE';
  let reportDocumentId = null;

  while (processingStatus === 'IN_QUEUE' || processingStatus === 'IN_PROGRESS') {
    console.log('⏳ Waiting 15 seconds for inventory report to process...');
    await new Promise((resolve) => setTimeout(resolve, 15000));

    const statusRes = await client.callAPI({
      operation: 'reports.getReport',
      path: { reportId }
    });

    processingStatus = statusRes.processingStatus;
    console.log(`📊 Status: ${processingStatus}`);

    if (processingStatus === 'DONE') {
      reportDocumentId = statusRes.reportDocumentId;
    } else if (processingStatus === 'FATAL' || processingStatus === 'CANCELLED') {
      throw new Error(`Inventory report processing failed with status: ${processingStatus}`);
    }
  }

  if (!reportDocumentId) throw new Error('No document ID returned');

  console.log('📥 Fetching inventory document download URL...');
  const docRes = await client.callAPI({
    operation: 'reports.getReportDocument',
    path: { reportDocumentId }
  });

  console.log('📄 Downloading inventory report document...');
  const res = await fetch(docRes.url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let tsvString: string;
  if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
    console.log('📦 Detected gzip compression, decompressing...');
    const decompressed = gunzipSync(buffer);
    tsvString = decompressed.toString('utf-8');
  } else {
    tsvString = buffer.toString('utf-8');
  }

  console.log('✅ Inventory TSV data downloaded successfully.');
  
  // Basic TSV Parser
  const lines = tsvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split('\t');
  const inventoryData = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    inventoryData.push(row);
  }

  return inventoryData;
};
