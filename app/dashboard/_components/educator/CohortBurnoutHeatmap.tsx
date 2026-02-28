'use client';

import { useDashboard } from '../../_lib/context';
import { cn } from '../../_lib/utils';
import { GlassCard } from '../shared/GlassCard';
import { INTENSITY_CLASSES } from '../../_lib/constants';

export default function CohortBurnoutHeatmap() {
  const { educator } = useDashboard();
  const { heatmap } = educator;
  const courses = Array.from(new Set(heatmap.map((c) => c.course)));
  const weeks = Array.from(new Set(heatmap.map((c) => c.week)));

  return (
    <GlassCard className="p-6" index={3}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Cohort Risk Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="inline-block">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-16" />
            {weeks.map((w) => (
              <div key={w} className="w-10 text-center text-[10px] text-white/30">{w}</div>
            ))}
          </div>
          {courses.map((course) => (
            <div key={course} className="flex items-center gap-1 mb-1">
              <div className="w-16 text-right pr-2 text-[10px] text-white/40 truncate">{course}</div>
              {weeks.map((w) => {
                const cell = heatmap.find((c) => c.course === course && c.week === w);
                const risk = cell?.risk ?? 0;
                return (
                  <div
                    key={w}
                    className={cn('w-10 h-6 rounded-sm flex items-center justify-center', INTENSITY_CLASSES[risk] ?? INTENSITY_CLASSES[0])}
                    title={`${course} ${w}: ${risk}/4`}
                  >
                    <span className="text-[9px] font-mono text-white/60">{risk}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-white/30">
        <span>Low risk</span>
        <div className="flex gap-0.5">
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={cn('h-2.5 w-6 rounded-sm', cls)} />
          ))}
        </div>
        <span>High risk</span>
      </div>
    </GlassCard>
  );
}
