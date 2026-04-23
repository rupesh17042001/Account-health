'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useDashboardStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function BrandSettings() {
  const { activeBrandId, brands, triggerRefresh } = useDashboardStore();
  const brand = brands.find(b => b.id === activeBrandId);

  const [sellerId, setSellerId] = useState('');
  const [spApiRefreshToken, setSpApiRefreshToken] = useState('');
  const [spApiClientId, setSpApiClientId] = useState('');
  const [spApiClientSecret, setSpApiClientSecret] = useState('');
  const [awsRegion, setAwsRegion] = useState('eu');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand) {
      setSellerId(brand.sellerId || '');
      setSpApiRefreshToken(brand.spApiRefreshToken || '');
      setSpApiClientId(brand.spApiClientId || '');
      setSpApiClientSecret(brand.spApiClientSecret || '');
      setAwsRegion(brand.awsRegion || 'eu');
    }
  }, [brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${activeBrandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: sellerId || null,
          spApiRefreshToken: spApiRefreshToken || null,
          spApiClientId: spApiClientId || null,
          spApiClientSecret: spApiClientSecret || null,
          awsRegion: awsRegion || null,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Brand settings updated!');
        triggerRefresh();
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (!brand) return null;

  const inputClass = 'w-full px-3 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] placeholder-[#4b5563] focus:border-[#ff6b2b] focus:outline-none focus:ring-1 focus:ring-[#ff6b2b]/20 transition-colors';
  const labelClass = 'text-xs font-semibold text-[#94a3b8] mb-1.5 block';

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-[#1f2d45] mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: brand.color }}>
          {brand.avatar}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Brand Settings</h3>
          <p className="text-xs text-[#64748b]">Configure Amazon SP-API integration for {brand.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Amazon Seller ID</label>
          <input
            type="text"
            value={sellerId}
            onChange={e => setSellerId(e.target.value)}
            placeholder="e.g. A2Q3Y263D00KWC"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>SP-API Refresh Token</label>
          <input
            type="text"
            value={spApiRefreshToken}
            onChange={e => setSpApiRefreshToken(e.target.value)}
            placeholder="Atzr|IwEB..."
            className={inputClass}
          />
          <p className="text-[10px] text-[#64748b] mt-1">Obtained when the seller authorizes your app.</p>
        </div>
        
        <div className="p-4 bg-[#0f1523] rounded-xl border border-[#1f2d45] space-y-4">
          <h4 className="text-sm font-semibold text-[#e2e8f0]">App Overrides (Optional)</h4>
          <p className="text-xs text-[#64748b]">
            Leave these blank to use the global SP-API app credentials from your .env file.
            Only fill these if this brand uses a different private app.
          </p>
          
          <div>
            <label className={labelClass}>Client ID</label>
            <input
              type="text"
              value={spApiClientId}
              onChange={e => setSpApiClientId(e.target.value)}
              placeholder="amzn1.application-oa2-client..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Client Secret</label>
            <input
              type="password"
              value={spApiClientSecret}
              onChange={e => setSpApiClientSecret(e.target.value)}
              placeholder="amzn1.oa2-cs.v1..."
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>AWS Region</label>
            <select
              value={awsRegion}
              onChange={e => setAwsRegion(e.target.value)}
              className={inputClass}
            >
              <option value="eu">Europe (eu)</option>
              <option value="na">North America (na)</option>
              <option value="fe">Far East (fe)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
