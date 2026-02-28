'use client';

import { Chrome, Wifi, WifiOff } from 'lucide-react';
import { useDashboard } from '../../_lib/context';
import { cn } from '../../_lib/utils';

export function ExtensionStatus() {
  const { student: { extensionStatus: ext } } = useDashboard();

  return (
    <div className={cn(
      'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm',
      ext.connected
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
        : 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    )}>
      {ext.connected ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
      )}

      {ext.connected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <span className="font-medium">{ext.connected ? 'Connected' : 'Disconnected'}</span>

      <span className="h-3 w-px bg-current opacity-30" />

      <Chrome className="h-3.5 w-3.5 opacity-60" />
      <span className="opacity-60">v{ext.version}</span>

      <span className="h-3 w-px bg-current opacity-30" />
      <span className="opacity-60">Synced {ext.lastSync}</span>
    </div>
  );
}
