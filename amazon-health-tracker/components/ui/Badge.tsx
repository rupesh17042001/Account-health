'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', size = 'sm', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#1a2236] text-[#e2e8f0] border-[#1f2d45]',
    success: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
    warning: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    danger: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
    info: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wider rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
