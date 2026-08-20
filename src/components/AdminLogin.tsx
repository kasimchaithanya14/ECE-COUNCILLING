import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  navigate: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { adminLogin, theme, toggleTheme } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const res = await adminLogin(username.trim(), password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top minimalistic header bar */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors btn-micro-interaction"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Counseling Hub</span>
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-dhanekula-royal" />
          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
            Admin Portal
          </span>
        </div>
      </header>

      {/* Main Login Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md college-glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200/80 dark:border-slate-800/80">
          
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-dhanekula-navy via-dhanekula-royal to-sky-500 flex items-center justify-center text-white shadow-lg shadow-dhanekula-navy/20">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dhanekula ECE Academic & Sub-Admin Counseling System
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-2.5 animate-fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Login ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Login ID / Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin ID or email"
                disabled={loading}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Please contact your IT support or Super Admin to reset your password.")}
                  className="text-[10px] font-bold text-dhanekula-royal hover:underline dark:text-dhanekula-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-dhanekula-navy via-dhanekula-royal to-dhanekula-500 hover:from-dhanekula-royal hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-dhanekula-navy/20 hover:shadow-dhanekula-royal/35 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>Login Securely</span>
              )}
            </button>

          </form>

        </div>
      </div>
      
    </div>
  );
};
