# Stellar - AI Study Planner & Performance Diagnostic App

Stellar is a production-ready, full-stack **AI Study Planner** web application designed to help students organize syllabi, track daily study habits, and dynamically reschedule missed tasks to protect exam dates.

This application is built with a highly interactive, Notion/Linear-inspired dark user interface. It is optimized to showcase software engineering best practices, including robust fallback logic for offline usage, clean architectural patterns, data validation, and responsive page views.

---

## Technical Stack

* **Frontend**: React (Vite) + TypeScript + Tailwind CSS v3
* **Backend**: FastAPI (Python 3.10+) + SQLAlchemy ORM
* **Database**: SQLite (local development) / PostgreSQL (production compatible)
* **Authentication**: JWT-based Bearer Token Auth
* **AI Integration**: Google Gemini API (`gemini-1.5-flash` model)
* **Charts**: Recharts
* **State Management**: React Context (AuthContext & AppStateContext)

---

## Features

1. **Authentication Gate**: Register, Login, and persistent JWT authentication. Fully protected routes block unauthenticated visitors and automatically load user profiles.
2. **AI Study Plan Generator**: Provide a subject, exam date, daily hours, current prep level, and a list of topics. Gemini returns a structured day-by-day study timetable.
3. **Smart Rescheduling Autopilot**: Detects overdue, uncompleted tasks and shifts their due dates to "today" with a single click, warning students of syllabus load changes.
4. **Interactive Agenda Calendar**: Custom monthly view displays color-coded dots representing scheduled study sessions, revision triggers, and mock exams. Click any day to view details or add tasks manually.
5. **Persistent Pomodoro Timer**: Set custom study/break intervals. The timer runs globally in the background, logs focus minutes to database analytics upon completion, and synthesizes alarms using the browser's Web Audio API.
6. **Rich Notes Organizer**: Two-pane Markdown editor organized by subject. Users can search and format formulas or active recall summaries.
7. **Performance Diagnostics**: Recharts visualizes daily study minutes and task completion shares. Gemini inspects history to list weak areas, suggested revision points, and readiness scores.
8. **PDF Report Exporter**: Generates a clean, print-friendly review sheet containing streaks, plans, and task statuses.

---

## Project Folder Structure

```text
ai_study_planner/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Routers (auth, subjects, plans, tasks, notes, analytics)
│   │   ├── core/            # Config variables, DB engine, JWT security helper
│   │   ├── crud/            # Database query operations & rescheduling logic
│   │   ├── models/          # SQLAlchemy Database Declarative Models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Gemini API client & local algorithmic fallback
│   │   └── main.py          # FastAPI application bootstrap
│   ├── requirements.txt
│   ├── seed.py              # Mock data populate script
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Common modules (Navbar, Sidebar, ProtectedRoute)
│   │   ├── context/         # AuthContext & AppStateContext providers
│   │   ├── pages/           # Pages (LandingPage, Login, Register, Dashboard, Planner, etc.)
│   │   ├── services/        # API Client client
│   │   ├── App.tsx          # Router mapping and layouts coordinator
│   │   ├── main.tsx
│   │   └── index.css        # Tailwind directives and custom animation classes
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
└── README.md
```

---

## Quick Start (Local Setup)

### 1. Backend Configuration

Navigate to the `backend` folder:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file from the example:
```bash
copy .env.example .env
```
Open `.env` and add your **`GEMINI_API_KEY`** from [Google AI Studio](https://aistudio.google.com/). If left blank, the app will run with a robust algorithmic fallback.

Run the seed script to populate a test account:
```bash
python seed.py
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
The documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Configuration

Navigate to the `frontend` folder:
```bash
cd ../frontend
```

Install packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`. 

**Demo Login credentials:**
* **Email**: `test@example.com`
* **Password**: `password123`

---

## API Endpoints List

### Authentication
* `POST /api/auth/register` - Register a new user account
* `POST /api/auth/login` - Authenticate and obtain JWT token
* `GET /api/auth/me` - Fetch profile of active user (Protected)

### Subject Tag Management
* `GET /api/subjects/` - Fetch all subject tags (Protected)
* `POST /api/subjects/` - Create a subject tag (Protected)
* `DELETE /api/subjects/{id}` - Delete a subject (Protected)

### Study Schedules & Tasks
* `POST /api/study-plans/generate` - Prompt Gemini for schedule and write tasks (Protected)
* `GET /api/study-plans/` - List study plans (Protected)
* `GET /api/tasks/` - Query study tasks (Filter by subject, date, status) (Protected)
* `PUT /api/tasks/{id}` - Edit task, change date, or toggle completed (Protected)
* `POST /api/tasks/reschedule` - Smart shift overdue tasks to today (Protected)

### Focus sessions & Notes
* `POST /api/sessions/` - Log completed Pomodoro session (Protected)
* `GET /api/sessions/` - Fetch Pomodoro history logs (Protected)
* `GET /api/notes/` - Query notes index (Protected)
* `PUT /api/notes/{id}` - Save markdown note edits (Protected)

### Diagnostic Reports
* `GET /api/analytics/dashboard` - Compile streak, today progress, and weekly chart stats (Protected)
* `GET /api/analytics/insights` - Request Gemini diagnostics (Protected)

---

## Production Deployment Instructions

### Deploying the Backend on Render
1. Create a new Web Service on Render, linking your github repository.
2. Set Environment parameters:
   * `DATABASE_URL` -> Link your PostgreSQL instance (`postgresql://...`)
   * `SECRET_KEY` -> Set a custom random secret string.
   * `GEMINI_API_KEY` -> Your API key.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploying the Frontend on Vercel
1. Link your repository on Vercel.
2. Set environment variables:
   * `VITE_API_URL` -> Set to the live HTTPS URL of your Render backend API service (e.g. `https://my-stellar-api.onrender.com/api`).
3. Vercel will auto-detect Vite + React and build the production bundle seamlessly.
