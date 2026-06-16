import google.generativeai as genai
import json
import re
import logging
from datetime import date, datetime, timedelta, timezone
from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)

# Try to configure Gemini
gemini_available = False
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        logger.info("Gemini API successfully configured.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini API: {e}")

def get_gemini_model():
    if not gemini_available:
        return None
    try:
        # Use gemini-1.5-flash as a reliable, fast, and structured-friendly model
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        logger.error(f"Error creating GenerativeModel: {e}")
        return None

def generate_study_plan(
    subject_name: str,
    topics: list[str],
    exam_date: date,
    daily_hours: float,
    prep_level: str
) -> list[dict]:
    """
    Generates a list of tasks for the study plan.
    Each task returned has the structure:
    {
        "title": str,
        "description": str,
        "priority": "low" | "medium" | "high",
        "days_from_today": int,
        "is_revision": bool,
        "estimated_minutes": int
    }
    """
    today = date.today()
    days_until_exam = (exam_date - today).days
    if days_until_exam <= 0:
        days_until_exam = 7  # Default fallback window

    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
            You are a professional AI Study Planner. Your goal is to generate a comprehensive, realistic, and personalized day-by-day study schedule for a student.

            Student Details:
            - Subject: {subject_name}
            - Topics to cover: {", ".join(topics)}
            - Exam Date: {exam_date} (Today's date is {today}; total days available: {days_until_exam} days)
            - Daily available study hours: {daily_hours} hours
            - Student's preparation level: {prep_level} (beginner, intermediate, or advanced)

            Generate a set of study tasks distributed across the available {days_until_exam} days.
            Please structure the tasks logically:
            1. Early days should cover basic concepts of the topics.
            2. Intermediate days should include problem solving and practice.
            3. The final 15-20% of the timeline must be dedicated to comprehensive revision, mock tests, and exam preparation.
            4. If the student's level is 'beginner', add more introductory and explanation tasks with slightly longer estimated times.
            5. Ensure the estimated time for tasks on any single day does not exceed the daily available limit of {daily_hours} hours ({int(daily_hours * 60)} minutes).

            You MUST respond with a JSON array and nothing else. Do not wrap the JSON in markdown code blocks or text.
            Each task in the JSON array must follow this exact schema:
            {{
                "title": "Clear concise task title, e.g., 'Study basics of Topic X'",
                "description": "Short explanation of what to cover, e.g., 'Read chapter 1 and write down core formulas'",
                "priority": "low" | "medium" | "high",
                "days_from_today": 0, // Integer representing when this task is scheduled relative to today (0 for today, 1 for tomorrow, etc., up to {days_until_exam - 1})
                "is_revision": false, // boolean, set to true for revision/review sessions in the final days
                "estimated_minutes": 60 // integer, estimated minutes required for the study session
            }}
            """
            
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            content = response.text.strip()
            # Clean up potential markdown formatting if returned
            if content.startswith("```"):
                content = re.sub(r"^```(json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            
            tasks = json.loads(content)
            if isinstance(tasks, list) and len(tasks) > 0:
                logger.info("Successfully generated AI study plan via Gemini.")
                return tasks
        except Exception as e:
            logger.error(f"Gemini study plan generation failed: {e}. Falling back to rule-based schedule.")

    # Rule-based fallback schedule
    return generate_fallback_study_plan(subject_name, topics, days_until_exam, daily_hours, prep_level)


def generate_fallback_study_plan(
    subject_name: str,
    topics: list[str],
    days_until_exam: int,
    daily_hours: float,
    prep_level: str
) -> list[dict]:
    """
    Algorithmic fallback for study plan generation when Gemini is not available.
    """
    tasks = []
    num_topics = len(topics)
    if num_topics == 0:
        topics = ["Core Concepts", "Practice Exercises", "Final Revision"]
        num_topics = 3

    daily_minutes_limit = int(daily_hours * 60)
    
    # Reserve the last 20% of days for revision
    revision_days = max(1, int(days_until_exam * 0.2))
    study_days = max(1, days_until_exam - revision_days)

    # Distribute topics across study days
    for i, topic in enumerate(topics):
        # Determine which days to assign this topic
        start_day_pct = i / num_topics
        end_day_pct = (i + 1) / num_topics
        
        start_day = int(start_day_pct * study_days)
        end_day = max(start_day + 1, int(end_day_pct * study_days))

        # Level modifier for task complexity
        if prep_level == "beginner":
            tasks.append({
                "title": f"Intro to {topic}",
                "description": f"Read fundamental concepts, definitions, and tutorials on {topic}.",
                "priority": "high",
                "days_from_today": start_day,
                "is_revision": False,
                "estimated_minutes": min(daily_minutes_limit, 60)
            })
            tasks.append({
                "title": f"Detailed notes: {topic}",
                "description": f"Draft detailed reference notes and formulas for {topic}.",
                "priority": "medium",
                "days_from_today": min(days_until_exam - 1, start_day + 1),
                "is_revision": False,
                "estimated_minutes": min(daily_minutes_limit, 45)
            })
        else:
            tasks.append({
                "title": f"Review {topic} fundamentals",
                "description": f"Briefly read core principles and key summaries for {topic}.",
                "priority": "medium",
                "days_from_today": start_day,
                "is_revision": False,
                "estimated_minutes": min(daily_minutes_limit, 45)
            })

        # Practice task
        practice_day = min(study_days - 1, end_day - 1)
        tasks.append({
            "title": f"Practice problems: {topic}",
            "description": f"Solve representative examples and quiz questions about {topic}.",
            "priority": "high",
            "days_from_today": practice_day,
            "is_revision": False,
            "estimated_minutes": min(daily_minutes_limit, 60)
        })

    # Add revision days
    for r_day in range(revision_days):
        day_idx = study_days + r_day
        if day_idx >= days_until_exam:
            day_idx = days_until_exam - 1
            
        topic_idx = r_day % num_topics
        topic_to_revise = topics[topic_idx]

        tasks.append({
            "title": f"Active Recall: {topic_to_revise}",
            "description": f"Synthesize summaries and test memory on {topic_to_revise} using flashcards.",
            "priority": "medium",
            "days_from_today": day_idx,
            "is_revision": True,
            "estimated_minutes": min(daily_minutes_limit, 45)
        })

    # Add a final mock exam on the last day
    tasks.append({
        "title": f"Mock Exam: {subject_name}",
        "description": f"Simulate exam conditions with a full mock test for {subject_name}.",
        "priority": "high",
        "days_from_today": days_until_exam - 1,
        "is_revision": True,
        "estimated_minutes": min(daily_minutes_limit, 120) if daily_minutes_limit >= 120 else daily_minutes_limit
    })

    return tasks


def generate_ai_insights(
    completed_tasks: list,
    pending_tasks: list,
    sessions: list,
    subject_names: list[str]
) -> dict:
    """
    Generates AI performance insights and exam readiness score.
    Returns:
    {
        "weak_areas": list[str],
        "suggested_revisions": list[str],
        "tips": list[str],
        "readiness_score": int
    }
    """
    total_completed = len(completed_tasks)
    total_pending = len(pending_tasks)
    total_tasks = total_completed + total_pending

    # Baseline calculations
    readiness_score = 50
    if total_tasks > 0:
        readiness_score = int((total_completed / total_tasks) * 100)
    
    # Adjust score slightly based on study minutes
    total_study_mins = sum(s.duration_minutes for s in sessions)
    if total_study_mins > 0:
        readiness_score = min(100, readiness_score + min(10, int(total_study_mins / 120)))

    model = get_gemini_model()
    if model:
        try:
            # Format summaries to feed into Gemini
            comp_summaries = [f"Task: {t.title} (Subject: {getattr(t.subject, 'name', 'N/A')})" for t in completed_tasks[:10]]
            pend_summaries = [f"Task: {t.title} (Subject: {getattr(t.subject, 'name', 'N/A')}, Overdue: {t.due_date < date.today()})" for t in pending_tasks[:10]]
            
            prompt = f"""
            You are an AI Coach. Analyze the student's study logs and provide personalized learning insights.
            
            Completed Tasks (recent 10):
            {chr(10).join(comp_summaries) if comp_summaries else "None"}
            
            Pending/Overdue Tasks (recent 10):
            {chr(10).join(pend_summaries) if pend_summaries else "None"}
            
            Total Study Session Focus Time: {total_study_mins} minutes
            Subjects: {", ".join(subject_names) if subject_names else "None"}

            Generate:
            1. Weak Areas: Identify specific topics or subjects where the student is lagging, has missed tasks, or needs attention.
            2. Suggested Revisions: Recommend particular topics to revise immediately.
            3. Personalized Tips: Offer 3 actionable, encouraging, and specific study tips (e.g. Pomodoro techniques, active recall advice, or stress-management).
            4. Readiness Score: Rate their overall exam readiness on a scale of 0 to 100. Be realistic but encouraging.

            You MUST respond with a JSON object and nothing else. Do not wrap in markdown or text.
            JSON structure:
            {{
                "weak_areas": ["Weak Area 1", "Weak Area 2"],
                "suggested_revisions": ["Revise Topic A", "Practice Topic B"],
                "tips": ["Tip 1", "Tip 2", "Tip 3"],
                "readiness_score": 75 // integer from 0 to 100
            }}
            """
            
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            content = response.text.strip()
            if content.startswith("```"):
                content = re.sub(r"^```(json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
                
            insights = json.loads(content)
            if isinstance(insights, dict) and "readiness_score" in insights:
                logger.info("Successfully generated AI insights via Gemini.")
                return insights
        except Exception as e:
            logger.error(f"Gemini insights generation failed: {e}. Using fallback.")

    # Fallback insights
    weak_areas = []
    suggested_revisions = []
    
    # Overdue tasks form weak areas
    overdue_tasks = [t for t in pending_tasks if t.due_date < date.today()]
    for ot in overdue_tasks[:3]:
        weak_areas.append(f"Lagging in {ot.title} (due on {ot.due_date})")
        suggested_revisions.append(f"Review core concepts of {ot.title}")
        
    if not weak_areas:
        if subject_names:
            weak_areas.append(f"Ensure balanced study across all subjects: {', '.join(subject_names)}")
        else:
            weak_areas.append("Add subjects and generate a study plan to evaluate weak areas.")
            
    if not suggested_revisions:
        if total_completed > 0:
            suggested_revisions.append(f"Review and reinforce completed topics")
        else:
            suggested_revisions.append("Complete your first study task to get custom recommendations")

    # Static default study tips
    tips = [
        "Use the Pomodoro Timer: Focus for 25 minutes, then take a 5-minute break. Repeat 4 times and take a longer break.",
        "Practice active recall: Close your notes and write down everything you remember about a topic, then verify correctness.",
        "Space out your revisions: Revising a topic after 1 day, then 3 days, then 7 days significantly improves long-term retention."
    ]

    return {
        "weak_areas": weak_areas,
        "suggested_revisions": suggested_revisions,
        "tips": tips,
        "readiness_score": readiness_score
    }
