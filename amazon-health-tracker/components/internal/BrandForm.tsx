'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useDashboardStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ViolationInput { issue: string; severity: string; status: string; }
interface SuppressedInput { asin: string; title: string; reason: string; }

export default function BrandForm() {
  const { activeBrandId, brands, triggerRefresh, setDataEntryMode } = useDashboardStore();
  const brand = brands.find(b => b.id === activeBrandId);

  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [healthScore, setHealthScore] = useState('');
  const [odr, setOdr] = useState('');
  const [ldr, setLdr] = useState('');
  const [cancellationRate, setCancellationRate] = useState('');
  const [notes, setNotes] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [violations, setViolations] = useState<ViolationInput[]>([]);
  const [suppressed, setSuppressed] = useState<SuppressedInput[]>([]);
  const [saving, setSaving] = useState(false);

  const addViolation = () => setViolations([...violations, { issue: '', severity: 'MEDIUM', status: '' }]);
  const removeViolation = (i: number) => setViolations(violations.filter((_, idx) => idx !== i));
  const updateViolation = (i: number, field: string, value: string) => {
    const updated = [...violations];
    updated[i] = { ...updated[i], [field]: value };
    setViolations(updated);
  };

  const addSuppressed = () => setSuppressed([...suppressed, { asin: '', title: '', reason: '' }]);
  const removeSuppressed = (i: number) => setSuppressed(suppressed.filter((_, idx) => idx !== i));
  const updateSuppressed = (i: number, field: string, value: string) => {
    const updated = [...suppressed];
    updated[i] = { ...updated[i], [field]: value };
    setSuppressed(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrandId || !healthScore) { toast.error('Please fill required fields'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${activeBrandId}/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportDate, healthScore: Number(healthScore), odr: Number(odr) || 0,
          ldr: Number(ldr) || 0, cancellationRate: Number(cancellationRate) || 0,
          notes: notes || null, isInternalNote,
          violations: violations.filter(v => v.issue.trim()),
          suppressed: suppressed.filter(s => s.asin.trim() || s.title.trim()),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Snapshot saved!');
        setHealthScore(''); setOdr(''); setLdr(''); setCancellationRate('');
        setNotes(''); setViolations([]); setSuppressed([]);
        triggerRefresh();
        setDataEntryMode(false);
      } else toast.error(data.error || 'Save failed');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (!brand) return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-8 text-center">
      <p className="text-[#64748b]">Select a brand from the tabs above to enter data</p>
    </div>
  );

  const inputClass = 'w-full px-3 py-2.5 bg-[#0a0e17] border border-[#1f2d45] rounded-xl text-sm text-[#e2e8f0] placeholder-[#4b5563] focus:border-[#ff6b2b] focus:outline-none focus:ring-1 focus:ring-[#ff6b2b]/20 transition-colors';
  const labelClass = 'text-xs font-semibold text-[#94a3b8] mb-1.5 block';

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#1f2d45]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: brand.color }}>{brand.avatar}</div>
        <div>
          <h3 className="text-sm font-semibold text-white">Update {brand.name}</h3>
          <p className="text-[10px] text-[#64748b]">Add a new weekly health snapshot</p>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div><label className={labelClass}>Report Date</label><input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Health Score *</label><input type="number" min="0" max="100" value={healthScore} onChange={e => setHealthScore(e.target.value)} placeholder="0-100" className={inputClass} required /></div>
        <div><label className={labelClass}>ODR %</label><input type="number" step="0.01" min="0" value={odr} onChange={e => setOdr(e.target.value)} placeholder="0.00" className={inputClass} /></div>
        <div><label className={labelClass}>LDR %</label><input type="number" step="0.01" min="0" value={ldr} onChange={e => setLdr(e.target.value)} placeholder="0.00" className={inputClass} /></div>
        <div><label className={labelClass}>Cancel %</label><input type="number" step="0.01" min="0" value={cancellationRate} onChange={e => setCancellationRate(e.target.value)} placeholder="0.00" className={inputClass} /></div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Weekly notes..." />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-[#1f2d45] bg-[#0a0e17] text-[#ff6b2b]" />
          <span className="text-xs text-[#64748b]">Internal only (hidden from client view)</span>
        </label>
      </div>

      {/* Violations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Violations</label>
          <button type="button" onClick={addViolation} className="text-xs text-[#ff6b2b] hover:text-[#ffb347] font-medium transition-colors">+ Add Violation</button>
        </div>
        {violations.map((v, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={v.issue} onChange={e => updateViolation(i, 'issue', e.target.value)} placeholder="Issue description" className={`${inputClass} flex-1`} />
            <select value={v.severity} onChange={e => updateViolation(i, 'severity', e.target.value)} className={`${inputClass} w-28`}>
              <option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option>
            </select>
            <input value={v.status} onChange={e => updateViolation(i, 'status', e.target.value)} placeholder="Status" className={`${inputClass} w-28`} />
            <button type="button" onClick={() => removeViolation(i)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Suppressed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Suppressed Listings</label>
          <button type="button" onClick={addSuppressed} className="text-xs text-[#ff6b2b] hover:text-[#ffb347] font-medium transition-colors">+ Add Listing</button>
        </div>
        {suppressed.map((s, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input value={s.asin} onChange={e => updateSuppressed(i, 'asin', e.target.value)} placeholder="ASIN" className={`${inputClass} w-32`} />
            <input value={s.title} onChange={e => updateSuppressed(i, 'title', e.target.value)} placeholder="Product title" className={`${inputClass} flex-1`} />
            <input value={s.reason} onChange={e => updateSuppressed(i, 'reason', e.target.value)} placeholder="Reason" className={`${inputClass} w-36`} />
            <button type="button" onClick={() => removeSuppressed(i)} className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={saving} className="w-full">Save Snapshot</Button>
    </form>
  );
}
