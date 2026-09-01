import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeachingSubmission } from '../types';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  CheckCircle2,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ExternalLink,
  Eye,
  X,
  Building2,
  Award,
  Share2,
  Layers
} from 'lucide-react';

interface InnovativeMethodsShowcaseProps {
  onSwitchToTasks?: () => void;
}

export const InnovativeMethodsShowcase: React.FC<InnovativeMethodsShowcaseProps> = ({ onSwitchToTasks }) => {
  const { publicShowcaseMethods, publicTeachingTasks, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [previewMethod, setPreviewMethod] = useState<TeachingSubmission | null>(null);

  // Departments list for filter
  const departments = ['All', 'ECE', 'EEE', 'CSE', 'Mechanical', 'Civil', 'AI & DS'];

  const filteredMethods = publicShowcaseMethods.filter((item) => {
    const matchesDept = selectedDept === 'All' || item.department === selectedDept;
    const matchesSearch =
      searchTerm === '' ||
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.faculty_lead_name && item.faculty_lead_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sub_admin_name && item.sub_admin_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const getFileIcon = (fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
    if (ext === 'ppt' || ext === 'pptx') return <FileSpreadsheet className="h-4 w-4 text-amber-500 shrink-0" />;
    return <File className="h-4 w-4 text-emerald-500 shrink-0" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF Document';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handleShare = (method: TeachingSubmission) => {
    if (navigator.share) {
      navigator.share({
        title: method.topic,
        text: `Explore Innovative Teaching Method: ${method.topic} at Dhanekula ECE`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Showcase link copied to clipboard!');
    }
  };

  return (
    <section className="space-y-6 animate-fade-in my-6">
      
      {/* Showcase Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified & Super Admin Approved
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Institutional Innovation Hub
              </span>
              {onSwitchToTasks && (
                <button
                  onClick={onSwitchToTasks}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5 text-purple-300" />
                  <span>View Tasks & Directives Tracker ({publicTeachingTasks.length}) →</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Award className="h-7 w-7 text-amber-400 shrink-0 animate-bounce" />
              Innovative Teaching–Learning Methods Showcase
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore officially verified pedagogical innovations, laboratory workflows, flipped-classroom models, and active learning practices curated and submitted by our faculty.
            </p>
          </div>

          {/* Quick Metrics Counter */}
          <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15">
            <div className="p-3 bg-blue-600/30 rounded-xl text-blue-300 border border-blue-400/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{publicShowcaseMethods.length}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Published Showcases</div>
            </div>
          </div>
        </div>

        {/* Toolbar Filter & View Switcher */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, faculty, or pedagogy keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Filter & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : `Dept: ${d}`}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Public Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Showcase Content: Grid vs Table */}
      {filteredMethods.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Approved Showcases Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your department filter or search keywords.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* --- 1. RESPONSIVE CARDS GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <div
              key={method.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-md hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"></div>

              <div className="space-y-4">
                
                {/* Meta Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {method.department || 'ECE'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {method.no_of_faculty} Faculty {method.no_of_faculty > 1 ? 'Involved' : 'In-Charge'}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Approved
                  </span>
                </div>

                {/* Topic Title */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {method.topic}
                  </h3>
                  
                  {/* Date & Submitter Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {method.date}
                    </span>
                    {method.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {method.time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pedagogy / Method Details Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {method.description}
                </p>

                {/* Faculty Author Tag */}
                {(method.faculty_lead_name || method.sub_admin_name) && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-400">Faculty Coordinator:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {method.faculty_lead_name || method.sub_admin_name}
                    </span>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setPreviewMethod(method)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                  <span>View Details</span>
                </button>

                {method.file_path && (
                  <a
                    href={method.file_path}
                    download={method.file_name || 'innovative-methodology.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all shrink-0"
                    title={`Download ${method.file_name || 'Attached Resource'}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                )}

                <button
                  onClick={() => handleShare(method)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                  title="Share Method"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      ) : (

        /* --- 2. PUBLIC TABLE VIEW --- */
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 text-center w-14">S.No</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-5">Topic Name</th>
                  <th className="py-4 px-4 text-center">Faculty Involved</th>
                  <th className="py-4 px-4">Coordinator / Dept</th>
                  <th className="py-4 px-5">Method Highlights</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMethods.map((method, index) => (
                  <tr
                    key={method.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* 1. S.No */}
                    <td className="py-4 px-4 text-center font-extrabold text-slate-400">
                      #{index + 1}
                    </td>

                    {/* 2. Date & Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        {method.date}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {method.time || 'N/A'}
                      </div>
                    </td>

                    {/* 3. Topic Name */}
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white max-w-xs">
                      <span className="block truncate hover:text-clip text-xs">
                        {method.topic}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-1 border border-blue-200/60 dark:border-blue-900/60">
                        {method.department || 'ECE'}
                      </span>
                    </td>

                    {/* 4. Number of Faculty */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Users className="h-3 w-3" />
                        {method.no_of_faculty}
                      </span>
                    </td>

                    {/* 5. Sub Admin / Faculty Name & Dept */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-800 dark:text-slate-200">
                        {method.faculty_lead_name || method.sub_admin_name || 'Department Faculty'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Dept of {method.department || 'ECE'}
                      </div>
                    </td>

                    {/* 6. Description / Highlights */}
                    <td className="py-4 px-5 max-w-sm">
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {method.description}
                      </p>
                    </td>

                    {/* 7. Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewMethod(method)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                          title="View Full Method Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        {method.file_path && (
                          <a
                            href={method.file_path}
                            download={method.file_name || 'innovative-method.pdf'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1"
                            title="Download Attachment"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED METHOD PREVIEW MODAL */}
      {previewMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Dept: {previewMethod.department || 'ECE'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {previewMethod.no_of_faculty} Faculty Involved
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Verified & Approved
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {previewMethod.topic}
                </h3>
              </div>

              <button
                onClick={() => setPreviewMethod(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submission Date</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{previewMethod.date}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Captured</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{previewMethod.time || '10:00 AM'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coordinator</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                  {previewMethod.faculty_lead_name || previewMethod.sub_admin_name || 'Faculty Lead'}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Detailed Methodology & Pedagogy Implementation
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {previewMethod.description}
              </div>
            </div>

            {/* Attached Resource Info */}
            {previewMethod.file_path && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Attached Resource / Curriculum Guide
                </h4>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      {getFileIcon(previewMethod.file_name)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {previewMethod.file_name || 'Curriculum-Resource.pdf'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {formatFileSize(previewMethod.file_size)}
                      </div>
                    </div>
                  </div>

                  <a
                    href={previewMethod.file_path}
                    download={previewMethod.file_name || 'innovative-method.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download File</span>
                  </a>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewMethod(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
