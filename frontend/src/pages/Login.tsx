import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    
    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email, password });
      window.location.hash = '#/dashboard';
    } catch (err: any) {
      // Error handled by AuthContext, but caught here to reset button state
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('test@example.com');
    setPassword('password123');
    setLocalError(null);
    clearError();
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden text-foreground">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Container */}
      <div className="w-full max-w-md bg-card/80 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-md relative">
        {/* Header logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground text-xs mt-1">Sign in to sync your study agenda</p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>{activeError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
              placeholder="e.g. alex@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {/* Buttons */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo trigger */}
        <div className="mt-4">
          <button
            onClick={handleDemoFill}
            className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted hover:text-foreground border border-border text-xs font-medium transition-all"
          >
            Fill Demo Credentials (test@example.com)
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <a href="#/register" className="text-purple-400 hover:underline font-semibold ml-1">
            Register for free
          </a>
        </div>
      </div>
    </div>
  );
};
