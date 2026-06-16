from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, subjects, study_plans, tasks, sessions, notes, analytics

# Create the database tables on startup (if not already existing)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the AI Study Planner application, incorporating Gemini integrations.",
    version="1.0.0"
)

# Configure CORS so the frontend can securely make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(subjects.router, prefix="/api")
app.include_router(study_plans.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "documentation": "/docs"
    }
