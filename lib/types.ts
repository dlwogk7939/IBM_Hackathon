export type DeadlineType = 'hw' | 'exam' | 'project';

export type Deadline = {
  title: string;
  type: DeadlineType;
  date: string;
  weight: number;
  course: string;
};

export type SyllabusExtraction = {
  course: string;
  termStart: string;
  termEnd: string;
  deadlines: Deadline[];
};

export type StudyPlanEntry = {
  date: string;
  start: string;
  durationMin: number;
  course: string;
  label: string;
};

export type RiskCategory = 'Low' | 'Medium' | 'High';

export type RiskDriver =
  | 'deadlineDensity'
  | 'consecutiveDaysStudying'
  | 'lateNightFrequency';

export type RiskSignals = {
  deadlineDensity: number;
  consecutiveDaysStudying: number;
  lateNightFrequency: number;
};

export type RiskResult = {
  score: number;
  category: RiskCategory;
  signals: RiskSignals;
  primaryDriver: RiskDriver;
};

export type CoachingTipSet = {
  category: RiskCategory;
  tips: string[];
};

export type MockCourseSchedule = {
  course: string;
  deadlines: Deadline[];
};

export type MockStudent = {
  studentId: string;
  courses: MockCourseSchedule[];
};

export type StudentWeekRisk = {
  studentId: string;
  week: number;
  risk: RiskResult;
};

export type RiskDistributionPoint = {
  week: string;
  low: number;
  medium: number;
  high: number;
};

export type AvgRiskPoint = {
  week: string;
  avgRisk: number;
};

export type CourseClusterPoint = {
  course: string;
  deadlines: number;
  affectedStudents: number;
};

export type HighRiskRow = {
  studentId: string;
  riskScore: number;
  primaryDriver: string;
};

export type DashboardKPIs = {
  highRiskPercent: number;
  avgRiskScore: number;
  topClusteredCourses: string[];
};

export type DashboardData = {
  selectedWeek: number;
  kpis: DashboardKPIs;
  riskDistributionByWeek: RiskDistributionPoint[];
  avgRiskByWeek: AvgRiskPoint[];
  courseClustersForWeek: CourseClusterPoint[];
  highRiskStudents: HighRiskRow[];
  interventionSuggestions: string[];
};
