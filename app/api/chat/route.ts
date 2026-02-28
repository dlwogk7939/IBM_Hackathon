import { NextRequest, NextResponse } from 'next/server';

const IAM_URL = 'https://iam.cloud.ibm.com/identity/token';
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
const WATSONX_SPACE_ID = process.env.WATSONX_SPACE_ID;
const WATSONX_URL =
  process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

/* ── StudentContext type (mirrors client-side) ──────────── */
interface SiteTime { domain: string; seconds: number; category: string }
interface StudentCtx {
  burnoutScore: number;
  burnoutTrend: string;
  burnoutChange: number;
  weeklyHours: number;
  studyStreak: number;
  nightSessionCount: number;
  bestDay: string;
  bestDayHours: number;
  peakFocusHour: string;
  deadlines: { course: string; title: string; due: string; weight: number }[];
  courseWorkload: { code: string; hours: number }[];
  extensionConnected: boolean;
  timerState: string;
  totalStudySeconds: number;
  studySites: SiteTime[];
  distractingSites: SiteTime[];
  studySeconds: number;
  distractingSeconds: number;
}

/* ── Hardcoded fallback data ──────────────────────────────── */
const DATA = {
  burnout: {
    score: 63, trend: 'rising', weeklyChange: 4, riskLevel: 'high',
    lateNightSessions: 3, studyStreak: 18, weeklyHours: 41.8, focusScore: 62,
  },
  studyPlan: [
    { time: '9:00 AM', task: 'Review ML Problem Set 4 requirements', course: 'CS 301', priority: 'high' },
    { time: '11:00 AM', task: 'Study for MATH 245 Midterm — eigenvalues & matrix decomposition', course: 'MATH 245', priority: 'high' },
    { time: '2:00 PM', task: 'Draft outline for ENG 102 Essay Draft 2', course: 'ENG 102', priority: 'medium' },
    { time: '4:00 PM', task: 'Complete PHYS 201 Homework 6 problems', course: 'PHYS 201', priority: 'medium' },
  ],
  deadlines: [
    { course: 'PHYS 201', title: 'Homework 6', due: 'Feb 27', weight: 5, cluster: true },
    { course: 'CS 301', title: 'ML Problem Set 4', due: 'Feb 28', weight: 15, cluster: true },
    { course: 'CS 301', title: 'Lab Report 6', due: 'Mar 1', weight: 10, cluster: true },
    { course: 'MATH 245', title: 'Midterm Exam', due: 'Mar 1', weight: 25, cluster: true },
    { course: 'ENG 102', title: 'Essay Draft 2', due: 'Mar 5', weight: 20, cluster: false },
    { course: 'PHYS 201', title: 'Homework 7', due: 'Mar 8', weight: 5, cluster: false },
    { course: 'MATH 245', title: 'Homework 7', due: 'Mar 10', weight: 10, cluster: false },
    { course: 'CS 301', title: 'Midterm Project', due: 'Mar 15', weight: 25, cluster: true },
    { course: 'PHYS 201', title: 'Midterm Exam', due: 'Mar 18', weight: 25, cluster: true },
  ],
  courses: [
    { code: 'CS 301', name: 'Machine Learning', hours: 14.2, trend: '+18%', burnout: 68, risk: 'high' },
    { code: 'MATH 245', name: 'Linear Algebra', hours: 9.5, trend: '-5%', burnout: 62, risk: 'high' },
    { code: 'PHYS 201', name: 'Mechanics', hours: 11.8, trend: '+12%', burnout: 65, risk: 'high' },
    { code: 'ENG 102', name: 'Composition II', hours: 6.3, trend: '+8%', burnout: 55, risk: 'medium' },
  ],
  digest: [
    'Burnout index rose 4% this week to 63/100. 3 late-night sessions detected. Shift evening work to mornings when focus peaks at 8 AM.',
    '3 deadlines within 48 hours this weekend: CS 301 ML Problem Set 4 (Feb 28), CS 301 Lab Report 6 (Mar 1), MATH 245 Midterm (Mar 1).',
    'Thursday was your most productive day (5.2 focused hours). Replicate that Tue-Thu morning schedule.',
    'Focus peaks at 8 AM (intensity 4/5). Schedule difficult problem-solving before 10 AM.',
  ],
};

