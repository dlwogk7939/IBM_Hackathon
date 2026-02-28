'use client';

import { ArrowRightLeft, TrendingDown, ArrowRight } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';

export function StudyRebalancer() {
  const { student } = useDashboard();
  const data = student.rebalance;

  if (!data) return null;

  return (
    <GlassCard className="lg:col-span-2" index={10}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-[#306CB5]" />
          <h3 className="text-sm font-semibold text-white">AI Study Rebalancer</h3>
        </div>
        <AIBadge variant="granite" />
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        {data.suggestion}
      </p>

      {data.shifts && data.shifts.length > 0 && (
        <div className="space-y-2 mb-4">
          {data.shifts.map((shift, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2"
            >
              <span className="text-xs font-mono font-semibold text-rose-400">{shift.from}</span>
              <ArrowRight className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-mono font-semibold text-emerald-400">{shift.to}</span>
              <span className="ml-auto text-xs text-slate-400">
                Shift <span className="font-semibold text-white">{shift.hours}h</span>/week
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
        <TrendingDown className="h-4 w-4 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium">
          Projected burnout reduction: <span className="font-bold">-{data.projectedBurnoutReduction} points</span>
        </span>
      </div>
    </GlassCard>
  );
}
