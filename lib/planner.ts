import { addDaysToISO, parseISODate } from '@/lib/dateUtils';
import { Deadline, DeadlineType, StudyPlanEntry } from '@/lib/types';

type StudyRule = {
  sessions: number;
  durationMin: number;
  windowDays: number;
};

const STUDY_RULES: Record<DeadlineType, StudyRule> = {
  exam: { sessions: 5, durationMin: 90, windowDays: 10 },
  project: { sessions: 6, durationMin: 120, windowDays: 14 },
  hw: { sessions: 2, durationMin: 60, windowDays: 4 }
};

function getSessionStart(existingSessions: StudyPlanEntry[]): string {
  if (existingSessions.length === 0) {
    return '18:00';
  }
  return '21:00';
}

function searchAvailableDate(
  preferred: string,
  start: string,
  end: string,
  planMap: Map<string, StudyPlanEntry[]>
): string | null {
  if (preferred < start) {
    return null;
  }

  const total = Math.max(0, Math.ceil((parseISODate(end).getTime() - parseISODate(start).getTime()) / 86400000));

  for (let radius = 0; radius <= total; radius += 1) {
    const earlier = addDaysToISO(preferred, -radius);
    if (earlier >= start && earlier <= end && (planMap.get(earlier)?.length ?? 0) < 2) {
      return earlier;
    }

    if (radius > 0) {
      const later = addDaysToISO(preferred, radius);
      if (later >= start && later <= end && (planMap.get(later)?.length ?? 0) < 2) {
        return later;
      }
    }
  }

  return null;
}

export function generateStudyPlan(deadlines: Deadline[]): StudyPlanEntry[] {
  const planMap = new Map<string, StudyPlanEntry[]>();
  const sortedDeadlines = [...deadlines].sort((a, b) => a.date.localeCompare(b.date));

  for (const deadline of sortedDeadlines) {
    const rule = STUDY_RULES[deadline.type];
    const latest = addDaysToISO(deadline.date, -1);
    const earliest = addDaysToISO(deadline.date, -rule.windowDays);

    for (let sessionIdx = 0; sessionIdx < rule.sessions; sessionIdx += 1) {
      const spreadDenominator = Math.max(rule.sessions - 1, 1);
      const offset = Math.floor((sessionIdx * (rule.windowDays - 1)) / spreadDenominator);
      const preferredDate = addDaysToISO(earliest, offset);

      const day = searchAvailableDate(preferredDate, earliest, latest, planMap);
      if (!day) {
        continue;
      }

      const existing = planMap.get(day) ?? [];
      const entry: StudyPlanEntry = {
        date: day,
        start: getSessionStart(existing),
        durationMin: rule.durationMin,
        course: deadline.course,
        label: `${deadline.title} prep`
      };

      existing.push(entry);
      planMap.set(day, existing);
    }
  }

  return Array.from(planMap.values())
    .flat()
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

export function filterStudyPlanByWeek(
  plan: StudyPlanEntry[],
  weekStart: string,
  weekEnd: string
): StudyPlanEntry[] {
  return plan.filter((entry) => entry.date >= weekStart && entry.date <= weekEnd);
}
