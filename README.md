# maintAIn

**AI-powered student wellbeing and study intelligence platform.**

A Chrome extension + institutional dashboard that tracks focus patterns, flags burnout risk, maps deadline pressure, and delivers AI-driven insights — with a FERPA-compliant educator view for cohort-level analytics.

Built for the **OSU AI Hackathon** by **Jaeha Lee**, **Lazizbek Ravshanov**, **Junna Park**, and **Mitchell Hooper**.

**Live demo:** [maintain-ai.vercel.app](https://maintain-ai.vercel.app)

---

## The Problem

Universities run on outdated infrastructure. Students interact with disconnected portals, get no feedback on study habits, and burn out before anyone notices. Advisors find out 11 days too late.

- **68%** of students misallocate study time toward low-weight coursework.
- **2.3x** higher disengagement risk when burnout spikes go undetected.
- **11-day** average gap between burnout onset and advisor awareness.

maintAIn closes this gap with a 3-stage pipeline: **Capture** (Chrome extension) → **Analyze** (IBM WatsonX Granite) → **Act** (real-time dashboard + AI nudges).

---

## How It Works

1. **Student installs Chrome extension** — tracks active tabs, classifies domains (study vs. distraction), runs a focus timer. All data stays local until dashboard sync.
2. **IBM Granite analyzes patterns** — burnout risk scoring, deadline clustering detection, personalized study plans, and behavioral nudges. All via WatsonX API.
3. **Dashboard surfaces insights** — students see burnout index, productivity ratio, AI-generated study plans, and live behavioral nudges. Educators see anonymized cohort analytics.

---

## Features

### Student Dashboard (15 components)

| Card | What it does |
|------|-------------|
| Burnout Gauge | Real-time burnout index (0–100) with weekly trend |
| Late-Night Spikes | Detects sessions after 10 PM and flags risky patterns |
| Deadline Clustering | Warns when 3+ deadlines fall within 72 hours |
| Time Allocation | Breakdown of hours by activity type (lectures, self-study, assignments, review) |
| Productivity Ratio | Focused vs. distracted study hours per day |
| Focus Heatmap | 7-day x 10-slot grid showing when concentration peaks |
| Course Stats | Per-course weekly hours, trend, and burnout score |
| Weekly AI Digest | 4 personalized insights generated via IBM Granite |
| Study Planner | AI-optimized daily schedule based on deadlines + focus patterns |
| Study Streak | Consecutive-day tracking for motivation |
| Pomodoro Timer | Built-in focus timer with intervals |
| Extension Status | Chrome extension sync status with live pulse |
| AI Chat Agent | Multi-turn conversational advisor powered by Granite |
| Live Activity Tracker | Real-time browsing classification from extension |
| AI Behavioral Nudge | Context-aware wellness banner (focus/break/sleep/encouragement) |

### Educator Dashboard (8 components)

| Card | What it does |
|------|-------------|
| Department KPIs | Avg burnout, active students, engagement rate, at-risk count (WoW change) |
| Engagement Table | Per-course enrollment, avg hours, burnout %, risk level |
| Cohort Burnout Heatmap | 6-week risk grid across all courses |
| At-Risk Alerts | AI-generated anomaly detection via IBM Granite |
| Engagement Trend | Weekly engagement vs. burnout over 6 weeks |
| ROI Metrics | Cost per student, projected savings, retention lift |
| Scalability Metrics | Active users, peak concurrent, response time, uptime |
| Competitor Comparison | Benchmarking against peer tools |

All educator data is **anonymized at the cohort level** — zero individual student data exposure. FERPA-compliant by design.

---

## IBM Technology Integration

| IBM Service | How We Use It | Integration Points |
|-------------|---------------|-------------------|
| **WatsonX** | AI inference platform | All 5 AI endpoints route through WatsonX API |
| **Granite 3 8B Instruct** | Foundation model | Chat, digest, study plan, alerts, behavioral nudges |
| **IBM Cloud** | Hosting + compliance | IAM authentication, data residency (US-East) |
| **Watson Orchestrate** | Agent framework | 5 Python tools + YAML agent spec (scaffolded) |

### AI Endpoints

1. `/api/chat` — Multi-turn conversational advisor with dynamic system prompt built from live student data
2. `/api/granite?action=digest` — Weekly digest generation (4 personalized insights)
3. `/api/granite?action=studyplan` — AI-optimized daily study schedule
4. `/api/granite?action=alerts` — Educator at-risk alert generation
5. `/api/granite?action=nudge` — Real-time behavioral nudge from live browsing data

All endpoints gracefully fall back to a local response engine when the API is unavailable.

---

## Architecture

```
Chrome Extension (Manifest V3)
  │  Tracks tabs, classifies domains, runs timer
  │  Posts data via window.postMessage every 2s
  ▼
Next.js Dashboard (React 18 + TypeScript)
  │  useExtensionSync() hook receives live data
  │  extensionBlend.ts merges with ILAP baseline
  │  buildStudentContext() creates AI-ready snapshot
  ▼
IBM WatsonX Granite API
  │  IAM OAuth 2.0 → Granite 3-8B-Instruct
  │  Dynamic system prompts with real student context
  ▼
ILAP Processing Pipeline
  ├─ ilap-types.ts        (10 normalized entities)
  ├─ ilap-mock-data.ts    (seeded realistic dataset)
  └─ ilap-processors.ts   (17 pure transform functions)
  ▼
React Context (role-based data isolation)
  ├─ Student Dashboard  (15 cards + chat + nudge)
  └─ Educator Dashboard (8 cards, cohort-only, zero PII)
```

The data layer follows the **ILAP (Institutional Learning Analytics Platform)** schema with 10 normalized entities: Institution, Student, StudentPII, Course, Enrollment, Consent, ActivitySession, Assignment, StudentDailySummary, and CourseDailySummary.

---

## Privacy & Compliance

| Principle | Implementation |
|-----------|---------------|
| **FERPA compliance** | Architectural PII isolation — educator views are anonymized by design, not by toggle |
| **Data minimization** | Extension stores hostname-level aggregates only, never full URLs |
| **Consent tracking** | Per-student grant/revoke with timestamps (ILAP Consent entity) |
| **Zero educator PII** | Individual student data is structurally unreachable from educator dashboard |
| **Local-first** | Extension data stays in browser until dashboard sync |
| **IBM Cloud residency** | All AI inference within governed IBM Cloud environment (US-East) |

---

## 12-Month Deployment Roadmap

This MVP is designed to scale to a full institutional deployment within 12 months.

### Phase 1: Pilot (Months 1–3)
- **Target:** 1 department, 200–500 students
- **Backend:** PostgreSQL on IBM Cloud for persistent data storage
- **Auth:** University SSO (SAML/CAS) for single sign-on
- **LMS integration:** Canvas REST API for real assignment deadlines
- **Chrome Web Store:** Publish extension for frictionless install
- **Cost:** ~$200/mo (IBM Cloud Lite + WatsonX API usage)

### Phase 2: Campus Rollout (Months 4–8)
- **Target:** University-wide, 5,000–15,000 students
- **Multi-tenant:** Per-department data isolation with shared infrastructure
- **Advisor portal:** Drill-down from cohort alerts to anonymized individual risk scores (with consent gate)
- **Calendar sync:** Google Calendar + Outlook OAuth for real deadline data
- **Mobile companion:** React Native app for push notifications (nudges, deadline alerts)
- **Granite fine-tuning:** Train on institution-specific study pattern data via WatsonX tuning studio

### Phase 3: Multi-Institution (Months 9–12)
- **Target:** 3–5 universities, 50,000+ students
- **LMS-agnostic:** Add Blackboard, Moodle, and D2L connectors via LTI 1.3
- **Regional compliance:** IBM Cloud multi-region for data residency (GDPR for international campuses)
- **Analytics API:** REST endpoints for institutional research teams
- **White-label:** Custom branding per institution

### Why This Timeline Is Realistic

| What we built | What it proves | What's left for production |
|---------------|----------------|---------------------------|
| ILAP schema (10 entities) | Data model maps directly to institutional LMS data | Replace mock seed with real Canvas/Blackboard API calls |
| Chrome extension (Manifest V3) | Capture pipeline works end-to-end | Publish to Chrome Web Store (1–2 weeks) |
| IBM Granite integration (5 endpoints) | AI analysis pipeline is production-ready | Scale WatsonX plan based on student volume |
| FERPA-compliant educator view | Privacy architecture is built-in, not bolted on | Add SSO + consent UI |
| Containerized deployment (Docker) | Runs anywhere (IBM Cloud, AWS, on-prem) | Add database + CI/CD pipeline |

---

## Tech Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** + **Framer Motion** for glassmorphic UI and animations
- **Recharts** for data visualizations
- **Radix UI** + **Lucide Icons** for accessible components
- **IBM WatsonX / Granite 3-8B-Instruct** for all AI features
- **IBM Cloud** (US-East) for infrastructure + IAM authentication
- **Docker** multi-stage build for containerized deployment

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 (redirects to landing page)
```

### Environment Variables

```env
WATSONX_API_KEY=your-ibm-cloud-api-key
WATSONX_PROJECT_ID=your-watsonx-project-id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Chrome Extension

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked" → select the `extension/` folder
4. Navigate to the dashboard — extension syncs automatically

---

## Demo Flows

1. **Landing page** (`/landing`) — product overview with live burnout gauge, heatmap preview, and feature highlights.
2. **Student dashboard** (`/dashboard`) — full analytics view with 15 cards, AI chat, and live extension sync.
3. **Educator dashboard** (`/dashboard` → toggle "Educator" in navbar) — cohort-level analytics with AI-generated alerts.
4. **Extension + AI** — install extension, browse study/distracting sites, then ask the AI chat "what am I working on?" — it responds with your live browsing data.
