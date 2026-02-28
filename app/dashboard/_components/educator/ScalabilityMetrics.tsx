'use client';

import { Server, Zap, Clock, Shield } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';

export default function ScalabilityMetrics() {
  const { educator: { scalability } } = useDashboard();

  const cards = [
    { label: 'Active Users', value: scalability.activeUsers.toLocaleString(), icon: Server },
    { label: 'Peak Concurrent', value: scalability.peakConcurrent.toLocaleString(), icon: Zap },
    { label: 'Avg Response', value: `${scalability.avgResponseMs}ms`, icon: Clock },
    { label: 'Uptime', value: `${scalability.uptime}%`, icon: Shield },
  ];

  return (
    <GlassCard index={7}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Scalability</h3>
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
          {scalability.region}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-white/5 p-3">
            <div className="flex items-center gap-2">
              <c.icon className="h-4 w-4 text-[#306CB5]" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400">{c.label}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>
      {/* Uptime progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Uptime</span>
          <span>{scalability.uptime}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${scalability.uptime}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
