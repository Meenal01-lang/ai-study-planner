import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import type { Task } from '../context/AppStateContext';
import { api } from '../services/api';
import { 
  Flame, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  AlertTriangle,
  Play, 
  Sparkles,
  TrendingUp,
  Circle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    updateTaskStatus, 
    rescheduleOverdue, 
    setFocusTask,
    theme
  } = useAppState();

  const isDark = theme === 'dark';

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleNotice, setRescheduleNotice] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      const data = await api.analytics.dashboard();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, [tasks]);

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      const count = await rescheduleOverdue();
      setRescheduleNotice(`Successfully shifted ${count} overdue tasks to today!`);
      setTimeout(() => setRescheduleNotice(null), 5000);
      await loadDashboardStats();
    } catch (err) {
      console.error('Failed to reschedule tasks', err);
    } finally {
      setRescheduling(false);
    }
  };

  const handlePlayTask = (task: Task) => {
    setFocusTask(task);
    window.location.hash = '#/pomodoro';
  };

  // Filter today's tasks
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.due_date === todayStr);
  const overdueTasksCount = tasks.filter(t => !t.is_completed && t.due_date < todayStr).length;

  // Formatting chart data
  const chartData = stats?.analytics?.map((item: any) => {
    const d = new Date(item.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayName,
      'Study Mins': item.study_minutes,
      'Tasks Done': item.completed_tasks
    };
  }) || [];

  if (loadingStats || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Rescheduling warnings */}
      {overdueTasksCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="font-outfit font-bold text-sm">Adaptive Plan Alert</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                You have {overdueTasksCount} task{overdueTasksCount > 1 ? 's' : ''} overdue from previous days. Autopilot rescheduling can redirect them to today.
              </div>
            </div>
          </div>
          <button
            onClick={handleReschedule}
            disabled={rescheduling}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
          >
            {rescheduling ? 'Rescheduling...' : 'Reschedule to Today'}
          </button>
        </div>
      )}

      {/* Reschedule success toast */}
      {rescheduleNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          {rescheduleNotice}
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak */}
        <div className="p-6 rounded-2xl bg-card/80 border border-border flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Streak</div>
            <div className="text-3xl font-outfit font-extrabold text-amber-500 mt-2 flex items-baseline gap-1">
              {stats.streak} <span className="text-sm font-normal text-muted-foreground">days</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* Tasks completed */}
        <div className="p-6 rounded-2xl bg-card/80 border border-border flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Today's Progress</div>
            <div className="text-3xl font-outfit font-extrabold text-emerald-400 mt-2 flex items-baseline gap-1">
              {stats.today_completed} <span className="text-sm font-normal text-muted-foreground">/ {stats.today_total} tasks</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Progress percent */}
        <div className="p-6 rounded-2xl bg-card/80 border border-border">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Completion Rate</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-outfit font-extrabold text-foreground">
              {Math.round(stats.progress_percentage)}%
            </div>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${stats.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Focus Session logged */}
        <div className="p-6 rounded-2xl bg-card/80 border border-border flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Focus Logs</div>
            <div className="text-3xl font-outfit font-extrabold text-purple-400 mt-2 flex items-baseline gap-1">
              {stats.analytics.reduce((acc: number, val: any) => acc + val.study_minutes, 0)} 
              <span className="text-xs font-normal text-muted-foreground"> mins this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Weekly charts + Coach tips) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts container */}
          <div className="p-6 rounded-2xl bg-card/75 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-outfit font-bold text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Weekly Activity Analysis
              </h3>
              <span className="text-xs text-muted-foreground">Past 7 days performance</span>
            </div>
            
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#E2E8F0"} />
                  <XAxis dataKey="name" stroke={isDark ? "#64748B" : "#94A3B8"} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8B5CF6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#E2E8F0', 
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderRadius: '12px' 
                    }}
                    labelStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Study Mins" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Tasks Done" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Coach block */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-900/10 via-card/20 to-indigo-900/10 border border-purple-500/10">
            <h3 className="font-outfit font-bold text-base text-purple-400 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 animate-pulse" /> AI Study Coach Tips
            </h3>
            <div className="space-y-3">
              {stats.ai_tips?.map((tip: string, idx: number) => (
                <div key={idx} className="flex gap-3 text-xs text-foreground/90 leading-relaxed border-b border-border/70 pb-3 last:border-0 last:pb-0">
                  <span className="text-purple-500 font-bold">0{idx + 1}.</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Tasks lists) */}
        <div className="space-y-8">
          {/* Today's Tasks */}
          <div className="p-6 rounded-2xl bg-card/75 border border-border flex flex-col h-[400px]">
            <h3 className="font-outfit font-bold text-base text-foreground mb-4 flex items-center justify-between">
              <span>Today's Schedule</span>
              <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-normal">
                {todayTasks.length} Task{todayTasks.length !== 1 ? 's' : ''}
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {todayTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground/70 mb-2" />
                  <p className="text-xs text-muted-foreground">No tasks scheduled for today.</p>
                  <a href="#/planner" className="text-xs text-purple-400 font-semibold hover:underline mt-2">
                    Create study plan &rarr;
                  </a>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3 rounded-xl bg-muted/70 border border-border hover:border-border transition-all flex items-start gap-3 group"
                  >
                    <button
                      onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                      className="mt-0.5 text-muted-foreground hover:text-purple-400 transition-colors"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-500 fill-purple-500/10" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground hover:text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        {task.subject && (
                          <span 
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium border"
                            style={{ 
                              color: task.subject.color, 
                              borderColor: `${task.subject.color}20`,
                              backgroundColor: `${task.subject.color}05` 
                            }}
                          >
                            {task.subject.name}
                          </span>
                        )}
                        <span className={`text-[8px] px-1 py-0.5 rounded-full uppercase font-bold ${
                          task.priority === 'high' 
                            ? 'bg-red-500/10 text-red-400' 
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-slate-500/10 text-muted-foreground'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayTask(task)}
                      className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-500 hover:text-foreground"
                      title="Start Focus Timer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="p-6 rounded-2xl bg-card/75 border border-border flex flex-col h-[320px]">
            <h3 className="font-outfit font-bold text-base text-foreground mb-4">Upcoming Deadlines</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {stats.upcoming_deadlines?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="w-8 h-8 text-muted-foreground/70 mb-2" />
                  <p className="text-xs text-muted-foreground">No upcoming deadlines.</p>
                </div>
              ) : (
                stats.upcoming_deadlines?.map((task: any) => (
                  <div 
                    key={task.id} 
                    className="p-3 rounded-xl bg-muted/60 border border-border/80 flex justify-between items-center gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {task.subject && (
                          <span 
                            className="text-[9px] font-medium"
                            style={{ color: task.subject.color }}
                          >
                            {task.subject.name}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground">•</span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    
                    <a 
                      href="#/calendar" 
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground/90"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
