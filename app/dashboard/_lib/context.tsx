'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as mock from './mockData';

export type Role = 'student' | 'educator';

interface DashboardState {
  role: Role;
  setRole: (r: Role) => void;
  student: typeof initialStudentData;
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

  useEffect(() => {
    // Build analytics context from processor data
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

    // Fetch digest and study plan
    fetchGranite('digest', studentCtx).then(data => {
      if (data) setStudentData(prev => ({ ...prev, digest: data }));
    });

    fetchGranite('studyplan', studentCtx).then(data => {
      if (data) setStudentData(prev => ({ ...prev, studyPlan: data }));
    });

    // Build educator context for alerts
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

  return (
    <Ctx.Provider value={{ role, setRole, student: studentData, educator: educatorData }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