/* ── Format seconds to human-readable ─────────────────────── */
function fmtTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}min` : `${h}h`;
}

/* ── Build dynamic system prompt from real context ────────── */
function buildDynamicSystemPrompt(ctx: StudentCtx): string {
  const deadlineStr = ctx.deadlines
    .map(d => `${d.course} ${d.title} (${d.due}, ${d.weight}pts)`)
    .join(', ');
  const courseStr = ctx.courseWorkload
    .map(c => `${c.code} ${c.hours}h`)
    .join(', ');

  let prompt = `You are maintAIn, a compassionate AI study advisor. Answer concisely using the student's real data. Use markdown formatting.
Student: Alex Chen | CS major
Burnout: ${ctx.burnoutScore}/100 (${ctx.burnoutTrend}, ${ctx.burnoutChange > 0 ? '+' : ''}${ctx.burnoutChange}%), ${ctx.nightSessionCount} late-night sessions, ${ctx.weeklyHours}h/week, ${ctx.studyStreak}-day streak.
Best day: ${ctx.bestDay} (${ctx.bestDayHours}h). Peak focus: ${ctx.peakFocusHour}.
Deadlines: ${deadlineStr}.
Course hours: ${courseStr}.`;

  if (ctx.extensionConnected) {
    const totalSession = fmtTime(ctx.totalStudySeconds);
    const studyList = ctx.studySites.length > 0
      ? ctx.studySites.slice(0, 5).map(s => `${s.domain} (${fmtTime(s.seconds)})`).join(', ')
      : 'none tracked';
    const distractList = ctx.distractingSites.length > 0
      ? ctx.distractingSites.slice(0, 5).map(s => `${s.domain} (${fmtTime(s.seconds)})`).join(', ')
      : 'none tracked';
    const totalTracked = ctx.studySeconds + ctx.distractingSeconds;
    const studyPct = totalTracked > 0 ? Math.round((ctx.studySeconds / totalTracked) * 100) : 0;
    const distractPct = totalTracked > 0 ? 100 - studyPct : 0;

    prompt += `\n\nLIVE BROWSING DATA (Chrome extension connected):
