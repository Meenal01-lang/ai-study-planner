import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { api } from '../services/api';
import { 
  Calendar, 
  Flame, 
  Clock, 
  FileDown, 
  History
} from 'lucide-react';

interface StudySession {
  id: number;
  duration_minutes: number;
  completed_at: string;
  subject_id: number;
  task_id: number;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { plans, tasks, subjects } = useAppState();
  
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileLogs = async () => {
    try {
      const logs = await api.sessions.list();
      setSessions(logs);
    } catch (err) {
      console.error('Failed to load focus sessions logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileLogs();
  }, []);

  const handleExportPDF = () => {
    if (!user) return;
    
    // Calculate report statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);

    // Create a new print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing PDF export. Please allow popups for this site.');
      return;
    }

    // Populate the print window content with inline styled document
    printWindow.document.write(`
      <html>
        <head>
          <title>Stellar AI - Student Progress Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h1 { font-size: 28px; font-weight: bold; margin-bottom: 5px; color: #4f46e5; }
            h2 { font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
            .card .val { font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 5px; }
            .card .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
            .badge-comp { bg-color: #d1fae5; color: #065f46; background: #d1fae5; }
            .badge-pend { bg-color: #ffedd5; color: #9a3412; background: #ffedd5; }
          </style>
        </head>
        <body>
          <h1>Stellar AI Study Planner</h1>
          <div className="meta">Exported on: ${new Date().toLocaleString()} | Student: ${user.full_name || 'N/A'} (${user.email})</div>
          
          <h2>Performance Scorecard</h2>
          <div class="grid">
            <div class="card">
              <div class="lbl">Syllabus Completion</div>
              <div class="val">${completionRate}%</div>
            </div>
            <div class="card">
              <div class="lbl">Total Study Tasks</div>
              <div class="val">${totalTasks}</div>
            </div>
            <div class="card">
              <div class="lbl">Focus Minutes</div>
              <div class="val">${totalFocusTime} Mins</div>
            </div>
            <div class="card">
              <div class="lbl">Daily Streak</div>
              <div class="val">${user.streak} Days</div>
            </div>
          </div>

          <h2>Active Study Plans</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Prep Level</th>
                <th>Daily Hours</th>
                <th>Exam Date</th>
                <th>Topics Count</th>
              </tr>
            </thead>
            <tbody>
              ${plans.map(p => `
                <tr>
                  <td><strong>${p.subject.name}</strong></td>
                  <td style="text-transform: capitalize;">${p.prep_level}</td>
                  <td>${p.daily_hours} Hrs</td>
                  <td>${new Date(p.exam_date).toLocaleDateString()}</td>
                  <td>${p.topics?.length || 0} Topics</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Study Tasks Details</h2>
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(t => `
                <tr>
                  <td>${t.title}</td>
                  <td>${t.subject?.name || 'N/A'}</td>
                  <td>${new Date(t.due_date).toLocaleDateString()}</td>
                  <td style="text-transform: uppercase; font-weight: bold;">${t.priority}</td>
                  <td>
                    <span class="badge ${t.is_completed ? 'badge-comp' : 'badge-pend'}">
                      ${t.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const registeredDate = user 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) 
    : 'N/A';

  const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Panel (Left Column) */}
        <div className="p-6 rounded-2xl bg-card/75 border border-border space-y-6">
          <div className="flex flex-col items-center text-center pb-6 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold font-outfit shadow-lg shadow-purple-500/10 mb-4 border-2 border-purple-500/20">
              {user ? (user.full_name || user.email)[0].toUpperCase() : 'U'}
            </div>
            
            <h3 className="font-outfit font-extrabold text-lg text-foreground">
              {user?.full_name || 'Student Profile'}
            </h3>
            <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Joined */}
            <div className="flex items-center gap-3 text-foreground/90">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground font-semibold block text-[10px] uppercase">Joined Stellar</span>
                <span className="font-medium">{registeredDate}</span>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3 text-foreground/90">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <div>
                <span className="text-muted-foreground font-semibold block text-[10px] uppercase">Study Streak</span>
                <span className="font-medium">{user?.streak} Days Active</span>
              </div>
            </div>

            {/* Total Focus */}
            <div className="flex items-center gap-3 text-foreground/90">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-muted-foreground font-semibold block text-[10px] uppercase">Total Focus Logs</span>
                <span className="font-medium">{totalFocusTime} Minutes</span>
              </div>
            </div>
          </div>

          {/* Export Report Trigger */}
          <button
            onClick={handleExportPDF}
            className="w-full py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow hover:-translate-y-0.5 duration-200"
          >
            <FileDown className="w-4 h-4" /> Export Progress Report (PDF)
          </button>
        </div>

        {/* Focus history logs list (Right Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card/75 border border-border flex flex-col h-[480px]">
          <h3 className="font-outfit font-bold text-base text-foreground mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" /> Pomodoro Focus History
          </h3>

          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {sessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Clock className="w-8 h-8 text-muted-foreground/70 mb-2" />
                <p className="text-xs text-muted-foreground">No Pomodoro study blocks logged yet.</p>
                <a href="#/pomodoro" className="text-xs text-purple-400 font-semibold hover:underline mt-2">
                  Launch timer view &rarr;
                </a>
              </div>
            ) : (
              sessions.map((log) => {
                const logDate = new Date(log.completed_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                // Find subject color
                const sub = subjects.find(s => s.id === log.subject_id);
                const task = tasks.find(t => t.id === log.task_id);

                return (
                  <div 
                    key={log.id} 
                    className="p-3.5 rounded-xl bg-muted/70 border border-border flex justify-between items-center gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {task ? `Task: ${task.title}` : 'General study focus session'}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span>{logDate}</span>
                        {sub && (
                          <>
                            <span>•</span>
                            <span style={{ color: sub.color }} className="font-medium">{sub.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">
                      <Clock className="w-3.5 h-3.5" /> {log.duration_minutes}m
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
