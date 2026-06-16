import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface Subject {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  due_date: string;
  is_completed: boolean;
  is_revision: boolean;
  estimated_minutes: number;
  subject_id: number;
  study_plan_id?: number;
  subject?: Subject;
}

export interface StudyPlan {
  id: number;
  exam_date: string;
  daily_hours: number;
  prep_level: string;
  topics: string[];
  subject_id: number;
  subject: Subject;
}

interface AppStateContextType {
  subjects: Subject[];
  plans: StudyPlan[];
  tasks: Task[];
  loadingData: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  refreshAllData: () => Promise<void>;
  createSubject: (name: string, color: string) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
  createTask: (task: any) => Promise<void>;
  updateTaskStatus: (id: number, completed: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  rescheduleOverdue: () => Promise<number>;
  generatePlan: (planRequest: any) => Promise<void>;

  // Pomodoro timer states
  timerSeconds: number;
  timerActive: boolean;
  timerMode: 'focus' | 'shortBreak' | 'longBreak';
  focusTask: Task | null;
  focusSubject: Subject | null;
  setFocusTask: (task: Task | null) => void;
  setFocusSubject: (subject: Subject | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  configureTimer: (focusMins: number, breakMins: number) => void;
  timerSettings: { focus: number; break: number };
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Base states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const storedTheme = localStorage.getItem('stellar-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Pomodoro states
  const [timerSettings, setTimerSettings] = useState({ focus: 25, break: 5 });
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [focusTask, setFocusTaskState] = useState<Task | null>(null);
  const [focusSubject, setFocusSubjectState] = useState<Subject | null>(null);
  
  const timerRef = useRef<number | null>(null);

  // Sync state helpers
  const setFocusTask = (t: Task | null) => {
    setFocusTaskState(t);
    if (t && t.subject) {
      setFocusSubjectState(t.subject);
    }
  };
  const setFocusSubject = (s: Subject | null) => {
    setFocusSubjectState(s);
    if (focusTask && focusTask.subject_id !== s?.id) {
      setFocusTaskState(null);
    }
  };

  // Sound Synthesizer via Web Audio API (highly compatible, no assets required)
  const playSynthesizedAlert = (freq = 880, duration = 0.5) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      // Fade out
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context not allowed by browser restrictions yet", e);
    }
  };

  // Core Pomodoro Ticker
  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timerMode]);

  const handleTimerComplete = async () => {
    setTimerActive(false);
    playSynthesizedAlert(587.33, 0.4); // Play completion tone D5
    setTimeout(() => playSynthesizedAlert(880, 0.6), 200); // Followed by A5
    
    if (timerMode === 'focus') {
      // 1. Log session focus to database
      try {
        await api.sessions.create({
          duration_minutes: timerSettings.focus,
          subject_id: focusSubject?.id || focusTask?.subject_id || null,
          task_id: focusTask?.id || null
        });
        
        // 2. If task was selected, prompt or mark task completion progress
        if (focusTask) {
          // Increment or check off
          console.log("Completed session for task:", focusTask.title);
        }
        
        refreshAllData();
      } catch (err) {
        console.error('Error logging focus session:', err);
      }
      
      // Toggle to break
      setTimerMode('shortBreak');
      setTimerSeconds(timerSettings.break * 60);
    } else {
      // Toggle back to focus
      setTimerMode('focus');
      setTimerSeconds(timerSettings.focus * 60);
    }
  };

  // Timer Control actions
  const startTimer = () => setTimerActive(true);
  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds((timerMode === 'focus' ? timerSettings.focus : timerSettings.break) * 60);
  };
  const configureTimer = (focusMins: number, breakMins: number) => {
    setTimerActive(false);
    setTimerSettings({ focus: focusMins, break: breakMins });
    setTimerSeconds((timerMode === 'focus' ? focusMins : breakMins) * 60);
  };

  // Load backend data
  const refreshAllData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [subjList, planList, taskList] = await Promise.all([
        api.subjects.list(),
        api.plans.list(),
        api.tasks.list()
      ]);
      setSubjects(subjList);
      setPlans(planList);
      setTasks(taskList);
    } catch (err) {
      console.error('Error refreshing state data', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Theme support
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    localStorage.setItem('stellar-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Trigger loading state on user changes
  useEffect(() => {
    if (user) {
      refreshAllData();
    } else {
      setSubjects([]);
      setPlans([]);
      setTasks([]);
    }
  }, [user]);

  // Subjects triggers
  const createSubject = async (name: string, color: string) => {
    await api.subjects.create({ name, color });
    await refreshAllData();
  };

  const deleteSubject = async (id: number) => {
    await api.subjects.delete(id);
    await refreshAllData();
  };

  // Tasks triggers
  const createTask = async (taskData: any) => {
    await api.tasks.create(taskData);
    await refreshAllData();
  };

  const updateTaskStatus = async (id: number, completed: boolean) => {
    // Optimistic UI updates
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: completed } : t))
    );
    try {
      await api.tasks.update(id, { is_completed: completed });
      playSynthesizedAlert(659.25, 0.15); // Quick chirp for completion satisfaction
      await refreshAllData();
    } catch (err) {
      console.error('Failed to update task status', err);
      await refreshAllData(); // Rollback if error
    }
  };

  const deleteTask = async (id: number) => {
    await api.tasks.delete(id);
    await refreshAllData();
  };

  const rescheduleOverdue = async () => {
    const res = await api.tasks.reschedule();
    await refreshAllData();
    return res.rescheduled_count;
  };

  const generatePlan = async (planReq: any) => {
    await api.plans.generate(planReq);
    await refreshAllData();
  };

  return (
    <AppStateContext.Provider
      value={{
        subjects,
        plans,
        tasks,
        loadingData,
        theme,
        toggleTheme,
        refreshAllData,
        createSubject,
        deleteSubject,
        createTask,
        updateTaskStatus,
        deleteTask,
        rescheduleOverdue,
        generatePlan,

        timerSeconds,
        timerActive,
        timerMode,
        focusTask,
        focusSubject,
        setFocusTask,
        setFocusSubject,
        startTimer,
        pauseTimer,
        resetTimer,
        configureTimer,
        timerSettings
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
