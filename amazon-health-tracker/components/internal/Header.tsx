'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { useDashboardStore } from '@/lib/store';
import Button from '@/components/ui/Button';

interface HeaderProps {
  userName?: string;
  orgName?: string;
}

export default function Header({ userName, orgName }: HeaderProps) {
  const { isDataEntryMode, setDataEntryMode, setExportModalOpen } = useDashboardStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1f2d45]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b2b] to-[#ffb347] flex items-center justify-center shadow-lg shadow-[#ff6b2b]/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">Account Health</h1>
            <p className="text-[10px] text-[#64748b] font-medium">{orgName || 'Agency Portal'}</p>
          </div>
        </div>

        {/* Center: Mode Toggle */}
        <div className="flex items-center bg-[#111827] rounded-xl p-1 border border-[#1f2d45]">
          <button
            onClick={() => setDataEntryMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!isDataEntryMode ? 'bg-[#ff6b2b] text-white shadow-lg shadow-[#ff6b2b]/20' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </span>
          </button>
          <button
            onClick={() => setDataEntryMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDataEntryMode ? 'bg-[#ff6b2b] text-white shadow-lg shadow-[#ff6b2b]/20' : 'text-[#64748b] hover:text-[#e2e8f0]'}`}
          >
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Update Data
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setExportModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export CSV
          </Button>
          <div className="flex items-center gap-2 pl-3 border-l border-[#1f2d45]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold">
              {userName?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-[#64748b] hover:text-[#ef4444] transition-colors p-1.5 rounded-lg hover:bg-[#1a2236]"
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
