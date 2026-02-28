'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';

export function TimeAllocationChart() {
  const { student: { timeBlocks } } = useDashboard();
  const total = timeBlocks.reduce((s, b) => s + b.hours, 0);

  return (
    <GlassCard index={4}>
      <h3 className="mb-4 text-sm font-semibold text-slate-300">Time Allocation</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={timeBlocks}
              dataKey="hours"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              strokeWidth={0}
            >
              {timeBlocks.map((b, i) => (
                <Cell key={i} fill={b.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <ul className="space-y-2 text-sm">
          {timeBlocks.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
              <span className="text-slate-300">{b.label}</span>
              <span className="text-slate-500">{b.hours}h ({Math.round((b.hours / total) * 100)}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
