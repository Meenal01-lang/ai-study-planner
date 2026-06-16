from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    subject_id: Optional[int] = Query(None),
    is_completed: Optional[bool] = Query(None),
    due_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_tasks(
        db, 
        user_id=current_user.id, 
        subject_id=subject_id, 
        is_completed=is_completed, 
        due_date=due_date
    )

@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = crud.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_task(db, task_in, current_user.id)

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = crud.update_task(db, task_id, task_update, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = crud.delete_task(db, task_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return

@router.post("/reschedule", status_code=status.HTTP_200_OK)
def reschedule_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rescheduled_count = crud.reschedule_overdue_tasks(db, current_user.id)
    return {"rescheduled_count": rescheduled_count}
