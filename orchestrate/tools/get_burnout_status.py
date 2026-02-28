from ibm_watsonx_orchestrate.agent_builder.tools import tool


@tool
def get_burnout_status() -> dict:
    """Returns the current student's burnout status including score, trend,
    weekly change, risk level, and contributing factors.

    Returns:
        A dictionary with the student's burnout metrics and risk factors.
    """
    return {
        "student": "Alex Chen",
        "burnout_score": 63,
        "trend": "rising",
        "weekly_change_pct": 4,
        "risk_level": "high",
        "contributing_factors": {
            "late_night_sessions": {
                "count": 3,
                "description": "3 late-night study sessions (after 10 PM) detected this week",
            },
            "deadline_clusters": {
                "count": 1,
                "description": "3 deadlines within 72 hours around Feb 28 - Mar 1",
            },
            "study_streak": {
                "current_days": 18,
                "longest_days": 22,
                "description": "18-day consecutive study streak — impressive but may contribute to fatigue",
            },
            "weekly_hours": {
                "total": 41.8,
                "description": "41.8 hours studied this week, above recommended 35h threshold",
            },
            "focus_decline": {
                "current_score": 62,
                "peak_score": 78,
                "description": "Focus score dropped from 78 (week 1) to 62 (current week)",
            },
        },
        "recommendation": "Your burnout score is in the danger zone (>=60). Consider shifting late-night sessions to mornings when your focus peaks at 8 AM.",
    }
