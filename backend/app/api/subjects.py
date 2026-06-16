from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import SubjectCreate, SubjectResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/subjects", tags=["subjects"])

@router.get("/", response_model=List[SubjectResponse])
def read_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_subjects(db, current_user.id)

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if subject with same name already exists
    existing = crud.get_subject_by_name(db, current_user.id, subject_in.name)
    if existing:
        return existing
    return crud.create_subject(db, subject_in, current_user.id)

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = crud.delete_subject(db, subject_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Subject not found")
    return
