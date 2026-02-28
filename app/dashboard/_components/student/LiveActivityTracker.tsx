'use client';

import { Globe, BookOpen, AlertTriangle, Clock, MonitorSmartphone } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';
import { useDashboard } from '../../_lib/context';

const STUDY_DOMAINS = [
  'carmen.osu.edu', 'canvas.osu.edu', 'docs.google.com',
  'drive.google.com', 'www.overleaf.com',
];

const DISTRACTING_DOMAINS = [
  'instagram.com', 'www.instagram.com', 'tiktok.com',
  'www.tiktok.com', 'youtube.com', 'www.youtube.com',
];

function classify(domain: string): 'study' | 'distracting' | 'other' {
  if (STUDY_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) return 'study';
  if (DISTRACTING_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) return 'distracting';
  return 'other';
}

function formatTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm.toString().padStart(2, '0')}m`;
}

const CATEGORY_STYLES = {
  study: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', bar: 'bg-emerald-500', icon: BookOpen },
  distracting: { color: 'text-rose-400', bg: 'bg-rose-500/20', bar: 'bg-rose-500', icon: AlertTriangle },
  other: { color: 'text-slate-400', bg: 'bg-slate-500/20', bar: 'bg-slate-500', icon: Globe },
} as const;

const TIMER_STATE_STYLES: Record<string, { label: string; dot: string }> = {
  RUNNING: { label: 'Tracking', dot: 'bg-emerald-400 animate-pulse' },
  PAUSED: { label: 'Paused', dot: 'bg-amber-400' },
  STOPPED: { label: 'Stopped', dot: 'bg-slate-500' },
};

export function LiveActivityTracker() {
  const { student: { extensionLive } } = useDashboard();
  const { connected, timerState, totalStudySeconds, websiteTotals } = extensionLive;

  // Sort domains by time spent (descending)
  const entries = Object.entries(websiteTotals)
    .filter(([, secs]) => secs > 0)
    .sort(([, a], [, b]) => b - a);

  const totalTracked = entries.reduce((sum, [, secs]) => sum + secs, 0);

  // Aggregate by category
  const categoryTotals = { study: 0, distracting: 0, other: 0 };
  entries.forEach(([domain, secs]) => {
    categoryTotals[classify(domain)] += secs;
  });

  const stateStyle = TIMER_STATE_STYLES[timerState] ?? TIMER_STATE_STYLES.STOPPED;

  if (!connected) {
    return (
      <GlassCard className="lg:col-span-2" index={9}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MonitorSmartphone className="mb-3 h-10 w-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-white">Live Activity Tracking</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            Install the maintAIn Chrome extension to track your study activity in real time.
            Load it from <code className="text-slate-400">chrome://extensions</code> → Load unpacked → select the <code className="text-slate-400">extension/</code> folder.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="lg:col-span-2" index={9}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#306CB5]" />
          <h3 className="text-sm font-semibold text-white">Live Activity Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${stateStyle.dot}`} />
          <span className="text-xs text-slate-400">{stateStyle.label}</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {(['study', 'distracting', 'other'] as const).map((cat) => {
          const style = CATEGORY_STYLES[cat];
          const Icon = style.icon;
          return (
            <div key={cat} className={`flex items-center gap-2 rounded-lg ${style.bg} px-3 py-2`}>
              <Icon className={`h-3.5 w-3.5 ${style.color}`} />
              <div>
                <p className={`text-xs font-semibold ${style.color}`}>
                  {formatTime(categoryTotals[cat])}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{cat}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total study time */}
      <div className="mb-3 flex items-center justify-between rounded-lg bg-[#306CB5]/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#306CB5]" />
          <span className="text-xs font-medium text-slate-300">Total Study Time</span>
        </div>
        <span className="font-mono text-sm font-bold text-[#306CB5]">
          {formatTime(totalStudySeconds)}
        </span>
      </div>

      {/* Per-domain list */}
      {entries.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">
          No websites tracked yet. Start browsing to see activity!
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto sl-scrollbar pr-1">
          {entries.map(([domain, secs]) => {
            const cat = classify(domain);
            const style = CATEGORY_STYLES[cat];
            const pct = totalTracked > 0 ? (secs / totalTracked) * 100 : 0;
            return (
              <div key={domain} className="group">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.bar}`} />
                    <span className="text-slate-300 truncate max-w-[200px]">{domain}</span>
                  </div>
                  <span className={`font-mono ${style.color}`}>{formatTime(secs)}</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
