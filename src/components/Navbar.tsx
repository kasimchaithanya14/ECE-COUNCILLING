import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Search,
  Moon,
  Sun,
  Bot,
  Sparkles,
  Award
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    setIsAITutorOpen,
    setIsDailyQuizOpen,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Dhanekula Institute Full Name Branding */}
        <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-dhanekula-navy via-dhanekula-royal to-sky-500 flex items-center justify-center text-white shadow-md shadow-dhanekula-navy/25 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            <GraduationCap className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white tracking-tight group-hover:text-dhanekula-royal dark:group-hover:text-dhanekula-300 transition-colors">
                Dhanekula Institute of Engineering and Technology (Autonomous)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden md:block">
              Department of Electronics & Communication Engineering • Courseware Hub
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teaching methods, subjects, or weekly activities..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-dhanekula-500/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Buttons with Micro-Interactions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* AI Tutor Button */}
          <button
            onClick={() => setIsAITutorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-purple-500/20 active:scale-95"
            title="Open AI Tutor & Assistant"
          >
            <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-subtle-float" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          {/* Daily Quiz Button */}
          <button
            onClick={() => setIsDailyQuizOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-amber-500/20 active:scale-95"
            title="Daily Concept Quiz"
          >
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Daily Quiz</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 rotate-0 hover:rotate-90 transition-transform duration-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 rotate-0 hover:-rotate-45 transition-transform duration-500" />
            )}
          </button>

        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search methods, topics..."
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
    </header>
  );
};
