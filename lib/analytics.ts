import { getWeekRange } from '@/lib/dateUtils';
import { MOCK_STUDENTS, TERM_START } from '@/lib/mockData';
import { generateStudyPlan } from '@/lib/planner';
import { computeWeeklyRisk, riskDriverLabel } from '@/lib/risk';
import {
  CourseClusterPoint,
  DashboardData,
  HighRiskRow,
  MockStudent,
  RiskCategory,
  RiskDistributionPoint,
  StudentWeekRisk
} from '@/lib/types';

const TOTAL_WEEKS = 15;

function allDeadlines(student: MockStudent) {
  return student.courses.flatMap((course) => course.deadlines);
}

function getStudentWeekRisks(students: MockStudent[]): StudentWeekRisk[] {
  const records: StudentWeekRisk[] = [];

  for (const student of students) {
    const deadlines = allDeadlines(student);
    const plan = generateStudyPlan(deadlines);

    for (let week = 1; week <= TOTAL_WEEKS; week += 1) {
      const range = getWeekRange(TERM_START, week);
      const risk = computeWeeklyRisk(deadlines, plan, range.start, range.end);
      records.push({
        studentId: student.studentId,
        week,
        risk
      });
    }
  }

  return records;
}

const STUDENT_WEEK_RISKS = getStudentWeekRisks(MOCK_STUDENTS);

function distributionForWeek(week: number): { low: number; medium: number; high: number } {
  const base = { low: 0, medium: 0, high: 0 };
  const rows = STUDENT_WEEK_RISKS.filter((risk) => risk.week === week);

  for (const row of rows) {
    if (row.risk.category === 'Low') {
      base.low += 1;
    } else if (row.risk.category === 'Medium') {
      base.medium += 1;
    } else {
      base.high += 1;
    }
  }

  return base;
}

function avgRiskForWeek(week: number): number {
  const rows = STUDENT_WEEK_RISKS.filter((risk) => risk.week === week);
  const total = rows.reduce((sum, row) => sum + row.risk.score, 0);
  return rows.length ? Number((total / rows.length).toFixed(1)) : 0;
}

function courseClustersForWeek(week: number): CourseClusterPoint[] {
  const range = getWeekRange(TERM_START, week);

  const courseCounts = new Map<string, number>();
  const courseStudents = new Map<string, Set<string>>();

  for (const student of MOCK_STUDENTS) {
    for (const course of student.courses) {
      const dueThisWeek = course.deadlines.filter(
        (deadline) => deadline.date >= range.start && deadline.date <= range.end
      );

      if (dueThisWeek.length > 0) {
        courseCounts.set(course.course, (courseCounts.get(course.course) ?? 0) + dueThisWeek.length);

        if (!courseStudents.has(course.course)) {
          courseStudents.set(course.course, new Set());
        }
        courseStudents.get(course.course)?.add(student.studentId);
      }
    }
  }

  return Array.from(courseCounts.entries())
    .map(([course, deadlines]) => ({
      course,
      deadlines,
      affectedStudents: courseStudents.get(course)?.size ?? 0
    }))
    .sort((a, b) => b.deadlines - a.deadlines || b.affectedStudents - a.affectedStudents);
}

function highRiskRowsForWeek(week: number): HighRiskRow[] {
  return STUDENT_WEEK_RISKS.filter((row) => row.week === week && row.risk.category === 'High')
    .sort((a, b) => b.risk.score - a.risk.score)
    .map((row) => ({
      studentId: row.studentId,
      riskScore: row.risk.score,
      primaryDriver: riskDriverLabel(row.risk.primaryDriver)
    }));
}

function interventionSuggestions(week: number, highRiskPercent: number, topCourse?: string): string[] {
  const suggestions: string[] = [];

  if (highRiskPercent > 30) {
    suggestions.push(
      `Consider coordinating major deadlines or offering review resources in Week ${week}.`
    );
  }

  if (topCourse) {
    suggestions.push(`Review assignment schedule for ${topCourse} in Week ${week}.`);
  }

  if (suggestions.length === 0) {
    suggestions.push(`Risk levels are stable in Week ${week}. Continue monitoring course pacing.`);
  }

  return suggestions;
}

function riskDistributionSeries(): RiskDistributionPoint[] {
  return Array.from({ length: TOTAL_WEEKS }, (_, idx) => {
    const week = idx + 1;
    const distribution = distributionForWeek(week);
    return {
      week: `W${week}`,
      low: distribution.low,
      medium: distribution.medium,
      high: distribution.high
    };
  });
}

function avgRiskSeries() {
  return Array.from({ length: TOTAL_WEEKS }, (_, idx) => {
    const week = idx + 1;
    return {
      week: `W${week}`,
      avgRisk: avgRiskForWeek(week)
    };
  });
}

export function getDashboardData(week: number): DashboardData {
  const safeWeek = Math.min(Math.max(week, 1), TOTAL_WEEKS);
  const selectedRows = STUDENT_WEEK_RISKS.filter((row) => row.week === safeWeek);

  const highCount = selectedRows.filter((row) => row.risk.category === 'High').length;
  const highRiskPercent = Number(((highCount / selectedRows.length) * 100).toFixed(1));
  const avgRiskScore = avgRiskForWeek(safeWeek);

  const clusters = courseClustersForWeek(safeWeek);
  const topClusteredCourses = clusters.slice(0, 3).map((row) => row.course);

  return {
    selectedWeek: safeWeek,
    kpis: {
      highRiskPercent,
      avgRiskScore,
      topClusteredCourses
    },
    riskDistributionByWeek: riskDistributionSeries(),
    avgRiskByWeek: avgRiskSeries(),
    courseClustersForWeek: clusters,
    highRiskStudents: highRiskRowsForWeek(safeWeek),
    interventionSuggestions: interventionSuggestions(safeWeek, highRiskPercent, topClusteredCourses[0])
  };
}

export function totalWeeks(): number {
  return TOTAL_WEEKS;
}

export function riskBadgeClass(category: RiskCategory): string {
  if (category === 'High') {
    return 'bg-red-100 text-red-700';
  }
  if (category === 'Medium') {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-emerald-100 text-emerald-700';
}
