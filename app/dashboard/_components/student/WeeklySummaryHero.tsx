'use client';

import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';
import { getCurrentWeekRange } from '../../_lib/utils';
import { Clock, TrendingUp } from 'lucide-react';

export function WeeklySummaryHero() {
  const { student } = useDashboard();
  const totalHours = student.timeBlocks.reduce((s, b) => s + b.hours, 0);

  // Dynamic best day from productivity data
  const bestDay = student.productivity.reduce(
    (best, d) => (d.productive > best.productive ? d : best),
    student.productivity[0],
  );

  // Dynamic trend: compare current total to a mock last-week baseline (80% of mock total)
  const mockBaselineHours = student.timeBlocks.reduce((s, b) => s + b.hours, 0) * 0.85;
  const trendPct = mockBaselineHours > 0
    ? Math.round(((totalHours - mockBaselineHours) / mockBaselineHours) * 100)
    : 0;
  const trendPositive = trendPct >= 0;

  return (
    <GlassCard index={0} className="col-span-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {getCurrentWeekRange()}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">Weekly Summary</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="h-5 w-5 text-[#306CB5]" />
            <span className="text-xl font-semibold">{totalHours}h</span>
            <span className="text-sm text-slate-400">tracked</span>
          </div>
          <div className={`flex items-center gap-2 ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">
              {trendPositive ? '+' : ''}{trendPct}% vs last week
            </span>
          </div>
          <AIBadge variant="maintain" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400">
        Your most productive day was <span className="text-emerald-400 font-medium">{bestDay?.day ?? 'N/A'}</span> with {bestDay?.productive ?? 0}h of focused study.
        Consider replicating that routine.
      </p>
    </GlassCard>
  );
}
