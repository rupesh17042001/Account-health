'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { SnapshotData } from '@/types';

interface TrendChartProps {
  snapshots: SnapshotData[];
  brandColor?: string;
}

export default function TrendChart({ snapshots, brandColor = '#ff6b2b' }: TrendChartProps) {
  const data = [...snapshots]
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
    .slice(-12)
    .map((s) => ({
      date: new Date(s.reportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.healthScore,
      odr: Number(s.odr),
      ldr: Number(s.ldr),
    }));

  if (data.length === 0) {
    return (
      <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
        <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Health Score Trend</h3>
        <div className="flex items-center justify-center h-48 text-[#64748b] text-sm">
          No data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1f2d45] p-5">
      <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
        Health Score Trend
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brandColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a2236',
              border: '1px solid #1f2d45',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#e2e8f0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          />
          <Area type="monotone" dataKey="score" fill="url(#scoreGradient)" stroke="none" />
          <Line
            type="monotone" dataKey="score" stroke={brandColor} strokeWidth={2.5}
            dot={{ fill: brandColor, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: brandColor, strokeWidth: 2, stroke: '#fff', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
