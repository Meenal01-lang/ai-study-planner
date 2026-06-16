from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    streak = Column(Integer, default=0)
    last_active = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    analytics = relationship("UserAnalytics", back_populates="user", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String, default="#4F46E5")  # Hex color for UI tags

    # Relationships
    user = relationship("User", back_populates="subjects")
    tasks = relationship("Task", back_populates="subject", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="subject", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="subject")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    exam_date = Column(Date, nullable=False)
    daily_hours = Column(Float, nullable=False)
    prep_level = Column(String, nullable=False)  # "beginner", "intermediate", "advanced"
    topics = Column(JSON, nullable=True)  # List of topics: ["Trigonometry", "Calculus"]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="study_plans")
    subject = relationship("Subject", back_populates="study_plans")
    tasks = relationship("Task", back_populates="study_plan", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="medium")  # "low", "medium", "high"
    due_date = Column(Date, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    is_revision = Column(Boolean, default=False)
    estimated_minutes = Column(Integer, default=60)

    # Relationships
    user = relationship("User", back_populates="tasks")
    subject = relationship("Subject", back_populates="tasks")
    study_plan = relationship("StudyPlan", back_populates="tasks")
    sessions = relationship("StudySession", back_populates="task")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="sessions")
    subject = relationship("Subject")
    task = relationship("Task", back_populates="sessions")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # Store Markdown or plain text content
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="notes")
    subject = relationship("Subject", back_populates="notes")


class UserAnalytics(Base):
    __tablename__ = "user_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    completed_tasks = Column(Integer, default=0)
    study_minutes = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="analytics")
