import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WeeklyActivity } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Edit,
  ArrowRight,
  Zap,
  Users,
  BookOpen
} from 'lucide-react';

export const WeeklySchedulePlanner: React.FC = () => {
  const { role, weeklyPlan, updateWeeklyActivity, setSelectedMethod, teachingMethods } = useApp();

  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editedGroupA, setEditedGroupA] = useState('');
  const [editedGroupB, setEditedGroupB] = useState('');
  const [editedSlot, setEditedSlot] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  const startEditingDay = (activity: WeeklyActivity) => {
    setEditingDayId(activity.id);
    setEditedGroupA(activity.groupAActivity);
    setEditedGroupB(activity.groupBActivity);
    setEditedSlot(activity.timeSlot || '');
    setEditedLocation(activity.location || '');
  };

  const saveEditedDay = (activity: WeeklyActivity) => {
    updateWeeklyActivity({
      ...activity,
      groupAActivity: editedGroupA,
      groupBActivity: editedGroupB,
      timeSlot: editedSlot,
      location: editedLocation,
    });
    setEditingDayId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Calendar className="h-5 w-5 text-dhanekula-royal animate-subtle-float" />
            Weekly Activity Plan (Unified Timetable)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Integrated daily learning schedule for Third-Year B.Tech ECE (Unified Learning Cohort)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300 border border-dhanekula-royal/20 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-dhanekula-royal animate-pulse"></span>
            Unified Learning Cohort (ULC)
          </span>
        </div>
      </div>

      {/* Schedule Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-dhanekula-royal" />
            <span>Day & Time</span>
          </div>
          <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5 text-dhanekula-royal dark:text-dhanekula-300">
            <Zap className="h-4 w-4" />
            <span>Core Lecture & Applied Session</span>
          </div>
          <div className="col-span-4 sm:col-span-4 flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Users className="h-4 w-4" />
            <span>Guided Lab & Remedial Support</span>
          </div>
          <div className="col-span-1 text-right hidden sm:block text-slate-400">
            <span>Edit</span>
          </div>
        </div>

        {/* Schedule Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {weeklyPlan.map((plan) => {
            const isEditing = editingDayId === plan.id;
            const matchedAMethod = teachingMethods.find(m => m.id === plan.groupAMethodId);
            const matchedBMethod = teachingMethods.find(m => m.id === plan.groupBMethodId);

            return (
              <div
                key={plan.id}
                className="grid grid-cols-12 p-4 sm:p-5 items-center gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                
                {/* Day & Time Slot */}
                <div className="col-span-12 sm:col-span-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {plan.day}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        plan.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : plan.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                    {plan.timeSlot || '09:30 AM - 11:30 AM'}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-dhanekula-royal" />
                    <span className="truncate">{plan.location || 'ECE Dept'}</span>
                  </p>
                </div>

                {/* Applied Strategy Session */}
                <div className="col-span-12 sm:col-span-5 space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedGroupA}
                      onChange={(e) => setEditedGroupA(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  ) : (
                    <div
                      onClick={() => matchedAMethod && setSelectedMethod(matchedAMethod)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-dhanekula-royal cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-dhanekula-royal dark:text-dhanekula-300 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Unified Application Session
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-dhanekula-royal opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {plan.groupAActivity}
                      </p>
                    </div>
                  )}
                </div>

                {/* Guided Practice & Labs */}
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedGroupB}
                      onChange={(e) => setEditedGroupB(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  ) : (
                    <div
                      onClick={() => matchedBMethod && setSelectedMethod(matchedBMethod)}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Guided Lab & Peer Review
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {plan.groupBActivity}
                      </p>
                    </div>
                  )}
                </div>

                {/* Faculty Edit Control */}
                <div className="col-span-12 sm:col-span-1 text-right">
                  {role === 'faculty' && (
                    <div>
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => saveEditedDay(plan)}
                            className="px-2 py-1 rounded-xl bg-dhanekula-royal text-white font-bold text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDayId(null)}
                            className="px-2 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingDay(plan)}
                          className="p-2 rounded-2xl text-slate-400 hover:text-dhanekula-royal hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Faculty Edit Schedule Slot"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
