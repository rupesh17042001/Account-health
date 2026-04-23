'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e17] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#ff6b2b] hover:bg-[#e55a1b] text-white focus:ring-[#ff6b2b] shadow-lg shadow-[#ff6b2b]/20',
    secondary: 'bg-[#1a2236] hover:bg-[#243050] text-[#e2e8f0] border border-[#1f2d45] focus:ring-[#3b82f6]',
    ghost: 'bg-transparent hover:bg-[#1a2236] text-[#64748b] hover:text-[#e2e8f0] focus:ring-[#3b82f6]',
    danger: 'bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/20 focus:ring-[#ef4444]',
    outline: 'bg-transparent border border-[#1f2d45] hover:border-[#ff6b2b] text-[#e2e8f0] hover:text-[#ff6b2b] focus:ring-[#ff6b2b]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
