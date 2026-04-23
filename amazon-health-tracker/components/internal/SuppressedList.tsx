'use client';

import React from 'react';
import { SuppressedData } from '@/types';

interface SuppressedListProps {
  items: SuppressedData[];
}

export default function SuppressedList({ items }: SuppressedListProps) {
  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        Suppressed Listings
        {items.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-bold">{items.length}</span>
        )}
      </h3>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[#22c55e] text-2xl mb-2">✓</div>
          <p className="text-sm text-[#64748b]">No suppressed listings</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0a0e17] hover:bg-[#0f1520] transition-colors gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {item.asin && <span className="text-xs font-mono text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded">{item.asin}</span>}
                  <span className="text-sm text-[#e2e8f0] truncate">{item.title || 'Untitled'}</span>
                </div>
                {item.reason && <p className="text-xs text-[#64748b] mt-0.5">{item.reason}</p>}
              </div>
              {item.asin && (
                <a
                  href={`https://sellercentral.amazon.in/fix-stranded-inventory`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[#ff6b2b]/10 text-[#ff6b2b] hover:bg-[#ff6b2b]/20 font-semibold whitespace-nowrap transition-colors"
                >
                  Fix →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
