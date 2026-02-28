'use client';

import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '../../_lib/utils';

export function DeadlineClustering() {
  const { student: { deadlines } } = useDashboard();
  const clusterCount = deadlines.filter((d) => d.isCluster).length;

  return (
    <GlassCard index={3}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Deadline Clustering</h3>
        {clusterCount >= 3 && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {clusterCount} clustered
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {deadlines.map((d) => (
          <li
            key={d.id}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
              d.isCluster ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5',
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-200">{d.title}</span>
              <span className="text-xs text-slate-500">{d.course}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{d.weight}%</span>
              <span>{d.due}</span>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
