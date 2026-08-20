import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PublicCounsellingUpdate } from '../types';
import { Calendar, User, HeartHandshake, X } from 'lucide-react';

export const StudentCounsellingPublic: React.FC = () => {
  const { publicCounsellingUpdates } = useApp();
  const [selectedUpdate, setSelectedUpdate] = useState<PublicCounsellingUpdate | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight uppercase">
          <HeartHandshake className="h-5 w-5 text-emerald-600" />
          ECE Student Counselling Updates
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Through differentiated counseling guidance, DIET's ECE department helps both Advanced Learners (Group A) and Foundation Learners (Group B) navigate study schedules, career planning, technical skill acquisition, and personal development goals.
        </p>
      </div>

      {/* Grid of Updates */}
      {publicCounsellingUpdates.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 italic text-xs">
          No student counselling highlights published recently. Check back soon for new updates.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicCounsellingUpdates.map((update) => (
            <div
              key={update.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-4">
                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-250/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    🎓 {update.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(update.publicDate)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                  {update.title}
                </h3>

                {/* Public Summary */}
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed line-clamp-3">
                  {update.publicSummary}
                </p>
              </div>

              {/* Submitter & Read More Bar */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold">
                  <User className="h-3.5 w-3.5" />
                  <span>{update.studentName}</span>
                </div>
                
                <button
                  onClick={() => setSelectedUpdate(update)}
                  className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-250/20">
                  {selectedUpdate.category} Update
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                  {selectedUpdate.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-850 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedUpdate.publicSummary}
              </div>

              {/* Safe Metadata Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Participant</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedUpdate.studentName}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Session Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-0.5">{formatDate(selectedUpdate.publicDate)}</span>
                </div>
              </div>

              {selectedUpdate.counsellorName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[9px] text-slate-450 font-bold block">Assigned Counsellor</span>
                    <span className="font-bold text-slate-800 dark:text-slate-250 text-[11px] block">{selectedUpdate.counsellorName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUpdate(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition-all btn-micro-interaction"
              >
                Close Update
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
