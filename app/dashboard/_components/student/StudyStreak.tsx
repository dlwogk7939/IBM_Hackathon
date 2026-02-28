'use client';

import { Flame } from 'lucide-react';
import { useDashboard } from '../../_lib/context';
import { cn } from '../../_lib/utils';

export function StudyStreak() {
  const { student: { studyStreak: streak } } = useDashboard();

  return (
    <div className={cn(
      'inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm',
      'border-amber-500/30 bg-amber-500/10 text-amber-400',
    )}>
      <Flame className={cn('h-4 w-4', streak.isActiveToday && 'animate-pulse')} />
      <span className="font-medium">{streak.currentStreak}-day streak</span>
      <span className="h-3 w-px bg-current opacity-30" />
      <span className="opacity-60">Best: {streak.longestStreak}</span>
    </div>
  );
}
