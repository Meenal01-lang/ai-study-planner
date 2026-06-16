import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Pages imports
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { StudyPlanner } from './pages/StudyPlanner';
import { Calendar } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { PomodoroTimer } from './pages/PomodoroTimer';
import { Notes } from './pages/Notes';
import { Profile } from './pages/Profile';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router based on active hash path
  const renderRoute = () => {
    switch (currentHash) {
      case '#/':
        return user ? <ProtectedRoute><Dashboard /></ProtectedRoute> : <LandingPage />;
      case '#/login':
        return <Login />;
      case '#/register':
        return <Register />;
      case '#/dashboard':
        return <ProtectedRoute><Dashboard /></ProtectedRoute>;
      case '#/planner':
        return <ProtectedRoute><StudyPlanner /></ProtectedRoute>;
      case '#/calendar':
        return <ProtectedRoute><Calendar /></ProtectedRoute>;
      case '#/analytics':
        return <ProtectedRoute><Analytics /></ProtectedRoute>;
      case '#/pomodoro':
        return <ProtectedRoute><PomodoroTimer /></ProtectedRoute>;
      case '#/notes':
        return <ProtectedRoute><Notes /></ProtectedRoute>;
      case '#/profile':
        return <ProtectedRoute><Profile /></ProtectedRoute>;
      default:
        return user ? <ProtectedRoute><Dashboard /></ProtectedRoute> : <LandingPage />;
    }
  };

  const getPageTitle = () => {
    switch (currentHash) {
      case '#/dashboard':
        return 'Overview Dashboard';
      case '#/planner':
        return 'AI Study Planner';
      case '#/calendar':
        return 'Study Agenda Calendar';
      case '#/analytics':
        return 'Performance Analytics';
      case '#/pomodoro':
        return 'Pomodoro Focus Session';
      case '#/notes':
        return 'Subject Study Notes';
      case '#/profile':
        return 'Student Progress Card';
      default:
        return 'Overview Dashboard';
    }
  };

  // If unauthenticated or accessing landing/login/register, render without app sidebar layout
  const isAuthView = currentHash === '#/' || currentHash === '#/login' || currentHash === '#/register';

  if (isAuthView && !user) {
    return <div className="min-h-screen bg-background text-foreground transition-colors duration-300">{renderRoute()}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
        {/* Navigation Layers */}
        <Sidebar currentPath={currentHash} />
        <Navbar pageTitle={getPageTitle()} />

        {/* Content Panel Wrapper */}
        <main className="pl-64 pt-16 min-h-screen">
          <div className="px-8 py-8 h-full">
            {renderRoute()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </AuthProvider>
  );
};

export default App;
