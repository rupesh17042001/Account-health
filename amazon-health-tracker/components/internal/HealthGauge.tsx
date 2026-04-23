'use client';

import React, { useEffect, useState } from 'react';
import { getHealthStatus, getGaugeColor } from '@/lib/health';

interface HealthGaugeProps {
  score: number;
  size?: number;
  animationKey?: string | number;
}

export default function HealthGauge({ score, size = 200, animationKey }: HealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const status = getHealthStatus(score);
  const color = getGaugeColor(score);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(score * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, animationKey]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1f2d45" strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          {/* Glow effect */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="2" opacity="0.3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: 'blur(6px)', transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white tracking-tight">{animatedScore}</span>
          <span className="text-xs text-[#64748b] font-medium mt-0.5">/ 100</span>
        </div>
      </div>
      {/* Status label */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color }}>{status.icon}</span>
        <span className="text-sm font-semibold" style={{ color }}>{status.label}</span>
      </div>
    </div>
  );
}
