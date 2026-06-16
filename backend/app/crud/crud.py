from sqlalchemy.orm import Session
from datetime import date, datetime, timezone, timedelta
from typing import List, Optional, Any
from app.models.models import User, Subject, StudyPlan, Task, StudySession, Note, UserAnalytics
from app.schemas.schemas import UserCreate, SubjectCreate, TaskCreate, TaskUpdate, StudyPlanCreate, StudySessionCreate, NoteCreate, NoteUpdate
from app.core.security import hash_password

# User Operations
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
        streak=0,
        last_active=None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_streak(db: Session, user: User) -> User:
    today = date.today()
    if user.last_active == today:
        return user
    
    if user.last_active == today - timedelta(days=1):
        user.streak += 1
    elif user.last_active is None or user.last_active < today - timedelta(days=1):
        user.streak = 1
        
    user.last_active = today
    db.commit()
    db.refresh(user)
    return user

# Subject Operations
def get_subjects(db: Session, user_id: int) -> List[Subject]:
    return db.query(Subject).filter(Subject.user_id == user_id).all()

def get_subject_by_name(db: Session, user_id: int, name: str) -> Optional[Subject]:
    return db.query(Subject).filter(Subject.user_id == user_id, Subject.name == name).first()

def create_subject(db: Session, subject: SubjectCreate, user_id: int) -> Subject:
    db_subject = Subject(
        user_id=user_id,
        name=subject.name,
        color=subject.color
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int, user_id: int) -> bool:
    db_subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user_id).first()
    if db_subject:
        db.delete(db_subject)
        db.commit()
        return True
    return False

# StudyPlan Operations
def get_study_plans(db: Session, user_id: int) -> List[StudyPlan]:
    return db.query(StudyPlan).filter(StudyPlan.user_id == user_id).all()

def get_study_plan(db: Session, plan_id: int, user_id: int) -> Optional[StudyPlan]:
    return db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == user_id).first()

def create_study_plan(db: Session, plan: StudyPlanCreate, user_id: int) -> StudyPlan:
    db_plan = StudyPlan(
        user_id=user_id,
        subject_id=plan.subject_id,
        exam_date=plan.exam_date,
        daily_hours=plan.daily_hours,
        prep_level=plan.prep_level,
        topics=plan.topics
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def delete_study_plan(db: Session, plan_id: int, user_id: int) -> bool:
    db_plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == user_id).first()
    if db_plan:
        db.delete(db_plan)
        db.commit()
        return True
    return False

# Task Operations
def get_tasks(
    db: Session,
    user_id: int,
    subject_id: Optional[int] = None,
    is_completed: Optional[bool] = None,
    due_date: Optional[date] = None
) -> List[Task]:
    query = db.query(Task).filter(Task.user_id == user_id)
    if subject_id is not None:
        query = query.filter(Task.subject_id == subject_id)
    if is_completed is not None:
        query = query.filter(Task.is_completed == is_completed)
    if due_date is not None:
        query = query.filter(Task.due_date == due_date)
    return query.order_by(Task.due_date.asc(), Task.priority.desc()).all()

def get_task(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    db_task = Task(
        user_id=user_id,
        subject_id=task.subject_id,
        study_plan_id=task.study_plan_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        is_completed=task.is_completed,
        is_revision=task.is_revision,
        estimated_minutes=task.estimated_minutes
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: int) -> Optional[Task]:
    db_task = get_task(db, task_id, user_id)
    if not db_task:
        return None
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Track completion transitions
    if "is_completed" in update_data:
        if update_data["is_completed"] and not db_task.is_completed:
            db_task.completed_at = datetime.now(timezone.utc)
            # Log to daily analytics
            log_analytics_task_completed(db, user_id, date.today())
            # Update user streak
            user = get_user_by_id(db, user_id)
            if user:
                update_user_streak(db, user)
        elif not update_data["is_completed"] and db_task.is_completed:
            db_task.completed_at = None
            
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int) -> bool:
    db_task = get_task(db, task_id, user_id)
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False

# Smart Rescheduling Engine
def reschedule_overdue_tasks(db: Session, user_id: int) -> int:
    """
    Finds all incomplete tasks due before today and shifts their due dates to today.
    Returns the count of rescheduled tasks.
    """
    today = date.today()
    overdue_tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_completed == False,
        Task.due_date < today
    ).all()
    
    for task in overdue_tasks:
        task.due_date = today
        
    if overdue_tasks:
        db.commit()
        
    return len(overdue_tasks)

# StudySession Operations
def get_sessions(db: Session, user_id: int) -> List[StudySession]:
    return db.query(StudySession).filter(StudySession.user_id == user_id).order_by(StudySession.completed_at.desc()).all()

def create_session(db: Session, session: StudySessionCreate, user_id: int) -> StudySession:
    db_session = StudySession(
        user_id=user_id,
        subject_id=session.subject_id,
        task_id=session.task_id,
        duration_minutes=session.duration_minutes
    )
    db.add(db_session)
    
    # Log to daily analytics
    log_analytics_study_minutes(db, user_id, date.today(), session.duration_minutes)
    
    db.commit()
    db.refresh(db_session)
    return db_session

# Note Operations
def get_notes(db: Session, user_id: int, subject_id: Optional[int] = None) -> List[Note]:
    query = db.query(Note).filter(Note.user_id == user_id)
    if subject_id is not None:
        query = query.filter(Note.subject_id == subject_id)
    return query.order_by(Note.updated_at.desc()).all()

def get_note(db: Session, note_id: int, user_id: int) -> Optional[Note]:
    return db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()

def create_note(db: Session, note: NoteCreate, user_id: int) -> Note:
    db_note = Note(
        user_id=user_id,
        subject_id=note.subject_id,
        title=note.title,
        content=note.content
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note_update: NoteUpdate, user_id: int) -> Optional[Note]:
    db_note = get_note(db, note_id, user_id)
    if not db_note:
        return None
    
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
        
    db_note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int, user_id: int) -> bool:
    db_note = get_note(db, note_id, user_id)
    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False

# Analytics Loggers
def get_analytics(db: Session, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[UserAnalytics]:
    query = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id)
    if start_date:
        query = query.filter(UserAnalytics.date >= start_date)
    if end_date:
        query = query.filter(UserAnalytics.date <= end_date)
    return query.order_by(UserAnalytics.date.asc()).all()

def log_analytics_task_completed(db: Session, user_id: int, log_date: date):
    record = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id, UserAnalytics.date == log_date).first()
    if not record:
        record = UserAnalytics(user_id=user_id, date=log_date, completed_tasks=1, study_minutes=0)
        db.add(record)
    else:
        record.completed_tasks += 1
    db.commit()

def log_analytics_study_minutes(db: Session, user_id: int, log_date: date, minutes: int):
    record = db.query(UserAnalytics).filter(UserAnalytics.user_id == user_id, UserAnalytics.date == log_date).first()
    if not record:
        record = UserAnalytics(user_id=user_id, date=log_date, completed_tasks=0, study_minutes=minutes)
        db.add(record)
    else:
        record.study_minutes += minutes
    db.commit()
