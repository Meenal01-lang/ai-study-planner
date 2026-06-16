import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <div className="relative flex items-center justify-center">
          {/* Animated glow ring */}
          <div className="absolute w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
          {/* Internal pulsate */}
          <div className="w-8 h-8 rounded-full bg-purple-500/80 animate-ping"></div>
        </div>
        <p className="mt-8 text-muted-foreground font-medium tracking-wide animate-pulse">
          Syncing schedules...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing / login page
    window.location.href = '#/';
    return null;
  }

  return <>{children}</>;
};
