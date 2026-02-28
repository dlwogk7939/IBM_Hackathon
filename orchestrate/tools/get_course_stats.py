from ibm_watsonx_orchestrate.agent_builder.tools import tool


@tool
def get_course_stats() -> list:
    """Returns per-course analytics showing weekly study hours, workload trend,
    and burnout level for each enrolled course. Helps identify which courses
    are driving the most stress.

    Returns:
        A list of course statistics with code, name, hours, trend, and burnout.
    """
    return [
        {
            "code": "CS 301",
            "name": "Machine Learning",
            "weekly_hours": 14.2,
            "trend_pct": 18,
            "burnout_level": 68,
            "risk": "high",
            "note": "Highest workload course — burnout in danger zone for 3+ weeks",
        },
        {
            "code": "MATH 245",
            "name": "Linear Algebra",
            "weekly_hours": 9.5,
            "trend_pct": -5,
            "burnout_level": 62,
            "risk": "high",
            "note": "Midterm exam approaching — expect hours to spike next week",
        },
        {
            "code": "PHYS 201",
            "name": "Mechanics",
            "weekly_hours": 11.8,
            "trend_pct": 12,
            "burnout_level": 65,
            "risk": "high",
            "note": "Hours trending up 12% week-over-week",
        },
        {
            "code": "ENG 102",
            "name": "Composition II",
            "weekly_hours": 6.3,
            "trend_pct": 8,
            "burnout_level": 55,
            "risk": "medium",
            "note": "Lowest workload — manageable but essay draft coming up",
        },
    ]
