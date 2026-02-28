'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';
import { COLORS, INTENSITY_CLASSES, DAY_LABELS, HOUR_LABELS } from '../../_lib/constants';
import { cn } from '../../_lib/utils';

export function ProductivityRatio() {
  const { student: { productivity, focusMap } } = useDashboard();

  return (
    <GlassCard index={5} className="col-span-full lg:col-span-2">
      <h3 className="mb-4 text-sm font-semibold text-slate-300">Productivity Ratio &amp; Focus Heatmap</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={productivity} barGap={2}>
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Bar dataKey="productive" fill={COLORS.success} radius={[3, 3, 0, 0]} barSize={16} />
            <Bar dataKey="distracted" fill={COLORS.danger} radius={[3, 3, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>

        <div>
          <div className="flex gap-1">
            <div className="w-8" />
            {HOUR_LABELS.map((h) => (
              <span key={h} className="flex-1 text-center text-[10px] text-slate-500">{h}</span>
            ))}
          </div>
          {DAY_LABELS.map((day, di) => (
            <React.Fragment key={di}>
              <div className="mt-1 flex items-center gap-1">
                <span className="w-8 text-right text-[10px] text-slate-500">{day}</span>
                {focusMap
                  .filter((c) => c.day === di)
                  .map((c, hi) => (
                    <div
                      key={hi}
                      className={cn('h-4 flex-1 rounded-sm', INTENSITY_CLASSES[c.intensity])}
                      title={`${day} ${HOUR_LABELS[c.hour]}: ${c.intensity}/4`}
                    />
                  ))}
              </div>
            </React.Fragment>
          ))}
          <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-500">
            <span>Less</span>
            {INTENSITY_CLASSES.map((cls, i) => (
              <div key={i} className={cn('h-3 w-3 rounded-sm', cls)} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
