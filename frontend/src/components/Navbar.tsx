import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const { user } = useAuth();
  const { 
    theme, 
    toggleTheme, 
    timerActive, 
    timerSeconds, 
    timerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    focusTask
  } = useAppState();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-card/75 backdrop-blur-md border-b border-border fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8 text-foreground transition-colors duration-300">
      {/* Title */}
      <h1 className="font-outfit font-bold text-xl tracking-tight text-foreground capitalize">
        {pageTitle}
      </h1>

      {/* Right widgets */}
      <div className="flex items-center gap-6">
        {/* Global Mini Pomodoro Widget (Displays active status across all pages) */}
        {(timerActive || timerSeconds < (timerMode === 'focus' ? 25 : 5) * 60) && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-muted border border-border shadow-inner text-xs transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <Timer className="w-4 h-4 animate-pulse" />
              <span className="font-mono">{formatTimer(timerSeconds)}</span>
            </div>
            
            <div className="text-[10px] text-muted-foreground max-w-[120px] truncate hidden md:inline">
              {timerMode === 'focus' 
                ? (focusTask ? `Focusing: ${focusTask.title}` : 'Focusing Session') 
                : 'Break Time'}
            </div>

            <div className="flex items-center gap-1.5 border-l border-border pl-2">
              {timerActive ? (
                <button 
                  onClick={pauseTimer} 
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                  title="Pause Timer"
                >
                  <Pause className="w-3 h-3" />
                </button>
              ) : (
                <button 
                  onClick={startTimer} 
                  className="p-1 text-purple-500 hover:text-foreground hover:bg-muted rounded"
                  title="Start Timer"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
              <button 
                onClick={resetTimer} 
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                title="Reset Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-muted px-1 transition-all duration-300 hover:border-accent focus:outline-none focus:ring-2 focus:ring-ring/40"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className={`relative h-7 w-7 rounded-full bg-card shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}>
            <Sun className={`absolute inset-0 m-auto w-4 h-4 text-amber-500 transition-all duration-300 ${theme === 'dark' ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
            <Moon className={`absolute inset-0 m-auto w-4 h-4 text-indigo-400 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} />
          </span>
        </button>

        {/* Date Display */}
        <div className="text-xs text-muted-foreground font-medium bg-muted/70 px-3 py-1.5 rounded-lg border border-border">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
};
