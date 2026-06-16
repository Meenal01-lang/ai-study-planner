import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import type { Task } from '../context/AppStateContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';

export const Calendar: React.FC = () => {
  const { tasks, subjects, createTask, updateTaskStatus } = useAppState();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Modal state for manual task creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskSubj, setNewTaskSubj] = useState<number | ''>('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskMinutes, setNewTaskMinutes] = useState(60);

  // Month stats
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Convert date to YYYY-MM-DD
  const formatDateString = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateString(day);
    const dateTasks = tasks.filter(t => t.due_date === dateStr);
    setSelectedDateTasks(dateTasks);
    setSelectedDateStr(dateStr);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskSubj || !selectedDateStr) return;

    try {
      await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        due_date: selectedDateStr,
        estimated_minutes: Number(newTaskMinutes),
        subject_id: Number(newTaskSubj),
        is_completed: false,
        is_revision: false
      });
      // Wait for refetch trigger or push manually for responsiveness
      setSelectedDateTasks([...selectedDateTasks, {
        id: Date.now(), // Temp ID, will be overwritten by refetch
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        due_date: selectedDateStr,
        estimated_minutes: Number(newTaskMinutes),
        subject_id: Number(newTaskSubj),
        is_completed: false,
        is_revision: false,
        subject: subjects.find(s => s.id === Number(newTaskSubj))
      }]);

      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskSubj('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create manual task', err);
    }
  };

  // Generate blank grids for padding
  const blanks = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Calendar Grid (Left Columns) */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-card/75 border border-border">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-outfit font-extrabold text-lg text-foreground">
              {monthNames[month]} {year}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 border border-border transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground/90 border border-border transition-all"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 border border-border transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {blanks.map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-square bg-muted/30 border border-transparent rounded-xl"></div>
            ))}
            
            {days.map((day) => {
              const dateStr = formatDateString(day);
              const dayTasks = tasks.filter(t => t.due_date === dateStr);
              const hasRevision = dayTasks.some(t => t.is_revision);
              const completedCount = dayTasks.filter(t => t.is_completed).length;
              const totalCount = dayTasks.length;

              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              const isSelected = selectedDateStr === dateStr;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-2 border rounded-xl flex flex-col justify-between items-start text-left calendar-day-hover relative transition-all ${
                    isToday 
                      ? 'bg-purple-600/10 border-purple-500 text-foreground font-bold' 
                      : isSelected
                      ? 'bg-muted border-slate-500 text-foreground'
                      : 'bg-card/40 border-border text-muted-foreground hover:border-border'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  
                  {/* Task Indicators */}
                  {totalCount > 0 && (
                    <div className="w-full flex items-center justify-between gap-1 mt-auto">
                      {/* Dots row */}
                      <div className="flex gap-1 overflow-x-hidden max-w-[70%]">
                        {dayTasks.slice(0, 3).map((task) => (
                          <span 
                            key={task.id} 
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: task.subject?.color || '#8B5CF6' }}
                            title={task.title}
                          ></span>
                        ))}
                        {totalCount > 3 && <span className="text-[7px] text-muted-foreground font-bold shrink-0">+</span>}
                      </div>

                      {/* Percent or revision icon */}
                      {hasRevision ? (
                        <span title="Revision Day"><Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" /></span>
                      ) : (
                        <span className="text-[8px] font-mono text-muted-foreground">
                          {completedCount}/{totalCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel (Right Column) */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-card/75 border border-border flex flex-col h-[520px]">
          {selectedDateStr ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-border mb-4">
                <div>
                  <h4 className="font-outfit font-bold text-foreground">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                    {selectedDateTasks.length} Scheduled Task{selectedDateTasks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground transition-all shadow shadow-purple-500/10"
                  title="Add Task to Day"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedDateTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground/70 mb-2" />
                    <p className="text-xs text-muted-foreground">No study sessions for this date.</p>
                  </div>
                ) : (
                  selectedDateTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="p-3 rounded-xl bg-muted/70 border border-border flex items-start gap-2.5"
                    >
                      <button
                        onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                        className="mt-0.5 text-muted-foreground hover:text-purple-400 transition-colors shrink-0"
                      >
                        {task.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-purple-500 fill-purple-500/5" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground hover:text-muted-foreground" />
                        )}
                      </button>
                      
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold leading-tight ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          {task.subject && (
                            <span 
                              className="text-[8px] px-1.5 py-0.5 rounded border"
                              style={{ 
                                color: task.subject.color, 
                                borderColor: `${task.subject.color}20`,
                                backgroundColor: `${task.subject.color}05`
                              }}
                            >
                              {task.subject.name}
                            </span>
                          )}
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                            task.priority === 'high' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                              : 'bg-slate-500/10 text-muted-foreground'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <CalendarIcon className="w-10 h-10 text-muted-foreground/70 mb-3 animate-pulse" />
              <div className="font-outfit font-bold text-foreground/90 text-sm">Select a Calendar Day</div>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                Click any cell in the grid to view detailed schedules, check off items, or log a custom study session.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Task Creator Modal */}
      {showCreateModal && selectedDateStr && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h4 className="font-outfit font-bold text-lg text-foreground mb-4">
              Add Task for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h4>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs rounded-xl"
                  placeholder="e.g. Read Chapter 4"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs rounded-xl h-20 resize-none"
                  placeholder="Add notes or goals for this session..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Subject Tag
                  </label>
                  <select
                    required
                    value={newTaskSubj}
                    onChange={(e) => setNewTaskSubj(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs rounded-xl"
                  >
                    <option value="">Select subject...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs rounded-xl"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border focus:border-accent text-foreground focus:outline-none text-xs rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-foreground font-semibold text-xs transition-all shadow shadow-purple-500/20"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
