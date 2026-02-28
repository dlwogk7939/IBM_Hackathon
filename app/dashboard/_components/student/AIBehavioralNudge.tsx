'use client';

import { useState } from 'react';
import { Brain, Coffee, Moon, Sparkles, X } from 'lucide-react';
import { AIBadge } from '../shared/AIBadge';
import { useDashboard } from '../../_lib/context';

const ICON_MAP = {
  focus: Brain,
  break: Coffee,
  sleep: Moon,
  encouragement: Sparkles,
} as const;

const BORDER_COLOR = {
  focus: 'border-amber-500/40',
  break: 'border-blue-500/40',
  sleep: 'border-purple-500/40',
  encouragement: 'border-emerald-500/40',
} as const;

const ICON_COLOR = {
  focus: 'text-amber-400',
  break: 'text-blue-400',
  sleep: 'text-purple-400',
  encouragement: 'text-emerald-400',
} as const;

const BG_COLOR = {
  focus: 'bg-amber-500/5',
  break: 'bg-blue-500/5',
  sleep: 'bg-purple-500/5',
  encouragement: 'bg-emerald-500/5',
} as const;

export function AIBehavioralNudge() {
  const { student } = useDashboard();
  const [dismissed, setDismissed] = useState(false);

  const nudge = student.nudge;
  if (!nudge || !student.extensionLive.connected || dismissed) return null;

  const type = nudge.type as keyof typeof ICON_MAP;
  const Icon = ICON_MAP[type] ?? Sparkles;
  const borderColor = BORDER_COLOR[type] ?? 'border-white/10';
  const iconColor = ICON_COLOR[type] ?? 'text-slate-400';
  const bgColor = BG_COLOR[type] ?? 'bg-white/5';

  return (
    <div className={`col-span-full rounded-xl border ${borderColor} ${bgColor} px-4 py-3 flex items-start gap-3`}>
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Behavioral Insight</span>
          <AIBadge variant="granite" />
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{nudge.nudge}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
