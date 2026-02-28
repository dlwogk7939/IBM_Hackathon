/* ── maintAIn Dashboard Types ── */

export interface BurnoutReading {
  score: number;
  trend: 'rising' | 'falling' | 'stable';
  weeklyChange: number;
}

export interface NightSession {
  day: string;
  hours: number;
  isLateNight: boolean;
}

export interface Deadline {
  id: string;
  course: string;
  title: string;
  due: string;
  weight: number;
  isCluster: boolean;
}

export interface TimeBlock {
  label: string;
  hours: number;
  color: string;
}

export interface ProductivityDay {
  day: string;
  productive: number;
  distracted: number;
}

export interface FocusCell {
  day: number;
  hour: number;
  intensity: number; // 0-4
}

export interface CourseStats {
  code: string;
  name: string;
  weeklyHours: number;
  trend: number;
  burnout: number;
  color: string;
}

export interface DigestItem {
  icon: string;
  text: string;
}

export interface StudyPlan {
  time: string;
  task: string;
  course: string;
}

export interface ExtensionStatus {
  connected: boolean;
  lastSync: string;
  browser: string;
  version: string;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  isActiveToday: boolean;
}

/* ── Educator types ── */

export interface DepartmentKPI {
  label: string;
  value: string;
  change: number;
  icon: string;
}

export interface EngagementRow {
  course: string;
  enrolled: number;
  avgHours: number;
  burnoutPct: number;
  trend: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface HeatmapCell {
  course: string;
  week: string;
  risk: number; // 0-4
}

export interface AlertItem {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
  course: string;
  timestamp: string;
}

export interface EngagementPoint {
  week: string;
  engagement: number;
  burnout: number;
}

export interface ScalabilityMetrics {
  activeUsers: number;
  peakConcurrent: number;
  avgResponseMs: number;
  uptime: number;
  region: string;
}

/* ── Shared context sent from client → AI APIs ── */

export interface SiteTime {
  domain: string;
  seconds: number;
  category: 'study' | 'distracting' | 'other';
}

export interface StudentContext {
  // ILAP / mock fields
  burnoutScore: number;
  burnoutTrend: 'rising' | 'falling' | 'stable';
  burnoutChange: number;
  weeklyHours: number;
  studyStreak: number;
  nightSessionCount: number;
  bestDay: string;
  bestDayHours: number;
  peakFocusHour: string;
  deadlines: { course: string; title: string; due: string; weight: number }[];
  courseWorkload: { code: string; hours: number }[];

  // Extension fields
  extensionConnected: boolean;
  timerState: string;
  totalStudySeconds: number;
  studySites: SiteTime[];
  distractingSites: SiteTime[];
  studySeconds: number;
  distractingSeconds: number;
}
