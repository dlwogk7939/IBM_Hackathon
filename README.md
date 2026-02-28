# maintAIn

**AI-powered student wellbeing and study intelligence platform.**

A Chrome extension + institutional dashboard that tracks focus patterns, flags burnout risk, maps deadline pressure, and delivers AI-driven insights — with a FERPA-compliant educator view for cohort-level analytics.

Built for the **OSU AI Hackathon** by **Jaeha Lee**, **Lazizbek Ravshanov**, **Junna Park**, and **Mitchell Hooper**.

---

## The Problem

- **68%** of students misallocate study time, leading to burnout spikes before exams.
- **2.3x** higher disengagement risk for students without structured study feedback.
- **11-day** average lag before students or advisors recognize declining performance.

maintAIn closes this gap with a 3-stage pipeline: **Capture** (Chrome extension) → **Analyze** (IBM WatsonX Granite) → **Act** (real-time dashboard).

---

## Features

### Student Dashboard

| Card | What it does |
|------|-------------|
| Burnout Gauge | Real-time burnout index (0–100) with weekly trend |
| Late-Night Spikes | Detects sessions after 10 PM and flags risky patterns |
| Deadline Clustering | Warns when 3+ deadlines fall within 72 hours |
| Time Allocation | Breakdown of hours by activity type (lectures, self-study, assignments, review) |
| Productivity Ratio | Focused vs. distracted study hours per day |
| Focus Heatmap | 7-day × 10-slot grid showing when concentration peaks |
| Course Stats | Per-course weekly hours, trend, and burnout score |
| Weekly AI Digest | 4 personalized insights generated from activity analysis |
| Study Planner | Suggested daily schedule based on upcoming deadlines |
| Study Streak | Consecutive-day tracking for motivation |
| Pomodoro Timer | Built-in focus timer with intervals |
| Extension Status | Chrome extension sync status |

### Educator Dashboard

| Card | What it does |
|------|-------------|
| Department KPIs | Avg burnout, active students, engagement rate, at-risk count (with WoW change) |
| Engagement Table | Per-course enrollment, avg hours, burnout %, risk level |
| Cohort Burnout Heatmap | 6-week risk grid across all courses |
| At-Risk Alerts | Anomaly detection: sustained burnout, late-night spikes, deadline clustering, engagement drops |
| Engagement Trend | Weekly engagement vs. burnout over 6 weeks |
| ROI Metrics | Cost per student, projected savings, retention lift |
| Scalability Metrics | Active users, peak concurrent, response time, uptime |
| Competitor Comparison | Benchmarking against peer tools |

All educator data is **anonymized at the cohort level** — zero individual student data exposure. FERPA-compliant by design.

---

## Architecture

```
Chrome Extension  →  Activity Sessions (ILAP schema)
                            ↓
                   IBM WatsonX Granite (analysis)
                            ↓
                   ILAP Processing Pipeline
                    ├─ ilap-types.ts        (10 entity interfaces)
                    ├─ ilap-mock-data.ts    (seeded realistic data)
                    └─ ilap-processors.ts   (17 transform functions)
                            ↓
                      mockData.ts (exports)
                            ↓
                   React Context (role-based)
                    ├─ Student Dashboard
                    └─ Educator Dashboard
```

The data layer follows the **ILAP (Institutional Learning Analytics Platform)** schema with 10 normalized entities: Institution, Student, StudentPII, Course, Enrollment, Consent, ActivitySession, Assignment, StudentDailySummary, and CourseDailySummary. Raw records are transformed by pure processor functions into the shapes each dashboard card expects.

---

## Tech Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + **Framer Motion** for glassmorphic UI and animations
- **Recharts** for data visualizations
- **Radix UI** + **Lucide Icons** for accessible components
- **IBM WatsonX / Granite** foundation models for AI insights
- **IBM Cloud** (US-East) for infrastructure

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 (redirects to landing page)
```

## Demo Flows

1. **Landing page** (`/landing`) — product overview with live burnout gauge, heatmap preview, and feature highlights.
2. **Student dashboard** (`/dashboard`) — full student analytics view with all 12 cards.
3. **Educator dashboard** (`/dashboard` → toggle to Educator) — cohort-level analytics with department KPIs, engagement table, heatmap, alerts, and trend charts.

---

## Privacy

- Educator dashboard shows anonymized cohort data only.
- Individual student data (PII) is architecturally isolated from the educator view.
- Consent is tracked per-student with grant/revoke timestamps.
- FERPA compliant by design.
