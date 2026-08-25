import React from 'react';
import { INITIAL_OUTCOME_METRICS } from '../data/initialData';
import {
  Award,
  TrendingUp,
  Sparkles,
  Briefcase,
  Lightbulb,
  ShieldCheck,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';

export const OutcomesAnalytics: React.FC = () => {
  const chartData = INITIAL_OUTCOME_METRICS.map((m) => ({
    name: m.title.split(' ')[0] + ' ' + (m.title.split(' ')[1] || ''),
    fullTitle: m.title,
    score: m.percentage,
    cohort: m.cohortTarget,
  }));

  const radarData = [
    { subject: 'Engagement', TargetScore: 96, CurrentScore: 94 },
    { subject: 'Pass %', TargetScore: 99, CurrentScore: 97 },
    { subject: 'Placement', TargetScore: 95, CurrentScore: 89 },
    { subject: 'Innovation', TargetScore: 90, CurrentScore: 86 },
    { subject: 'Foundation Mastery', TargetScore: 98, CurrentScore: 92 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Award className="h-5 w-5 text-dhanekula-royal animate-subtle-float" />
          Expected Learning Outcomes & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Target outcome indicators measured across Third-Year B.Tech ECE (Unified Learning Cohort)
        </p>
      </div>

      {/* Outcome Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INITIAL_OUTCOME_METRICS.map((metric, idx) => {
          return (
            <div
              key={metric.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300">
                  {idx === 0 && <Sparkles className="h-5 w-5" />}
                  {idx === 1 && <TrendingUp className="h-5 w-5" />}
                  {idx === 2 && <Briefcase className="h-5 w-5" />}
                  {idx === 3 && <Lightbulb className="h-5 w-5" />}
                  {idx === 4 && <ShieldCheck className="h-5 w-5" />}
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300 border border-dhanekula-royal/20">
                  ULC Target
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {metric.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                  {metric.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-500 dark:text-slate-400">Target Benchmark</span>
                  <span className="text-dhanekula-royal dark:text-dhanekula-300 font-black">{metric.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-1000"
                    style={{ width: `${metric.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-dhanekula-royal" />
              Outcome Competency Target (%)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="#2563eb"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-dhanekula-royal" />
              Unified Cohort Competency Radar (Target vs Current)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name="Target Competency" dataKey="TargetScore" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
                <Radar name="Current Achievement" dataKey="CurrentScore" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
