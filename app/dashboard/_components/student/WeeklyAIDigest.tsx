'use client';

import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';
import { Clock } from 'lucide-react';

export function WeeklyAIDigest() {
  const { student: { digest, studyPlan } } = useDashboard();

  return (
    <GlassCard index={7} className="col-span-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">AI Weekly Digest</h3>
        <AIBadge variant="granite" />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400">Insights</h4>
          <ul className="mt-2 space-y-2">
            {digest.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400">Suggested Study Plan</h4>
          <ul className="mt-2 space-y-2">
            {studyPlan.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-[#306CB5]" />
                <span className="font-mono text-xs text-slate-400">{s.time}</span>
                <span className="text-slate-200">{s.task}</span>
                <span className="ml-auto text-xs text-slate-500">{s.course}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
