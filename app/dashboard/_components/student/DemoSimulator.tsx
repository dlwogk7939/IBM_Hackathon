'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Monitor } from 'lucide-react';

const SIMULATED_SITES: { domain: string; rate: number }[] = [
  { domain: 'docs.google.com', rate: 3 },
  { domain: 'github.com', rate: 2 },
  { domain: 'stackoverflow.com', rate: 1.5 },
  { domain: 'youtube.com', rate: 2.5 },
  { domain: 'carmen.osu.edu', rate: 1 },
  { domain: 'www.reddit.com', rate: 1.5 },
  { domain: 'arxiv.org', rate: 0.5 },
  { domain: 'www.instagram.com', rate: 1 },
];

export function DemoSimulator() {
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const totalsRef = useRef<Record<string, number>>({});
  const secondsRef = useRef(0);

  const tick = useCallback(() => {
    // Accumulate seconds for each site based on its rate
    for (const site of SIMULATED_SITES) {
      const prev = totalsRef.current[site.domain] ?? 0;
      // Each tick = 2s real time, simulate `rate` seconds per tick
      totalsRef.current[site.domain] = prev + site.rate;
    }
    secondsRef.current += 2;

    // Post the same message format the real extension uses
    window.postMessage({
      type: 'MAINTAIN_EXTENSION_DATA',
      payload: {
        timerState: 'RUNNING',
        totalStudySeconds: secondsRef.current,
        websiteTotals: { ...totalsRef.current },
        version: '1.0.0-demo',
      },
    }, '*');
  }, []);

  useEffect(() => {
    if (running) {
      // Send initial burst so data appears immediately
      for (let i = 0; i < 150; i++) tick();
      intervalRef.current = setInterval(tick, 2000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const handleToggle = () => {
    if (running) {
      setRunning(false);
      // Send a final message marking stopped
      window.postMessage({
        type: 'MAINTAIN_EXTENSION_DATA',
        payload: {
          timerState: 'STOPPED',
          totalStudySeconds: secondsRef.current,
          websiteTotals: { ...totalsRef.current },
          version: '1.0.0-demo',
        },
      }, '*');
    } else {
      // Reset
      totalsRef.current = {};
      secondsRef.current = 0;
      setRunning(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        running
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
      }`}
    >
      {running ? (
        <>
          <Square className="h-3 w-3" />
          Stop Demo
        </>
      ) : (
        <>
          <Play className="h-3 w-3" />
          <Monitor className="h-3 w-3" />
          Simulate Extension
        </>
      )}
    </button>
  );
}
