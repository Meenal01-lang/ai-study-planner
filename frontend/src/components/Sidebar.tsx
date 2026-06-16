import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Timer, 
  FileText, 
  User, 
  LogOut, 
  Flame,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const { user, logout } = useAuth();
  const { timerActive, timerSeconds } = useAppState();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '#/dashboard' },
    { name: 'Study Planner', icon: BookOpen, path: '#/planner' },
    { name: 'Calendar', icon: Calendar, path: '#/calendar' },
    { name: 'Analytics', icon: BarChart3, path: '#/analytics' },
    { name: 'Pomodoro Focus', icon: Timer, path: '#/pomodoro', badge: timerActive },
    { name: 'Notes Section', icon: FileText, path: '#/notes' },
    { name: 'Profile Log', icon: User, path: '#/profile' },
  ];

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!user) return null;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0 text-card-foreground transition-colors duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-outfit font-bold text-lg text-foreground">
          Stellar AI
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-purple-600/10 text-purple-400 border-l-2 border-purple-500 font-medium' 
                  : 'hover:bg-muted hover:text-foreground text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-purple-400' : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                <span>{item.name}</span>
              </div>
              
              {/* Pomodoro background indicator */}
              {item.badge && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {formatTimer(timerSeconds)}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border bg-background/60 space-y-4 transition-colors duration-300">
        {/* Streak details */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center animate-bounce">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Daily Streak</div>
            <div className="text-sm font-outfit font-bold text-foreground">
              {user.streak} {user.streak === 1 ? 'Day' : 'Days'} Active
            </div>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 max-w-[150px]">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-semibold text-purple-300">
              {(user.full_name || user.email)[0].toUpperCase()}
            </div>
            <div className="truncate text-xs font-medium">
              <div className="text-foreground truncate">{user.full_name || 'Student'}</div>
              <div className="text-muted-foreground truncate text-[10px]">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
