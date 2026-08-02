import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Target,
  Award,
  Users,
  Calendar,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { teachingMethods, students, activeCohort, setActiveCohort } = useApp();

  const groupAMethodsCount = teachingMethods.filter(m => m.cohort === 'Group A').length;
  const groupBMethodsCount = teachingMethods.filter(m => m.cohort === 'Group B').length;

  return (
    <div className="animate-slide-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-dhanekula-navy to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-2xl border border-dhanekula-800/50">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-dhanekula-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="relative z-10 space-y-6">
        
        {/* Top University Header Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-dhanekula-100 hover:bg-white/15 transition-all duration-300">
            <GraduationCap className="h-4 w-4 text-dhanekula-300 animate-subtle-float" />
            <span className="font-extrabold tracking-tight">
              Dhanekula Institute of Engineering and Technology (Autonomous)
            </span>
            <span className="text-white/40">•</span>
            <span className="text-slate-300">ECE Department</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Autonomous Academic Curriculum</span>
          </div>
        </div>

        {/* Title & Objective Callout */}
        <div className="max-w-4xl space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Differentiated Teaching–Learning Strategies <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-dhanekula-300 via-sky-200 to-white bg-clip-text text-transparent">
              For Third-Year B.Tech ECE Students
            </span>
          </h1>

          {/* Objective Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5 hover:border-white/25 transition-all duration-300">
            <div className="p-2.5 rounded-xl bg-dhanekula-500/20 text-dhanekula-300 shrink-0 mt-0.5 shadow-inner">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-0.5">
                Core Objective:
              </span>
              To improve teaching-learning effectiveness, academic performance, student progression, and employability through differentiated instructional strategies across Advanced (Group A) and Foundation (Group B) learning cohorts.
            </div>
          </div>
        </div>

        {/* Interactive Cohort Quick Filter Tabs */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Filter View:
          </span>

          <button
            onClick={() => setActiveCohort('All')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
              activeCohort === 'All'
                ? 'bg-white text-slate-900 shadow-xl scale-105'
                : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10 hover:scale-105'
            }`}
          >
            All Cohorts (20 Methods)
          </button>

          <button
            onClick={() => setActiveCohort('Group A')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeCohort === 'Group A'
                ? 'bg-emerald-500 text-white shadow-xl scale-105'
                : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30 hover:scale-105'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Group A – ALC ({groupAMethodsCount} Methods)
          </button>

          <button
            onClick={() => setActiveCohort('Group B')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeCohort === 'Group B'
                ? 'bg-amber-500 text-white shadow-xl scale-105'
                : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30 hover:scale-105'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            Group B – FLC ({groupBMethodsCount} Methods)
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
              <span>Teaching Methods</span>
              <BookOpen className="h-4 w-4 text-dhanekula-300 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {teachingMethods.length}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">10 Group A + 10 Group B</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
              <span>Weekly Schedule</span>
              <Calendar className="h-4 w-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              Mon – Sat
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Differentiated Daily Plans</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
              <span>Target Students</span>
              <Users className="h-4 w-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              {students.length} Enrolled
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">3rd Year B.Tech ECE</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:scale-105 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
              <span>Expected Outcomes</span>
              <Award className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">
              5 Core Goals
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Progression & Employability</p>
          </div>
        </div>

      </div>
    </div>
  );
};
