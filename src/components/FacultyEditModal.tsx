import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Edit3, Plus } from 'lucide-react';
import { CohortType, TeachingMethod } from '../types';

export const FacultyEditModal: React.FC = () => {
  const {
    role,
    isFacultyEditModalOpen,
    setIsFacultyEditModalOpen,
    editingMethod,
    addMethod,
    updateMethod,
    showToast,
  } = useApp();

  const [name, setName] = useState('');
  const [cohort, setCohort] = useState<CohortType>('Group A');
  const [implementation, setImplementation] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [category, setCategory] = useState<'Innovative' | 'Active Learning' | 'Assessment' | 'Peer & Collaborative' | 'AI & Tech Supported'>('Active Learning');
  const [detailedDescription, setDetailedDescription] = useState('');

  useEffect(() => {
    if (editingMethod) {
      setName(editingMethod.name);
      setCohort(editingMethod.cohort);
      setImplementation(editingMethod.implementation);
      setExpectedOutcome(editingMethod.expectedOutcome);
      setCategory(editingMethod.category);
      setDetailedDescription(editingMethod.detailedDescription || '');
    } else {
      setName('');
      setCohort('Group A');
      setImplementation('');
      setExpectedOutcome('');
      setCategory('Active Learning');
      setDetailedDescription('');
    }
  }, [editingMethod, isFacultyEditModalOpen]);

  if (!isFacultyEditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'faculty') {
      showToast('⚠️ Edit denied! Only Faculty members have permission to modify methods.');
      return;
    }

    if (editingMethod) {
      updateMethod({
        ...editingMethod,
        name,
        cohort,
        implementation,
        expectedOutcome,
        category,
        detailedDescription,
      });
    } else {
      const newMethod: TeachingMethod = {
        id: `method-${Date.now()}`,
        name,
        cohort,
        implementation,
        expectedOutcome,
        category,
        detailedDescription,
        tags: [category, cohort],
        materialsCount: 0,
      };
      addMethod(newMethod);
    }

    setIsFacultyEditModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-obsidian-900 rounded-3xl shadow-neon-red-lg border border-cyberRed-800/60 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyberRed-950 via-cyberRed-900 to-obsidian-950 text-white flex items-center justify-between border-b border-cyberRed-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyberRed-950 rounded-xl border border-cyberRed-800 shadow-neon-red">
              {editingMethod ? <Edit3 className="h-5 w-5 text-cyberRed-400" /> : <Plus className="h-5 w-5 text-cyberRed-400" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-cyberRed-950 px-2 py-0.5 rounded-md text-cyberRed-400 border border-cyberRed-800">
                Faculty Access Control
              </span>
              <h3 className="text-lg font-black text-white">
                {editingMethod ? `Edit Strategy: ${editingMethod.name}` : 'Add New Teaching–Learning Method'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsFacultyEditModalOpen(false)}
            className="p-1 rounded-full bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Teaching Method Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Flipped Classroom"
                className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Student Cohort
              </label>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value as CohortType)}
                className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500 font-bold"
              >
                <option value="Group A">Group A – Advanced Learning Cohort (ALC)</option>
                <option value="Group B">Group B – Foundation Learning Cohort (FLC)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Implementation Strategy (Exact PDF format)
            </label>
            <textarea
              rows={2}
              value={implementation}
              onChange={(e) => setImplementation(e.target.value)}
              placeholder="e.g. Students study videos/material before class; class used for applications"
              className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Expected Outcome (Exact PDF format)
            </label>
            <input
              type="text"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              placeholder="e.g. Higher-order thinking"
              className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Method Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500 font-semibold"
            >
              <option value="Active Learning">Active Learning</option>
              <option value="Innovative">Innovative</option>
              <option value="Assessment">Assessment</option>
              <option value="Peer & Collaborative">Peer & Collaborative</option>
              <option value="AI & Tech Supported">AI & Tech Supported</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Extended Workflow Description
            </label>
            <textarea
              rows={3}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="Actionable steps for students and faculty..."
              className="w-full p-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-950 text-white focus:ring-2 focus:ring-cyberRed-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFacultyEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-2xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-2xl bg-cyberRed-600 hover:bg-cyberRed-500 text-white shadow-neon-red"
            >
              {editingMethod ? 'Update Method' : 'Add Method'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
