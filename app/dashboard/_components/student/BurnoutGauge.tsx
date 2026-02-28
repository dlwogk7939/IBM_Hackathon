'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';
import { fmtChange } from '../../_lib/utils';
import { COLORS } from '../../_lib/constants';

export function BurnoutGauge() {
  const { student: { burnout } } = useDashboard();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(burnout.score), 300);
    return () => clearTimeout(t);
  }, [burnout.score]);

  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = burnout.score >= 60 ? COLORS.danger : burnout.score >= 40 ? COLORS.ember : COLORS.success;

  return (
    <GlassCard index={1}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Burnout Index</h3>
        <AIBadge variant="watsonx" />
      </div>
      <div className="mt-4 flex flex-col items-center">
        <svg width="160" height="90" viewBox="0 0 160 90">
          <path
            d="M 10 85 A 70 70 0 0 1 150 85"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 10 85 A 70 70 0 0 1 150 85"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <p className="mt-2 text-3xl font-bold" style={{ color }}>{Math.round(burnout.score)}</p>
        <p className="text-xs text-slate-400">
          {burnout.trend === 'rising' ? '↑' : burnout.trend === 'falling' ? '↓' : '→'}{' '}
          {fmtChange(Math.round(burnout.weeklyChange))} this week
        </p>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        Combines overwork hours, focus decay, sleep disruption, deadline pressure, recovery deficit, and workload imbalance — six behavioral signals with research-informed weights.
      </p>
    </GlassCard>
  );
}
