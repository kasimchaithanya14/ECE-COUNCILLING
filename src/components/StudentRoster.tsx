import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search } from 'lucide-react';
import { CohortType } from '../types';

export const StudentRoster: React.FC = () => {
  const { role, students, updateStudentCohort } = useApp();
  const [filterCohort, setFilterCohort] = useState<string>('All');
  const [searchRoster, setSearchRoster] = useState('');

  const filteredStudents = students.filter((stu) => {
    const matchesCohort = filterCohort === 'All' || stu.cohort === filterCohort;
    const matchesSearch =
      searchRoster === '' ||
      stu.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(searchRoster.toLowerCase());
    return matchesCohort && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Users className="h-5 w-5 text-cyberRed-500" />
            Third-Year Student Roster & Cohort Assignment
          </h2>
          <p className="text-xs text-slate-400">
            {role === 'faculty'
              ? 'Faculty Management: Dynamically assign students between Advanced (Group A) and Foundation (Group B) cohorts.'
              : 'Student Directory (Read-Only View).'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-900 text-white font-bold"
          >
            <option value="All">All Cohorts ({students.length})</option>
            <option value="Group A">Group A – ALC</option>
            <option value="Group B">Group B – FLC</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchRoster}
              onChange={(e) => setSearchRoster(e.target.value)}
              placeholder="Search roll no..."
              className="pl-9 pr-3 py-2 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-900 text-white"
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
              className="p-5 rounded-3xl bg-obsidian-900/80 border border-cyberRed-900/40 backdrop-blur-xl shadow-md space-y-3 relative overflow-hidden hover:border-cyberRed-600/70 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white">{stu.name}</h3>
                  <p className="text-xs text-cyberRed-400 font-mono">Roll: {stu.rollNumber}</p>
                </div>

                {/* Cohort Selector / Badge */}
                {role === 'faculty' ? (
                  <select
                    value={stu.cohort}
                    onChange={(e) => updateStudentCohort(stu.id, e.target.value as CohortType)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black border cursor-pointer ${
                      isGroupA
                        ? 'bg-cyberRed-950 text-cyberRed-400 border-cyberRed-800'
                        : 'bg-red-950 text-red-300 border-red-800'
                    }`}
                  >
                    <option value="Group A">Group A (ALC)</option>
                    <option value="Group B">Group B (FLC)</option>
                  </select>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                      isGroupA
                        ? 'bg-cyberRed-950 text-cyberRed-400 border border-cyberRed-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {stu.cohort}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">GPA</span>
                  <span className="font-black text-white">{stu.gpa} / 10</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance</span>
                  <span className="font-black text-white">{stu.attendance}%</span>
                </div>
              </div>

              {/* Strengths & Focus Areas */}
              <div className="space-y-1 text-[11px]">
                <p className="text-slate-400">
                  <strong className="text-white">Strengths:</strong> {stu.strengths.join(', ')}
                </p>
                <p className="text-slate-400">
                  <strong className="text-white">Focus Area:</strong> {stu.focusAreas.join(', ')}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
