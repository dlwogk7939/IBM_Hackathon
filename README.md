# maintAIn

AI-powered study intelligence platform. A Chrome extension that tracks focus, flags late-night spikes, and maps deadline pressure — with an institutional dashboard for educators.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- IBM WatsonX / Granite (AI insights)
- IBM Cloud (infrastructure)

## Run
1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open `http://localhost:3000` (redirects to landing page).

## Demo flows
1. **Landing page** (`/landing`): product overview with burnout gauge, heatmap, and feature highlights.
2. **Student dashboard** (`/dashboard`): burnout index, study distribution, deadline clustering, time allocation, productivity ratio with focus heatmap, per-course stats, and AI weekly digest.
3. **Educator dashboard** (`/dashboard` → toggle to Educator): FERPA-compliant cohort view with department KPIs, ROI metrics, scalability stats, engagement table, burnout heatmap, at-risk alerts, engagement trends, and competitor comparison.

## Privacy
- Educator dashboard shows anonymized cohort data only.
- Individual student data is architecturally isolated from the educator view.
- FERPA compliant by design.
