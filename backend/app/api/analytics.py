from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List
from app.core.database import get_db
from app.schemas.schemas import DashboardStats, AIInsightsResponse, UserAnalyticsResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User, Task
from app.services import gemini

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=DashboardStats)
def read_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    
    # 1. Fetch today's tasks
    today_tasks = crud.get_tasks(db, user_id=current_user.id, due_date=today)
    today_completed = sum(1 for t in today_tasks if t.is_completed)
    today_total = len(today_tasks)
    progress_percentage = (today_completed / today_total * 100) if today_total > 0 else 0.0

    # 2. Fetch upcoming deadlines (next 5 incomplete tasks starting today)
    upcoming_deadlines = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_completed == False,
        Task.due_date >= today
    ).order_by(Task.due_date.asc()).limit(5).all()

    # 3. Fetch past 7 days analytics and backfill missing dates
    start_date = today - timedelta(days=6)
    analytics_records = crud.get_analytics(db, current_user.id, start_date=start_date, end_date=today)
    
    # Create a mapping of date -> record
    analytics_map = {r.date: r for r in analytics_records}
    
    backfilled_analytics = []
    for i in range(7):
        d = start_date + timedelta(days=i)
        if d in analytics_map:
            backfilled_analytics.append(analytics_map[d])
        else:
            # Create a mock record structure for the schema
            backfilled_analytics.append(
                UserAnalyticsResponse(date=d, completed_tasks=0, study_minutes=0)
            )

    # 4. Standard dashboard suggestions
    ai_tips = [
        "Welcome back! Try using a 25-minute Pomodoro block to tackle your highest priority task.",
        "Your study streak is at " + str(current_user.streak) + " days! Keep it up to build long-term memory.",
        "Need a change? Export your study plan to PDF for an offline printed version."
    ]

    return DashboardStats(
        streak=current_user.streak,
        today_completed=today_completed,
        today_total=today_total,
        progress_percentage=progress_percentage,
        upcoming_deadlines=upcoming_deadlines,
        analytics=backfilled_analytics,
        ai_tips=ai_tips
    )

@router.get("/insights", response_model=AIInsightsResponse)
def read_ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    completed_tasks = crud.get_tasks(db, user_id=current_user.id, is_completed=True)
    pending_tasks = crud.get_tasks(db, user_id=current_user.id, is_completed=False)
    sessions = crud.get_sessions(db, current_user.id)
    subjects = crud.get_subjects(db, current_user.id)
    subject_names = [s.name for s in subjects]

    insights = gemini.generate_ai_insights(
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        sessions=sessions,
        subject_names=subject_names
    )
    
    return AIInsightsResponse(
        weak_areas=insights.get("weak_areas", []),
        suggested_revisions=insights.get("suggested_revisions", []),
        tips=insights.get("tips", []),
        readiness_score=insights.get("readiness_score", 50)
    )
