import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  CheckSquare,
  X
} from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const {
    tasks,
    subjects,
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
  } = useAppState();

  const [showSettings, setShowSettings] = useState(false);
  const [customFocus, setCustomFocus] = useState(timerSettings.focus);
  const [customBreak, setCustomBreak] = useState(timerSettings.break);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    configureTimer(customFocus, customBreak);
    setShowSettings(false);
  };

  // SVG circle calculations
  const maxMins = timerMode === 'focus' ? timerSettings.focus : timerSettings.break;
  const maxSecs = maxMins * 60;
  const elapsedSecs = maxSecs - timerSeconds;
  const completionPercentage = (elapsedSecs / maxSecs) * 100;
  
  // Circumference of our 220px diameter circle (r = 100)
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercentage) / 100;

  // Filter tasks that are not completed
  const pendingTasks = tasks.filter(t => !t.is_completed);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Pomodoro Timer Center (Left Columns) */}
        <div className="lg:col-span-3 p-8 rounded-2xl bg-card/75 border border-border flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all"
            title="Configure intervals"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mode indicators */}
          <div className="flex gap-2 mb-8 p-1.5 bg-background border border-border rounded-xl">
            <button
              disabled={timerActive}
              onClick={() => configureTimer(timerSettings.focus, timerSettings.break)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timerMode === 'focus' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Focus Blocks
            </button>
            <button
              disabled={timerActive}
              onClick={() => {
                setCustomFocus(timerSettings.focus);
                configureTimer(timerSettings.focus, timerSettings.break);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timerMode === 'shortBreak' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Short Break
            </button>
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            {/* Background circle */}
            <svg className="w-64 h-64 -rotate-90">
              <circle
                cx="128"
                cy="128"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke={timerMode === 'focus' ? 'url(#focusGradient)' : 'url(#breakGradient)'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
                <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Timer digits overlay */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-5xl tracking-tight text-foreground select-none">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                {timerMode === 'focus' ? 'Focus Session' : 'Take a Break'}
              </span>
            </div>
          </div>

          {/* Timer Controls Row */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 border border-border transition-all hover:scale-105"
              title="Reset Session"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            {timerActive ? (
              <button
                onClick={pauseTimer}
                className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-slate-100 dark:text-slate-900 font-bold transition-all shadow hover:scale-105 flex items-center gap-2"
              >
                <Pause className="w-5 h-5 fill-current" /> Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-500/25 hover:scale-105 flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> Start Focus
              </button>
            )}
          </div>

        </div>

        {/* Association Sidebar Settings (Right Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-card/75 border border-border space-y-6">
            <h3 className="font-outfit font-bold text-base text-foreground flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-400" /> Focus Association
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tying study session timers to specific subjects and tasks updates your subject study logs and daily analytics graph automatically.
            </p>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Associate Subject
              </label>
              <select
                value={focusSubject?.id || ''}
                onChange={(e) => setFocusSubject(subjects.find(s => s.id === Number(e.target.value)) || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs transition-all"
              >
                <option value="">No subject associated...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Task Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Associate Task
              </label>
              <select
                value={focusTask?.id || ''}
                onChange={(e) => setFocusTask(pendingTasks.find(t => t.id === Number(e.target.value)) || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs transition-all"
              >
                <option value="">No task associated...</option>
                {pendingTasks
                  .filter(t => !focusSubject || t.subject_id === focusSubject.id)
                  .map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))
                }
              </select>
            </div>

            {/* Active details panel */}
            {(focusSubject || focusTask) && (
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs">
                <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px]">Target Area</span>
                <div className="font-outfit font-bold text-foreground mt-1">
                  {focusTask ? focusTask.title : focusSubject?.name}
                </div>
                {focusTask?.description && (
                  <p className="text-[10px] text-muted-foreground mt-1">{focusTask.description}</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Interval Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h4 className="font-outfit font-bold text-base text-foreground mb-4">Configure Intervals</h4>

            <form onSubmit={handleApplySettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Study Block Minutes
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Break Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customBreak}
                  onChange={(e) => setCustomBreak(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none text-xs rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground font-semibold text-xs transition-all shadow"
              >
                Apply Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
