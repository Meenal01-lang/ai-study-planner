from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.schemas import StudySessionCreate, StudySessionResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("/", response_model=List[StudySessionResponse])
def read_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_sessions(db, current_user.id)

@router.post("/", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_in: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_session(db, session_in, current_user.id)
