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
    { subject: 'Engagement', GroupA: 95, GroupB: 93 },
    { subject: 'Pass %', GroupA: 99, GroupB: 96 },
    { subject: 'Placement', GroupA: 92, GroupB: 84 },
    { subject: 'Innovation', GroupA: 90, GroupB: 62 },
    { subject: 'Foundation', GroupA: 85, GroupB: 95 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
          <Award className="h-5 w-5 text-cyberRed-500" />
          Expected Learning Outcomes & Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Target outcome indicators measured across Third-Year B.Tech ECE learning cohorts
        </p>
      </div>

      {/* Outcome Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INITIAL_OUTCOME_METRICS.map((metric, idx) => {
          const isGroupA = metric.cohortTarget === 'Group A';

          return (
            <div
              key={metric.id}
              className="p-5 rounded-3xl bg-obsidian-900/80 border border-cyberRed-900/40 backdrop-blur-xl shadow-md space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-2xl bg-cyberRed-950 text-cyberRed-400 border border-cyberRed-800">
                  {idx === 0 && <Sparkles className="h-5 w-5" />}
                  {idx === 1 && <TrendingUp className="h-5 w-5" />}
                  {idx === 2 && <Briefcase className="h-5 w-5" />}
                  {idx === 3 && <Lightbulb className="h-5 w-5" />}
                  {idx === 4 && <ShieldCheck className="h-5 w-5" />}
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyberRed-950 text-cyberRed-400 border border-cyberRed-800">
                  {metric.cohortTarget} Target
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white">
                  {metric.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  {metric.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-400">Achievement Index</span>
                  <span className="text-cyberRed-400 font-black">{metric.value}</span>
                </div>
                <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyberRed-700 to-red-500 shadow-neon-red transition-all duration-1000"
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
        <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-cyberRed-900/40 backdrop-blur-xl shadow-neon-red-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyberRed-500" />
              Outcome Competency Score (%)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#334155" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#be123c',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 0 20px rgba(225,29,72,0.4)',
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cohort === 'Group A' ? '#ff1e42' : entry.cohort === 'Group B' ? '#dc2626' : '#be123c'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-cyberRed-900/40 backdrop-blur-xl shadow-neon-red-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyberRed-500" />
              Cohort Performance Radar (Group A vs Group B)
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" />
                <Radar name="Group A (ALC)" dataKey="GroupA" stroke="#ff1e42" fill="#ff1e42" fillOpacity={0.35} />
                <Radar name="Group B (FLC)" dataKey="GroupB" stroke="#991b1b" fill="#991b1b" fillOpacity={0.35} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#be123c',
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
