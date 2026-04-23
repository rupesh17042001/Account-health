'use client';

import React, { useState } from 'react';
import { useDashboardStore } from '@/lib/store';
import { BrandData } from '@/types';
import toast from 'react-hot-toast';

export default function BrandTabs() {
  const { brands, activeBrandId, setActiveBrandId, triggerRefresh } = useDashboardStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newBrandName} added!`);
        setNewBrandName('');
        setShowAddForm(false);
        triggerRefresh();
      } else {
        toast.error(data.error || 'Failed to add brand');
      }
    } catch {
      toast.error('Failed to add brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${brandName}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`${brandName} deleted successfully`);
        const remaining = brands.filter((b: BrandData) => b.id !== brandId);
        setActiveBrandId(remaining.length > 0 ? remaining[0].id : null);
        triggerRefresh();
      } else {
        toast.error(data.error || 'Failed to delete brand');
      }
    } catch {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto scrollbar-hide">
      {brands.map((brand: BrandData) => (
        <button
          key={brand.id}
          onClick={() => setActiveBrandId(brand.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            activeBrandId === brand.id
              ? 'bg-[#1a2236] text-white border border-[#ff6b2b]/40 shadow-lg shadow-[#ff6b2b]/10'
              : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#111827] border border-transparent'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: brand.color }}
          />
          {brand.name}
          {brand.snapshots && brand.snapshots.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#111827] text-[#64748b]">
              {brand._count?.snapshots || brand.snapshots.length}
            </span>
          )}
          {activeBrandId === brand.id && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBrand(brand.id, brand.name);
              }}
              className="ml-1 p-1 -mr-2 rounded-lg hover:bg-[#ef4444]/20 text-[#64748b] hover:text-[#ef4444] transition-colors"
              title="Delete Brand"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
          )}
        </button>
      ))}

      {/* Add Brand */}
      {showAddForm ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
            placeholder="Brand name..."
            className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1f2d45] text-sm text-[#e2e8f0] placeholder-[#64748b] focus:border-[#ff6b2b] focus:outline-none w-40"
            autoFocus
          />
          <button
            onClick={handleAddBrand}
            disabled={loading}
            className="p-2 rounded-lg bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button
            onClick={() => { setShowAddForm(false); setNewBrandName(''); }}
            className="p-2 rounded-lg text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-dashed border-[#1f2d45] text-[#64748b] hover:border-[#ff6b2b] hover:text-[#ff6b2b] text-sm font-medium transition-all duration-200 whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Add Brand
        </button>
      )}
    </div>
  );
}
