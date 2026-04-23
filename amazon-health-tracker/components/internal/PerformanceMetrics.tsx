'use client';

import React from 'react';
import { getMetricStatus, METRIC_THRESHOLDS } from '@/lib/health';

interface PerformanceMetricsProps {
  odr: number;
  ldr: number;
  cancellationRate: number;
}

export default function PerformanceMetrics({ odr, ldr, cancellationRate }: PerformanceMetricsProps) {
  const metrics = [
    { key: 'odr' as const, value: odr, ...METRIC_THRESHOLDS.odr },
    { key: 'ldr' as const, value: ldr, ...METRIC_THRESHOLDS.ldr },
    { key: 'cancellationRate' as const, value: cancellationRate, ...METRIC_THRESHOLDS.cancellationRate },
  ];

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b2b" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Performance Metrics
      </h3>
      <div className="space-y-4">
        {metrics.map((m) => {
          const status = getMetricStatus(m.value, m.key);
          const barWidth = Math.min((m.value / (m.critical * 1.5)) * 100, 100);
          const targetPos = Math.min((m.target / (m.critical * 1.5)) * 100, 100);

          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#94a3b8] font-medium">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: status.color }}>
                    {m.value.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-[#4b5563]">target {m.targetLabel}</span>
                </div>
              </div>
              <div className="relative h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                {/* Value bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, backgroundColor: status.color }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                  style={{ left: `${targetPos}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
