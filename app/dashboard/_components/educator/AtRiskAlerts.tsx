'use client';

import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useDashboard } from '../../_lib/context';
import { cn } from '../../_lib/utils';
import { GlassCard } from '../shared/GlassCard';
import { AIBadge } from '../shared/AIBadge';

const severityConfig = {
  critical: { Icon: AlertCircle, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/[0.06]' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.06]' },
};

export default function AtRiskAlerts() {
  const { educator } = useDashboard();
  return (
    <GlassCard className="p-6" index={4}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">At-Risk Alerts</h3>
        <AIBadge variant="granite" />
      </div>
      <div className="space-y-3">
        {educator.alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.Icon;
          return (
            <div key={alert.id} className={cn('rounded-lg border p-3', config.border, config.bg)}>
              <div className="flex gap-2">
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', config.color)} />
                <div>
                  <p className="text-sm leading-relaxed text-white/70">{alert.message}</p>
                  <p className="mt-1 text-[10px] text-white/30">{alert.course} · {alert.timestamp}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
