'use client';

import { useEffect, useRef } from 'react';
import {
  Shield,
  Cpu,
  Chrome,
  BrainCircuit,
  BarChart3,
  Zap,
  Users,
  GraduationCap,
  Building2,
  Database,
  Lock,
  Globe,
  FileText,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   BRAND
   ═══════════════════════════════════════════════════════════════ */

function BrandName({ className = '' }: { className?: string }) {
  return (
    <span className={className}>
      Maint<span style={{ color: '#306CB5' }}>AI</span>n
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

// Focus Heatmap: 7 days × 16 hours (8am–midnight)
// 0=empty  1=low  2=moderate  3=deep  4=late-night spike (amber)
const FOCUS_HEATMAP: number[][] = [
  /* Mon */ [0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  /* Tue */ [0, 1, 2, 1, 1, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  /* Wed */ [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 2, 2, 1, 0, 0],
  /* Thu */ [0, 1, 1, 2, 1, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  /* Fri */ [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  /* Sat */ [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  /* Sun */ [0, 0, 0, 0, 1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 4, 4],
];

const FOCUS_COLORS = ['#232A3B', '#1E3A5C', '#2B6299', '#306CB5', '#D97706'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOUR_LABELS: { label: string; index: number }[] = [
  { label: '8am', index: 0 },
  { label: '12pm', index: 4 },
  { label: '4pm', index: 8 },
  { label: '8pm', index: 12 },
];

const PROBLEM_STATS = [
  { value: '68%', label: 'of students misallocate time toward low-weight coursework' },
  { value: '2.3x', label: 'more likely to disengage after week 8 when spikes go undetected' },
  { value: '11 days', label: 'average gap between burnout onset and advisor awareness' },
];

const USE_CASES = [
  {
    icon: GraduationCap,
    title: 'Student',
    scenario: 'Week 10: burnout index hits 74%. Extension flags that 68% of study time went to a 10%-weight course. Student rebalances, avoids the spiral.',
  },
  {
    icon: Users,
    title: 'Academic Advisor',
    scenario: 'Cohort dashboard shows 31% of CS201 trending high-risk 11 days before finals. Advisor schedules office hours before anyone drops.',
  },
  {
    icon: Building2,
    title: 'Department',
    scenario: 'Anonymized heatmap reveals a 3-course deadline collision in week 8. Department staggers due dates for next semester.',
  },
];


const DEADLINE_DAYS = [
  { day: 'Mon', h: 20, alert: false },
  { day: 'Tue', h: 35, alert: false },
  { day: 'Wed', h: 85, alert: true },
  { day: 'Thu', h: 90, alert: true },
  { day: 'Fri', h: 40, alert: false },
  { day: 'Sat', h: 10, alert: false },
  { day: 'Sun', h: 25, alert: false },
];

const TESTIMONIALS = [
  {
    quote:
      'Dropped ECON from 11 hours to 4 after it flagged the imbalance. GPA went up half a point that semester.',
    name: 'Jordan M.',
    role: 'Junior, CS \u00b7 Ohio State',
  },
  {
    quote:
      'I can see when a third of my class trends toward burnout before the drop deadline. That signal didn\u2019t exist before.',
    name: 'Dr. Priya N.',
    role: 'Assoc. Prof. Statistics \u00b7 Georgia Tech',
  },
  {
    quote:
      'Deadline clustering alerts show me who has four things due in 72 hours. I reach out before they miss them.',
    name: 'Marcus T.',
    role: 'Academic Advisor \u00b7 UT Austin',
  },
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Burnout Gauge ── */

function BurnoutGauge({ small = false }: { small?: boolean }) {
  const size = small ? 140 : 200;
  const r = small ? 50 : 70;
  const sw = small ? 7 : 9;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const arcLen = (270 / 360) * C;
  const fillLen = 0.74 * arcLen;
  const id = small ? 'gg-sm' : 'gg-lg';

  // Pulse arrow — sits just outside the filled arc tip
  const deg = 135 + 0.74 * 270;
  const rad = (deg * Math.PI) / 180;
  const arrowR = r + sw / 2 + (small ? 6 : 8);
  const ax = cx + arrowR * Math.cos(rad);
  const ay = cy + arrowR * Math.sin(rad);
  const aRot = deg - 90;

  const vbH = small ? 120 : 162;

  return (
    <svg
      viewBox={`0 4 ${size} ${vbH}`}
      className={small ? 'w-36 mx-auto' : 'w-48 mx-auto'}
      role="meter"
      aria-valuenow={74}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Burnout index gauge at 74 percent"
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={cx - r}
          y1={cy}
          x2={cx + r}
          y2={cy}
        >
          <stop offset="0%" stopColor="#306CB5" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Track arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#2A3245"
        strokeWidth={sw}
        strokeDasharray={`${arcLen} ${C}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={sw}
        strokeDasharray={`${fillLen} ${C}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
      />

      {/* Pulse arrow indicator — outside the arc, points inward */}
      <g
        transform={`translate(${ax},${ay}) rotate(${aRot})`}
        className="gauge-arrow"
      >
        {/* Glow ring */}
        <circle cx={0} cy={0} r={small ? 7 : 9} fill="rgba(239,68,68,0.12)" />
        {/* Arrow triangle */}
        <polygon
          points={small ? '0,-4 3.5,3 -3.5,3' : '0,-5.5 5,4 -5,4'}
          fill="#EF4444"
        />
      </g>

      {/* Center value — inside the ring, no overlap with arrow */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'JetBrains Mono', monospace"
      >
        <tspan
          fill="#E2E8F0"
          fontSize={small ? 24 : 38}
          fontWeight={700}
        >
          74
        </tspan>
        <tspan
          fill="#94A3B8"
          fontSize={small ? 14 : 20}
          fontWeight={600}
        >
          %
        </tspan>
      </text>
    </svg>
  );
}

/* ── Micro-Stats Row ── */

function MicroStats() {
  return (
    <div className="flex items-center justify-center gap-4 text-[11px] font-mono">
      <span>
        <span className="text-slate-100">11 days</span>{' '}
        <span className="text-slate-400">straight</span>
      </span>
      <span className="text-slate-300">&middot;</span>
      <span>
        <span className="text-slate-100">4.2 hrs/day</span>{' '}
        <span className="text-slate-400">avg</span>
      </span>
      <span className="text-slate-300">&middot;</span>
      <span>
        <span className="text-slate-400">Reset rec:</span>{' '}
        <span className="text-slate-100">Thu</span>
      </span>
    </div>
  );
}

/* ── Productivity Bars ── */

function ProductivityBars() {
  return (
    <div>
      {/* Productive */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-xs">Productive</span>
          <span className="text-green-500 text-xs font-mono font-semibold">
            72%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#2A3245]">
          <div
            className="h-full rounded-full bg-[#306CB5]"
            style={{ width: '72%' }}
          />
        </div>
      </div>
      {/* Distraction */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-xs">Distraction</span>
          <span className="text-red-500 text-xs font-mono font-semibold">
            28%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#2A3245]">
          <div
            className="h-full rounded-full bg-red-500/60"
            style={{ width: '28%' }}
          />
        </div>
      </div>
      <p className="text-slate-400 text-[12px] font-mono">
        Session: Tue 2&ndash;5pm &middot; 3h 12m total
      </p>
    </div>
  );
}

/* ── Deadline Calendar ── */

function DeadlineCalendar() {
  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-24 mb-1">
        {DEADLINE_DAYS.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            {d.alert && (
              <span className="text-yellow-500 text-[10px] leading-none">
                &#9888;
              </span>
            )}
            <div
              className={`w-full max-w-[28px] rounded-sm ${d.alert ? 'bg-red-500/60' : 'bg-[#306CB5]/40'}`}
              style={{ height: `${d.h}%` }}
            />
          </div>
        ))}
      </div>
      {/* Day labels */}
      <div className="flex justify-between gap-2 mb-4">
        {DEADLINE_DAYS.map((d) => (
          <span
            key={d.day}
            className="flex-1 text-center text-slate-400 text-[11px] font-mono"
          >
            {d.day}
          </span>
        ))}
      </div>
      {/* Alert pill */}
      <div
        className="px-3 py-2 rounded-lg"
        style={{
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.2)',
        }}
      >
        <p className="text-yellow-500 text-xs font-mono leading-relaxed">
          3 deadlines in 48hrs &mdash; <BrandName /> recommends adjusting your
          study plan
        </p>
      </div>
    </div>
  );
}

/* ── Wide Focus Heatmap ── */

function WideFocusHeatmap() {
  return (
    <div>
      {/* Card label */}
      <p className="text-slate-400 text-xs uppercase tracking-widest mb-5">
        Focus Heatmap &middot; Week of Nov 4
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-[280px]">
          {/* Day column headers */}
          <div className="flex items-center gap-[3px] mb-[3px]">
            <span className="w-10 shrink-0" />
            {DAYS.map((d) => (
              <span
                key={d}
                className="w-4 text-center text-slate-400 text-[11px] font-mono"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid rows (hours) */}
          {Array.from({ length: 16 }, (_, hour) => {
            const hourLabel = HOUR_LABELS.find((h) => h.index === hour);
            return (
              <div key={hour} className="flex items-center gap-[3px] mb-[3px]">
                <span className="w-10 shrink-0 text-right pr-2 text-slate-400 text-[10px] font-mono leading-none">
                  {hourLabel ? hourLabel.label : ''}
                </span>
                {FOCUS_HEATMAP.map((day, di) => (
                  <div
                    key={di}
                    className="heatmap-cell w-4 h-4 rounded-[2px]"
                    style={{ background: FOCUS_COLORS[day[hour]] }}
                  />
                ))}
              </div>
            );
          })}
          {/* 12am label at bottom */}
          <div className="flex items-center gap-[3px]">
            <span className="w-10 shrink-0 text-right pr-2 text-slate-400 text-[10px] font-mono leading-none">
              12am
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] text-slate-400">
        <span>No activity</span>
        {FOCUS_COLORS.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-[2px]"
            style={{ background: c }}
          />
        ))}
        <span>Deep work</span>
        <span className="text-slate-400 mx-1">&middot;</span>
        <div
          className="w-3 h-3 rounded-[2px]"
          style={{ background: '#D97706' }}
        />
        <span className="text-yellow-600">&#9888; Late-night spike</span>
      </div>

      {/* AI Insight */}
      <p className="mt-5 text-[#306CB5] text-[13px]">
        &#10022; <BrandName /> insight: Your peak focus window is Tue/Thu
        1&ndash;4pm. Protect it.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  /* Intersection Observer for fade-in-up */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    const els = pageRef.current?.querySelectorAll('.fade-up');
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ─────────────────────────────── JSX ─────────────────────────────── */

  return (
    <div ref={pageRef} className="relative bg-[#1A1F2E] text-slate-100">
      {/* ── Global styles ── */}
      <style>{`
        html { scroll-behavior: smooth; }

        .gauge-arrow {
          animation: arrowPulse 2s ease-in-out infinite;
        }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }

        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .heatmap-cell {
          transition: background-color 0.15s ease;
        }
        .heatmap-cell:hover {
          filter: brightness(1.3);
        }

        .landing-focus:focus-visible {
          outline: 2px solid #306CB5;
          outline-offset: 2px;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — NAVIGATION
          ══════════════════════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50 bg-[#1A1F2E]"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-[#306CB5] text-lg leading-none">
              &bull;
            </span>
            <BrandName className="text-lg font-semibold text-slate-100 tracking-tight" />
          </div>

          {/* Center links */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#features"
              className="landing-focus text-sm text-slate-400 hover:text-white transition"
            >
              Product
            </a>
            <a
              href="#educators"
              className="landing-focus text-sm text-slate-400 hover:text-white transition"
            >
              For Educators
            </a>
            <a
              href="#integrations"
              className="landing-focus text-sm text-slate-400 hover:text-white transition"
            >
              Integrations
            </a>
            <a
              href="#integrations"
              className="landing-focus text-sm text-slate-400 hover:text-white transition"
            >
              WatsonX
            </a>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="landing-focus text-sm text-slate-400 hover:text-white transition"
              aria-label="Log in"
            >
              Log in
            </a>
            <a
              href="https://github.com/dlwogk7939/IBM_Hackathon/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-focus text-sm font-semibold px-4 py-2 rounded-md bg-[#306CB5] text-white hover:bg-[#4A8AD4] transition"
              aria-label="Add to Chrome"
            >
              Add to Chrome
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — HERO
          ══════════════════════════════════════════════════════════════ */}
      <section className="pt-[100px] md:pt-[160px] pb-24 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          {/* Badge pill */}
          <div className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#306CB5]/10 border border-[#306CB5]/25 text-[#306CB5] text-xs mb-8">
            <span>&#10022;</span>
            <span>Chrome extension &middot; Free for students</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up text-[40px] md:text-[64px] font-bold text-slate-100 tracking-[-0.03em] leading-[1.05]">
            Study analytics that predict burnout.
          </h1>

          {/* Subheadline */}
          <p className="fade-up mt-6 text-lg text-slate-400 max-w-[520px] mx-auto leading-[1.7]">
            A Chrome extension that tracks focus, flags late-night spikes,
            and maps deadline pressure. Shows you what&rsquo;s costing you
            grades before you see it on your transcript.
          </p>

          {/* CTAs */}
          <div className="fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/dlwogk7939/IBM_Hackathon/tree/main/extension"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-focus px-6 py-3 bg-[#306CB5] text-white font-semibold rounded-md hover:bg-[#4A8AD4] transition"
              aria-label="Add to Chrome for free"
            >
              Add to Chrome &mdash; free
            </a>
            <a
              href="#features"
              className="landing-focus text-slate-400 hover:text-white transition"
            >
              See how it works &rarr;
            </a>
          </div>
          <p className="fade-up mt-4 text-slate-400 text-[13px]">
            Free for students &middot; Works alongside your existing tools
            &middot; No data sold
          </p>
        </div>

        {/* Hero card — Burnout Index gauge */}
        <div
          className="fade-up mt-16 max-w-sm mx-auto bg-[#232A3B] rounded-2xl p-8 text-center"
          style={{
            boxShadow:
              '0 0 0 1px rgba(48,108,181,0.15), 0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">
            Burnout Index &middot; This Week
          </p>
          <BurnoutGauge />
          <div className="mt-2 mb-5">
            <span className="inline-block px-3 py-1 bg-red-500/15 text-red-500 text-xs font-semibold rounded uppercase tracking-wide">
              HIGH RISK
            </span>
          </div>
          <MicroStats />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — TECH STACK RIBBON
          ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-5 px-6"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-slate-400 text-[11px] uppercase tracking-widest">Built with</span>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Cpu className="w-4 h-4 text-[#306CB5]" />
            IBM WatsonX
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <BrainCircuit className="w-4 h-4 text-[#306CB5]" />
            Granite Models
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Chrome className="w-4 h-4 text-slate-400" />
            Chrome Extension
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
            <Zap className="w-4 h-4 text-slate-400" />
            Next.js
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — THE PROBLEM
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-10">
            BY THE NUMBERS
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {PROBLEM_STATS.map((s) => (
              <div
                key={s.value}
                className="fade-up bg-[#232A3B] rounded-xl p-7"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="font-mono text-[48px] font-bold text-slate-100 leading-none">
                  {s.value}
                </p>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5a — ARCHITECTURE PIPELINE
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-4">
            ARCHITECTURE
          </p>
          <h2 className="fade-up text-center text-2xl md:text-[32px] font-bold text-slate-100 tracking-tight leading-tight mb-14">
            Three-stage pipeline. One Chrome extension.
          </h2>

          {/* Pipeline: 5-col grid on desktop (step · arrow · step · arrow · step) */}
          <div className="fade-up grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-y-10 md:gap-x-4 items-start">
            {/* Step 1 */}
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(48,108,181,0.06)' }}
              >
                <Chrome className="w-9 h-9 text-[#306CB5]" />
              </div>
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-2">
                01 &mdash; CAPTURE
              </p>
              <p className="text-slate-100 font-semibold mb-2">Chrome Extension</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tracks active tabs, session length, and late-night patterns. Classifies sites as productive or distraction. All data stays local until sync.
              </p>
            </div>

            {/* Arrow 1→2 */}
            <div className="hidden md:flex items-center justify-center" style={{ paddingTop: 36 }}>
              <div className="flex items-center gap-1">
                <div className="w-8 h-px bg-[#306CB5]/30" />
                <span className="text-[#306CB5]/50 text-lg leading-none">&rsaquo;</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(48,108,181,0.06)' }}
              >
                <Cpu className="w-9 h-9 text-[#306CB5]" />
              </div>
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-2">
                02 &mdash; ANALYZE
              </p>
              <p className="text-slate-100 font-semibold mb-2">IBM WatsonX + Granite</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Granite foundation models score burnout risk, detect deadline clustering, and generate natural-language weekly digests. Hosted on IBM Cloud.
              </p>
            </div>

            {/* Arrow 2→3 */}
            <div className="hidden md:flex items-center justify-center" style={{ paddingTop: 36 }}>
              <div className="flex items-center gap-1">
                <div className="w-8 h-px bg-[#306CB5]/30" />
                <span className="text-[#306CB5]/50 text-lg leading-none">&rsaquo;</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(48,108,181,0.06)' }}
              >
                <BarChart3 className="w-9 h-9 text-[#306CB5]" />
              </div>
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-2">
                03 &mdash; ACT
              </p>
              <p className="text-slate-100 font-semibold mb-2">Dashboard + Alerts</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Students get burnout scores and rebalancing tips. Educators see anonymized cohort trends. Alerts fire before deadlines cluster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5b — FEATURES (3 feature rows)
          ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-20">
            CORE FEATURES
          </p>

          {/* ── Row 1 — Burnout Index ── */}
          <div className="fade-up grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div>
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-3">
                FEATURE 01
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">
                Burnout Index
              </h3>
              <p className="text-slate-400 leading-relaxed mb-5">
                Composite score from session length, late-night hours, deadline
                clustering, and distraction ratio. Recalculates after every
                session. Powered by IBM Granite.
              </p>
              <div className="space-y-2 text-slate-400 text-sm">
                <p>&mdash; Automatic late-night spike detection</p>
                <p>&mdash; Recovery window recommendations</p>
                <p>&mdash; Multi-signal composite scoring via IBM Granite</p>
              </div>
            </div>
            <div
              className="bg-[#232A3B] rounded-xl p-6"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <BurnoutGauge small />
              <div className="mt-4">
                <MicroStats />
              </div>
            </div>
          </div>

          {/* ── Row 2 — Productivity Ratio (reversed) ── */}
          <div className="fade-up grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
            <div className="lg:order-2">
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-3">
                FEATURE 02
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">
                Productivity Ratio
              </h3>
              <p className="text-slate-400 leading-relaxed mb-5">
                Classifies every site visited during a study session as
                productive, neutral, or distraction. Shows you what percentage
                of your time was actually study.
              </p>
              <div className="space-y-2 text-slate-400 text-sm">
                <p>&mdash; Smart domain classification (study vs. distraction)</p>
                <p>&mdash; Session-by-session breakdown</p>
                <p>
                  &mdash; Distraction alerts when ratio drops below threshold
                </p>
              </div>
            </div>
            <div
              className="lg:order-1 bg-[#232A3B] rounded-xl p-6"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <ProductivityBars />
            </div>
          </div>

          {/* ── Row 3 — Calendar Integration ── */}
          <div className="fade-up grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold mb-3">
                FEATURE 03
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">
                Deadline Intelligence
              </h3>
              <p className="text-slate-400 leading-relaxed mb-5">
                Maps deadlines onto study patterns and alerts you when
                assignments cluster&nbsp;&mdash; a week out, not the night
                before. Designed for integration with campus LMS and calendar
                systems.
              </p>
              <div className="space-y-2 text-slate-400 text-sm">
                <p>&mdash; Deadline cluster detection (3+ in 72 hours)</p>
                <p>&mdash; Weight-aware prioritization via IBM Granite</p>
                <p>&mdash; LMS-ready architecture (Canvas, Blackboard)</p>
              </div>
            </div>
            <div
              className="bg-[#232A3B] rounded-xl p-6"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <DeadlineCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — FOCUS HEATMAP CALLOUT
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-4">
            FOCUS HEATMAP
          </p>
          <h2 className="fade-up text-center text-2xl md:text-[32px] font-bold text-slate-100 tracking-tight leading-tight mb-12">
            Not when you studied. How well.
          </h2>
          <div
            className="fade-up bg-[#232A3B] rounded-xl p-6 md:p-8"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <WideFocusHeatmap />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — EDUCATOR & FERPA TRUST
          ══════════════════════════════════════════════════════════════ */}
      <section id="educators" className="py-24 px-6 bg-[#151929]">
        <div className="fade-up max-w-[640px] mx-auto">
          <div
            className="rounded-xl p-8 md:p-10"
            style={{
              border: '1px solid rgba(48,108,181,0.2)',
              background: 'rgba(48,108,181,0.06)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-[#306CB5]" />
              <span className="text-[#306CB5] text-[11px] uppercase tracking-widest font-semibold">
                FERPA Compliant by Design
              </span>
            </div>

            <h3 className="text-[28px] font-bold text-slate-100 leading-snug">
              Educators see cohorts. Never individuals.
            </h3>

            <p className="mt-4 text-slate-400 leading-[1.75]">
              Anonymized, class-level aggregates only. Individual student data
              is architecturally isolated&nbsp;&mdash; not a privacy toggle, a
              design decision.
            </p>

            {/* Trust items */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-slate-400 text-[13px]">
              <span>&#10003; Zero PII in educator view</span>
              <span>&#10003; IBM Cloud data residency controls</span>
            </div>

            {/* DO / DON'T columns */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-3 font-semibold">
                  What educators see
                </p>
                <div className="space-y-2 text-slate-400 text-[12px]">
                  <p>
                    <span className="text-green-500">&#10003;</span> Class
                    burnout index
                  </p>
                  <p>
                    <span className="text-green-500">&#10003;</span> Engagement
                    trend
                  </p>
                  <p>
                    <span className="text-green-500">&#10003;</span> Deadline
                    cluster alerts
                  </p>
                  <p>
                    <span className="text-green-500">&#10003;</span> At-risk
                    cohort %
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-3 font-semibold">
                  What educators never see
                </p>
                <div className="space-y-2 text-slate-400 text-[12px]">
                  <p>
                    <span className="text-red-500">&#10007;</span> Individual
                    names
                  </p>
                  <p>
                    <span className="text-red-500">&#10007;</span> Individual
                    scores
                  </p>
                  <p>
                    <span className="text-red-500">&#10007;</span> Browsing data
                  </p>
                  <p>
                    <span className="text-red-500">&#10007;</span> Session
                    recordings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 8 — USE CASES
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-4">
            USE CASES
          </p>
          <h2 className="fade-up text-center text-2xl md:text-[32px] font-bold text-slate-100 tracking-tight leading-tight mb-14">
            One tool. Three stakeholders.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {USE_CASES.map((uc) => (
              <div
                key={uc.title}
                className="fade-up bg-[#232A3B] rounded-xl p-7"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <uc.icon className="w-5 h-5 text-[#306CB5] mb-4" />
                <p className="text-slate-100 font-semibold text-[15px] mb-3">
                  {uc.title}
                </p>
                <p className="text-slate-400 text-sm leading-[1.7]">
                  {uc.scenario}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 9 — POWERED BY IBM WATSONX
          ══════════════════════════════════════════════════════════════ */}
      <section id="integrations" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="fade-up text-center text-slate-400 text-[11px] uppercase tracking-widest mb-4">
            WHY IBM WATSONX
          </p>
          <h2 className="fade-up text-center text-2xl md:text-[32px] font-bold text-slate-100 tracking-tight leading-tight mb-6">
            Enterprise AI for student wellbeing
          </h2>
          <p className="fade-up text-center text-slate-400 max-w-xl mx-auto mb-14">
            We chose WatsonX because student data demands enterprise-grade
            compliance&nbsp;&mdash; not a wrapper around a consumer API.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="fade-up bg-[#232A3B] rounded-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <BrainCircuit className="w-5 h-5 text-[#306CB5] mb-3" />
              <p className="text-slate-100 font-semibold mb-2">Granite Foundation Models</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Burnout risk scoring, study pattern recognition, and natural-language weekly digests. Fine-tuned for academic behavioral data.
              </p>
            </div>
            <div className="fade-up bg-[#232A3B] rounded-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Database className="w-5 h-5 text-[#306CB5] mb-3" />
              <p className="text-slate-100 font-semibold mb-2">IBM Cloud Hosting</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Data residency controls, SOC 2 infrastructure, and regional compliance. Student data never leaves the governed environment.
              </p>
            </div>
            <div className="fade-up bg-[#232A3B] rounded-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Lock className="w-5 h-5 text-[#306CB5] mb-3" />
              <p className="text-slate-100 font-semibold mb-2">FERPA-Ready Architecture</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Architectural PII isolation&nbsp;&mdash; educator views are anonymized by design, not by toggle. Zero individual data in cohort analytics.
              </p>
            </div>
            <div className="fade-up bg-[#232A3B] rounded-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <Globe className="w-5 h-5 text-[#306CB5] mb-3" />
              <p className="text-slate-100 font-semibold mb-2">LMS-Ready Architecture</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Standardized ILAP data schema maps to Canvas, Blackboard, and Moodle APIs. Designed for institutional deployment with OAuth 2.0 integration points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 10 — FINAL CTA
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 text-center">
        <h2 className="fade-up text-4xl md:text-[48px] font-bold text-slate-100 tracking-tight leading-tight">
          Try the demo
        </h2>
        <p className="fade-up text-slate-400 text-lg mt-4 max-w-lg mx-auto">
          Free and open source. Built for the IBM WatsonX Challenge&nbsp;2026.
        </p>
        <div className="fade-up mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="landing-focus inline-block px-8 py-4 bg-[#306CB5] text-white font-semibold text-lg rounded-md hover:bg-[#4A8AD4] transition"
            aria-label="Try the live demo"
          >
            Live Demo
          </a>
          <a
            href="https://github.com/dlwogk7939/IBM_Hackathon"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-focus inline-flex items-center gap-2 px-8 py-4 rounded-md font-semibold text-lg transition border border-[#306CB5] text-[#306CB5] hover:bg-[#306CB5]/10"
            aria-label="View on GitHub"
          >
            <FileText className="w-5 h-5" />
            GitHub
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 12 — FOOTER
          ══════════════════════════════════════════════════════════════ */}
      <footer
        className="py-8 px-6 bg-[#1A1F2E]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="MaintAIn" className="h-8 w-auto" />
          </div>
          <p className="text-slate-400 text-sm">
            AI insights powered by IBM WatsonX &middot; Granite foundation
            models &middot; Hosted on IBM Cloud
          </p>
          <p className="text-slate-400 text-xs mt-3">
            &copy; 2026 <BrandName /> &middot; IBM WatsonX Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
