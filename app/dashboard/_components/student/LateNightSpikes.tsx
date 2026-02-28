'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { COLORS } from '../../_lib/constants';

export function LateNightSpikes() {
  const { student: { nightSessions } } = useDashboard();

  return (
    <GlassCard index={2}>
      <h3 className="mb-4 text-sm font-semibold text-slate-300">Late-Night Study Spikes</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={nightSessions} barSize={24}>
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {nightSessions.map((entry, i) => (
              <Cell key={i} fill={entry.isLateNight ? COLORS.ember : COLORS.electric} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-slate-500">Amber bars indicate sessions past midnight</p>
    </GlassCard>
  );
}
