import { NextRequest, NextResponse } from 'next/server';

const IAM_URL = 'https://iam.cloud.ibm.com/identity/token';
const WATSONX_API_KEY = process.env.WATSONX_API_KEY!;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID!;
const WATSONX_URL = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

async function getIAMToken(): Promise<string> {
  const res = await fetch(IAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${WATSONX_API_KEY}`,
  });
  if (!res.ok) throw new Error(`IAM auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function callGranite(token: string, prompt: string): Promise<string> {
  const res = await fetch(
    `${WATSONX_URL}/ml/v1/text/generation?version=2024-05-31`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'ibm/granite-3-8b-instruct',
        project_id: WATSONX_PROJECT_ID,
        input: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        },
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Granite call failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.results?.[0]?.generated_text ?? '';
}

function buildDigestPrompt(ctx: Record<string, unknown>): string {
  return `You are an AI study assistant analyzing student learning data. Based on the following analytics, generate exactly 4 weekly digest insights.

Student Analytics:
- Burnout score: ${ctx.burnoutScore}/100 (trend: ${ctx.burnoutTrend}, weekly change: ${ctx.burnoutChange}%)
- Late-night study sessions this week: ${ctx.nightSessionCount}
- Deadline clusters (3+ assignments within 48h): ${ctx.deadlineClusters}
- Best productivity day: ${ctx.bestDay} (${ctx.bestDayHours}h focused)
- Peak focus hour: ${ctx.peakFocusHour}

Return ONLY a valid JSON array of exactly 4 objects with this shape:
[{"icon": "<emoji>", "text": "<insight>"}, ...]

Use these icons: 🔥 for burnout, ⚠️ for deadlines, 📈 for productivity, 💡 for tips.
Each text should be 1-2 concise sentences with specific, actionable advice referencing the data above.
Return ONLY the JSON array, no markdown, no explanation.`;
}

function buildStudyPlanPrompt(ctx: Record<string, unknown>): string {
  return `You are an AI study planner. Based on the following student data, create an optimized study schedule for today.

Student Data:
- Upcoming deadlines: ${JSON.stringify(ctx.deadlines)}
- Peak focus hours: ${ctx.peakFocusHour}
- Course workload (weekly hours): ${JSON.stringify(ctx.courseWorkload)}

Return ONLY a valid JSON array of exactly 4 objects with this shape:
[{"time": "<time like 9:00 AM>", "task": "<specific task>", "course": "<course code>"}, ...]

Schedule tasks during high-focus hours. Prioritize by deadline urgency and assignment weight.
Return ONLY the JSON array, no markdown, no explanation.`;
}

function buildAlertsPrompt(ctx: Record<string, unknown>): string {
  return `You are an AI educator assistant analyzing course-wide student data. Generate alerts for courses that need attention.

Course Analytics:
${JSON.stringify(ctx.courseAnalytics, null, 2)}

Return ONLY a valid JSON array of alert objects with this shape:
[{"id": "<number>", "severity": "<warning|critical>", "message": "<specific alert message>", "course": "<course code>", "timestamp": "<relative time like 2h ago>"}, ...]

Generate 3-5 alerts. Mark as "critical" if burnout > 60% or engagement dropped sharply. Use "warning" for moderate concerns.
Each message should be specific, referencing actual numbers from the data.
Return ONLY the JSON array, no markdown, no explanation.`;
}

function fmtSec(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}min` : `${h}h`;
}

function buildNudgePrompt(ctx: Record<string, unknown>): string {
  const studySites = (ctx.studySites as { domain: string; seconds: number }[] | undefined) ?? [];
  const distractingSites = (ctx.distractingSites as { domain: string; seconds: number }[] | undefined) ?? [];
  const studyList = studySites.slice(0, 5).map(s => `${s.domain} (${fmtSec(s.seconds)})`).join(', ') || 'none';
  const distractList = distractingSites.slice(0, 5).map(s => `${s.domain} (${fmtSec(s.seconds)})`).join(', ') || 'none';
  const studySec = (ctx.studySeconds as number) ?? 0;
  const distractSec = (ctx.distractingSeconds as number) ?? 0;
  const total = studySec + distractSec;
  const studyPct = total > 0 ? Math.round((studySec / total) * 100) : 0;
  const hour = new Date().getHours();

  return `You are an AI study wellness coach. Generate a single personalized behavioral nudge based on this live student data.

Live Session Data:
- Timer state: ${ctx.timerState}
- Total study time: ${fmtSec((ctx.totalStudySeconds as number) ?? 0)}
- Study sites: ${studyList}
- Distracting sites: ${distractList}
- Study/distraction ratio: ${studyPct}% study, ${100 - studyPct}% distraction
- Burnout score: ${ctx.burnoutScore}/100 (trend: ${ctx.burnoutTrend})
- Current hour: ${hour}:00 (${hour >= 22 || hour < 6 ? 'late night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'})

Return ONLY a valid JSON object (not an array) with this shape:
{"nudge": "<1-2 sentence personalized advice>", "type": "<focus|break|encouragement|sleep>"}

Choose type based on context:
- "focus" if distraction ratio is high
- "break" if study time > 2 hours without break
- "sleep" if it's late night (after 10 PM)
- "encouragement" if study ratio is good

The nudge should reference specific sites or data from above. Be warm and concise.
Return ONLY the JSON object, no markdown, no explanation.`;
}

function buildRebalancePrompt(ctx: Record<string, unknown>): string {
  const courseWorkload = (ctx.courseWorkload as { code: string; hours: number }[]) ?? [];
  const burnoutScore = (ctx.burnoutScore as number) ?? 50;
  const burnoutTrend = (ctx.burnoutTrend as string) ?? 'stable';
  const weeklyHours = (ctx.weeklyHours as number) ?? 0;

  return `You are an AI study optimization coach. Analyze this student's course workload distribution and suggest a specific rebalancing plan to reduce burnout risk.

Student Data:
- Overall burnout: ${burnoutScore}/100 (trend: ${burnoutTrend})
- Total weekly hours: ${weeklyHours}h
- Course breakdown: ${courseWorkload.map(c => `${c.code}: ${c.hours}h/week`).join(', ')}

Return ONLY a valid JSON object (not an array) with this shape:
{"suggestion": "<2-3 sentence specific rebalancing advice referencing actual course codes and hours>", "shifts": [{"from": "<course code>", "to": "<course code>", "hours": <number>}], "projectedBurnoutReduction": <number 1-15>}

Rules:
- Suggest shifting hours from the highest-hour course to lower-hour courses
- The projected burnout reduction should be realistic (1-15 points)
- Reference specific course codes and hours in the suggestion
- Be actionable and specific, not generic
Return ONLY the JSON object, no markdown, no explanation.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, context: ctx } = body as {
      action: 'digest' | 'studyplan' | 'alerts' | 'nudge' | 'rebalance';
      context: Record<string, unknown>;
    };

    if (!WATSONX_API_KEY || !WATSONX_PROJECT_ID) {
      return NextResponse.json({ fallback: true, error: 'Missing credentials' });
    }

    const token = await getIAMToken();

    let prompt: string;
    switch (action) {
      case 'digest':
        prompt = buildDigestPrompt(ctx);
        break;
      case 'studyplan':
        prompt = buildStudyPlanPrompt(ctx);
        break;
      case 'alerts':
        prompt = buildAlertsPrompt(ctx);
        break;
      case 'nudge':
        prompt = buildNudgePrompt(ctx);
        break;
      case 'rebalance':
        prompt = buildRebalancePrompt(ctx);
        break;
      default:
        return NextResponse.json({ fallback: true, error: 'Unknown action' });
    }

    const raw = await callGranite(token, prompt);

    // Nudge and rebalance return JSON objects, others return arrays
    if (action === 'nudge' || action === 'rebalance') {
      const objMatch = raw.match(/\{[\s\S]*\}/);
      if (!objMatch) {
        console.error('Granite returned non-JSON for nudge:', raw);
        return NextResponse.json({ fallback: true, error: 'Invalid JSON from Granite' });
      }
      const parsed = JSON.parse(objMatch[0]);
      return NextResponse.json({ fallback: false, data: parsed });
    }

    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Granite returned non-JSON:', raw);
      return NextResponse.json({ fallback: true, error: 'Invalid JSON from Granite' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ fallback: false, data: parsed });
  } catch (err) {
    console.error('Granite API error:', err);
    return NextResponse.json({ fallback: true, error: String(err) });
  }
}
