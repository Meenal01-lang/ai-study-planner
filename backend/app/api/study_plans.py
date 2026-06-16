from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import date, timedelta
from app.core.database import get_db
from app.schemas.schemas import StudyPlanGenerateRequest, StudyPlanResponse, TaskResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User, Subject, StudyPlan
from app.services import gemini
from app.schemas.schemas import SubjectCreate, StudyPlanCreate, TaskCreate

router = APIRouter(prefix="/study-plans", tags=["study-plans"])

@router.get("/", response_model=List[StudyPlanResponse])
def read_study_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_study_plans(db, current_user.id)

@router.get("/{plan_id}", response_model=StudyPlanResponse)
def read_study_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = crud.get_study_plan(db, plan_id, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return plan

@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_study_plan(
    req: StudyPlanGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Resolve or create the Subject
    subject = crud.get_subject_by_name(db, current_user.id, req.subject_name)
    if not subject:
        subject = crud.create_subject(
            db,
            SubjectCreate(name=req.subject_name, color=req.color),
            current_user.id
        )

    # 2. Call Gemini (or local fallback) to obtain list of scheduled tasks
    try:
        tasks_data = gemini.generate_study_plan(
            subject_name=req.subject_name,
            topics=req.topics,
            exam_date=req.exam_date,
            daily_hours=req.daily_hours,
            prep_level=req.prep_level
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating study plan structure: {str(e)}"
        )

    # 3. Create StudyPlan record
    plan_in = StudyPlanCreate(
        subject_id=subject.id,
        exam_date=req.exam_date,
        daily_hours=req.daily_hours,
        prep_level=req.prep_level,
        topics=req.topics
    )
    study_plan = crud.create_study_plan(db, plan_in, current_user.id)

    # 4. Insert tasks into database with computed target due dates
    created_tasks = []
    today = date.today()
    for t_data in tasks_data:
        days_offset = t_data.get("days_from_today", 0)
        due_date = today + timedelta(days=days_offset)
        
        # Guard against tasks scheduled beyond the exam date
        if due_date > req.exam_date:
            due_date = req.exam_date

        task_in = TaskCreate(
            subject_id=subject.id,
            study_plan_id=study_plan.id,
            title=t_data.get("title", "Study Session"),
            description=t_data.get("description", ""),
            priority=t_data.get("priority", "medium"),
            due_date=due_date,
            is_completed=False,
            is_revision=t_data.get("is_revision", False),
            estimated_minutes=t_data.get("estimated_minutes", 60)
        )
        
        db_task = crud.create_task(db, task_in, current_user.id)
        created_tasks.append(db_task)

    return {
        "plan": study_plan,
        "tasks_created_count": len(created_tasks)
    }

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = crud.delete_study_plan(db, plan_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return
