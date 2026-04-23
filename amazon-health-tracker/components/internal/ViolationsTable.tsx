'use client';

import React from 'react';
import { ViolationData } from '@/types';
import Badge from '@/components/ui/Badge';

interface ViolationsTableProps {
  violations: ViolationData[];
}

export default function ViolationsTable({ violations }: ViolationsTableProps) {
  const severityVariant = (s: string) => {
    if (s === 'HIGH') return 'danger';
    if (s === 'MEDIUM') return 'warning';
    return 'info';
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Violations
        {violations.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] font-bold">{violations.length}</span>
        )}
      </h3>
      {violations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[#22c55e] text-2xl mb-2">✓</div>
          <p className="text-sm text-[#64748b]">No active violations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {violations.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0a0e17] hover:bg-[#0f1520] transition-colors">
              <span className="text-sm text-[#e2e8f0] flex-1 mr-3">{v.issue}</span>
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant(v.severity)}>{v.severity}</Badge>
                {v.status && <span className="text-[10px] text-[#64748b] bg-[#1a2236] px-2 py-0.5 rounded-md">{v.status}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
