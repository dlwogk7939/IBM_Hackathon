'use client';

import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { fmtChange } from '../../_lib/utils';
import { BookOpen } from 'lucide-react';

export function CourseStatsCards() {
  const { student: { courseStats } } = useDashboard();

  return (
    <GlassCard index={6} className="col-span-full">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">Per-Course Stats</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 sl-scrollbar">
        {courseStats.map((c, i) => (
          <div
            key={c.code}
            className="min-w-[200px] flex-shrink-0 rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: c.color }} />
              <span className="text-sm font-semibold text-white">{c.code}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{c.name}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-white">{c.weeklyHours}h</p>
                <p className="text-[10px] text-slate-500">this week</p>
              </div>
              <span className={`text-xs font-medium ${c.trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtChange(c.trend)}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${c.burnout}%`, background: c.color }}
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Burnout: {c.burnout}%</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
