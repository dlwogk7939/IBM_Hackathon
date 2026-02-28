'use client';

import { Flame, Users, Activity, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { fmtChange } from '../../_lib/utils';

const iconMap: Record<string, React.ElementType> = {
  flame: Flame,
  users: Users,
  activity: Activity,
  'alert-triangle': AlertTriangle,
};

export default function DepartmentStats() {
  const { educator } = useDashboard();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {educator.kpis.map((kpi, i) => {
        const Icon = iconMap[kpi.icon] ?? Activity;
        return (
          <GlassCard key={kpi.label} index={i}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#306CB5]/10">
                <Icon className="h-5 w-5 text-[#306CB5]" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{kpi.label}</p>
                <p className="text-xl font-bold text-white">{kpi.value}</p>
              </div>
            </div>
            <p className={`mt-2 text-xs font-medium ${kpi.change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fmtChange(kpi.change)} vs last month
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
