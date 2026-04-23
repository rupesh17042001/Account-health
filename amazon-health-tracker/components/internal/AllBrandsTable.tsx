'use client';

import React, { useState } from 'react';
import { BrandData } from '@/types';
import { getHealthStatus, getMetricStatus } from '@/lib/health';
import { useDashboardStore } from '@/lib/store';

interface AllBrandsTableProps {
  brands: BrandData[];
}

type SortKey = 'name' | 'healthScore' | 'odr' | 'ldr' | 'cancellationRate' | 'violations' | 'suppressed';

const SortHeader = ({ label, sKey, sortKey, sortAsc, handleSort }: { label: string; sKey: SortKey; sortKey: SortKey; sortAsc: boolean; handleSort: (key: SortKey) => void }) => (
  <th
    onClick={() => handleSort(sKey)}
    className="px-4 py-3 text-left text-[10px] font-semibold text-[#64748b] uppercase tracking-wider cursor-pointer hover:text-[#e2e8f0] transition-colors select-none"
  >
    <span className="flex items-center gap-1">
      {label}
      {sortKey === sKey && <span className="text-[#ff6b2b]">{sortAsc ? '↑' : '↓'}</span>}
    </span>
  </th>
);

export default function AllBrandsTable({ brands }: AllBrandsTableProps) {
  const { setActiveBrandId, setDataEntryMode } = useDashboardStore();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const getSnap = (b: BrandData) => b.snapshots?.[0] || null;

  const sorted = [...brands].sort((a, b) => {
    const sa = getSnap(a);
    const sb = getSnap(b);
    let va: number | string = 0, vb: number | string = 0;

    switch (sortKey) {
      case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
      case 'healthScore': va = sa?.healthScore ?? -1; vb = sb?.healthScore ?? -1; break;
      case 'odr': va = sa?.odr ?? 0; vb = sb?.odr ?? 0; break;
      case 'ldr': va = sa?.ldr ?? 0; vb = sb?.ldr ?? 0; break;
      case 'cancellationRate': va = sa?.cancellationRate ?? 0; vb = sb?.cancellationRate ?? 0; break;
      case 'violations': va = sa?.violations?.length ?? 0; vb = sb?.violations?.length ?? 0; break;
      case 'suppressed': va = sa?.suppressed?.length ?? 0; vb = sb?.suppressed?.length ?? 0; break;
    }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1f2d45]">
        <h3 className="text-sm font-semibold text-[#e2e8f0] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          All Brands Overview
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1f2d45]">
              <SortHeader label="Brand" sKey="name" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="Health" sKey="healthScore" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="ODR %" sKey="odr" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="LDR %" sKey="ldr" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="Cancel %" sKey="cancellationRate" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="Violations" sKey="violations" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
              <SortHeader label="Suppressed" sKey="suppressed" sortKey={sortKey} sortAsc={sortAsc} handleSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((brand) => {
              const snap = getSnap(brand);
              const score = snap?.healthScore ?? 0;
              const status = getHealthStatus(score);
              return (
                <tr
                  key={brand.id}
                  onClick={() => { setActiveBrandId(brand.id); setDataEntryMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="border-b border-[#1f2d45]/50 hover:bg-[#1a2236] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: brand.color }}>
                        {brand.avatar}
                      </div>
                      <span className="text-sm text-[#e2e8f0] font-medium">{brand.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: status.color }}>
                      <span className="text-[8px]">{status.icon}</span>
                      {score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: getMetricStatus(Number(snap?.odr ?? 0), 'odr').color }}>
                      {snap ? Number(snap.odr).toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: getMetricStatus(Number(snap?.ldr ?? 0), 'ldr').color }}>
                      {snap ? Number(snap.ldr).toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: getMetricStatus(Number(snap?.cancellationRate ?? 0), 'cancellationRate').color }}>
                      {snap ? Number(snap.cancellationRate).toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${(snap?.violations?.length ?? 0) > 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                      {snap?.violations?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${(snap?.suppressed?.length ?? 0) > 0 ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>
                      {snap?.suppressed?.length ?? 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
