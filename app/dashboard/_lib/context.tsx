'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import * as mock from './mockData';

export type Role = 'student' | 'educator';

interface DashboardState {
  role: Role;
  setRole: (r: Role) => void;
  student: typeof studentData;
  educator: typeof educatorData;
}

const studentData = {
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

const educatorData = {
  kpis: mock.departmentKPIs,
  engagement: mock.engagementRows,
  heatmap: mock.heatmapData,
  alerts: mock.alerts,
  trend: mock.engagementTrend,
  roi: mock.roiMetrics,
  scalability: mock.scalabilityMetrics,
};

const Ctx = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('student');
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
