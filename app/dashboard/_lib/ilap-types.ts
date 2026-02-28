/* ── ILAP (Institutional Learning Analytics Platform) Entity Types ── */

export interface ILAPInstitution {
  id: string;
  name: string;
  createdAt: string;
}

export interface ILAPStudent {
  id: string;
  institutionId: string;
  externalStudentRef: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
}

export interface ILAPStudentPII {
  studentId: string;
  name: string;
  email: string;
  gradYear: number;
  major: string;
  updatedAt: string;
}

export interface ILAPCourse {
  id: string;
  institutionId: string;
  courseRef: string;
  term: string;
  title: string;
  createdAt: string;
  color: string; // dashboard display color
}

export interface ILAPEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
}

export interface ILAPConsent {
  id: string;
  studentId: string;
  granted: boolean;
  grantedAt: string;
  revokedAt: string | null;
}

export type ActivityType = 'lecture' | 'self-study' | 'assignment' | 'review';

export interface ILAPActivitySession {
  id: string;
  studentId: string;
  courseId: string;
  startedAt: string;
  endedAt: string;
  durationMin: number;
  focusRating: number; // 1-5
  notes: string;
  createdAt: string;
  activityType: ActivityType;
}

export interface ILAPAssignment {
  id: string;
  courseId: string;
  title: string;
  dueAt: string;
  pointsPossible: number;
}

export interface ILAPStudentDailySummary {
  studentId: string;
  date: string;
  studyMinutes: number;
  focusScore: number;   // 0-100
  workloadScore: number; // 0-100
}

export interface ILAPCourseDailySummary {
  courseId: string;
  date: string;
  avgStudyMinutes: number;
  avgFocusScore: number;
  atRiskCount: number;
}

export interface ILAPDatabase {
  institutions: ILAPInstitution[];
  students: ILAPStudent[];
  studentPII: ILAPStudentPII[];
  courses: ILAPCourse[];
  enrollments: ILAPEnrollment[];
  consents: ILAPConsent[];
  activitySessions: ILAPActivitySession[];
  assignments: ILAPAssignment[];
  studentDailySummaries: ILAPStudentDailySummary[];
  courseDailySummaries: ILAPCourseDailySummary[];
}
