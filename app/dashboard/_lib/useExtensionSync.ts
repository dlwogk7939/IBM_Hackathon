'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface ExtensionSyncData {
  connected: boolean;
  timerState: string;
  totalStudySeconds: number;
  websiteTotals: Record<string, number>;
  version: string;
  lastSync: string;
}

const INITIAL: ExtensionSyncData = {
  connected: false,
  timerState: 'STOPPED',
  totalStudySeconds: 0,
  websiteTotals: {},
  version: '0.0.0',
  lastSync: 'never',
};

/** Time since last sync as a readable string */
function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/**
 * Listens for postMessage events from the maintAIn Chrome extension.
 * Returns live study data or a disconnected fallback if the extension
 * is not installed or stops responding.
 */
export function useExtensionSync(): ExtensionSyncData {
  const [data, setData] = useState<ExtensionSyncData>(INITIAL);
  const lastMessageAt = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'MAINTAIN_EXTENSION_DATA') return;

    const payload = event.data.payload;
    if (!payload) return;

    lastMessageAt.current = Date.now();

    setData({
      connected: true,
      timerState: payload.timerState ?? 'STOPPED',
      totalStudySeconds: payload.totalStudySeconds ?? 0,
      websiteTotals: payload.websiteTotals ?? {},
      version: payload.version ?? '0.0.0',
      lastSync: 'just now',
    });
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    // Request data from the extension immediately
    window.postMessage({ type: 'MAINTAIN_REQUEST_DATA' }, '*');

    // Periodically update lastSync text & detect disconnection
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastMessageAt.current;

      if (lastMessageAt.current === 0) {
        // Never received a message — extension not installed.
        // After 3s timeout, ensure we show disconnected (already default).
        return;
      }

      if (elapsed > 6000) {
        // Extension was connected but stopped responding
        setData((prev) => ({ ...prev, connected: false, lastSync: formatRelativeTime(lastMessageAt.current) }));
      } else {
        setData((prev) => ({ ...prev, lastSync: formatRelativeTime(lastMessageAt.current) }));
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(intervalRef.current);
    };
  }, [handleMessage]);

  return data;
}
