'use client';

import { DollarSign, TrendingUp, UserCheck, Clock } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';

export default function ROIMetrics() {
  const { educator: { roi } } = useDashboard();

  const cards = [
    { label: 'Cost per Student', value: `$${roi.costPerStudent.toFixed(2)}`, icon: DollarSign, detail: 'per semester' },
    { label: 'Projected Savings', value: `$${(roi.projectedSavings / 1000).toFixed(0)}K`, icon: TrendingUp, detail: 'annual' },
    { label: 'Retention Lift', value: `+${roi.retentionLift}%`, icon: UserCheck, detail: 'vs baseline' },
    { label: 'Avg Intervention', value: `${roi.avgInterventionTime}s`, icon: Clock, detail: 'response time' },
  ];

  return (
    <GlassCard index={6}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">ROI Metrics</h3>
        <AIBadge variant="watsonx" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <c.icon className="h-4 w-4 text-[#306CB5]" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400">{c.label}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-white">{c.value}</p>
            <p className="text-[10px] text-slate-500">{c.detail}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
