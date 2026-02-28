from ibm_watsonx_orchestrate.agent_builder.tools import tool


@tool
def get_study_plan() -> list:
    """Returns a recommended daily study plan with 4 time-blocked tasks
    prioritized by deadline urgency and optimal focus windows.

    Returns:
        A list of 4 study plan items with time, task, and course.
    """
    return [
        {
            "time": "9:00 AM",
            "task": "Review ML Problem Set 4 requirements and start problem solving",
            "course": "CS 301",
            "priority": "high",
            "reason": "Due tomorrow (Feb 28), 15 pts — your focus peaks at 8-10 AM",
        },
        {
            "time": "11:00 AM",
            "task": "Study for MATH 245 Midterm Exam — review eigenvalues and matrix decomposition",
            "course": "MATH 245",
            "priority": "high",
            "reason": "Due Mar 1 (25 pts) — part of deadline cluster this weekend",
        },
        {
            "time": "2:00 PM",
            "task": "Draft outline for ENG 102 Essay Draft 2",
            "course": "ENG 102",
            "priority": "medium",
            "reason": "Due Mar 5 (20 pts) — start early to avoid weekend crunch",
        },
        {
            "time": "4:00 PM",
            "task": "Complete PHYS 201 Homework 6 problems",
            "course": "PHYS 201",
            "priority": "medium",
            "reason": "Due today (5 pts) — lighter weight, schedule in afternoon slot",
        },
    ]
