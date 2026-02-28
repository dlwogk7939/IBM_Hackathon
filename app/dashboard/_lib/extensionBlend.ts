/* ── Extension Data → Dashboard Blending Functions ── */
import type {
  BurnoutReading, NightSession, ProductivityDay,
  TimeBlock, StudyStreak,
} from './types';
import type { ExtensionSyncData } from './useExtensionSync';

/* ── Domain classification ── */

const STUDY_DOMAINS = new Set([
  'carmen.osu.edu', 'canvas.osu.edu', 'docs.google.com',
  'drive.google.com', 'www.overleaf.com', 'github.com', 'stackoverflow.com',
  'scholar.google.com', 'arxiv.org', 'wikipedia.org',
]);

const DISTRACTING_DOMAINS = new Set([
  'instagram.com', 'www.instagram.com', 'tiktok.com', 'www.tiktok.com',
  'youtube.com', 'www.youtube.com', 'twitter.com', 'x.com',
  'reddit.com', 'www.reddit.com', 'facebook.com', 'www.facebook.com',
]);

export function classifyDomain(domain: string): 'study' | 'distracting' | 'other' {
  if (STUDY_DOMAINS.has(domain)) return 'study';
  if (DISTRACTING_DOMAINS.has(domain)) return 'distracting';
  return 'other';
}

/* ── Time-block classification (study domains → activity type) ── */

const SELF_STUDY_DOMAINS = new Set([
  'docs.google.com', 'drive.google.com', 'www.overleaf.com',
]);
const LECTURE_DOMAINS = new Set([
  'carmen.osu.edu', 'canvas.osu.edu',
]);
const ASSIGNMENT_DOMAINS = new Set([
  'github.com', 'stackoverflow.com',
]);
// Remaining study domains → Review

function classifyTimeBlock(domain: string): 'Self-study' | 'Lectures' | 'Assignments' | 'Review' | null {
  if (SELF_STUDY_DOMAINS.has(domain)) return 'Self-study';
  if (LECTURE_DOMAINS.has(domain)) return 'Lectures';
  if (ASSIGNMENT_DOMAINS.has(domain)) return 'Assignments';
  if (STUDY_DOMAINS.has(domain)) return 'Review';
  return null; // non-study domains don't map to time blocks
}

/* ── Helpers ── */

function sumWebsiteSeconds(
  websiteTotals: Record<string, number>,
  filter: (domain: string) => boolean,
): number {
  return Object.entries(websiteTotals)
    .filter(([domain]) => filter(domain))
    .reduce((sum, [, seconds]) => sum + seconds, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ── Blend functions ── */

export function blendBurnout(base: BurnoutReading, ext: ExtensionSyncData): BurnoutReading {
  const totalSeconds = Object.values(ext.websiteTotals).reduce((s, v) => s + v, 0);
  const distractingSeconds = sumWebsiteSeconds(ext.websiteTotals, d => classifyDomain(d) === 'distracting');
  const distractionRatio = totalSeconds > 0 ? distractingSeconds / totalSeconds : 0;

  // Distraction adjustment: high distraction % adds to burnout (max +10)
  const distractionAdj = distractionRatio * 20; // 50 % distracted → +10

  // Continuous session penalty: >3 h without pause adds to overwork factor
  const extensionHours = ext.totalStudySeconds / 3600;
  const continuousAdj = extensionHours > 3 ? Math.min(8, (extensionHours - 3) * 2.5) : 0;

  const score = clamp(base.score + distractionAdj + continuousAdj, 0, 100);

  // Late-night trend override: timer running after 10 PM → rising
  const currentHour = new Date().getHours();
  const trend: BurnoutReading['trend'] =
    ext.timerState === 'RUNNING' && currentHour >= 22
      ? 'rising'
      : base.trend;

  return { ...base, score, trend };
}

export function blendNightSessions(base: NightSession[], ext: ExtensionSyncData): NightSession[] {
  const currentHour = new Date().getHours();
  const isLateNow = currentHour >= 22 || currentHour < 4;

  if (!isLateNow || ext.timerState !== 'RUNNING') return base;

  // Replace the last entry (today) with live late-night data
  const result = [...base];
  const todayIdx = result.length - 1;
  if (todayIdx < 0) return base;

  // Estimate late-night seconds: we don't know exactly when late-night started,
  // but if it's currently late and timer is running, use a fraction of total seconds
  // as a reasonable approximation (at least show some activity)
  const lateNightHours = Math.max(result[todayIdx].hours, ext.totalStudySeconds / 3600 * 0.3);

  result[todayIdx] = {
    ...result[todayIdx],
    hours: Math.round(lateNightHours * 10) / 10,
    isLateNight: true,
  };

  return result;
}

export function blendProductivity(base: ProductivityDay[], ext: ExtensionSyncData): ProductivityDay[] {
  const result = [...base];
  const todayIdx = result.length - 1;
  if (todayIdx < 0) return base;

  const studySeconds = sumWebsiteSeconds(ext.websiteTotals, d => classifyDomain(d) === 'study');
  const distractingSeconds = sumWebsiteSeconds(ext.websiteTotals, d => classifyDomain(d) !== 'study');

  const productiveHours = studySeconds / 3600;
  const distractedHours = distractingSeconds / 3600;

  result[todayIdx] = {
    ...result[todayIdx],
    productive: Math.round(Math.max(result[todayIdx].productive, productiveHours) * 10) / 10,
    distracted: Math.round(Math.max(result[todayIdx].distracted, distractedHours) * 10) / 10,
  };

  return result;
}

export function blendTimeBlocks(base: TimeBlock[], ext: ExtensionSyncData): TimeBlock[] {
  // Accumulate extension seconds into time-block categories
  const extraHours: Record<string, number> = {
    'Self-study': 0,
    'Lectures': 0,
    'Assignments': 0,
    'Review': 0,
  };

  for (const [domain, seconds] of Object.entries(ext.websiteTotals)) {
    const category = classifyTimeBlock(domain);
    if (category) {
      extraHours[category] += seconds / 3600;
    }
  }

  return base.map(block => {
    const extra = extraHours[block.label] ?? 0;
    return extra > 0
      ? { ...block, hours: Math.round((block.hours + extra) * 10) / 10 }
      : block;
  });
}

export function blendStudyStreak(base: StudyStreak, ext: ExtensionSyncData): StudyStreak {
  if (ext.totalStudySeconds <= 0) return base;

  // Extension has recorded study time → today is active
  if (base.isActiveToday) return base; // already active, no change needed

  return {
    ...base,
    isActiveToday: true,
    currentStreak: base.currentStreak + 1,
    longestStreak: Math.max(base.longestStreak, base.currentStreak + 1),
  };
}
