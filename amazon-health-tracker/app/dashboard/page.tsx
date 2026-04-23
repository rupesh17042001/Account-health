'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/lib/store';
import Header from '@/components/internal/Header';
import BrandTabs from '@/components/internal/BrandTabs';
import StatCard from '@/components/internal/StatCard';
import HealthGauge from '@/components/internal/HealthGauge';
import PerformanceMetrics from '@/components/internal/PerformanceMetrics';
import ViolationsTable from '@/components/internal/ViolationsTable';
import SuppressedList from '@/components/internal/SuppressedList';
import AllBrandsTable from '@/components/internal/AllBrandsTable';
import TrendChart from '@/components/internal/TrendChart';
import BrandForm from '@/components/internal/BrandForm';
import ShareLinkPanel from '@/components/internal/ShareLinkPanel';
import ExportModal from '@/components/internal/ExportModal';
import BrandSettings from '@/components/internal/BrandSettings';
import { SnapshotData } from '@/types';

type DashboardTab = 'Overview' | 'Sales Analytics' | 'LQI Analytics' | 'Settings';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview');
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const {
    brands, setBrands, activeBrandId, setActiveBrandId,
    snapshots, setSnapshots, isDataEntryMode,
    salesData, setSalesData, inventoryData, setInventoryData,
    isExportModalOpen, setExportModalOpen, refreshKey, triggerRefresh,
  } = useDashboardStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
        if (!activeBrandId && data.data.length > 0) {
          setActiveBrandId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  }, [setBrands, activeBrandId, setActiveBrandId]);

  const handleSyncSpApi = async () => {
    if (!activeBrandId) return;
    setSyncing(true);
    const { toast } = await import('react-hot-toast');
    const toastId = toast.loading('Syncing with Amazon SP-API...');
    try {
      const res = await fetch(`/api/brands/${activeBrandId}/sync-sp-api`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Sync complete!', { id: toastId });
        triggerRefresh();
      } else {
        toast.error(data.error || 'Failed to sync SP-API', { id: toastId });
      }
    } catch (err) {
      toast.error('An error occurred during sync', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => { if (status === 'authenticated') fetchBrands(); }, [status, refreshKey, fetchBrands]);

  // Fetch snapshots and SP-API data for active brand
  useEffect(() => {
    if (!activeBrandId) return;
    
    const fetchBrandData = async () => {
      try {
        const [snapRes, spApiRes] = await Promise.all([
          fetch(`/api/brands/${activeBrandId}/snapshots`),
          fetch(`/api/brands/${activeBrandId}/sp-api-data`)
        ]);
        
        if (!snapRes.ok || !spApiRes.ok) {
          if (snapRes.status === 404 || spApiRes.status === 404) {
            console.warn('Brand not found (stale ID?), resetting active brand.');
            setActiveBrandId(null);
          }
          return;
        }

        const snapData = await snapRes.json();
        if (snapData.success) setSnapshots(snapData.data);

        const spData = await spApiRes.json();
        if (spData.success) {
          setSalesData(spData.data.sales);
          setInventoryData(spData.data.inventory);
        }
      } catch (err) {
        console.error('Failed to fetch brand data:', err);
      }
    };
    fetchBrandData();
  }, [activeBrandId, refreshKey, setSnapshots, setSalesData, setInventoryData, setActiveBrandId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b2b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const activeBrand = brands.find(b => b.id === activeBrandId);
  const latestSnap: SnapshotData | null = snapshots.length > 0 ? snapshots[0] : null;
  const hasAnyData = latestSnap !== null || salesData.length > 0;
  
  // Create a safe fallback so the UI doesn't crash if they only have sales data but no health snapshots
  const safeSnap = latestSnap || {
    id: 'placeholder',
    brandId: activeBrandId || '',
    reportDate: new Date().toISOString(),
    healthScore: 0,
    odr: 0,
    ldr: 0,
    cancellationRate: 0,
    notes: '',
    isInternalNote: false,
    violations: [],
    suppressed: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Header userName={user?.name} orgName={user?.organizationName} />
      
      {/* Brand Tabs */}
      <div className="border-b border-[#1f2d45]">
        <div className="max-w-[1400px] mx-auto">
          <BrandTabs />
        </div>
      </div>

      {/* Sub Navigation */}
      {activeBrandId && !isDataEntryMode && (
        <div className="bg-[#0f1523] border-b border-[#1f2d45] sticky top-0 z-10">
          <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
            <div className="flex gap-8">
              {(['Overview', 'Sales Analytics', 'LQI Analytics', 'Settings'] as DashboardTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#ff6b2b] text-[#ff6b2b]'
                      : 'border-transparent text-[#64748b] hover:text-[#e2e8f0]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleSyncSpApi}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#111827] border border-[#ff6b2b]/30 text-[#ffb347] text-sm font-medium hover:bg-[#ff6b2b]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <div className="w-4 h-4 border-2 border-[#ffb347] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.67-5.67"/></svg>
              )}
              {syncing ? 'Syncing...' : 'Sync SP-API'}
            </button>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {isDataEntryMode ? (
          <BrandForm />
        ) : (
          <>
            {activeBrand && hasAnyData ? (
              <>
                {activeTab === 'Overview' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard
                    title="Health Score"
                    value={safeSnap.healthScore}
                    subtitle={`Updated ${new Date(safeSnap.reportDate).toLocaleDateString()}`}
                    borderColor="#22c55e"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                  />
                  <StatCard
                    title="Violations"
                    value={safeSnap.violations.length}
                    subtitle={safeSnap.violations.filter(v => v.severity === 'HIGH').length > 0 ? `${safeSnap.violations.filter(v => v.severity === 'HIGH').length} critical` : 'None critical'}
                    borderColor="#ef4444"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>}
                  />
                  <StatCard
                    title="Suppressed"
                    value={safeSnap.suppressed.length}
                    subtitle="Listings"
                    borderColor="#f59e0b"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                  />
                  <StatCard
                    title="ODR"
                    value={`${Number(safeSnap.odr).toFixed(1)}%`}
                    subtitle="Order Defect Rate"
                    borderColor="#3b82f6"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>}
                  />
                  <StatCard
                    title="30-Day Sales"
                    value={salesData.length > 0 ? `$${Math.round(salesData.reduce((acc, curr) => acc + curr.orderedProductSales, 0)).toLocaleString()}` : '$0'}
                    subtitle={`${salesData.reduce((acc, curr) => acc + curr.unitsOrdered, 0)} units ordered`}
                    borderColor="#ffb347"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                  />
                </div>

                {/* Gauge + Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-6 flex items-center justify-center">
                    <HealthGauge score={safeSnap.healthScore} animationKey={activeBrandId || 'default'} />
                  </div>
                  <div className="md:col-span-2">
                    <PerformanceMetrics
                      odr={Number(safeSnap.odr)}
                      ldr={Number(safeSnap.ldr)}
                      cancellationRate={Number(safeSnap.cancellationRate)}
                    />
                  </div>
                </div>

                {/* Trend Chart */}
                <TrendChart snapshots={snapshots} brandColor={activeBrand.color} />

                {/* Violations + Suppressed Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ViolationsTable violations={safeSnap.violations} />
                  <SuppressedList items={safeSnap.suppressed} />
                </div>

                {/* Share Link Panel */}
                <ShareLinkPanel brand={activeBrand} onUpdate={triggerRefresh} />

                {/* Notes */}
                {safeSnap.notes && (
                  <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
                    <h3 className="text-sm font-semibold text-[#e2e8f0] mb-2 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Notes
                      {safeSnap.isInternalNote && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">Internal</span>}
                    </h3>
                    <p className="text-sm text-[#94a3b8] leading-relaxed">{safeSnap.notes}</p>
                  </div>
                )}
                  </div>
                )}
                
                {activeTab === 'Sales Analytics' && (
                  <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-12 text-center animate-in fade-in duration-300">
                    <div className="text-4xl mb-3">📈</div>
                    <h3 className="text-lg font-semibold text-[#e2e8f0] mb-1">Sales & Traffic Analytics</h3>
                    <p className="text-sm text-[#64748b]">Real-time SP-API data integration coming soon. Currently using seeded mock data for 30-Day Sales metric.</p>
                  </div>
                )}

                {activeTab === 'LQI Analytics' && (
                  <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-12 text-center animate-in fade-in duration-300">
                    <div className="text-4xl mb-3">✨</div>
                    <h3 className="text-lg font-semibold text-[#e2e8f0] mb-1">Listing Quality Index (LQI)</h3>
                    <p className="text-sm text-[#64748b]">LQI Dashboard merging in progress...</p>
                  </div>
                )}
                
                {activeTab === 'Settings' && (
                  <div className="animate-in fade-in duration-300">
                    <BrandSettings />
                  </div>
                )}
              </>
            ) : activeBrand ? (
              <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-12 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-[#e2e8f0] mb-1">No data yet</h3>
                <p className="text-sm text-[#64748b] mb-4">Switch to &quot;Update Data&quot; to add the first health snapshot for {activeBrand.name}</p>
                {activeTab === 'Settings' && (
                  <div className="mt-8 text-left">
                    <BrandSettings />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-12 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-[#e2e8f0] mb-1">Welcome!</h3>
                <p className="text-sm text-[#64748b]">Add your first brand using the &quot;+ Add Brand&quot; button above</p>
              </div>
            )}

            {/* All Brands Table */}
            {brands.length > 1 && <AllBrandsTable brands={brands} />}
          </>
        )}
      </main>

      <ExportModal isOpen={isExportModalOpen} onClose={() => setExportModalOpen(false)} />
    </div>
  );
}
