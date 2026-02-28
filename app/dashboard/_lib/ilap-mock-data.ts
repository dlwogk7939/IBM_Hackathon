/* ── Realistic ILAP Raw Data ("database") ── */
import type {
  ILAPDatabase, ILAPInstitution, ILAPStudent, ILAPStudentPII,
  ILAPCourse, ILAPEnrollment, ILAPConsent, ILAPActivitySession,
  ILAPAssignment, ILAPStudentDailySummary, ILAPCourseDailySummary,
  ActivityType,
} from './ilap-types';

/* ── Helpers ── */

/** Deterministic pseudo-random using a seed (avoids Math.random instability in SSR). */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = seededRandom(42);

function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function fmtISO(d: Date): string {
  return d.toISOString();
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function addMinutes(base: Date, n: number): Date {
  return new Date(base.getTime() + n * 60_000);
}

/* ── Date window: 6 weeks ending 2025-02-27 ── */
const WINDOW_END = new Date('2025-02-27T23:59:59Z');
const WINDOW_START = addDays(WINDOW_END, -41); // 42 days total (6 weeks)

/* ── Institution ── */
const institutions: ILAPInstitution[] = [
  { id: 'inst-001', name: 'Northfield State University', createdAt: '2024-01-15T00:00:00Z' },
];

/* ── Students (10) ── */
const studentConfigs: [string, string, string, string, number][] = [
  ['stu-001', 'Alex Chen',      'achen@northfield.edu',    'Computer Science',  2026],
  ['stu-002', 'Maria Rodriguez','mrodriguez@northfield.edu','Mathematics',       2025],
  ['stu-003', 'James Wilson',   'jwilson@northfield.edu',  'English',           2027],
  ['stu-004', 'Priya Patel',    'ppatel@northfield.edu',   'Physics',           2026],
  ['stu-005', 'David Kim',      'dkim@northfield.edu',     'Computer Science',  2025],
  ['stu-006', 'Sarah Johnson',  'sjohnson@northfield.edu', 'Mathematics',       2026],
  ['stu-007', 'Michael Brown',  'mbrown@northfield.edu',   'English',           2027],
  ['stu-008', 'Emily Davis',    'edavis@northfield.edu',   'Physics',           2026],
  ['stu-009', 'Chris Taylor',   'ctaylor@northfield.edu',  'Computer Science',  2025],
  ['stu-010', 'Lisa Anderson',  'landerson@northfield.edu','Mathematics',       2026],
];

const students: ILAPStudent[] = studentConfigs.map(([id, , , , ]) => ({
  id,
  institutionId: 'inst-001',
  externalStudentRef: id.toUpperCase().replace('-', ''),
  status: 'active' as const,
  createdAt: '2024-08-20T00:00:00Z',
}));

const studentPII: ILAPStudentPII[] = studentConfigs.map(([id, name, email, major, yr]) => ({
  studentId: id,
  name,
  email,
  gradYear: yr,
  major,
  updatedAt: '2025-01-10T00:00:00Z',
}));

/* ── Courses (4) ── */
const courses: ILAPCourse[] = [
  { id: 'crs-cs301',   institutionId: 'inst-001', courseRef: 'CS 301',   term: 'Spring 2025', title: 'Machine Learning',  createdAt: '2025-01-06T00:00:00Z', color: '#306CB5' },
  { id: 'crs-math245', institutionId: 'inst-001', courseRef: 'MATH 245', term: 'Spring 2025', title: 'Linear Algebra',    createdAt: '2025-01-06T00:00:00Z', color: '#F59E0B' },
  { id: 'crs-eng102',  institutionId: 'inst-001', courseRef: 'ENG 102',  term: 'Spring 2025', title: 'Composition II',    createdAt: '2025-01-06T00:00:00Z', color: '#10B981' },
  { id: 'crs-phys201', institutionId: 'inst-001', courseRef: 'PHYS 201', term: 'Spring 2025', title: 'Mechanics',         createdAt: '2025-01-06T00:00:00Z', color: '#8B5CF6' },
];

/* ── Enrollments: each student in all 4 courses ── */
const enrollments: ILAPEnrollment[] = [];
let enrollId = 1;
for (const stu of students) {
  for (const crs of courses) {
    enrollments.push({
      id: `enr-${String(enrollId++).padStart(3, '0')}`,
      studentId: stu.id,
      courseId: crs.id,
      createdAt: '2025-01-08T00:00:00Z',
    });
  }
}

/* ── Consents: one per student, all granted ── */
const consents: ILAPConsent[] = students.map((s, i) => ({
  id: `con-${String(i + 1).padStart(3, '0')}`,
  studentId: s.id,
  granted: true,
  grantedAt: '2025-01-09T00:00:00Z',
  revokedAt: null,
}));

/* ── Assignments: 5 per course (20 total) ── */
const assignmentConfigs: [string, string, string, number][] = [
  // CS 301
  ['crs-cs301', 'ML Problem Set 3',     '2025-02-14', 15],
  ['crs-cs301', 'Lab Report 5',         '2025-02-20', 10],
  ['crs-cs301', 'ML Problem Set 4',     '2025-02-28', 15],
  ['crs-cs301', 'Lab Report 6',         '2025-03-01', 10],
  ['crs-cs301', 'Midterm Project',      '2025-03-15', 25],
  // MATH 245
  ['crs-math245', 'Homework 5',         '2025-02-17', 10],
  ['crs-math245', 'Homework 6',         '2025-02-24', 10],
  ['crs-math245', 'Midterm Exam',       '2025-03-01', 25],
  ['crs-math245', 'Homework 7',         '2025-03-10', 10],
  ['crs-math245', 'Group Project',      '2025-03-20', 20],
  // ENG 102
  ['crs-eng102', 'Essay Draft 1',       '2025-02-10', 15],
  ['crs-eng102', 'Peer Review 1',       '2025-02-18', 5],
  ['crs-eng102', 'Essay Draft 2',       '2025-03-05', 20],
  ['crs-eng102', 'Research Proposal',   '2025-03-14', 15],
  ['crs-eng102', 'Final Essay',         '2025-04-01', 25],
  // PHYS 201
  ['crs-phys201', 'Homework 5',         '2025-02-13', 5],
  ['crs-phys201', 'Lab Report 4',       '2025-02-21', 10],
  ['crs-phys201', 'Homework 6',         '2025-02-27', 5],
  ['crs-phys201', 'Homework 7',         '2025-03-08', 5],
  ['crs-phys201', 'Midterm Exam',       '2025-03-18', 25],
];

const assignments: ILAPAssignment[] = assignmentConfigs.map(([courseId, title, dueAt, pts], i) => ({
  id: `asgn-${String(i + 1).padStart(3, '0')}`,
  courseId,
  title,
  dueAt,
  pointsPossible: pts,
}));

/* ── Activity Sessions ── */

/** Build sessions for a student over the 42-day window. */
function buildSessions(
  studentId: string,
  sessionsPerDay: number,
  isCurrentUser: boolean,
): ILAPActivitySession[] {
  const sessions: ILAPActivitySession[] = [];
  const courseIds = courses.map(c => c.id);
  const activityTypes: ActivityType[] = ['lecture', 'self-study', 'assignment', 'review'];
  // Weighted distribution for current user: 20% lecture, 40% self-study, 25% assignment, 15% review
  const typeWeights = isCurrentUser
    ? [0.20, 0.60, 0.85, 1.0]
    : [0.25, 0.55, 0.80, 1.0];

  for (let dayOffset = 0; dayOffset < 42; dayOffset++) {
    const date = addDays(WINDOW_START, dayOffset);
    const dow = date.getDay(); // 0=Sun, 6=Sat

    // Fewer sessions on weekends
    const daySessions = (dow === 0 || dow === 6)
      ? Math.max(1, Math.floor(sessionsPerDay * 0.4))
      : sessionsPerDay;

    for (let s = 0; s < daySessions; s++) {
      const courseId = courseIds[Math.floor(rand() * courseIds.length)];

      // Pick activity type using weighted distribution
      const r = rand();
      const typeIdx = typeWeights.findIndex(w => r < w);
      const activityType = activityTypes[typeIdx];

      // Time of day: mostly 8AM-8PM, with late-night sessions for current user on Tue/Thu/Fri
      let startHour: number;
      if (isCurrentUser && (dow === 2 || dow === 4 || dow === 5) && rand() < 0.25) {
        // Late-night session
        startHour = 22 + Math.floor(rand() * 3); // 22, 23, 24(0)
        if (startHour >= 24) startHour = 0;
      } else {
        startHour = 8 + Math.floor(rand() * 12); // 8AM to 7PM
      }

      const startMin = Math.floor(rand() * 60);
      const start = new Date(date);
      start.setHours(startHour, startMin, 0, 0);

      // Duration: 20-120 minutes
      const duration = 20 + Math.floor(rand() * 100);
      const end = addMinutes(start, duration);

      // Focus rating: morning 4-5, afternoon 3-4, late night 1-3
      let focusBase: number;
      if (startHour >= 6 && startHour < 12) focusBase = 4 + Math.floor(rand() * 2);      // 4-5
      else if (startHour >= 12 && startHour < 18) focusBase = 3 + Math.floor(rand() * 2); // 3-4
      else focusBase = 1 + Math.floor(rand() * 3);                                         // 1-3
      const focusRating = Math.min(5, Math.max(1, focusBase));

      sessions.push({
        id: `ses-${studentId}-${String(sessions.length + 1).padStart(4, '0')}`,
        studentId,
        courseId,
        startedAt: fmtISO(start),
        endedAt: fmtISO(end),
        durationMin: duration,
        focusRating,
        notes: '',
        createdAt: fmtISO(start),
        activityType,
      });
    }
  }
  return sessions;
}

const activitySessions: ILAPActivitySession[] = [];
for (const stu of students) {
  const isCurrent = stu.id === 'stu-001';
  const perDay = isCurrent ? 4 : 1; // ~168 for STU-001, ~42 for others
  activitySessions.push(...buildSessions(stu.id, perDay, isCurrent));
}

/* ── Student Daily Summaries ── */

function buildStudentDailySummaries(studentId: string, isCurrentUser: boolean): ILAPStudentDailySummary[] {
  const summaries: ILAPStudentDailySummary[] = [];
  for (let dayOffset = 0; dayOffset < 42; dayOffset++) {
    const date = addDays(WINDOW_START, dayOffset);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;

    // Study minutes: current user studies more on weekdays
    let studyMin: number;
    if (isCurrentUser) {
      studyMin = isWeekend
        ? 60 + Math.floor(rand() * 120)   // 60-180 min on weekends
        : 180 + Math.floor(rand() * 240);  // 180-420 min on weekdays (3-7h)
    } else {
      studyMin = isWeekend
        ? 30 + Math.floor(rand() * 90)
        : 120 + Math.floor(rand() * 180);
    }

    // Focus score: trending down for current user in recent weeks
    const weekNum = Math.floor(dayOffset / 7);
    let focusBase = isCurrentUser ? 75 - weekNum * 3 : 65 + Math.floor(rand() * 20);
    focusBase += Math.floor(rand() * 10) - 5;
    const focusScore = Math.min(100, Math.max(20, focusBase));

    // Workload score: rising for current user (burnout narrative)
    let workloadBase = isCurrentUser ? 45 + weekNum * 4 : 40 + Math.floor(rand() * 25);
    workloadBase += Math.floor(rand() * 10) - 5;
    const workloadScore = Math.min(100, Math.max(10, workloadBase));

    summaries.push({
      studentId,
      date: fmtDate(date),
      studyMinutes: studyMin,
      focusScore,
      workloadScore,
    });
  }
  return summaries;
}

const studentDailySummaries: ILAPStudentDailySummary[] = [];
for (const stu of students) {
  studentDailySummaries.push(...buildStudentDailySummaries(stu.id, stu.id === 'stu-001'));
}

/* ── Course Daily Summaries ── */

function buildCourseDailySummaries(): ILAPCourseDailySummary[] {
  const summaries: ILAPCourseDailySummary[] = [];
  // Risk profiles per course: CS 301 = high risk, ENG 102 = low
  const riskProfiles: Record<string, number> = {
    'crs-cs301': 0.6,    // higher baseline at-risk
    'crs-math245': 0.4,
    'crs-phys201': 0.45,
    'crs-eng102': 0.2,
  };

  for (const course of courses) {
    const riskBase = riskProfiles[course.id] ?? 0.3;
    for (let dayOffset = 0; dayOffset < 42; dayOffset++) {
      const date = addDays(WINDOW_START, dayOffset);
      const weekNum = Math.floor(dayOffset / 7);

      // Average study minutes per student for this course
      const avgStudy = 40 + Math.floor(rand() * 30) - weekNum * 2;
      const avgFocus = 60 + Math.floor(rand() * 20) - weekNum * 2;

      // At-risk count rises slightly over weeks for high-risk courses
      const atRisk = Math.floor(10 * (riskBase + weekNum * 0.03) + (rand() * 3 - 1.5));

      summaries.push({
        courseId: course.id,
        date: fmtDate(date),
        avgStudyMinutes: Math.max(10, avgStudy),
        avgFocusScore: Math.min(100, Math.max(20, avgFocus)),
        atRiskCount: Math.max(0, atRisk),
      });
    }
  }
  return summaries;
}

const courseDailySummaries = buildCourseDailySummaries();

/* ── Assembled Database ── */

export const ilapDB: ILAPDatabase = {
  institutions,
  students,
  studentPII,
  courses,
  enrollments,
  consents,
  activitySessions,
  assignments,
  studentDailySummaries,
  courseDailySummaries,
};
