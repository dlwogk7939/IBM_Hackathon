'use client';

import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { cn, fmtChange } from '../../_lib/utils';
import { RISK_CONFIG } from '../../_lib/constants';

export default function EngagementTable() {
  const { educator } = useDashboard();

  return (
    <GlassCard index={2} className="col-span-full overflow-x-auto">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Course Engagement</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
            <th className="pb-2 pr-4">Course</th>
            <th className="pb-2 px-4">Enrolled</th>
            <th className="pb-2 px-4">Avg Hours</th>
            <th className="pb-2 px-4">Burnout</th>
            <th className="pb-2 px-4">Trend</th>
            <th className="pb-2 pl-4">Risk</th>
          </tr>
        </thead>
        <tbody>
          {educator.engagement.map((row) => {
            const risk = RISK_CONFIG[row.riskLevel];
            return (
              <tr key={row.course} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-slate-200">{row.course}</td>
                <td className="py-3 px-4 text-slate-300">{row.enrolled}</td>
                <td className="py-3 px-4 text-slate-300">{row.avgHours}h</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.burnoutPct}%`, background: risk.color }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{row.burnoutPct}%</span>
                  </div>
                </td>
                <td className={cn('py-3 px-4 text-xs font-medium', row.trend > 0 ? 'text-emerald-400' : 'text-rose-400')}>
                  {fmtChange(row.trend)}
                </td>
                <td className="py-3 pl-4">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ color: risk.color, background: `${risk.color}15` }}
                  >
                    {risk.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </GlassCard>
  );
}
