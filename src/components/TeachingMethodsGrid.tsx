import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Target,
  ArrowUpRight,
  Layers,
  Video,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes('youtube.com/embed/')) {
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }
    return trimmed;
  }

  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  if (trimmed.includes('youtu')) {
    const idMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
    if (idMatch && idMatch[1]) {
      return `https://www.youtube.com/embed/${idMatch[1]}`;
    }
  }

  return null;
};

export const TeachingMethodsGrid: React.FC = () => {
  const {
    teachingMethods,
    activeCohort,
    searchQuery,
    setSelectedMethod
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Active Learning',
    'Innovative',
    'Assessment',
    'Peer & Collaborative',
    'AI & Tech Supported',
  ];

  const filteredMethods = teachingMethods.filter((method) => {
    const matchesCohort = activeCohort === 'All' || method.cohort === activeCohort;
    const matchesCategory = selectedCategory === 'All' || method.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.implementation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.expectedOutcome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCohort && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-slide-up-delay-2">
      
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <BookOpen className="h-5 w-5 text-dhanekula-royal animate-subtle-float" />
              Innovative Teaching–Learning Methods ({filteredMethods.length})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-royal/20 dark:text-dhanekula-300 border border-dhanekula-royal/30">
              Unified Learning Cohort
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Explore active learning strategies, watch integrated video lectures directly on this page, and click any card for full curriculum materials.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md scale-105'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Methods Grid */}
      {filteredMethods.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Teaching Methods Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => {
            const embedUrl = getYouTubeEmbedUrl(method.videoUrl);

            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method)}
                className="group relative flex flex-col justify-between rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-dhanekula-royal/60 dark:hover:border-dhanekula-royal/60 shadow-md hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Cohort Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <div className="space-y-4 pt-1">
                  
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-dhanekula-royal/10 text-dhanekula-royal dark:bg-dhanekula-navy/60 dark:text-dhanekula-300 border border-dhanekula-royal/20">
                        Unified Learning Cohort (ULC)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {method.category}
                      </span>
                    </div>

                    {method.featured && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Method Name */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-dhanekula-royal dark:group-hover:text-dhanekula-300 transition-colors flex items-center justify-between">
                      <span>{method.name}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-dhanekula-royal group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </h3>
                  </div>

                  {/* YouTube Video Section (Embedded and Playable Directly on Main Page) */}
                  {embedUrl ? (
                    <div
                      className="space-y-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-md">
                        <iframe
                          src={`${embedUrl}?rel=0`}
                          title={`${method.name} Video Lecture`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1">
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                          <Video className="h-3.5 w-3.5" />
                          Integrated Video Lecture
                        </span>
                        <a
                          href={method.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 font-bold transition-colors"
                        >
                          <span>YouTube</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {/* Implementation & Outcome */}
                  <div className="space-y-2.5 pt-1">
                    
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="h-3 w-3 text-dhanekula-royal" />
                        Implementation
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {method.implementation}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl border space-y-1 bg-dhanekula-royal/5 dark:bg-dhanekula-navy/30 border-dhanekula-royal/20 text-slate-900 dark:text-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-dhanekula-royal dark:text-dhanekula-300">
                        <Target className="h-3 w-3" />
                        Expected Outcome
                      </span>
                      <p className="text-xs font-extrabold leading-snug">
                        {method.expectedOutcome}
                      </p>
                    </div>

                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {method.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Footer Link Callout */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-dhanekula-royal dark:group-hover:text-dhanekula-300">
                  <span>View Details & Resources</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {method.materialsCount || 8} Files
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
