import sys
import os
from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session

# Add the current directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.models import User, Subject, StudyPlan, Task, Note, UserAnalytics, StudySession
from app.core.security import hash_password

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Create a test user if not already exists
        email = "test@example.com"
        test_user = db.query(User).filter(User.email == email).first()
        if not test_user:
            print("Creating test user (test@example.com / password123)...")
            test_user = User(
                email=email,
                hashed_password=hash_password("password123"),
                full_name="Alex Mercer",
                streak=5,
                last_active=date.today() - timedelta(days=1)
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        else:
            print("Test user already exists.")

        # 2. Add sample subjects
        subjects_to_create = [
            {"name": "Machine Learning", "color": "#8B5CF6"},  # Purple
            {"name": "Database Systems", "color": "#3B82F6"},  # Blue
            {"name": "Software Engineering", "color": "#10B981"}  # Green
        ]
        
        subjects = []
        for s_data in subjects_to_create:
            subj = db.query(Subject).filter(
                Subject.user_id == test_user.id, 
                Subject.name == s_data["name"]
            ).first()
            if not subj:
                print(f"Creating subject: {s_data['name']}")
                subj = Subject(
                    user_id=test_user.id,
                    name=s_data["name"],
                    color=s_data["color"]
                )
                db.add(subj)
                db.commit()
                db.refresh(subj)
            subjects.append(subj)

        ml_subject = subjects[0]
        db_subject = subjects[1]
        se_subject = subjects[2]

        # 3. Add study plan for Machine Learning if none exists
        plan = db.query(StudyPlan).filter(StudyPlan.user_id == test_user.id).first()
        if not plan:
            print("Creating sample Study Plan...")
            plan = StudyPlan(
                user_id=test_user.id,
                subject_id=ml_subject.id,
                exam_date=date.today() + timedelta(days=14),
                daily_hours=2.5,
                prep_level="intermediate",
                topics=["Supervised Learning", "Neural Networks", "Model Validation", "Clustering"]
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)

        # 4. Add tasks (yesterday, today, tomorrow, and future)
        existing_tasks = db.query(Task).filter(Task.user_id == test_user.id).count()
        if existing_tasks == 0:
            print("Adding sample tasks...")
            today = date.today()
            tasks_data = [
                # Yesterday's tasks
                {
                    "title": "Study Linear Regression",
                    "description": "Read lecture slides and understand MSE optimization.",
                    "priority": "high",
                    "due_date": today - timedelta(days=1),
                    "is_completed": True,
                    "completed_at": datetime.now(timezone.utc) - timedelta(days=1),
                    "subject_id": ml_subject.id,
                    "study_plan_id": plan.id if plan else None,
                    "is_revision": False,
                    "estimated_minutes": 60
                },
                {
                    "title": "Setup PostgreSQL Locally",
                    "description": "Install postgresql and verify client connection.",
                    "priority": "medium",
                    "due_date": today - timedelta(days=1),
                    "is_completed": True,
                    "completed_at": datetime.now(timezone.utc) - timedelta(days=1),
                    "subject_id": db_subject.id,
                    "is_revision": False,
                    "estimated_minutes": 45
                },
                # Today's tasks
                {
                    "title": "Neural Networks basics",
                    "description": "Study forward propagation and activation functions.",
                    "priority": "high",
                    "due_date": today,
                    "is_completed": False,
                    "subject_id": ml_subject.id,
                    "study_plan_id": plan.id if plan else None,
                    "is_revision": False,
                    "estimated_minutes": 90
                },
                {
                    "title": "Write SQL queries challenge",
                    "description": "Complete Hackerrank exercises on subqueries and joins.",
                    "priority": "medium",
                    "due_date": today,
                    "is_completed": False,
                    "subject_id": db_subject.id,
                    "is_revision": False,
                    "estimated_minutes": 45
                },
                # Tomorrow's tasks
                {
                    "title": "Design patterns review",
                    "description": "Study Singleton, Factory, and Observer design patterns.",
                    "priority": "low",
                    "due_date": today + timedelta(days=1),
                    "is_completed": False,
                    "subject_id": se_subject.id,
                    "is_revision": False,
                    "estimated_minutes": 60
                },
                {
                    "title": "Neural Networks backpropagation",
                    "description": "Derive gradients for simple multi-layer perceptron.",
                    "priority": "high",
                    "due_date": today + timedelta(days=1),
                    "is_completed": False,
                    "subject_id": ml_subject.id,
                    "study_plan_id": plan.id if plan else None,
                    "is_revision": False,
                    "estimated_minutes": 90
                },
                # Future tasks
                {
                    "title": "Revise ML Core Concepts",
                    "description": "Revise linear regression, classification trees and gradients.",
                    "priority": "medium",
                    "due_date": today + timedelta(days=5),
                    "is_completed": False,
                    "subject_id": ml_subject.id,
                    "study_plan_id": plan.id if plan else None,
                    "is_revision": True,
                    "estimated_minutes": 60
                }
            ]
            
            for t_info in tasks_data:
                task = Task(**t_info, user_id=test_user.id)
                db.add(task)
            db.commit()

        # 5. Add sample focus sessions
        existing_sessions = db.query(StudySession).filter(StudySession.user_id == test_user.id).count()
        if existing_sessions == 0:
            print("Logging sample focus sessions...")
            completed_task = db.query(Task).filter(Task.user_id == test_user.id, Task.is_completed == True).first()
            sessions_data = [
                {
                    "subject_id": ml_subject.id,
                    "task_id": completed_task.id if completed_task else None,
                    "duration_minutes": 25,
                    "completed_at": datetime.now(timezone.utc) - timedelta(days=1, hours=2)
                },
                {
                    "subject_id": ml_subject.id,
                    "task_id": completed_task.id if completed_task else None,
                    "duration_minutes": 25,
                    "completed_at": datetime.now(timezone.utc) - timedelta(days=1, hours=1)
                }
            ]
            for s_info in sessions_data:
                session = StudySession(**s_info, user_id=test_user.id)
                db.add(session)
            db.commit()

        # 6. Add notes
        existing_notes = db.query(Note).filter(Note.user_id == test_user.id).count()
        if existing_notes == 0:
            print("Adding sample study notes...")
            notes_data = [
                {
                    "title": "Machine Learning: Bias-Variance Tradeoff",
                    "content": "### Bias-Variance Tradeoff\n\n- **Bias**: Error introduced by approximating a real-world problem with a simpler model. High bias leads to **underfitting**.\n- **Variance**: Error from sensitivity to small fluctuations in the training set. High variance leads to **overfitting**.\n\n$$\\text{Total Error} = \\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Error}$$\n\n*Action items:*\n1. Regularize overfitting models (L1/L2).\n2. Gather more data or try complex model to fix underfitting.",
                    "subject_id": ml_subject.id
                },
                {
                    "title": "Database: Normalization Rules",
                    "content": "### Database Normalization\n\n1. **1NF**: Atomic values, unique column names, rows must be unique.\n2. **2NF**: In 1NF + no partial dependency (every non-prime attribute is fully dependent on primary key).\n3. **3NF**: In 2NF + no transitive dependencies.",
                    "subject_id": db_subject.id
                }
            ]
            for n_info in notes_data:
                note = Note(**n_info, user_id=test_user.id)
                db.add(note)
            db.commit()

        # 7. Add analytics history for the past week
        existing_analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == test_user.id).count()
        if existing_analytics == 0:
            print("Populating weekly analytics logs...")
            today = date.today()
            # Feed analytics for past 7 days
            analytics_data = [
                {"date": today - timedelta(days=6), "completed_tasks": 1, "study_minutes": 30},
                {"date": today - timedelta(days=5), "completed_tasks": 2, "study_minutes": 60},
                {"date": today - timedelta(days=4), "completed_tasks": 0, "study_minutes": 15},
                {"date": today - timedelta(days=3), "completed_tasks": 3, "study_minutes": 110},
                {"date": today - timedelta(days=2), "completed_tasks": 1, "study_minutes": 45},
                {"date": today - timedelta(days=1), "completed_tasks": 2, "study_minutes": 50},
                {"date": today, "completed_tasks": 0, "study_minutes": 0}
            ]
            for a_info in analytics_data:
                analytics = UserAnalytics(**a_info, user_id=test_user.id)
                db.add(analytics)
            db.commit()

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
