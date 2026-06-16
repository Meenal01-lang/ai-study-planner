import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Award,
  BookOpen,
  PieChart as PieIcon
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { subjects, tasks, theme } = useAppState();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      const [statsData, insightsData] = await Promise.all([
        api.analytics.dashboard(),
        api.analytics.insights()
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [tasks]);

  if (loading || !stats || !insights) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Weekly hours spent calculations
  const weeklyData = stats.analytics.map((item: any) => {
    const d = new Date(item.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayName,
      Hours: Number((item.study_minutes / 60).toFixed(1))
    };
  });

  // 2. Subject-wise tasks distribution (Pie Chart)
  // Count tasks per subject
  const subjectTaskCounts = subjects.map(subj => {
    const totalSubjTasks = tasks.filter(t => t.subject_id === subj.id).length;
    const completedSubjTasks = tasks.filter(t => t.subject_id === subj.id && t.is_completed).length;
    return {
      name: subj.name,
      value: totalSubjTasks,
      completed: completedSubjTasks,
      color: subj.color
    };
  }).filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Top Banner: Exam Readiness Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-900/10 via-card/20 to-indigo-900/10 border border-purple-500/10 flex flex-col md:flex-row items-center gap-8">
        
        {/* Readiness Radial Indicator */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border-4 border-border"></div>
          {/* Rotating glow */}
          <svg className="w-36 h-36 -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="68"
              stroke="url(#purpleGlowGradient)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={427}
              strokeDashoffset={427 - (427 * insights.readiness_score) / 100}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="purpleGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          {/* Internal text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-outfit font-black text-3xl text-foreground">{insights.readiness_score}%</span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Readiness</span>
          </div>
        </div>

        {/* Coach Overview */}
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 text-purple-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 animate-pulse" /> AI Performance Diagnostic
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-foreground">
            {insights.readiness_score >= 80 
              ? 'Excellent Preparation Progress' 
              : insights.readiness_score >= 50 
              ? 'Steady Syllabus Coverage' 
              : 'Preparation Support Needed'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Based on your completed study sessions, Pomodoro focus logs, and overdue tasks, our AI calculates an overall readiness score of {insights.readiness_score}%. Ensure you cover your suggested revision milestones below to maximize retention.
          </p>
        </div>
      </div>

      {/* Main charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly study hours */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-outfit font-bold text-foreground flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Focus Time Allocation
            </h4>
            <span className="text-xs text-muted-foreground">Daily hours spent studying</span>
          </div>
          
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1E293B" : "#E2E8F0"} />
                <XAxis dataKey="name" stroke={isDark ? "#64748B" : "#94A3B8"} />
                <YAxis stroke={isDark ? "#64748B" : "#94A3B8"} />
                <RechartsTooltip
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    borderRadius: '12px' 
                  }}
                  labelStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 'bold' }}
                />
                <Bar dataKey="Hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Pie chart */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-outfit font-bold text-foreground flex items-center gap-2 text-sm">
              <PieIcon className="w-4 h-4 text-blue-400" /> Syllabus Share per Subject
            </h4>
            <span className="text-xs text-muted-foreground">Total assigned tasks split</span>
          </div>

          {subjectTaskCounts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs">
              Add tasks or subjects to view syllabus breakdown.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center h-64">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectTaskCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {subjectTaskCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                        borderColor: isDark ? '#334155' : '#E2E8F0', 
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        borderRadius: '12px' 
                      }}
                      labelStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="space-y-3 px-4 max-h-56 overflow-y-auto">
                {subjectTaskCounts.map((entry, index) => (
                  <div key={index} className="flex flex-col gap-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                      <span className="font-semibold text-foreground/90 truncate max-w-[120px]" title={entry.name}>{entry.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground pl-4">
                      {entry.completed} / {entry.value} tasks completed ({Math.round(entry.completed / entry.value * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Diagnostics Grid: Weak areas, Suggested revisions, Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Weak Areas */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border">
          <h4 className="font-outfit font-bold text-sm text-red-400 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4" /> Weak Areas identified
          </h4>
          <div className="space-y-3 min-h-[160px]">
            {insights.weak_areas?.length === 0 ? (
              <div className="text-xs text-muted-foreground flex items-center gap-2 h-20">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> All subjects are currently on track!
              </div>
            ) : (
              insights.weak_areas?.map((wa: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-foreground/90 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5"></span>
                  <p>{wa}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggested Revisions */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border">
          <h4 className="font-outfit font-bold text-sm text-amber-400 flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" /> Recommended Revisions
          </h4>
          <div className="space-y-3 min-h-[160px]">
            {insights.suggested_revisions?.length === 0 ? (
              <div className="text-xs text-muted-foreground flex items-center gap-2 h-20">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Syllabus is fully synchronized.
              </div>
            ) : (
              insights.suggested_revisions?.map((sr: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-foreground/90 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <p>{sr}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Study Tips */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border">
          <h4 className="font-outfit font-bold text-sm text-purple-400 flex items-center gap-2 mb-4">
            <Award className="w-4 h-4" /> Actionable Advice
          </h4>
          <div className="space-y-3 min-h-[160px]">
            {insights.tips?.map((tip: string, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-foreground/90 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5"></span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
