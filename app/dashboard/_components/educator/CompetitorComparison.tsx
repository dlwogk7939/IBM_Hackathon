'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { cn } from '../../_lib/utils';

const features = [
  { feature: 'AI-Powered Insights', maintain: true, competitorA: false, competitorB: true },
  { feature: 'Real-time Tracking', maintain: true, competitorA: true, competitorB: false },
  { feature: 'FERPA Compliant', maintain: true, competitorA: true, competitorB: false },
  { feature: 'IBM Cloud Scalability', maintain: true, competitorA: false, competitorB: false },
  { feature: 'Burnout Detection', maintain: true, competitorA: false, competitorB: false },
  { feature: 'Chrome Extension', maintain: true, competitorA: true, competitorB: true },
  { feature: 'Cost per Student < $5', maintain: true, competitorA: false, competitorB: true },
];

function StatusIcon({ supported }: { supported: boolean }) {
  return supported ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-rose-400/60" />;
}

export default function CompetitorComparison() {
  return (
    <GlassCard className="p-6" index={8}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Feature Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">Feature</th>
              <th className="pb-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-[#306CB5]">maintAIn</th>
              <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-wider text-white/40">Competitor A</th>
              <th className="pb-3 pl-4 text-center text-xs font-medium uppercase tracking-wider text-white/40">Competitor B</th>
            </tr>
          </thead>
          <tbody>
            {features.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="py-3 pr-4 text-white/70">{row.feature}</td>
                <td className={cn('py-3 px-4', 'bg-[#306CB5]/[0.04]')}>
                  <div className="flex justify-center"><StatusIcon supported={row.maintain} /></div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center"><StatusIcon supported={row.competitorA} /></div>
                </td>
                <td className="py-3 pl-4">
                  <div className="flex justify-center"><StatusIcon supported={row.competitorB} /></div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
