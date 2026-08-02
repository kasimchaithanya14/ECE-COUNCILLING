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
  Users
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
          <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <Calendar className="h-5 w-5 text-cyberRed-500" />
            Weekly Activity Plan (Differentiated Timetable)
          </h2>
          <p className="text-xs text-slate-400">
            Parallel daily schedule comparing Advanced Learning Cohort (Group A) and Foundation Cohort (Group B)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyberRed-500 animate-pulse"></span> Group A (ALC)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span> Group B (FLC)
          </span>
        </div>
      </div>

      {/* Schedule Container */}
      <div className="overflow-hidden rounded-3xl border border-cyberRed-900/40 bg-obsidian-900/80 backdrop-blur-xl shadow-neon-red-lg">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-obsidian-950 p-4 border-b border-cyberRed-900/60 text-xs font-black text-slate-300 uppercase tracking-wider">
          <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 text-cyberRed-400">
            <Clock className="h-4 w-4 text-cyberRed-500" />
            <span>Day & Time</span>
          </div>
          <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5 text-cyberRed-400">
            <Zap className="h-4 w-4" />
            <span>Group A Activity (Advanced)</span>
          </div>
          <div className="col-span-4 sm:col-span-4 flex items-center gap-1.5 text-rose-400">
            <Users className="h-4 w-4" />
            <span>Group B Activity (Foundation)</span>
          </div>
          <div className="col-span-1 text-right hidden sm:block text-slate-500">
            <span>Edit</span>
          </div>
        </div>

        {/* Schedule Rows */}
        <div className="divide-y divide-slate-800/60">
          {weeklyPlan.map((plan) => {
            const isEditing = editingDayId === plan.id;
            const matchedAMethod = teachingMethods.find(m => m.id === plan.groupAMethodId);
            const matchedBMethod = teachingMethods.find(m => m.id === plan.groupBMethodId);

            return (
              <div
                key={plan.id}
                className="grid grid-cols-12 p-4 sm:p-5 items-center gap-3 hover:bg-obsidian-950/60 transition-colors"
              >
                
                {/* Day & Time Slot */}
                <div className="col-span-12 sm:col-span-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">
                      {plan.day}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        plan.status === 'Completed'
                          ? 'bg-cyberRed-950 text-cyberRed-400 border border-cyberRed-800'
                          : plan.status === 'In Progress'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-obsidian-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-bold">
                    {plan.timeSlot || '09:30 AM - 11:30 AM'}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-cyberRed-500" />
                    <span className="truncate">{plan.location || 'ECE Dept'}</span>
                  </p>
                </div>

                {/* Group A Activity */}
                <div className="col-span-12 sm:col-span-5 space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedGroupA}
                      onChange={(e) => setEditedGroupA(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white font-bold"
                    />
                  ) : (
                    <div
                      onClick={() => matchedAMethod && setSelectedMethod(matchedAMethod)}
                      className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-cyberRed-900/60 hover:border-cyberRed-500 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyberRed-400">
                          Group A • Advanced Strategy
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-cyberRed-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-black text-white">
                        {plan.groupAActivity}
                      </p>
                    </div>
                  )}
                </div>

                {/* Group B Activity */}
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedGroupB}
                      onChange={(e) => setEditedGroupB(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-2xl border border-red-900 bg-obsidian-950 text-white font-bold"
                    />
                  ) : (
                    <div
                      onClick={() => matchedBMethod && setSelectedMethod(matchedBMethod)}
                      className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-red-950/60 hover:border-rose-500 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                          Group B • Foundation Strategy
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-black text-white">
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
                            className="px-2 py-1 rounded-xl bg-cyberRed-600 text-white font-bold text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDayId(null)}
                            className="px-2 py-1 rounded-xl bg-obsidian-950 text-slate-400 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingDay(plan)}
                          className="p-2 rounded-2xl text-slate-400 hover:text-cyberRed-400 hover:bg-obsidian-950 transition-colors"
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
