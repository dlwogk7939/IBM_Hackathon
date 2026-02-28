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
import { AgentChatWidget } from './AgentChatWidget';
import { LiveActivityTracker } from './LiveActivityTracker';
import { AIBehavioralNudge } from './AIBehavioralNudge';
import { DemoSimulator } from './DemoSimulator';
import { StudyRebalancer } from './StudyRebalancer';
import { useDashboard } from '../../_lib/context';

function formatStudyTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function StudentDashboard() {
  const { student: { extensionLive } } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
        <div className="flex items-center gap-3">
          {extensionLive.connected && extensionLive.totalStudySeconds > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              {formatStudyTime(extensionLive.totalStudySeconds)} studied
            </span>
          )}
          {!extensionLive.connected && <DemoSimulator />}
          <StudyStreak />
          <ExtensionStatus />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklySummaryHero />
        <AIBehavioralNudge />
        <BurnoutGauge />
        <LateNightSpikes />
        <DeadlineClustering />
        <TimeAllocationChart />
        <ProductivityRatio />
        <CourseStatsCards />
        <WeeklyAIDigest />
        <StudyRebalancer />
        <LiveActivityTracker />
      </div>
      <PomodoroTimer />
      <AgentChatWidget />
    </div>
  );
}
