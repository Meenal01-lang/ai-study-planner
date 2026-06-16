import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { api } from '../services/api';
import { 
  Sparkles, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  Trash2,
  GraduationCap
} from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const { plans, generatePlan, refreshAllData } = useAppState();

  // Wizard state
  const [subjectName, setSubjectName] = useState('');
  const [color, setColor] = useState('#8B5CF6'); // Purple
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [prepLevel, setPrepLevel] = useState('intermediate');
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorsList = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F43F5E', // Rose
    '#F59E0B', // Amber
    '#06B6D4'  // Cyan
  ];

  const handleAddTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, idx) => idx !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subjectName.trim()) {
      setError('Subject name is required.');
      return;
    }
    if (topics.length === 0) {
      setError('Please add at least one topic.');
      return;
    }
    if (!examDate) {
      setError('Exam date is required.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (examDate <= today) {
      setError('Exam date must be in the future.');
      return;
    }

    setGenerating(true);
    try {
      await generatePlan({
        subject_name: subjectName.trim(),
        color,
        topics,
        exam_date: examDate,
        daily_hours: Number(dailyHours),
        prep_level: prepLevel
      });
      
      // Reset form
      setSubjectName('');
      setTopics([]);
      setExamDate('');
      setDailyHours(2);
      setPrepLevel('intermediate');
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this study plan? All generated tasks will be removed.')) {
      try {
        await api.plans.delete(id);
        await refreshAllData();
      } catch (err) {
        console.error('Failed to delete study plan', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {generating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-foreground">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <h2 className="font-outfit font-extrabold text-xl text-foreground tracking-wide">
            Consulting Gemini AI Coach...
          </h2>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm text-center leading-relaxed">
            We are analyzing your topics, calculating daily milestones, and creating custom revision loops for you. This will take just a moment.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Planner Settings Wizard (Left Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-card/75 border border-border relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
            
            <h3 className="font-outfit font-bold text-base text-foreground flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Schedule Generator
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* Subject details */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-sm transition-all"
                  placeholder="e.g. Data Structures"
                />
              </div>

              {/* Tag color */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Subject Color Tag
                </label>
                <div className="flex gap-2">
                  {colorsList.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-purple-600 dark:ring-purple-400 ring-offset-2 scale-110 shadow-lg' : 'opacity-80 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Topics to Cover
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-sm transition-all"
                    placeholder="e.g. Binary Search Trees"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-purple-400 border border-border hover:text-foreground transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Topics List Tags */}
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/60 border border-border">
                    {topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-foreground/90 border border-border"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(idx)}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Exam Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-sm transition-all pr-10"
                  />
                  <Calendar className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Daily hours */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Daily Available Hours
                  </label>
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {dailyHours} Hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Prep Level */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Preparation Level
                </label>
                <select
                  value={prepLevel}
                  onChange={(e) => setPrepLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none text-sm transition-all"
                >
                  <option value="beginner">Beginner (Slow pace, heavy concept reviews)</option>
                  <option value="intermediate">Intermediate (Standard pace, balanced review)</option>
                  <option value="advanced">Advanced (Fast pace, focus on revision & tests)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-200"
              >
                <Sparkles className="w-4 h-4" /> Assemble Schedule
              </button>
            </form>
          </div>
        </div>

        {/* Existing plans details list (Right Columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-outfit font-bold text-lg text-foreground">Active Syllabus Schedules</h3>
            <span className="text-xs text-muted-foreground font-mono">{plans.length} Plan{plans.length !== 1 ? 's' : ''}</span>
          </div>

          {plans.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/40 border border-border border-dashed text-center flex flex-col items-center justify-center py-20">
              <GraduationCap className="w-12 h-12 text-muted-foreground/70 mb-3" />
              <div className="font-outfit font-bold text-foreground/90">No active plans yet</div>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Enter your subjects and parameters on the left to let Gemini design your study timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="p-6 rounded-2xl bg-card/75 border border-border hover:border-border transition-all flex flex-col gap-5"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: plan.subject.color }}
                      ></div>
                      <div>
                        <h4 className="font-outfit font-bold text-foreground">{plan.subject.name}</h4>
                        <div className="text-[10px] text-muted-foreground uppercase mt-0.5">
                          Exam Date: {new Date(plan.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all"
                      title="Delete study plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Plan stats bar */}
                  <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-muted/70 border border-border text-xs">
                    <div>
                      <span className="text-muted-foreground">Prep Level</span>
                      <div className="font-bold text-foreground/90 mt-0.5 capitalize">{plan.prep_level}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Daily Hours</span>
                      <div className="font-bold text-foreground/90 mt-0.5">{plan.daily_hours} Hrs</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining Days</span>
                      <div className="font-bold text-foreground/90 mt-0.5">
                        {Math.max(0, Math.ceil((new Date(plan.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days
                      </div>
                    </div>
                  </div>

                  {/* Topics covered */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topics Included</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {plan.topics?.map((topic: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
