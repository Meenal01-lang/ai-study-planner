import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        password,
        full_name: fullName
      });
      window.location.hash = '#/dashboard';
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden text-foreground">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

      {/* Container */}
      <div className="w-full max-w-md bg-card/80 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-md relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-foreground">Create Account</h2>
          <p className="text-muted-foreground text-xs mt-1">Get started with AI-driven study schedules</p>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>{activeError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
              placeholder="e.g. Alex Mercer"
            />
          </div>

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
              Password (6+ chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-sm transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? 'Registering...' : 'Sign Up'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <a href="#/login" className="text-purple-400 hover:underline font-semibold ml-1">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};
