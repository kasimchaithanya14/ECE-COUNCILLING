import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TeachingTask } from '../types';
import {
  Layers,
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
  AlertCircle,
  Timer,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  FileCheck
} from 'lucide-react';

export const TeachingTasksTracker: React.FC = () => {
  const { publicTeachingTasks, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [previewTask, setPreviewTask] = useState<TeachingTask | null>(null);

  const departments = ['All', 'ECE', 'EEE', 'CSE', 'Mechanical', 'Civil', 'AI & DS'];
  const statusOptions = ['All', 'Completed', 'Submitted', 'Pending'];

  // Helper to determine real completion status
  const getTaskStatusCategory = (task: TeachingTask): 'Completed' | 'Submitted' | 'Pending' => {
    if (task.status === 'Approved' || task.submission_status === 'Approved') {
      return 'Completed';
    }
    if (task.status === 'Submitted' || task.submission_status === 'Submitted') {
      return 'Submitted';
    }
    return 'Pending';
  };

  const filteredTasks = publicTeachingTasks.filter((task) => {
    const statusCat = getTaskStatusCategory(task);
    const matchesDept = selectedDept === 'All' || task.department === selectedDept;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Completed' && statusCat === 'Completed') ||
      (selectedStatus === 'Submitted' && statusCat === 'Submitted') ||
      (selectedStatus === 'Pending' && statusCat === 'Pending');

    const matchesSearch =
      searchTerm === '' ||
      task.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.sub_admin_name && task.sub_admin_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.sub_admin_username && task.sub_admin_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.submission_description && task.submission_description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDept && matchesStatus && matchesSearch;
  });

  const completedCount = publicTeachingTasks.filter(t => getTaskStatusCategory(t) === 'Completed').length;
  const submittedCount = publicTeachingTasks.filter(t => getTaskStatusCategory(t) === 'Submitted').length;
  const pendingCount = publicTeachingTasks.filter(t => getTaskStatusCategory(t) === 'Pending').length;

  const getFileIcon = (fileName?: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
    if (ext === 'ppt' || ext === 'pptx') return <FileSpreadsheet className="h-4 w-4 text-amber-500 shrink-0" />;
    return <File className="h-4 w-4 text-emerald-500 shrink-0" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Attached Resource';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handleShare = (task: TeachingTask) => {
    if (navigator.share) {
      navigator.share({
        title: task.topic,
        text: `Innovative Teaching Directive: ${task.topic} at Dhanekula ECE`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Directive link copied to clipboard!');
    }
  };

  return (
    <section className="space-y-6 animate-fade-in my-6">
      
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Layers className="h-3.5 w-3.5" />
                Delegated Teaching Directives
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Live Sub-Admin Completion Tracking
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-amber-400 shrink-0 animate-bounce" />
              Assigned Innovative Teaching Tasks & Directives
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Institutional dashboard tracking innovative pedagogy tasks assigned by Super Admin to faculty Sub-Admins, target deadlines, submitted deliverables, and verified completion status.
            </p>
          </div>

          {/* Metrics Counter Pill */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
              <div className="p-2 bg-blue-600/30 rounded-xl text-blue-300 border border-blue-400/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black text-white">{publicTeachingTasks.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Tasks</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-500/30">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300 border border-emerald-400/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black text-emerald-300">{completedCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-amber-950/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-500/30">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/20">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-black text-amber-300">{pendingCount}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">In Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & View Switcher */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, faculty coordinator, or guidelines..."
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

          {/* Filters & Mode Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Depts' : `Dept: ${d}`}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Status' : s === 'Completed' ? 'Completed & Verified' : s === 'Submitted' ? 'Submitted (In Review)' : 'Pending / In Progress'}
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

      {/* Main Content: Cards vs Table */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Layers className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Teaching Tasks Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your status or department filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* --- 1. RESPONSIVE CARDS GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const statusCat = getTaskStatusCategory(task);
            const isCompleted = statusCat === 'Completed';
            const isSubmitted = statusCat === 'Submitted';

            return (
              <div
                key={task.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-md hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : isSubmitted ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}></div>

                <div className="space-y-4">
                  
                  {/* Top Badges & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {task.department || 'ECE'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.no_of_faculty} Faculty
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : isSubmitted
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed & Verified</span>
                        </>
                      ) : isSubmitted ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Submitted (In Review)</span>
                        </>
                      ) : (
                        <>
                          <Timer className="h-3 w-3" />
                          <span>In Progress</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Topic Title */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.topic}
                    </h3>
                    
                    {/* Target Deadline */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        Target: {task.date}
                      </span>
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {task.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Directive Instructions */}
                  {task.description && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Super Admin Directive:
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-850/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {task.description}
                      </p>
                    </div>
                  )}

                  {/* Faculty Coordinator Sub-Admin Info */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-400">Faculty Coordinator:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {task.sub_admin_name || 'Department Faculty'}
                    </span>
                  </div>

                  {/* Sub-Admin Completion Deliverable Box */}
                  {(isCompleted || isSubmitted) && task.submission_id ? (
                    <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed Deliverable Uploaded</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {task.submission_date}
                        </span>
                      </div>

                      {task.submission_description && (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                          {task.submission_description}
                        </p>
                      )}

                      {task.submission_file_path && (
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            {getFileIcon(task.submission_file_name)}
                            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                              {task.submission_file_name || 'Pedagogy-Document.pdf'}
                            </span>
                          </div>

                          <a
                            href={task.submission_file_path}
                            download={task.submission_file_name || 'methodology-deliverable.pdf'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-all shrink-0"
                            title="Download Completed Resource"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                      <Timer className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>Sub-Admin is actively working on this teaching methodology.</span>
                    </div>
                  )}

                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTask(task)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-500" />
                    <span>View Directive & Details</span>
                  </button>

                  {task.submission_file_path && (
                    <a
                      href={task.submission_file_path}
                      download={task.submission_file_name || 'teaching-deliverable.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all shrink-0"
                      title={`Download ${task.submission_file_name || 'Attached Resource'}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleShare(task)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
                    title="Share Directive"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* --- 2. PUBLIC TABLE VIEW --- */
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 text-center w-14">S.No</th>
                  <th className="py-4 px-4">Target Date</th>
                  <th className="py-4 px-5">Directive Topic</th>
                  <th className="py-4 px-4">Coordinator / Dept</th>
                  <th className="py-4 px-4 text-center">Faculty</th>
                  <th className="py-4 px-4">Completion Status</th>
                  <th className="py-4 px-5">Directive Summary & Outcome</th>
                  <th className="py-4 px-4 text-right">Deliverable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTasks.map((task, index) => {
                  const statusCat = getTaskStatusCategory(task);
                  const isCompleted = statusCat === 'Completed';
                  const isSubmitted = statusCat === 'Submitted';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. S.No */}
                      <td className="py-4 px-4 text-center font-extrabold text-slate-400">
                        #{index + 1}
                      </td>

                      {/* 2. Target Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          {task.date}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {task.time || '10:30 AM'}
                        </div>
                      </td>

                      {/* 3. Topic Name */}
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white max-w-xs">
                        <span className="block truncate hover:text-clip text-xs">
                          {task.topic}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-1 border border-blue-200/60 dark:border-blue-900/60">
                          {task.department || 'ECE'}
                        </span>
                      </td>

                      {/* 4. Faculty Coordinator */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {task.sub_admin_name || 'Sub Admin'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Dept of {task.department || 'ECE'}
                        </div>
                      </td>

                      {/* 5. Faculty Count */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Users className="h-3 w-3" />
                          {task.no_of_faculty}
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : isSubmitted
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        }`}>
                          {isCompleted ? 'Completed & Verified' : isSubmitted ? 'Submitted (In Review)' : 'In Progress'}
                        </span>
                      </td>

                      {/* 7. Summary */}
                      <td className="py-4 px-5 max-w-sm">
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {task.submission_description || task.description || 'Directive guidelines for faculty coordinator.'}
                        </p>
                      </td>

                      {/* 8. Actions / Deliverables */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewTask(task)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
                            title="View Full Directive Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          {task.submission_file_path && (
                            <a
                              href={task.submission_file_path}
                              download={task.submission_file_name || 'teaching-deliverable.pdf'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1"
                              title="Download Completed Deliverable"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">File</span>
                            </a>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED DIRECTIVE & COMPLETION MODAL */}
      {previewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Dept: {previewTask.department || 'ECE'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {previewTask.no_of_faculty} Faculty Involved
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    getTaskStatusCategory(previewTask) === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : getTaskStatusCategory(previewTask) === 'Submitted'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {getTaskStatusCategory(previewTask) === 'Completed' ? 'Completed & Verified' : getTaskStatusCategory(previewTask) === 'Submitted' ? 'Submitted (In Review)' : 'Pending / In Progress'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {previewTask.topic}
                </h3>
              </div>

              <button
                onClick={() => setPreviewTask(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Date</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{previewTask.date}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Time</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{previewTask.time || '10:30 AM'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Coordinator</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                  {previewTask.sub_admin_name || 'Sub Admin'}
                </span>
              </div>
            </div>

            {/* Directive Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-500" />
                <span>Super Admin Directive Guidelines & Expectations</span>
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {previewTask.description || 'No specific instructions specified.'}
              </div>
            </div>

            {/* Sub-Admin Completion Details */}
            {previewTask.submission_id ? (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Sub-Admin Completed Implementation & Deliverable</span>
                </h4>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span>Submitted by {previewTask.sub_admin_name} on {previewTask.submission_date} at {previewTask.submission_time}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {previewTask.submission_description}
                  </p>

                  {previewTask.submission_feedback && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <span className="font-black text-emerald-700 dark:text-emerald-300 block mb-0.5">Super Admin Verification Feedback:</span>
                      <span className="text-slate-600 dark:text-slate-400">{previewTask.submission_feedback}</span>
                    </div>
                  )}

                  {previewTask.submission_file_path && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {getFileIcon(previewTask.submission_file_name)}
                        <div className="truncate">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {previewTask.submission_file_name || 'Deliverable.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {formatFileSize(previewTask.submission_file_size)}
                          </div>
                        </div>
                      </div>

                      <a
                        href={previewTask.submission_file_path}
                        download={previewTask.submission_file_name || 'teaching-deliverable.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all shrink-0"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Deliverable</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-black block flex items-center gap-1">
                  <Timer className="h-4 w-4 text-amber-500" />
                  <span>Task Directive in Progress</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  The faculty coordinator ({previewTask.sub_admin_name}) has received this directive and is currently compiling the pedagogy materials and student outcomes for submission.
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewTask(null)}
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
