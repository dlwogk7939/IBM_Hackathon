'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, SkipForward,
  Minus, Plus, Timer, ChevronDown,
} from 'lucide-react';
import { cn } from '../../_lib/utils';

type Mode = 'focus' | 'break' | 'idle';

export function PomodoroTimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);

  const totalSeconds = mode === 'break' ? breakMinutes * 60 : workMinutes * 60;

  const handleSkip = useCallback(() => {
    if (mode === 'focus' || mode === 'idle') {
      setMode('break');
      setSecondsLeft(breakMinutes * 60);
      setIsRunning(true);
    } else {
      setCompletedSessions((s) => s + 1);
      setMode('focus');
      setSecondsLeft(workMinutes * 60);
      setIsRunning(true);
    }
  }, [mode, breakMinutes, workMinutes]);

  // Countdown effect
  useEffect(() => {
    if (!isRunning || mode === 'idle') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // Auto-transition when timer hits 0
  useEffect(() => {
    if (secondsLeft === 0 && mode !== 'idle' && isRunning) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(mode === 'focus' ? 'Focus session complete! Time for a break.' : 'Break over! Ready to focus.');
      }
      handleSkip();
    }
  }, [secondsLeft, mode, isRunning, handleSkip]);

  const handlePlayPause = () => {
    if (mode === 'idle') {
      setMode('focus');
      setSecondsLeft(workMinutes * 60);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('idle');
    setSecondsLeft(workMinutes * 60);
    setCompletedSessions(0);
  };

  const adjustDuration = (type: 'work' | 'break', delta: number) => {
    if (type === 'work') {
      const next = Math.max(1, Math.min(60, workMinutes + delta));
      setWorkMinutes(next);
      if (mode === 'idle' || (mode === 'focus' && !isRunning)) {
        setSecondsLeft(next * 60);
      }
    } else {
      const next = Math.max(1, Math.min(60, breakMinutes + delta));
      setBreakMinutes(next);
      if (mode === 'break' && !isRunning) {
        setSecondsLeft(next * 60);
      }
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = mode === 'idle' ? 0 : 1 - secondsLeft / totalSeconds;

  const modeColor = mode === 'break' ? '#10B981' : '#306CB5';

  // SVG ring dimensions
  const size = 140;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Collapsed pill
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md transition-all hover:scale-105',
          mode === 'break'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        )}
      >
        <Timer className="h-4 w-4" />
        {mode !== 'idle' && isRunning ? (
          <span className="font-mono">{timeStr}</span>
        ) : mode !== 'idle' ? (
          <span className="font-mono opacity-70">{timeStr}</span>
        ) : (
          <span>Pomodoro</span>
        )}
        {mode !== 'idle' && (
          <span className="text-xs opacity-60">{mode === 'focus' ? 'Focus' : 'Break'}</span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-72 rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">Pomodoro</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Circular progress ring + time */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={modeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold text-white">{timeStr}</span>
            <span
              className="mt-1 text-xs font-medium"
              style={{ color: modeColor }}
            >
              {mode === 'idle' ? 'Ready' : mode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>

        {/* Session counter */}
        <p className="mt-3 text-xs text-slate-400">
          {completedSessions} session{completedSessions !== 1 ? 's' : ''} completed
        </p>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={handlePlayPause}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors"
          style={{ backgroundColor: modeColor }}
          title={isRunning ? 'Pause' : 'Play'}
        >
          {isRunning && mode !== 'idle' ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" />
          )}
        </button>
        <button
          onClick={handleSkip}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Skip"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/* Duration settings */}
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Work</span>
          <button
            onClick={() => adjustDuration('work', -1)}
            className="rounded p-0.5 hover:bg-white/10 hover:text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-7 text-center font-mono text-white">{workMinutes}</span>
          <button
            onClick={() => adjustDuration('work', 1)}
            className="rounded p-0.5 hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Break</span>
          <button
            onClick={() => adjustDuration('break', -1)}
            className="rounded p-0.5 hover:bg-white/10 hover:text-white"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-7 text-center font-mono text-white">{breakMinutes}</span>
          <button
            onClick={() => adjustDuration('break', 1)}
            className="rounded p-0.5 hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
