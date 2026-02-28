'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboard } from '../../_lib/context';
import { GlassCard } from '../shared/GlassCard';
import { COLORS } from '../../_lib/constants';

export default function EngagementLineChart() {
  const { educator } = useDashboard();

  return (
    <GlassCard className="p-6" index={5}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Engagement Trends</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={educator.trend}>
          <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[20, 90]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
          <Line type="monotone" dataKey="engagement" stroke={COLORS.electric} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="burnout" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
