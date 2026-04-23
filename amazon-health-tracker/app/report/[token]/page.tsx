'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BrandReportData } from '@/types';
import { getHealthStatus, getMetricStatus, METRIC_THRESHOLDS } from '@/lib/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

export default function BrandReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [report, setReport] = useState<BrandReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${token}`);
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.error || 'Failed to load report');
        }
      } catch {
        setError('Unable to load report. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6b7280] font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading report...</p>
        </div>
      </div>
    );
  }

  // Error / Revoked
  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#fee2e2] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Unavailable</h1>
          <p className="text-[#6b7280] mb-6 leading-relaxed">This report link is no longer active. Please contact your account manager for an updated link.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3f4f6] rounded-xl text-sm text-[#6b7280]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Contact your account manager
          </div>
        </div>
      </div>
    );
  }

  const snap = report.latestSnapshot;
  const status = snap ? getHealthStatus(snap.healthScore) : null;
  const reportDate = snap ? new Date(snap.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const trendData = report.trendData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: d.score,
  }));

  const MetricBar = ({ label, value, metric }: { label: string; value: number; metric: 'odr' | 'ldr' | 'cancellationRate' }) => {
    const s = getMetricStatus(value, metric);
    const threshold = METRIC_THRESHOLDS[metric];
    const barPct = Math.min((value / (threshold.critical * 1.5)) * 100, 100);
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#374151]">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{value.toFixed(2)}%</span>
            <span className="text-[11px] text-[#9ca3af]">target {threshold.targetLabel}</span>
          </div>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: s.color }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Import fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: report.brandColor }}>
                {report.brandName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e]">{report.brandName}</h1>
                <p className="text-xs text-[#9ca3af] font-medium">Account Health Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9ca3af] font-medium">Last Updated</p>
              <p className="text-sm font-semibold text-[#374151]">{reportDate}</p>
            </div>
          </div>
        </div>
      </header>

      {snap && status && (
        <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Status Banner */}
          <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: `${status.color}10`, border: `1px solid ${status.color}30` }}>
            <div className="text-4xl mb-2">{status.icon}</div>
            <h2 className="text-2xl font-bold" style={{ color: status.color }}>{status.label}</h2>
            <p className="text-sm text-[#6b7280] mt-1">Overall account health status</p>
          </div>

          {/* Score + Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Gauge */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 flex flex-col items-center justify-center shadow-sm">
              <BrandGauge score={snap.healthScore} color={status.color} />
              <p className="text-xs text-[#9ca3af] mt-3 font-medium">Health Score</p>
            </div>

            {/* Performance Metrics */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: report.brandColor }} />
                Performance Metrics
              </h3>
              <MetricBar label="Order Defect Rate" value={snap.odr} metric="odr" />
              <MetricBar label="Late Dispatch Rate" value={snap.ldr} metric="ldr" />
              <MetricBar label="Cancellation Rate" value={snap.cancellationRate} metric="cancellationRate" />
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 1 && (
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: report.brandColor }} />
                Health Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={report.brandColor} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={report.brandColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="score" fill="url(#brandGrad)" stroke="none" />
                  <Line type="monotone" dataKey="score" stroke={report.brandColor} strokeWidth={2.5} dot={{ fill: report.brandColor, strokeWidth: 0, r: 3 }} activeDot={{ fill: report.brandColor, stroke: '#fff', strokeWidth: 2, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Violations + Suppressed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Violations */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                Violations
                {snap.violations.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#dc2626] font-bold">{snap.violations.length}</span>}
              </h3>
              {snap.violations.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-sm text-[#9ca3af]">No active violations</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snap.violations.map((v, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#fafafa] border border-[#f3f4f6]">
                      <span className="text-sm text-[#374151] flex-1">{v.issue}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${v.severity === 'HIGH' ? 'bg-[#fee2e2] text-[#dc2626]' : v.severity === 'MEDIUM' ? 'bg-[#fef3c7] text-[#d97706]' : 'bg-[#dbeafe] text-[#2563eb]'}`}>
                        {v.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suppressed Listings */}
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
                Suppressed Listings
                {snap.suppressed.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#d97706] font-bold">{snap.suppressed.length}</span>}
              </h3>
              {snap.suppressed.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-2xl mb-1">✅</div>
                  <p className="text-sm text-[#9ca3af]">No suppressed listings</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snap.suppressed.map((s, i) => (
                    <div key={i} className="py-2.5 px-3 rounded-xl bg-[#fafafa] border border-[#f3f4f6]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {s.asin && <span className="text-[11px] font-mono text-[#2563eb] bg-[#dbeafe] px-1.5 py-0.5 rounded">{s.asin}</span>}
                            <span className="text-sm text-[#374151] truncate">{s.title || 'Untitled'}</span>
                          </div>
                          {s.reason && <p className="text-xs text-[#9ca3af] mt-0.5">{s.reason}</p>}
                        </div>
                        {s.asin && (
                          <a href="https://sellercentral.amazon.in/fix-stranded-inventory" target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-1 rounded-lg bg-[#dbeafe] text-[#2563eb] hover:bg-[#bfdbfe] font-semibold whitespace-nowrap transition-colors ml-2">
                            Fix →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {snap.notes && (
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Notes from your account manager
              </h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{snap.notes}</p>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center pt-6 pb-8 border-t border-[#e5e7eb]">
            <p className="text-xs text-[#9ca3af]">
              Report prepared by <span className="font-semibold text-[#6b7280]">{report.agencyName}</span>
            </p>
            <p className="text-[10px] text-[#d1d5db] mt-1">{reportDate}</p>
          </footer>
        </main>
      )}
    </div>
  );
}

/* Client-view Gauge — clean, light design */
function BrandGauge({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  const size = 160;
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(score * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1a1a2e]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{animated}</span>
        <span className="text-[10px] text-[#9ca3af]">/ 100</span>
      </div>
    </div>
  );
}