Timer: ${ctx.timerState} | Total session: ${totalSession}
Study sites: ${studyList}
Distracting sites: ${distractList}
Study/distraction ratio: ${studyPct}% study, ${distractPct}% distraction
Use this live data when answering questions about what the student is doing, their current focus, or browsing habits.`;
  }

  return prompt;
}

/* ── Fallback hardcoded system prompt ─────────────────────── */
const FALLBACK_SYSTEM_PROMPT = `You are maintAIn, a compassionate AI study advisor. Answer concisely using the student's data.
Student: Alex Chen | CS major | Courses: CS 301 (ML), MATH 245 (Linear Algebra), ENG 102 (Composition II), PHYS 201 (Mechanics)
Burnout: 63/100 (rising +4%), 3 late-night sessions, 41.8h/week, focus score 62, 18-day streak.
Deadlines: PHYS 201 HW6 (Feb 27), CS 301 PS4 (Feb 28, 15pts), CS 301 Lab6 (Mar 1), MATH 245 Midterm (Mar 1, 25pts), ENG 102 Essay (Mar 5).
Course hours: CS 301 14.2h (+18%), MATH 245 9.5h (-5%), PHYS 201 11.8h (+12%), ENG 102 6.3h (+8%).
Peak focus: 8 AM. Best day: Thursday (5.2h). Use markdown formatting.`;

/* ── Smart local response engine ──────────────────────────── */
function generateLocalResponse(userMsg: string, ctx?: StudentCtx): string {
  const msg = userMsg.toLowerCase();

  // Pull real values or fallback to hardcoded
  const burnoutScore = ctx?.burnoutScore ?? DATA.burnout.score;
  const burnoutTrend = ctx?.burnoutTrend ?? DATA.burnout.trend;
  const weeklyHours = ctx?.weeklyHours ?? DATA.burnout.weeklyHours;
  const streak = ctx?.studyStreak ?? DATA.burnout.studyStreak;
  const nightSessions = ctx?.nightSessionCount ?? DATA.burnout.lateNightSessions;
  const peakFocus = ctx?.peakFocusHour ?? '8 AM';

  // Extension-aware helper
  const browsingLine = ctx?.extensionConnected && ctx.distractingSeconds > 60
    ? `\n- **Live browsing:** You've spent ${fmtTime(ctx.distractingSeconds)} on distracting sites — try closing those tabs to improve focus.`
    : '';
  const studyRatioLine = ctx?.extensionConnected && (ctx.studySeconds + ctx.distractingSeconds) > 0
    ? (() => {
        const total = ctx.studySeconds + ctx.distractingSeconds;
        const pct = Math.round((ctx.studySeconds / total) * 100);
        return `\n- **Study ratio:** ${pct}% study vs ${100 - pct}% distraction this session`;
      })()
    : '';

  // Burnout
  if (msg.match(/burnout|stress|tired|exhaust|fatigue|overwhelm|wellness/)) {
    const zone = burnoutScore >= 60 ? 'danger zone' : burnoutScore >= 40 ? 'moderate' : 'healthy range';
    return `Your burnout score is **${burnoutScore}/100** — that's in the **${zone}**.\n\n` +
      `**Contributing factors:**\n` +
      `- **${nightSessions} late-night sessions** this week (after 10 PM)\n` +
      `- **${weeklyHours} hours** studied — ${weeklyHours > 35 ? 'above the recommended 35h threshold' : 'within a healthy range'}\n` +
      `- **${streak}-day study streak** — ${streak > 14 ? 'impressive but contributing to fatigue' : 'good consistency'}` +
      browsingLine + studyRatioLine +
      `\n\n**My advice:** Your focus peaks at **${peakFocus}**. Try shifting late-night sessions to early mornings. ${streak > 14 ? 'Consider taking a rest day to break the streak — your productivity will actually improve.' : 'Keep up the good balance!'}`;
  }

  // Study plan
  if (msg.match(/study plan|what should i study|schedule|plan.*today|today.*plan|what.*do today/)) {
    return `Here's your optimized study plan for today:\n\n` +
      `| Time | Task | Course | Priority |\n` +
      `|------|------|--------|----------|\n` +
      DATA.studyPlan.map(s => `| ${s.time} | ${s.task} | ${s.course} | ${s.priority} |`).join('\n') +
      `\n\nThis prioritizes by **deadline urgency** and your **peak focus window** (${peakFocus}).` +
      browsingLine;
  }

  // Deadlines
  if (msg.match(/deadline|due date|assignment|upcoming|exam|when.*due|what.*due/)) {
    const deadlines = ctx?.deadlines ?? DATA.deadlines;
    return `**Upcoming deadlines:**\n\n` +
      `| Course | Assignment | Due | Weight |\n` +
      `|--------|-----------|-----|--------|\n` +
      deadlines.map(d =>
        `| ${d.course} | ${d.title} | ${d.due} | ${d.weight}pts |`
      ).join('\n') +
      `\n\nPrioritize by weight and due date.` + browsingLine;
  }

  // Course stats / workload
  if (msg.match(/course|workload|class|which.*stress|hardest|most time|hours/)) {
    const courses = ctx?.courseWorkload ?? DATA.courses.map(c => ({ code: c.code, hours: c.hours }));
    return `**Course workload breakdown:**\n\n` +
      `| Course | Hours/Week |\n` +
      `|--------|------------|\n` +
      courses.map(c => `| ${c.code} | ${c.hours}h |`).join('\n') +
      `\n\nTotal: **${weeklyHours}h/week**. Burnout: **${burnoutScore}/100** (${burnoutTrend}).` +
      browsingLine;
  }

  // Weekly digest / summary
  if (msg.match(/digest|summary|weekly|overview|report|how.*doing|how.*week/)) {
    return `**Weekly Study Digest:**\n\n` +
      DATA.digest.map((d, i) => {
        const icons = ['🔥', '⚠️', '📈', '💡'];
        return `${icons[i]} ${d}`;
      }).join('\n\n') +
      `\n\n**Bottom line:** You're working hard (${weeklyHours}h), burnout at **${burnoutScore}/100** (${burnoutTrend}).` +
      browsingLine + studyRatioLine;
  }

  // Focus / productivity
  if (msg.match(/focus|productive|best time|peak|when.*study|concentration/)) {
    const best = ctx?.bestDay ?? 'Thursday';
    const bestHrs = ctx?.bestDayHours ?? 5.2;
    return `**Your focus patterns:**\n\n` +
      `- **Peak focus time:** ${peakFocus}\n` +
      `- **Best day:** ${best} — ${bestHrs}h of focused study\n` +
      `- **Late-night sessions:** ${nightSessions} this week` +
      browsingLine + studyRatioLine +
      `\n\n**Recommendation:** Schedule your hardest problems during your peak focus time.`;
  }

  // What am I doing / working on (extension-aware)
  if (msg.match(/what.*doing|what.*working|current|right now|am i/)) {
    if (ctx?.extensionConnected) {
      const topStudy = ctx.studySites.slice(0, 3).map(s => `${s.domain} (${fmtTime(s.seconds)})`).join(', ') || 'none';
      const topDistract = ctx.distractingSites.slice(0, 3).map(s => `${s.domain} (${fmtTime(s.seconds)})`).join(', ') || 'none';
      return `**Your current session:**\n\n` +
        `- **Timer:** ${ctx.timerState} | **Total:** ${fmtTime(ctx.totalStudySeconds)}\n` +
        `- **Study sites:** ${topStudy}\n` +
        `- **Distracting sites:** ${topDistract}` +
        studyRatioLine +
        `\n\n${ctx.distractingSeconds > ctx.studySeconds ? 'You\'re spending more time on distracting sites — try focusing back on your study material.' : 'Good focus! Keep it up.'}`;
    }
    return `I can't see your current activity. **Connect the Chrome extension** for live browsing insights!\n\n` +
      `Based on your data: burnout is **${burnoutScore}/100** (${burnoutTrend}), ${weeklyHours}h studied this week.`;
  }

  // Late night
  if (msg.match(/late.?night|night.*session|sleep|evening|after.*10/)) {
    return `You had **${nightSessions} late-night sessions** this week (after 10 PM).\n\n` +
      `Your focus drops significantly at night. Peak focus is at **${peakFocus}**.\n\n` +
      `**Try this:** Set a hard stop at 9:30 PM. Move that study time to mornings where you'll get better retention.` +
      browsingLine;
  }

  // Study streak
  if (msg.match(/streak|consecutive|days.*row/)) {
    return `**Study Streak:** ${streak} consecutive days\n\n` +
      `${streak > 14 ? 'That\'s impressive dedication! But at a burnout score of **' + burnoutScore + '/100**, your streak may be working against you. Consider taking a rest day.' : 'Good consistency! Keep building that habit.'}` +
      browsingLine;
  }

  // Help / what can you do
  if (msg.match(/help|what can you|what do you|features|capabilities/)) {
    return `I'm **maintAIn**, your AI study advisor! Here's what I can help with:\n\n` +
      `- **"What's my burnout score?"** — Check your stress levels and risk factors\n` +
      `- **"What should I study today?"** — Get a prioritized daily study plan\n` +
      `- **"Show my deadlines"** — See upcoming due dates\n` +
      `- **"Which course is most stressful?"** — Course workload breakdown\n` +
      `- **"What am I working on?"** — Live browsing data (requires extension)\n` +
      `- **"When do I focus best?"** — Your productivity patterns\n\n` +
      `Just ask naturally — I'm here to help you study smarter, not harder.`;
  }

  // Greeting
  if (msg.match(/^(hi|hello|hey|sup|yo|greetings|good morning|good evening)/)) {
    const extNote = ctx?.extensionConnected ? ` Extension connected — I can see your live browsing data.` : '';
    return `Hey Alex! 👋 I'm **maintAIn**, your AI study advisor.\n\n` +
      `Quick status: Your burnout is at **${burnoutScore}/100** (${burnoutTrend}).${extNote} ` +
      `Want me to help with a study plan, or would you like to check something specific?`;
  }

  // Thanks
  if (msg.match(/thank|thanks|appreciate/)) {
    return `You're welcome, Alex! Remember — your well-being matters as much as your grades. ` +
      `Don't hesitate to ask if you need help planning or just want to check in. You've got this! 💪`;
  }

  // Default
  return `Great question! Based on your current data:\n\n` +
    `- **Burnout:** ${burnoutScore}/100 (${burnoutTrend}, ${nightSessions} late-night sessions)\n` +
    `- **This week:** ${weeklyHours}h studied\n` +
    `- **Streak:** ${streak} days` +
    browsingLine + studyRatioLine +
    `\n\nWant me to dive deeper? Try asking about your **burnout**, **study plan**, **deadlines**, or **course workload**.`;
}

