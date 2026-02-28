/* ── Build a StudentContext snapshot from the merged dashboard student object ── */
import type { StudentContext, SiteTime } from './types';
import type { ExtensionSyncData } from './useExtensionSync';
import { classifyDomain } from './extensionBlend';
import * as mock from './mockData';

type MergedStudent = typeof import('./context')extends { useDashboard: () => { student: infer S } } ? S : never;

/**
 * Builds a StudentContext from the merged student object exposed by useDashboard().
 * Used by AgentChatWidget (chat API) and context.tsx (granite API).
 */
export function buildStudentContext(
  student: { extensionLive: ExtensionSyncData } & Record<string, unknown>,
): StudentContext {
  const burnout = (student.burnout ?? mock.burnout) as typeof mock.burnout;
  const nightSessions = (student.nightSessions ?? mock.nightSessions) as typeof mock.nightSessions;
  const productivity = (student.productivity ?? mock.productivity) as typeof mock.productivity;
  const deadlines = (student.deadlines ?? mock.deadlines) as typeof mock.deadlines;
  const courseStats = (student.courseStats ?? mock.courseStats) as typeof mock.courseStats;
  const studyStreak = (student.studyStreak ?? mock.studyStreak) as typeof mock.studyStreak;
  const timeBlocks = (student.timeBlocks ?? mock.timeBlocks) as typeof mock.timeBlocks;
  const focusMap = (student.focusMap ?? mock.focusMap) as typeof mock.focusMap;
  const ext = student.extensionLive;

  // Derive ILAP fields
  const nightCount = nightSessions.filter(n => n.isLateNight).length;
  const bestDay = productivity.reduce(
    (best, d) => (d.productive > best.productive ? d : best),
    productivity[0],
  );
  const totalHours = timeBlocks.reduce((s, b) => s + b.hours, 0);

  const hourLabels = ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM','12 AM'];
  const hourAvgs = Array.from({ length: 10 }, (_, h) => {
    const cells = focusMap.filter(c => c.hour === h && c.intensity > 0);
    return cells.length ? cells.reduce((s, c) => s + c.intensity, 0) / cells.length : 0;
  });
  const peakHourIdx = hourAvgs.indexOf(Math.max(...hourAvgs));

  // Classify extension domains
  const studySites: SiteTime[] = [];
  const distractingSites: SiteTime[] = [];
  let studySeconds = 0;
  let distractingSeconds = 0;

  if (ext.connected && ext.websiteTotals) {
    const entries = Object.entries(ext.websiteTotals)
      .map(([domain, seconds]) => ({ domain, seconds, category: classifyDomain(domain) }))
      .sort((a, b) => b.seconds - a.seconds);

    for (const site of entries) {
      if (site.category === 'study') {
        studySites.push(site);
        studySeconds += site.seconds;
      } else if (site.category === 'distracting') {
        distractingSites.push(site);
        distractingSeconds += site.seconds;
      }
    }
  }

  return {
    burnoutScore: burnout.score,
    burnoutTrend: burnout.trend,
    burnoutChange: burnout.weeklyChange,
    weeklyHours: Math.round(totalHours * 10) / 10,
    studyStreak: studyStreak.currentStreak,
    nightSessionCount: nightCount,
    bestDay: bestDay?.day ?? 'N/A',
    bestDayHours: bestDay?.productive ?? 0,
    peakFocusHour: hourLabels[peakHourIdx] ?? '8 AM',
    deadlines: deadlines.slice(0, 6).map(d => ({
      course: d.course,
      title: d.title,
      due: d.due,
      weight: d.weight,
    })),
    courseWorkload: courseStats.map(c => ({ code: c.code, hours: c.weeklyHours })),
    extensionConnected: ext.connected,
    timerState: ext.timerState,
    totalStudySeconds: ext.totalStudySeconds,
    studySites,
    distractingSites,
    studySeconds,
    distractingSeconds,
  };
}
