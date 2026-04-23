'use client';

import React, { useState } from 'react';
import Toggle from '@/components/ui/Toggle';
import Button from '@/components/ui/Button';
import { BrandData } from '@/types';
import toast from 'react-hot-toast';

interface ShareLinkPanelProps {
  brand: BrandData;
  onUpdate: () => void;
}

export default function ShareLinkPanel({ brand, onUpdate }: ShareLinkPanelProps) {
  const [loading, setLoading] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shareUrl = brand.shareToken ? `${appUrl}/report/${brand.shareToken}` : null;

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        const res = await fetch(`/api/brands/${brand.id}/share`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          toast.success('Share link enabled');
          onUpdate();
        }
      } else {
        const res = await fetch(`/api/brands/${brand.id}/share`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          toast.success('Share link revoked');
          onUpdate();
        }
      }
    } catch { toast.error('Failed to update share link'); }
    finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!confirm('This will invalidate the current link immediately. Continue?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brands/${brand.id}/share`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { toast.success('New link generated'); onUpdate(); }
    } catch { toast.error('Failed to regenerate'); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        Client Report Link
      </h3>
      <div className="space-y-4">
        <Toggle enabled={brand.shareEnabled} onToggle={handleToggle} label={brand.shareEnabled ? 'Enabled' : 'Disabled'} disabled={loading} />

        {brand.shareEnabled && shareUrl && (
          <>
            <div className="flex items-center gap-2 p-3 bg-[#0a0e17] rounded-xl border border-[#1f2d45]">
              <input
                type="text" readOnly value={shareUrl}
                className="flex-1 bg-transparent text-xs text-[#94a3b8] font-mono focus:outline-none truncate"
              />
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copy
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(shareUrl, '_blank')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Preview
              </Button>
              <Button variant="danger" size="sm" onClick={handleRegenerate} loading={loading}>
                Regenerate
              </Button>
            </div>
            <p className="text-[10px] text-[#f59e0b] flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              Regenerating creates a new link and invalidates the previous one immediately.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
