'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { SectionCard } from '@/components/SectionCard';
import { getDashboardData, totalWeeks } from '@/lib/analytics';

const ADMIN_STORAGE_KEY = 'campusflow_admin_ok';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [week, setWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authorized = localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    if (!authorized) {
      router.replace('/admin');
      return;
    }
    setIsReady(true);
  }, [router]);

  const dashboard = useMemo(() => getDashboardData(week), [week]);

  const weekOptions = Array.from({ length: totalWeeks() }, (_, idx) => idx + 1);

  const onWeekChange = (nextWeek: number) => {
    setIsLoading(true);
    window.setTimeout(() => {
      setWeek(nextWeek);
      setIsLoading(false);
    }, 250);
  };

  const signOut = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    router.push('/admin');
  };

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Institution Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Aggregated anonymized analytics across 20 mock students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="week" className="text-sm font-medium text-slate-700">
            Week
          </label>
          <select
            id="week"
            value={week}
            onChange={(event) => onWeekChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {weekOptions.map((value) => (
              <option key={value} value={value}>
                Week {value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Sign out
          </button>
        </div>
      </section>

      {isLoading ? <p className="text-sm text-slate-500">Refreshing analytics...</p> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-600">Students High Risk (Week {dashboard.selectedWeek})</p>
          <p className="metric-value mt-2">{dashboard.kpis.highRiskPercent}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Average Risk Score</p>
          <p className="metric-value mt-2">{dashboard.kpis.avgRiskScore}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Top Clustered Courses</p>
          <p className="mt-2 text-sm font-medium text-slate-800">
            {dashboard.kpis.topClusteredCourses.length > 0
              ? dashboard.kpis.topClusteredCourses.join(', ')
              : 'No clustering this week'}
          </p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Risk Distribution by Week">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.riskDistributionByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" name="Low" stackId="risk" fill="#10b981" />
                <Bar dataKey="medium" name="Medium" stackId="risk" fill="#f59e0b" />
                <Bar dataKey="high" name="High" stackId="risk" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Average Risk Trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.avgRiskByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgRisk" stroke="#2b63d9" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={`Deadline Clustering by Course (Week ${dashboard.selectedWeek})`}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.courseClustersForWeek.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="deadlines" fill="#1946a8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Students at High Risk">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Student ID</th>
                  <th className="py-2 pr-4">Risk Score</th>
                  <th className="py-2 pr-4">Primary Driver</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.highRiskStudents.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={3}>
                      No high-risk students this week.
                    </td>
                  </tr>
                ) : (
                  dashboard.highRiskStudents.map((row) => (
                    <tr key={row.studentId} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{row.studentId}</td>
                      <td className="py-2 pr-4 text-slate-700">{row.riskScore}</td>
                      <td className="py-2 pr-4 text-slate-700">{row.primaryDriver}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Course Clustering Table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Course</th>
                  <th className="py-2 pr-4"># Deadlines</th>
                  <th className="py-2 pr-4">Affected Students</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.courseClustersForWeek.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={3}>
                      No clustering records for this week.
                    </td>
                  </tr>
                ) : (
                  dashboard.courseClustersForWeek.map((row) => (
                    <tr key={row.course} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{row.course}</td>
                      <td className="py-2 pr-4 text-slate-700">{row.deadlines}</td>
                      <td className="py-2 pr-4 text-slate-700">{row.affectedStudents}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Intervention Suggestions">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {dashboard.interventionSuggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
