from ibm_watsonx_orchestrate.agent_builder.tools import tool


@tool
def get_weekly_digest() -> list:
    """Returns 4 AI-generated weekly insights about the student's study patterns,
    including burnout trends, late-night activity, productivity highlights,
    and actionable recommendations.

    Returns:
        A list of 4 digest items with category, icon, and insight text.
    """
    return [
        {
            "category": "burnout_alert",
            "icon": "fire",
            "insight": "Your burnout index rose 4% this week to 63/100. 3 late-night sessions (after 10 PM) were detected. Consider shifting evening work to mornings when your focus peaks at 8 AM.",
        },
        {
            "category": "deadline_warning",
            "icon": "warning",
            "insight": "3 deadlines within 48 hours this weekend: CS 301 ML Problem Set 4 (Feb 28), CS 301 Lab Report 6 (Mar 1), and MATH 245 Midterm Exam (Mar 1). Start CS 301 Problem Set 4 today to avoid a crunch.",
        },
        {
            "category": "productivity_highlight",
            "icon": "chart_up",
            "insight": "Thursday was your most productive day with 5.2 focused hours. Your productivity ratio is highest on Tue-Thu mornings. Try to replicate that schedule for other high-load days.",
        },
        {
            "category": "focus_tip",
            "icon": "lightbulb",
            "insight": "Your focus peaks at 8 AM with an intensity score of 4/5. Schedule review sessions and difficult problem-solving before 10 AM for maximum retention. Avoid starting new material after 8 PM.",
        },
    ]
