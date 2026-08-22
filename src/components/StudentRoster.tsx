import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, GraduationCap } from 'lucide-react';

export const StudentRoster: React.FC = () => {
  const { students } = useApp();
  const [filterBatch, setFilterBatch] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>('All');
  const [filterSection, setFilterSection] = useState<string>('All');
  const [searchRoster, setSearchRoster] = useState('');

  const filteredStudents = students.filter((stu) => {
    const matchesBatch = filterBatch === 'All' || stu.batch === filterBatch;
    const matchesYear = filterYear === 'All' || (stu.year || '3rd Year') === filterYear;
    const matchesSection = filterSection === 'All' || (stu.section || 'A') === filterSection;
    const matchesSearch =
      searchRoster === '' ||
      stu.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(searchRoster.toLowerCase());
    return matchesBatch && matchesYear && matchesSection && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight uppercase">
            <Users className="h-4.5 w-4.5 text-dhanekula-royal" />
            Student Directory
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Unified student roster and academic records ({filteredStudents.length} Students)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
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
              placeholder="Search name or roll..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Roster Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 italic text-xs">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((stu) => (
            <div
              key={stu.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative overflow-hidden hover:border-dhanekula-royal/60 dark:hover:border-dhanekula-royal/60 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-dhanekula-royal transition-colors">
                    {stu.name}
                  </h3>
                  <p className="text-[10px] text-dhanekula-royal dark:text-dhanekula-400 font-mono font-bold">
                    Roll: {stu.rollNumber} • {stu.batch || '2023 - 2027'}
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {stu.year || '3rd Year'} • Sec {stu.section || 'A'}
                </span>
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
                {stu.strengths && stu.strengths.length > 0 && (
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Strengths:</strong> {stu.strengths.join(', ')}
                  </p>
                )}
                {stu.focusAreas && stu.focusAreas.length > 0 && (
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-800 dark:text-slate-200">Focus Areas:</strong> {stu.focusAreas.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
