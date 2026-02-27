'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionCard } from '@/components/SectionCard';
import { ShareIdModal } from '@/components/ShareIdModal';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { getWeekDates, getWeekRange } from '@/lib/dateUtils';
import { TEMPLATE_OPTIONS, TERM_START, getTemplateExtraction } from '@/lib/mockData';
import { filterStudyPlanByWeek, generateStudyPlan } from '@/lib/planner';
import { coachingTipsFromRisk, computeWeeklyRisk } from '@/lib/risk';
import { SyllabusExtraction } from '@/lib/types';

const STUDENT_STORAGE_KEY = 'campusflow_student_id';
const STUDENT_STATE_PREFIX = 'campusflow_student_state_';
const TOTAL_WEEKS = 15;

type PersistedStudentState = {
  templateId: string;
  extraction: SyllabusExtraction | null;
  week: number;
};

function categoryStyles(category: string): string {
  if (category === 'High') {
    return 'bg-red-100 text-red-700';
  }
  if (category === 'Medium') {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-emerald-100 text-emerald-700';
}

export default function StudentHomePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [templateId, setTemplateId] = useState('engineering');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<SyllabusExtraction | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [week, setWeek] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);

  const persistState = (nextState: PersistedStudentState, currentStudentId: string) => {
    localStorage.setItem(`${STUDENT_STATE_PREFIX}${currentStudentId}`, JSON.stringify(nextState));
  };

  useEffect(() => {
    const storedId = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!storedId || !/^S\d{4}$/.test(storedId)) {
      router.replace('/student');
      return;
    }

    setStudentId(storedId);

    const persistedRaw = localStorage.getItem(`${STUDENT_STATE_PREFIX}${storedId}`);
    if (persistedRaw) {
      try {
        const parsed = JSON.parse(persistedRaw) as PersistedStudentState;
        setTemplateId(parsed.templateId ?? 'engineering');
        setExtraction(parsed.extraction ?? null);
        setWeek(parsed.week ?? 1);
      } catch {
        setTemplateId('engineering');
      }
    }

    setIsReady(true);
  }, [router]);

  const plan = useMemo(() => {
    if (!extraction) {
      return [];
    }
    return generateStudyPlan(extraction.deadlines);
  }, [extraction]);

  const weekRange = useMemo(() => getWeekRange(extraction?.termStart ?? TERM_START, week), [extraction, week]);
  const weekDates = useMemo(() => getWeekDates(weekRange.start), [weekRange.start]);

  const weekPlan = useMemo(
    () => filterStudyPlanByWeek(plan, weekRange.start, weekRange.end),
    [plan, weekRange.end, weekRange.start]
  );

  const risk = useMemo(() => {
    if (!extraction) {
      return null;
    }
    return computeWeeklyRisk(extraction.deadlines, plan, weekRange.start, weekRange.end);
  }, [extraction, plan, weekRange.end, weekRange.start]);

  const coachingTips = useMemo(() => {
    if (!risk) {
      return [];
    }
    return coachingTipsFromRisk(risk);
  }, [risk]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadedFileName(file ? file.name : '');
  };

  const handleExtract = () => {
    if (!studentId) {
      return;
    }

    setIsExtracting(true);

    window.setTimeout(() => {
      const generated = getTemplateExtraction(templateId);
      setExtraction(generated);
      setWeek(1);
      setShowJson(true);

      persistState(
        {
          templateId,
          extraction: generated,
          week: 1
        },
        studentId
      );

      setIsExtracting(false);
    }, 700);
  };

  const updateWeek = (nextWeek: number) => {
    if (!studentId) {
      return;
    }

    const boundedWeek = Math.min(Math.max(nextWeek, 1), TOTAL_WEEKS);
    setWeek(boundedWeek);

    persistState(
      {
        templateId,
        extraction,
        week: boundedWeek
      },
      studentId
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    router.push('/student');
  };

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading student workspace...</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Home</h1>
          <p className="mt-1 text-sm text-slate-600">
            Logged in as <span className="font-semibold text-brand-700">{studentId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
          >
            Share my ID
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Sign out
          </button>
        </div>
      </section>

      <SectionCard
        title="Syllabus Upload"
        subtitle="Upload a PDF (ignored) and select a mock template for deterministic deadline extraction."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="template" className="mb-1 block text-sm font-medium text-slate-700">
              Sample Template
            </label>
            <select
              id="template"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="syllabus" className="mb-1 block text-sm font-medium text-slate-700">
              Syllabus PDF
            </label>
            <input
              id="syllabus"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-700"
            />
            <p className="mt-1 text-xs text-slate-500">
              {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Optional for demo flow.'}
            </p>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtract}
              className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isExtracting ? 'Extracting...' : 'Extract Deadlines'}
            </button>
          </div>
        </div>
      </SectionCard>

      {!extraction ? (
        <section className="card">
          <h3 className="text-lg font-semibold text-slate-900">No deadlines extracted yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Pick a template and click &quot;Extract Deadlines&quot; to generate your planner and weekly
            risk insights.
          </p>
        </section>
      ) : (
        <>
          <SectionCard
            title="Extracted Deadlines JSON"
            actions={
              <button
                type="button"
                onClick={() => setShowJson((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                {showJson ? 'Hide JSON' : 'Show JSON'}
              </button>
            }
          >
            {showJson ? (
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(extraction, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-slate-600">JSON panel collapsed.</p>
            )}
          </SectionCard>

          <SectionCard title="Deadlines Table">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {extraction.deadlines.map((deadline) => (
                    <tr key={`${deadline.title}-${deadline.date}`} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{deadline.title}</td>
                      <td className="py-2 pr-4 uppercase text-slate-600">{deadline.type}</td>
                      <td className="py-2 pr-4 text-slate-700">{deadline.date}</td>
                      <td className="py-2 pr-4 text-slate-700">{deadline.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard
            title="Weekly Planner"
            subtitle={`Week ${week}: ${weekRange.start} to ${weekRange.end}`}
            actions={
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={week <= 1}
                  onClick={() => updateWeek(week - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={week >= TOTAL_WEEKS}
                  onClick={() => updateWeek(week + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            }
          >
            <WeeklyCalendar weekDates={weekDates} entries={weekPlan} />
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Burnout Risk Score" subtitle="Deterministic weekly risk model (0-100)">
              {risk ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <p className="metric-value">{risk.score}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${categoryStyles(risk.category)}`}
                    >
                      {risk.category}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                    <p>
                      Deadline Density: <span className="font-medium">{risk.signals.deadlineDensity}</span>
                    </p>
                    <p>
                      Consecutive Days: <span className="font-medium">{risk.signals.consecutiveDaysStudying}</span>
                    </p>
                    <p>
                      Late Nights: <span className="font-medium">{risk.signals.lateNightFrequency}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Risk data unavailable.</p>
              )}
            </SectionCard>

            <SectionCard title="Coaching Tips" subtitle="Rule-based support guidance">
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                {coachingTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </>
      )}

      {showShareModal ? (
        <ShareIdModal studentId={studentId} onClose={() => setShowShareModal(false)} />
      ) : null}
    </div>
  );
}
