import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_COHORTS } from '../data/initialData';
import { Compass, CheckCircle2, ArrowRight, Sparkles, Users, BookOpen, GraduationCap } from 'lucide-react';

export const CohortSelector: React.FC = () => {
  const { activeCohort, setActiveCohort, teachingMethods, students } = useApp();
  const cohort = INITIAL_COHORTS[0];

  const totalMethods = teachingMethods.length;
  const totalStudents = students.length || 80;
  const isSelected = activeCohort === 'Unified Learning Cohort';

  return (
    <div className="space-y-4 animate-slide-up-delay-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Compass className="h-5 w-5 text-dhanekula-royal animate-subtle-float" />
            Student Cohort Classification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Single unified learning framework bringing together all third-year B.Tech ECE students
          </p>
        </div>
      </div>

      <div className="w-full">
        <div
          onClick={() => setActiveCohort(isSelected ? 'All' : 'Unified Learning Cohort')}
          className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 border-2 cursor-pointer transition-all duration-300 ${
            isSelected
              ? 'border-dhanekula-royal bg-dhanekula-royal/5 dark:bg-dhanekula-navy/40 shadow-2xl shadow-dhanekula-royal/15 scale-[1.01]'
              : 'border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 hover:border-dhanekula-royal/50 hover:scale-[1.01] shadow-md hover:shadow-2xl'
          }`}
        >
          {/* Top Gradient Banner Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-5">
            {/* Cohort Identification */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-indigo-500/30 group-hover:rotate-3 group-hover:scale-105 transition-all duration-300">
                <GraduationCap className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-dhanekula-royal text-white shadow-xs">
                    ULC
                  </span>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white group-hover:text-dhanekula-royal dark:group-hover:text-dhanekula-300 transition-colors">
                    Unified Learning Cohort
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    All Students Combined
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Third-Year B.Tech ECE • Dhanekula Institute of Engineering and Technology (Autonomous)
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Enrolled Students
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-dhanekula-royal" />
                  {totalStudents} Students
                </span>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Active Methodologies
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  {totalMethods} Methods
                </span>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 mb-4 leading-relaxed">
            <p className="font-semibold">
              • <span className="font-bold text-slate-900 dark:text-white">Unified Learning Cohort (ULC):</span> {cohort.description}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Eliminates segregated grouping in favor of an integrated ecosystem combining flipped lectures, industrial case studies, step-by-step worked demonstrations, interactive quizzes, and peer learning pods.
            </p>
          </div>

          {/* Strategy Footer Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">{totalMethods}</strong> Innovative Teaching Methods with Integrated YouTube Lectures
              </span>
            </div>

            <div className="flex items-center gap-1 text-dhanekula-royal dark:text-dhanekula-400 font-extrabold group-hover:translate-x-1.5 transition-transform">
              <span>{isSelected ? 'Viewing Unified Methods' : 'Explore All Methods'}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
