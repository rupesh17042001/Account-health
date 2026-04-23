'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  borderColor: string;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, borderColor, trend }: StatCardProps) {
  return (
    <div className="relative bg-[#111827] rounded-2xl border border-[#1f2d45] p-5 overflow-hidden group hover:border-[#1f2d45]/80 transition-all duration-300">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: borderColor }} />
      
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-[#0a0e17]" style={{ color: borderColor }}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
            {trend.positive ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      <p className="text-2xl font-bold text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-xs text-[#64748b] font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-[#4b5563] mt-1">{subtitle}</p>}
      
      {/* Subtle glow effect on hover */}
      <div
        className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl"
        style={{ backgroundColor: borderColor }}
      />
    </div>
  );
}
