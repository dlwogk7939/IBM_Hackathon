import { PortalChoiceCard } from '@/components/PortalChoiceCard';

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-10 text-white">
        <p className="text-sm uppercase tracking-wide text-brand-100">University Infrastructure Demo</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">CampusFlow</h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-100 sm:text-base">
          A local-first planning and analytics demo with deterministic logic for academic planning,
          burnout risk scoring, and anonymized institutional insights.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <PortalChoiceCard
          href="/student"
          title="Student Portal"
          description="Upload a syllabus template, extract mock deadlines, generate a weekly planner, and review burnout risk + coaching tips."
          cta="Open Student Portal"
        />
        <PortalChoiceCard
          href="/admin"
          title="Institution Dashboard"
          description="View anonymized risk trends for 20 mock students and inspect deadline clustering by course across Weeks 1-15."
          cta="Open Admin Dashboard"
        />
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold text-slate-900">Ethics & Privacy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Admin views only show anonymized Student IDs (for example: S1001).</li>
          <li>No student names are collected or displayed in dashboard analytics.</li>
          <li>
            Students can use an opt-in &quot;Share my ID&quot; modal that only displays their own code
            for manual sharing.
          </li>
          <li>All logic runs locally with deterministic mock data and no external AI services.</li>
        </ul>
      </section>
    </div>
  );
}
