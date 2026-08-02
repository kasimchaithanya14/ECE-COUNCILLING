import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_COHORTS } from '../data/initialData';
import { Zap, Compass, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const CohortSelector: React.FC = () => {
  const { activeCohort, setActiveCohort, teachingMethods, students } = useApp();

  return (
    <div className="space-y-4 animate-slide-up-delay-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Compass className="h-5 w-5 text-dhanekula-royal animate-subtle-float" />
            Student Cohort Classifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Differentiated instructional grouping tailored for third-year engineering capabilities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_COHORTS.map((cohort) => {
          const isGroupA = cohort.id === 'Group A';
          const cohortMethods = teachingMethods.filter((m) => m.cohort === cohort.id);
          const cohortStudents = students.filter((s) => s.cohort === cohort.id);
          const isSelected = activeCohort === cohort.id;

          return (
            <div
              key={cohort.id}
              onClick={() => setActiveCohort(isSelected ? 'All' : cohort.id)}
              className={`group relative overflow-hidden rounded-3xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? isGroupA
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                    : 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-xl shadow-amber-500/10 scale-[1.02]'
                  : 'border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.03] hover:-translate-y-1 shadow-md hover:shadow-2xl'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 ${
                      isGroupA
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30'
                        : 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-500/30'
                    }`}
                  >
                    {isGroupA ? <Zap className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cohort.badgeColor}`}>
                        {cohort.code}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-dhanekula-royal dark:group-hover:text-dhanekula-300 transition-colors">
                        {cohort.id}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {cohort.title}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Enrolled
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {cohortStudents.length || cohort.studentCount} Students
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-4 leading-relaxed">
                <p className="font-semibold">
                  • <span className="font-bold text-slate-900 dark:text-white">{cohort.id} – {cohort.title}:</span> {cohort.description}
                </p>
              </div>

              {/* Strategy Footer Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <CheckCircle2 className={`h-4 w-4 ${isGroupA ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span>
                    <strong className="text-slate-900 dark:text-white">{cohortMethods.length}</strong> Innovative Methods
                  </span>
                </div>

                <div className="flex items-center gap-1 text-dhanekula-royal dark:text-dhanekula-400 font-bold group-hover:translate-x-1.5 transition-transform">
                  <span>{isSelected ? 'Viewing Methods' : 'Explore Methods'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
