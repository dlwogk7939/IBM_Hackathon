'use client';

import { ShieldCheck } from 'lucide-react';
import DepartmentStats from './DepartmentStats';
import ROIMetrics from './ROIMetrics';
import ScalabilityMetrics from './ScalabilityMetrics';
import EngagementTable from './EngagementTable';
import CohortBurnoutHeatmap from './CohortBurnoutHeatmap';
import AtRiskAlerts from './AtRiskAlerts';
import EngagementLineChart from './EngagementLineChart';
import CompetitorComparison from './CompetitorComparison';

export default function EducatorDashboard() {
  return (
    <div className="space-y-6">
      {/* FERPA compliance banner */}
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
        <ShieldCheck className="h-4 w-4" />
        <span>FERPA Compliant — All data is anonymized at the cohort level. No individual student data is displayed.</span>
      </div>

      <h1 className="text-xl font-bold text-white">Educator Dashboard</h1>

      <DepartmentStats />

      {/* ROI + Scalability side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ROIMetrics />
        <ScalabilityMetrics />
      </div>

      <EngagementTable />

      <div className="grid gap-4 lg:grid-cols-2">
        <CohortBurnoutHeatmap />
        <AtRiskAlerts />
      </div>

      <EngagementLineChart />

      <CompetitorComparison />
    </div>
  );
}
