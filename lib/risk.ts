import { isDateInRange } from '@/lib/dateUtils';
import { Deadline, RiskCategory, RiskDriver, RiskResult, StudyPlanEntry } from '@/lib/types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return clamp((value - min) / (max - min), 0, 1);
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function consecutiveStudyDays(entries: StudyPlanEntry[]): number {
  const uniqueDates = Array.from(new Set(entries.map((entry) => entry.date))).sort();
  if (uniqueDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i += 1) {
    const prev = new Date(`${uniqueDates[i - 1]}T00:00:00Z`).getTime();
    const now = new Date(`${uniqueDates[i]}T00:00:00Z`).getTime();
    const diffDays = Math.round((now - prev) / 86400000);

    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function categorize(score: number): RiskCategory {
  if (score <= 39) {
    return 'Low';
  }
  if (score <= 69) {
    return 'Medium';
  }
  return 'High';
}

export function computeWeeklyRisk(
  deadlines: Deadline[],
  plan: StudyPlanEntry[],
  weekStart: string,
  weekEnd: string
): RiskResult {
  const deadlinesThisWeek = deadlines.filter((deadline) => isDateInRange(deadline.date, weekStart, weekEnd));
  const weekPlan = plan.filter((entry) => isDateInRange(entry.date, weekStart, weekEnd));

  const deadlineDensity = deadlinesThisWeek.length;
  const consecutiveDaysStudying = consecutiveStudyDays(weekPlan);
  const lateNightFrequency = weekPlan.filter((entry) => {
    const endMinutes = toMinutes(entry.start) + entry.durationMin;
    return endMinutes > 22 * 60 + 30;
  }).length;

  const deadlineNorm = normalize(deadlineDensity, 0, 6);
  const consecutiveNorm = normalize(consecutiveDaysStudying, 0, 7);
  const lateNightNorm = normalize(lateNightFrequency, 0, 5);

  const weightedDeadline = deadlineNorm * 0.45;
  const weightedConsecutive = consecutiveNorm * 0.35;
  const weightedLateNight = lateNightNorm * 0.2;

  const score = Math.round(
    clamp(100 * (weightedDeadline + weightedConsecutive + weightedLateNight), 0, 100)
  );

  const drivers: Record<RiskDriver, number> = {
    deadlineDensity: weightedDeadline,
    consecutiveDaysStudying: weightedConsecutive,
    lateNightFrequency: weightedLateNight
  };

  const primaryDriver = (Object.entries(drivers).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'deadlineDensity') as RiskDriver;

  return {
    score,
    category: categorize(score),
    primaryDriver,
    signals: {
      deadlineDensity,
      consecutiveDaysStudying,
      lateNightFrequency
    }
  };
}

export function coachingTipsFromRisk(risk: RiskResult): string[] {
  if (risk.category === 'High' && risk.primaryDriver === 'deadlineDensity') {
    return [
      'This week has clustered deadlines. Consider starting earlier and breaking tasks into smaller chunks.',
      'Group similar tasks and finish one priority item each day before adding new work.',
      'Reserve one low-pressure evening for recovery so your pace stays sustainable.'
    ];
  }

  if (risk.category === 'High' && risk.primaryDriver === 'consecutiveDaysStudying') {
    return [
      'You have many consecutive study days. Schedule one recovery day and lighter sessions.',
      'Split heavy sessions into shorter blocks with short breaks between topics.',
      'Protect sleep by setting a hard stop time and preparing tomorrow plans earlier.'
    ];
  }

  if (risk.category === 'High') {
    return [
      'Late-night sessions are frequent this week. Shift one study block earlier where possible.',
      'Front-load difficult material in daytime hours to reduce night pressure.',
      'Use a fixed shutdown routine to maintain sleep consistency.'
    ];
  }

  if (risk.category === 'Medium') {
    return [
      'Your workload is manageable. Keep a consistent routine and protect your sleep.',
      'Prioritize upcoming deadlines first, then use short review sessions for retention.',
      'Plan one flexible catch-up block to absorb unexpected workload changes.'
    ];
  }

  return [
    'Your current pace is sustainable. Keep your momentum with short, focused sessions.',
    'Review your next deadline at the start of each week to stay ahead.',
    'Continue balancing study blocks with breaks and regular sleep.'
  ];
}

export function riskDriverLabel(driver: RiskDriver): string {
  if (driver === 'deadlineDensity') {
    return 'Deadline density';
  }
  if (driver === 'consecutiveDaysStudying') {
    return 'Consecutive study days';
  }
  return 'Late-night load';
}
