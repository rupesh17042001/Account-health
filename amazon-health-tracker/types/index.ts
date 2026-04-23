export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';
// ─── Brand Types ─────────────────────────────────────────────────────

export interface BrandData {
  id: string;
  name: string;
  sellerId?: string | null;
  color: string;
  avatar: string;
  organizationId: string;
  shareToken?: string | null;
  shareEnabled: boolean;
  spApiRefreshToken?: string | null;
  spApiClientId?: string | null;
  spApiClientSecret?: string | null;
  awsRegion?: string | null;
  createdAt: string;
  updatedAt: string;
  snapshots?: SnapshotData[];
  _count?: {
    snapshots: number;
  };
}

export interface CreateBrandInput {
  name: string;
  sellerId?: string;
}

export interface UpdateBrandInput {
  name?: string;
  sellerId?: string;
  color?: string;
  spApiRefreshToken?: string;
  spApiClientId?: string;
  spApiClientSecret?: string;
  awsRegion?: string;
}

// ─── Snapshot Types ──────────────────────────────────────────────────

export interface SnapshotData {
  id: string;
  brandId: string;
  reportDate: string;
  healthScore: number;
  odr: number;
  ldr: number;
  cancellationRate: number;
  notes?: string | null;
  isInternalNote: boolean;
  violations: ViolationData[];
  suppressed: SuppressedData[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnapshotInput {
  reportDate: string;
  healthScore: number;
  odr: number;
  ldr: number;
  cancellationRate: number;
  notes?: string;
  isInternalNote?: boolean;
  violations: CreateViolationInput[];
  suppressed: CreateSuppressedInput[];
}

export interface UpdateSnapshotInput extends Partial<CreateSnapshotInput> {
  id: string;
}

// ─── Violation Types ─────────────────────────────────────────────────

export interface ViolationData {
  id: string;
  issue: string;
  severity: Severity;
  status?: string | null;
}

export interface CreateViolationInput {
  issue: string;
  severity: Severity;
  status?: string;
}

// ─── Suppressed Listing Types ────────────────────────────────────────

export interface SuppressedData {
  id: string;
  asin?: string | null;
  title?: string | null;
  reason?: string | null;
}

export interface CreateSuppressedInput {
  asin?: string;
  title?: string;
  reason?: string;
}

// ─── Report Types (Public Brand View) ────────────────────────────────

export interface BrandReportData {
  brandName: string;
  brandColor: string;
  agencyName: string;
  agencyLogo?: string | null;
  latestSnapshot: {
    reportDate: string;
    healthScore: number;
    odr: number;
    ldr: number;
    cancellationRate: number;
    notes?: string | null;
    violations: Omit<ViolationData, 'status'>[];
    suppressed: SuppressedData[];
  } | null;
  trendData: {
    date: string;
    score: number;
  }[];
}

// ─── API Response Types ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── SP-API Data Types ─────────────────────────────────────────────────

export interface SalesData {
  id: string;
  brandId: string;
  date: string;
  orderedProductSales: number;
  unitsOrdered: number;
  totalOrderItems: number;
  sessions: number;
  pageViews: number;
  buyBoxPercentage: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryData {
  id: string;
  brandId: string;
  sku: string;
  asin: string;
  title?: string | null;
  fulfillableQuantity: number;
  inboundQuantity: number;
  reservedQuantity: number;
  unfulfillableQuantity: number;
  snapshotDate: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ──────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}
