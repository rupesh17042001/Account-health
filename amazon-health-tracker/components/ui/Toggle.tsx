'use client';

import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ enabled, onToggle, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onToggle(!enabled)}
      className="flex items-center gap-3 group disabled:opacity-50"
    >
      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${enabled ? 'bg-[#ff6b2b]' : 'bg-[#1f2d45]'}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-sm text-[#e2e8f0] group-hover:text-white transition-colors">{label}</span>}
    </button>
  );
}
