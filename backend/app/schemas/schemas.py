from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import List, Optional, Any

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    streak: int
    last_active: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Subject schemas
class SubjectBase(BaseModel):
    name: str
    color: str = "#4F46E5"

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # "low", "medium", "high"
    due_date: date
    is_completed: bool = False
    is_revision: bool = False
    estimated_minutes: int = 60

class TaskCreate(TaskBase):
    subject_id: int
    study_plan_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    is_completed: Optional[bool] = None
    is_revision: Optional[bool] = None
    estimated_minutes: Optional[int] = None
    subject_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    subject_id: int
    study_plan_id: Optional[int] = None
    completed_at: Optional[datetime] = None
    subject: Optional[SubjectResponse] = None

    class Config:
        from_attributes = True

# StudyPlan schemas
class StudyPlanBase(BaseModel):
    exam_date: date
    daily_hours: float
    prep_level: str
    topics: List[str]

class StudyPlanCreate(StudyPlanBase):
    subject_id: int

class StudyPlanResponse(StudyPlanBase):
    id: int
    user_id: int
    subject_id: int
    created_at: datetime
    subject: SubjectResponse

    class Config:
        from_attributes = True

# StudyPlanGenerateRequest for AI planner trigger
class StudyPlanGenerateRequest(BaseModel):
    subject_name: str
    color: str = "#4F46E5"
    topics: List[str]
    exam_date: date
    daily_hours: float
    prep_level: str  # "beginner", "intermediate", "advanced"

# StudySession schemas
class StudySessionBase(BaseModel):
    duration_minutes: int
    subject_id: Optional[int] = None
    task_id: Optional[int] = None

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionResponse(StudySessionBase):
    id: int
    user_id: int
    completed_at: datetime

    class Config:
        from_attributes = True

# Note schemas
class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    subject_id: Optional[int] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subject_id: Optional[int] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    subject: Optional[SubjectResponse] = None

    class Config:
        from_attributes = True

# Analytics schemas
class UserAnalyticsResponse(BaseModel):
    date: date
    completed_tasks: int
    study_minutes: int

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    streak: int
    today_completed: int
    today_total: int
    progress_percentage: float
    upcoming_deadlines: List[TaskResponse]
    analytics: List[UserAnalyticsResponse]
    ai_tips: List[str] = []

class AIInsightsResponse(BaseModel):
    weak_areas: List[str]
    suggested_revisions: List[str]
    tips: List[str]
    readiness_score: int
