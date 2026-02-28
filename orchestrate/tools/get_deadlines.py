from ibm_watsonx_orchestrate.agent_builder.tools import tool


@tool
def get_deadlines() -> list:
    """Returns upcoming deadlines with clustering alerts. Deadlines within
    72 hours of each other are flagged as a cluster, which increases burnout risk.

    Returns:
        A list of upcoming deadlines with course, title, due date, weight,
        and cluster status.
    """
    return [
        {
            "course": "PHYS 201",
            "title": "Homework 6",
            "due": "2025-02-27",
            "weight": 5,
            "is_cluster": True,
            "status": "due_today",
        },
        {
            "course": "CS 301",
            "title": "ML Problem Set 4",
            "due": "2025-02-28",
            "weight": 15,
            "is_cluster": True,
            "status": "due_tomorrow",
        },
        {
            "course": "CS 301",
            "title": "Lab Report 6",
            "due": "2025-03-01",
            "weight": 10,
            "is_cluster": True,
            "status": "upcoming",
        },
        {
            "course": "MATH 245",
            "title": "Midterm Exam",
            "due": "2025-03-01",
            "weight": 25,
            "is_cluster": True,
            "status": "upcoming",
        },
        {
            "course": "ENG 102",
            "title": "Essay Draft 2",
            "due": "2025-03-05",
            "weight": 20,
            "is_cluster": False,
            "status": "upcoming",
        },
        {
            "course": "PHYS 201",
            "title": "Homework 7",
            "due": "2025-03-08",
            "weight": 5,
            "is_cluster": False,
            "status": "upcoming",
        },
        {
            "course": "MATH 245",
            "title": "Homework 7",
            "due": "2025-03-10",
            "weight": 10,
            "is_cluster": False,
            "status": "upcoming",
        },
        {
            "course": "ENG 102",
            "title": "Research Proposal",
            "due": "2025-03-14",
            "weight": 15,
            "is_cluster": True,
            "status": "upcoming",
        },
        {
            "course": "CS 301",
            "title": "Midterm Project",
            "due": "2025-03-15",
            "weight": 25,
            "is_cluster": True,
            "status": "upcoming",
        },
        {
            "course": "PHYS 201",
            "title": "Midterm Exam",
            "due": "2025-03-18",
            "weight": 25,
            "is_cluster": True,
            "status": "upcoming",
        },
    ]