/* ── IBM IAM auth ─────────────────────────────────────────── */
let cachedToken: { token: string; expires: number } | null = null;

async function getIAMToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;
  const res = await fetch(IAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${WATSONX_API_KEY}`,
  });
  if (!res.ok) throw new Error(`IAM auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 3000 * 1000 };
  return data.access_token;
}

/* ── Call Granite (if available) ──────────────────────────── */
async function callGranite(userMsg: string, systemPrompt: string): Promise<string> {
  const token = await getIAMToken();

  const prompt = `<|system|>\n${systemPrompt}\n<|user|>\n${userMsg}\n<|assistant|>\n`;

  const body: Record<string, unknown> = {
    model_id: 'ibm/granite-3-8b-instruct',
    input: prompt,
    parameters: { max_new_tokens: 400, temperature: 0.7, stop_sequences: ['<|user|>', '<|system|>'] },
  };

  if (WATSONX_SPACE_ID) body.space_id = WATSONX_SPACE_ID;
  else if (WATSONX_PROJECT_ID) body.project_id = WATSONX_PROJECT_ID;

  const res = await fetch(
    `${WATSONX_URL}/ml/v1/text/generation?version=2024-05-31`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) throw new Error(`Granite: ${res.status}`);
  const data = await res.json();
  return (data.results?.[0]?.generated_text ?? '').trim();
}

/* ── POST handler ─────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { messages, studentContext } = (await req.json()) as {
      messages: { role: string; content: string }[];
      studentContext?: StudentCtx;
    };

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

    // Build system prompt: dynamic if context provided, else fallback
    const systemPrompt = studentContext
      ? buildDynamicSystemPrompt(studentContext)
      : FALLBACK_SYSTEM_PROMPT;

    // Try Granite first, fall back to local
    let reply: string;
    try {
      if (!WATSONX_API_KEY) throw new Error('No API key');
      reply = await callGranite(lastUserMsg, systemPrompt);
      if (!reply || reply.length < 10) throw new Error('Empty response');
    } catch {
      reply = generateLocalResponse(lastUserMsg, studentContext);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ reply: generateLocalResponse('help') });
  }
}
