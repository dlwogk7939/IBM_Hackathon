'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import * as mock from './mockData';
import { useExtensionSync, type ExtensionSyncData } from './useExtensionSync';
import {
  blendBurnout, blendNightSessions, blendProductivity,
  blendTimeBlocks, blendStudyStreak,
} from './extensionBlend';
import { buildStudentContext } from './buildStudentContext';

export type Role = 'student' | 'educator';

interface DashboardState {
  role: Role;
  setRole: (r: Role) => void;
  student: typeof initialStudentData & { extensionLive: ExtensionSyncData };
  educator: typeof initialEducatorData;
}

const initialStudentData = {
  burnout: mock.burnout,
  nightSessions: mock.nightSessions,
  deadlines: mock.deadlines,
  timeBlocks: mock.timeBlocks,
  productivity: mock.productivity,
  focusMap: mock.focusMap,
  courseStats: mock.courseStats,
  digest: mock.digestItems,
  studyPlan: mock.studyPlan,
  extensionStatus: mock.extensionStatus,
  studyStreak: mock.studyStreak,
  nudge: null as { nudge: string; type: 'focus' | 'break' | 'encouragement' | 'sleep' } | null,
};

const initialEducatorData = {
  kpis: mock.departmentKPIs,
  engagement: mock.engagementRows,
  heatmap: mock.heatmapData,
  alerts: mock.alerts,
  trend: mock.engagementTrend,
  roi: mock.roiMetrics,
  scalability: mock.scalabilityMetrics,
};

const Ctx = createContext<DashboardState | null>(null);

async function fetchGranite(action: string, context: Record<string, unknown>) {
  try {
    const res = await fetch('/api/granite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, context }),
    });
    const json = await res.json();
    if (json.fallback) return null;
    return json.data;
  } catch {
    return null;
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('student');
  const [studentData, setStudentData] = useState(initialStudentData);
  const [educatorData, setEducatorData] = useState(initialEducatorData);
  const extensionLive = useExtensionSync();

  // Track previous extension connected state for transition detection
  const prevConnectedRef = useRef(false);
  const lastNudgeFetchRef = useRef(0);

  // Initial fetch on mount (mock-only context)
  useEffect(() => {
    const burnout = mock.burnout;
    const nights = mock.nightSessions;
    const deadlines = mock.deadlines;
    const productivity = mock.productivity;
    const courseStats = mock.courseStats;

    const nightCount = nights.filter(n => n.isLateNight).length;
    const clusterCount = deadlines.filter(d => d.isCluster).length;
    const bestDay = productivity.reduce(
      (best, d) => (d.productive > best.productive ? d : best),
      productivity[0],
    );

    const hourLabels = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM', '12 AM'];
    const focusCells = mock.focusMap;
    const hourAvgs = Array.from({ length: 10 }, (_, h) => {
      const cells = focusCells.filter(c => c.hour === h && c.intensity > 0);
      return cells.length ? cells.reduce((s, c) => s + c.intensity, 0) / cells.length : 0;
    });
    const peakHourIdx = hourAvgs.indexOf(Math.max(...hourAvgs));

    const studentCtx = {
      burnoutScore: burnout.score,
      burnoutTrend: burnout.trend,
      burnoutChange: burnout.weeklyChange,
      nightSessionCount: nightCount,
      deadlineClusters: clusterCount,
      bestDay: bestDay.day,
      bestDayHours: bestDay.productive,
      peakFocusHour: hourLabels[peakHourIdx],
      deadlines: deadlines.slice(0, 4).map(d => ({
        course: d.course,
        title: d.title,
        due: d.due,
        weight: d.weight,
      })),
      courseWorkload: courseStats.map(c => ({
        code: c.code,
        hours: c.weeklyHours,
      })),
    };

    fetchGranite('digest', studentCtx).then(data => {
      if (data) setStudentData(prev => ({ ...prev, digest: data }));
    });

    fetchGranite('studyplan', studentCtx).then(data => {
      if (data) setStudentData(prev => ({ ...prev, studyPlan: data }));
    });

    const educatorCtx = {
      courseAnalytics: mock.engagementRows.map(row => ({
        course: row.course,
        enrolled: row.enrolled,
        avgHours: row.avgHours,
        burnoutPct: row.burnoutPct,
        trend: row.trend,
        riskLevel: row.riskLevel,
      })),
    };

    fetchGranite('alerts', educatorCtx).then(data => {
      if (data) setEducatorData(prev => ({ ...prev, alerts: data }));
    });
  }, []);

  // Build merged student for context building
  const mergedStudent = extensionLive.connected
    ? {
        ...studentData,
        burnout: blendBurnout(studentData.burnout, extensionLive),
        nightSessions: blendNightSessions(studentData.nightSessions, extensionLive),
        productivity: blendProductivity(studentData.productivity, extensionLive),
        timeBlocks: blendTimeBlocks(studentData.timeBlocks, extensionLive),
        studyStreak: blendStudyStreak(studentData.studyStreak, extensionLive),
        extensionLive,
        extensionStatus: {
          connected: true,
          lastSync: extensionLive.lastSync,
          browser: 'Chrome',
          version: extensionLive.version,
        },
      }
    : { ...studentData, extensionLive };

  // Re-fetch AI data when extension transitions disconnected → connected
  // Also fetch nudge when connected with enough data, debounced to 5min
  useEffect(() => {
    const wasConnected = prevConnectedRef.current;
    const isConnected = extensionLive.connected;
    prevConnectedRef.current = isConnected;

    // Transition: disconnected → connected — re-fetch digest & studyplan with real context
    if (!wasConnected && isConnected) {
      const ctx = buildStudentContext(mergedStudent as Parameters<typeof buildStudentContext>[0]);
      fetchGranite('digest', ctx as unknown as Record<string, unknown>).then(data => {
        if (data) setStudentData(prev => ({ ...prev, digest: data }));
      });
      fetchGranite('studyplan', ctx as unknown as Record<string, unknown>).then(data => {
        if (data) setStudentData(prev => ({ ...prev, studyPlan: data }));
      });
    }

    // Nudge: connected + >5min tracked + debounced to once per 5min
    if (isConnected && extensionLive.totalStudySeconds >= 300) {
      const now = Date.now();
      if (now - lastNudgeFetchRef.current >= 5 * 60 * 1000) {
        lastNudgeFetchRef.current = now;
        const ctx = buildStudentContext(mergedStudent as Parameters<typeof buildStudentContext>[0]);
        fetchGranite('nudge', ctx as unknown as Record<string, unknown>).then(data => {
          if (data && data.nudge) {
            setStudentData(prev => ({ ...prev, nudge: data }));
          }
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionLive.connected, extensionLive.totalStudySeconds]);

  return (
    <Ctx.Provider value={{ role, setRole, student: mergedStudent, educator: educatorData }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
