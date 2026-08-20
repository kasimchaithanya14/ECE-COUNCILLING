import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, HeartHandshake } from 'lucide-react';
import { CohortType } from '../types';
import { StudentCounsellingPublic } from './StudentCounsellingPublic';

export const StudentRoster: React.FC = () => {
  const { role, students, updateStudentCohort } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'updates' | 'roster'>('updates');
  const [filterCohort, setFilterCohort] = useState<string>('All');
  const [filterBatch, setFilterBatch] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSection, setFilterSection] = useState<string>('All');
  const [searchRoster, setSearchRoster] = useState('');

  const filteredStudents = students.filter((stu) => {
    const matchesCohort = filterCohort === 'All' || stu.cohort === filterCohort;
    const matchesBatch = filterBatch === 'All' || stu.batch === filterBatch;
    const matchesYear = filterYear === 'All' || (stu.year || '3rd Year') === filterYear;
    const matchesSection = filterSection === 'All' || (stu.section || 'A') === filterSection;
    const matchesSearch =
      searchRoster === '' ||
      stu.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(searchRoster.toLowerCase());
    return matchesCohort && matchesBatch && matchesYear && matchesSection && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Sub-Tab Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('updates')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
            activeSubTab === 'updates'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          <span>Counselling Highlights & Updates</span>
        </button>
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs border-b-2 transition-all ${
            activeSubTab === 'roster'
              ? 'border-dhanekula-royal text-dhanekula-royal dark:border-dhanekula-400 dark:text-dhanekula-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Student Directory & Cohorts</span>
        </button>
      </div>

      {activeSubTab === 'updates' ? (
        /* TAB 1: PUBLIC COUNSELLING HIGHLIGHTS */
        <StudentCounsellingPublic />
      ) : (
        /* TAB 2: ORIGINAL STUDENT ROSTER & COHORTS */
        <div className="space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight uppercase">
                <Users className="h-4.5 w-4.5 text-dhanekula-royal" />
                Third-Year Student Roster & Cohort Assignment
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {role === 'faculty'
                  ? 'Faculty Management: Dynamically assign students between Advanced (Group A) and Foundation (Group B) cohorts.'
                  : 'Student Directory (Read-Only View).'}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="All">All Batches</option>
                <option value="2022 - 2026">2022 - 2026</option>
                <option value="2023 - 2027">2023 - 2027</option>
                <option value="2024 - 2028">2024 - 2028</option>
                <option value="2025 - 2029">2025 - 2029</option>
                <option value="2026 - 2030">2026 - 2030</option>
              </select>

              <select
                value={filterCohort}
                onChange={(e) => setFilterCohort(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="All">All Cohorts ({students.length})</option>
                <option value="Group A">Group A – ALC</option>
                <option value="Group B">Group B – FLC</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>

              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="All">All Sections</option>
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
                <option value="C">Sec C</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchRoster}
                  onChange={(e) => setSearchRoster(e.target.value)}
                  placeholder="Search roll no..."
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Roster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((stu) => {
              const isGroupA = stu.cohort === 'Group A';

              return (
                <div
                  key={stu.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden hover:border-dhanekula-royal/60 dark:hover:border-dhanekula-royal/60 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-dhanekula-royal transition-colors">{stu.name}</h3>
                      <p className="text-[10px] text-dhanekula-royal dark:text-dhanekula-400 font-mono font-bold">Roll: {stu.rollNumber} • Batch {stu.batch || '2023 - 2027'}</p>
                    </div>

                    {/* Cohort Selector / Badge */}
                    {role === 'faculty' ? (
                      <select
                        value={stu.cohort}
                        onChange={(e) => updateStudentCohort(stu.id, e.target.value as CohortType)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border cursor-pointer ${
                          isGroupA
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200/50'
                        }`}
                      >
                        <option value="Group A">Group A (ALC)</option>
                        <option value="Group B">Group B (FLC)</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          isGroupA
                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/50'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/50'
                        }`}
                      >
                        {stu.cohort}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">GPA</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{stu.gpa} / 10</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Attendance</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{stu.attendance}%</span>
                    </div>
                  </div>

                  {/* Strengths & Focus Areas */}
                  <div className="space-y-0.5 text-[10px] leading-relaxed">
                    <p className="text-slate-550 dark:text-slate-400">
                      <strong className="text-slate-805 dark:text-slate-200">Strengths:</strong> {stu.strengths.join(', ')}
                    </p>
                    <p className="text-slate-550 dark:text-slate-400">
                      <strong className="text-slate-805 dark:text-slate-200">Focus Area:</strong> {stu.focusAreas.join(', ')}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
