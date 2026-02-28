/* ── Dashboard Mock Data — powered by ILAP processing pipeline ── */
import { ilapDB } from './ilap-mock-data';
import {
  processBurnout, processNightSessions, processDeadlines,
  processTimeBlocks, processProductivity, processFocusMap,
  processCourseStats, processDigest, processStudyPlan,
  processExtensionStatus, processStudyStreak,
  processKPIs, processEngagement, processHeatmap,
  processAlerts, processEngagementTrend, processROI, processScalability,
} from './ilap-processors';

const CURRENT_STUDENT = 'stu-001';

/* ── Student data ── */
export const burnout = processBurnout(ilapDB, CURRENT_STUDENT);
export const nightSessions = processNightSessions(ilapDB, CURRENT_STUDENT);
export const deadlines = processDeadlines(ilapDB, CURRENT_STUDENT);
export const timeBlocks = processTimeBlocks(ilapDB, CURRENT_STUDENT);
export const productivity = processProductivity(ilapDB, CURRENT_STUDENT);
export const focusMap = processFocusMap(ilapDB, CURRENT_STUDENT);
export const courseStats = processCourseStats(ilapDB, CURRENT_STUDENT);
export const digestItems = processDigest(ilapDB, CURRENT_STUDENT);
export const studyPlan = processStudyPlan(ilapDB, CURRENT_STUDENT);
export const extensionStatus = processExtensionStatus();
export const studyStreak = processStudyStreak(ilapDB, CURRENT_STUDENT);

/* ── Educator data ── */
export const departmentKPIs = processKPIs(ilapDB);
export const engagementRows = processEngagement(ilapDB);
export const heatmapData = processHeatmap(ilapDB);
export const alerts = processAlerts(ilapDB);
export const engagementTrend = processEngagementTrend(ilapDB);
export const roiMetrics = processROI(ilapDB);
export const scalabilityMetrics = processScalability();
