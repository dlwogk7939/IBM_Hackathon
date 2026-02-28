'use client';

import { WeeklySummaryHero } from './WeeklySummaryHero';
import { ExtensionStatus } from './ExtensionStatus';
import { StudyStreak } from './StudyStreak';
import { BurnoutGauge } from './BurnoutGauge';
import { LateNightSpikes } from './LateNightSpikes';
import { DeadlineClustering } from './DeadlineClustering';
import { TimeAllocationChart } from './TimeAllocationChart';
import { ProductivityRatio } from './ProductivityRatio';
import { CourseStatsCards } from './CourseStatsCards';
import { WeeklyAIDigest } from './WeeklyAIDigest';
import { PomodoroTimer } from './PomodoroTimer';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
        <div className="flex items-center gap-3">
          <StudyStreak />
          <ExtensionStatus />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklySummaryHero />
        <BurnoutGauge />
        <LateNightSpikes />
        <DeadlineClustering />
        <TimeAllocationChart />
        <ProductivityRatio />
        <CourseStatsCards />
        <WeeklyAIDigest />
      </div>
      <PomodoroTimer />
    </div>
  );
}
