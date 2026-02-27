# CampusFlow

CampusFlow is a local-first Next.js demo app that modernizes university workflows with deterministic logic and mock data only.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Local state/localStorage only (no database, no external AI/LLM services)

## Run
1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Demo flows
1. Landing page (`/`): choose Student Portal or Admin Dashboard.
2. Student login (`/student`): enter `S1001`-style ID (format `S####`).
3. Student home (`/student/home`):
- select a syllabus template and optionally upload a PDF
- click **Extract Deadlines** (mock deterministic extraction)
- inspect extracted JSON, deadlines table, weekly planner, risk score, and coaching tips
- open **Share my ID** modal to display anonymized code
4. Admin login (`/admin`): passcode is `admin123`.
5. Admin dashboard (`/admin/dashboard`):
- view week filter (Week 1-15)
- KPI cards, risk distribution, average trend, and course clustering charts
- tables for high-risk students (ID-only) and clustered courses
- rule-based intervention suggestions

## Privacy behavior
- Admin dashboard shows anonymized Student IDs only (`S1001`...`S1020`).
- No student names appear in admin views.
- "Share my ID" is local display only and does not transmit data.
