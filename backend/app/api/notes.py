from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.crud import crud
from app.api.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/notes", tags=["notes"])

@router.get("/", response_model=List[NoteResponse])
def read_notes(
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_notes(db, current_user.id, subject_id)

@router.get("/{note_id}", response_model=NoteResponse)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = crud.get_note(db, note_id, current_user.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create_note(db, note_in, current_user.id)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = crud.update_note(db, note_id, note_update, current_user.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = crud.delete_note(db, note_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
    return
