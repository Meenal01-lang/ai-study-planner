import React from 'react';
import { 
  GraduationCap, 
  Zap, 
  Calendar as CalendarIcon, 
  Flame, 
  Timer, 
  BrainCircuit, 
  TrendingUp, 
  FileSpreadsheet,
  ArrowRight 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500 overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-20 border-b border-border flex items-center justify-between px-8 md:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight text-foreground">
            Stellar AI
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="#/login" 
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
          >
            Sign In
          </a>
          <a 
            href="#/register" 
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-500/25 hover:-translate-y-0.5 duration-200"
          >
            Get Started Free
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 md:px-20 text-center relative max-w-5xl mx-auto">
        {/* Background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" /> Next-Gen AI Study Planner
        </span>
        
        <h1 className="font-outfit font-extrabold text-5xl md:text-7xl leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-6 animate-fade-in tracking-tight">
          Supercharge Your Study Habits <br className="hidden md:inline"/>
          With Custom <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">AI Guidance</span>
        </h1>
        
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Set your exam dates, define your subjects, and let Stellar create an adaptive study plan that automatically reschedules missed tasks, hosts Pomodoro sessions, and logs progress.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a 
            href="#/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/20 hover:-translate-y-0.5 duration-200"
          >
            Create Your Plan <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="#/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 hover:text-foreground border border-border font-medium transition-all"
          >
            Try Demo Account
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative glass-premium rounded-2xl p-2.5 max-w-4xl mx-auto shadow-2xl shadow-purple-500/5 hover:scale-[1.01] transition-transform duration-300">
          <div className="rounded-xl overflow-hidden border border-border bg-card/80 p-6 flex flex-col gap-6 text-left">
            {/* Fake dashboard header */}
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500/70"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/70"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-green-500/70"></span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">stellar-planner-mockup.dmg</div>
            </div>
            
            {/* Fake dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/70 border border-border/70">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>ML EXAM PREPARATION</span>
                  <span className="text-purple-400">80% Done</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[80%]"></div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/70 border border-border/70 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">STUDY STREAK</div>
                  <div className="text-xl font-bold font-outfit text-amber-500 flex items-center gap-1 mt-1">
                    <Flame className="w-5 h-5 fill-amber-500" /> 5 Days
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">On Fire</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/70 border border-border/70">
                <div className="text-xs text-muted-foreground">TODAY'S TASK COMPLETED</div>
                <div className="text-xl font-bold text-foreground mt-1">3 / 4 tasks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-border bg-background/70 relative">
        <div className="max-w-6xl mx-auto px-6 md:px-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit font-extrabold text-3xl md:text-4xl text-foreground mb-4">
              Everything You Need to Ace Your Exams
            </h2>
            <p className="text-muted-foreground">
              Stop juggling custom spreadsheets and calendar notifications. Stellar AI combines task scheduling, focus cycles, and habit analysis in a unified workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-purple-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">AI Plan Generation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Feed your topics, dates, and study hours, and Gemini structures the syllabus logically. Topics are divided into concepts, practice sessions, and revision points.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-blue-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Smart Rescheduling</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Life happens. When you miss a task, Stellar automatically moves it forward without breaking your streak, recalculating daily study budgets to protect your exam date.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Timer className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Pomodoro Focus Timer</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Study with intention using custom 25-minute focus cycles. Time spent is automatically logged to daily statistics and linked to your subjects for precise analysis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-orange-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Weekly Productivity Logs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track study hours and completed tasks using interactive weekly bar graphs. Identify weak areas where you frequently miss deadlines or skip review sessions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-pink-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Subject Notes Organizer</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Write structured Markdown notes directly adjacent to your study plans. Organize documentation by subject color coding, making exam prep fast and searchable.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-card/80 border border-border hover:border-purple-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Flame className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-outfit font-bold text-lg text-foreground mb-2">Active Streak Multiplier</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Build a consistent daily routine. Stellar tracks active study streaks just like Duolingo, urging you to complete at least one focus session a day to keep the fire going.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 text-center border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-outfit font-extrabold text-3xl text-foreground mb-4">
            Ready to Ace Your Upcoming Exams?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm">
            Sign up today, build your custom subjects, generate your first AI study schedule, and track your daily habits with ease.
          </p>
          <a 
            href="#/register" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground font-semibold transition-all shadow-xl shadow-purple-500/20 hover:-translate-y-0.5 duration-200"
          >
            Create Your Account Now <ArrowRight className="w-4 h-4" />
          </a>
          
          <div className="mt-16 text-muted-foreground text-xs font-mono">
            &copy; 2026 Stellar Planner Inc. All rights reserved. Built for developers and scholars.
          </div>
        </div>
      </footer>
    </div>
  );
};
