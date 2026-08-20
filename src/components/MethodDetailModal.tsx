import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Layers,
  Target,
  FileText,
  Video,
  Sparkles,
  Bot,
  Edit3,
  Eye,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  GraduationCap,
  Image,
  Film,
  Download,
  Cpu,
  Upload
} from 'lucide-react';
import { CoursewareResource, MediaSubmission } from '../types';
import { MediaSubmissionModal } from './MediaSubmissionModal';

export const MethodDetailModal: React.FC = () => {
  const {
    role,
    selectedMethod,
    setSelectedMethod,
    resources,
    updateMethod,
    addResource,
    deleteResource,
    setViewingResource,
    setIsAITutorOpen,
    setIsDailyQuizOpen,
    showToast,
    fetchApprovedMedia
  } = useApp();

  const [approvedMedia, setApprovedMedia] = useState<MediaSubmission[]>([]);
  const [showSubmitMediaModal, setShowSubmitMediaModal] = useState(false);

  // Fetch approved media for this method on selection
  useEffect(() => {
    if (selectedMethod) {
      fetchApprovedMedia(selectedMethod.id).then(setApprovedMedia);
    } else {
      setApprovedMedia([]);
    }
  }, [selectedMethod]);

  const refreshMedia = async () => {
    if (selectedMethod) {
      const list = await fetchApprovedMedia(selectedMethod.id);
      setApprovedMedia(list);
    }
  };

  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [editedImplementation, setEditedImplementation] = useState('');
  const [editedOutcome, setEditedOutcome] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Attached resource drag and drop form state
  const [showAddResource, setShowAddResource] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resFileName, setResFileName] = useState('');
  const [resFileSize, setResFileSize] = useState('');
  const [resType, setResType] = useState<'video' | 'pdf' | 'quiz' | 'simulation' | 'code'>('pdf');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedMethod) return null;

  const isGroupA = selectedMethod.cohort === 'Group A';
  const methodResources = resources.filter(r => r.methodId === selectedMethod.id || r.cohort === selectedMethod.cohort);

  const startEdit = () => {
    setEditedImplementation(selectedMethod.implementation);
    setEditedOutcome(selectedMethod.expectedOutcome);
    setEditedDescription(selectedMethod.detailedDescription || '');
    setIsEditingInModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMethod({
      ...selectedMethod,
      implementation: editedImplementation,
      expectedOutcome: editedOutcome,
      detailedDescription: editedDescription,
    });
    setIsEditingInModal(false);
  };

  const processDroppedFile = (file: File) => {
    setResFileName(file.name);
    
    // Auto calculate file size string
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setResFileSize(file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`);

    // Auto set title if empty
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setResTitle(titleWithoutExt);

    // Auto detect material type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') setResType('pdf');
    else if (ext === 'mp4' || ext === 'mkv' || ext === 'webm' || ext === 'avi') setResType('video');
    else if (ext === 'v' || ext === 'sv' || ext === 'py' || ext === 'cpp' || ext === 'c' || ext === 'js') setResType('code');
    else if (ext === 'pdsprj' || ext === 'slx' || ext === 'mat' || ext === 'sch') setResType('simulation');

    showToast(`File attached: ${file.name} (${sizeInMB} MB)`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDroppedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processDroppedFile(e.dataTransfer.files[0]);
    }
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle) return;

    const newRes: CoursewareResource = {
      id: `res-custom-${Date.now()}`,
      title: resTitle,
      fileName: resFileName || `${resTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${resType === 'pdf' ? 'pdf' : resType === 'code' ? 'v' : 'mp4'}`,
      fileSize: resFileSize || '1.8 MB',
      type: resType,
      subject: 'ECE Third-Year Courseware',
      cohort: selectedMethod.cohort,
      methodId: selectedMethod.id,
      url: `https://dhanekula.ac.in/courseware/${resTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: `Courseware file attached for ${selectedMethod.name}`,
      addedBy: 'Dhanekula Faculty',
      dateAdded: new Date().toISOString().split('T')[0],
      downloads: 0,
      contentSnippet: `Dhanekula Institute of Engineering and Technology (Autonomous)\nCourseware File: ${resTitle}`,
    };

    addResource(newRes);
    setResTitle('');
    setResFileName('');
    setResFileSize('');
    setShowAddResource(false);
  };

  const handleDeleteResource = (id: string, title: string) => {
    if (confirm(`Delete attached resource "${title}"?`)) {
      deleteResource(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header Banner */}
        <div className={`p-6 sm:p-8 text-white relative ${
          isGroupA
            ? 'bg-gradient-to-r from-dhanekula-navy via-dhanekula-royal to-slate-900'
            : 'bg-gradient-to-r from-amber-600 via-orange-700 to-slate-900'
        }`}>
          <button
            onClick={() => setSelectedMethod(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
              {selectedMethod.cohort} • {isGroupA ? 'Advanced Learning Cohort (ALC)' : 'Foundation Learning Cohort (FLC)'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/20 text-white/90">
              {selectedMethod.category}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {selectedMethod.name}
          </h2>

          {/* Quick interactive trigger buttons */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {selectedMethod.name.includes('Flipped') && (
              <button
                onClick={() => showToast('Playing pre-class lecture video: Embedded DSP Systems Architecture')}
                className="px-3.5 py-1.5 rounded-xl bg-white text-dhanekula-navy font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-all shadow-md"
              >
                <Video className="h-4 w-4 text-dhanekula-royal" />
                <span>Play Pre-Class Video</span>
              </button>
            )}

            {selectedMethod.name.includes('Daily Concept Quiz') && (
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setIsDailyQuizOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-300 transition-all shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch 5-Question Daily Quiz</span>
              </button>
            )}

            {(selectedMethod.name.includes('AI') || selectedMethod.name.includes('Tutor')) && (
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setIsAITutorOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-purple-700 transition-all shadow-md"
              >
                <Bot className="h-4 w-4" />
                <span>Launch AI Tutor & Assistant</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Faculty Edit Panel vs View Panel */}
          {isEditingInModal ? (
            <form onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-dhanekula-50 dark:bg-dhanekula-950/30 border border-dhanekula-300 dark:border-dhanekula-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-dhanekula-900 dark:text-dhanekula-300 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Faculty Edit Mode: {selectedMethod.name}
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Implementation Strategy
                </label>
                <textarea
                  rows={3}
                  value={editedImplementation}
                  onChange={(e) => setEditedImplementation(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-dhanekula-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Outcome
                </label>
                <input
                  type="text"
                  value={editedOutcome}
                  onChange={(e) => setEditedOutcome(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-dhanekula-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Workflow Description
                </label>
                <textarea
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-dhanekula-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingInModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-dhanekula-navy text-white hover:bg-dhanekula-royal shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Implementation Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-dhanekula-600 dark:text-dhanekula-400 flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    Implementation Strategy
                  </span>
                  {role === 'faculty' && (
                    <button
                      onClick={startEdit}
                      className="text-xs text-dhanekula-600 dark:text-dhanekula-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  "{selectedMethod.implementation}"
                </p>
              </div>

              {/* Expected Outcome Box */}
              <div className="p-5 rounded-2xl bg-dhanekula-50 dark:bg-dhanekula-950/30 border border-dhanekula-200 dark:border-dhanekula-800 text-slate-900 dark:text-slate-100 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-dhanekula-700 dark:text-dhanekula-300">
                  <Target className="h-4 w-4" />
                  Expected Outcome
                </span>
                <p className="text-sm font-black leading-relaxed">
                  "{selectedMethod.expectedOutcome}"
                </p>
              </div>

            </div>
          )}

          {/* Detailed Workflow & Rationale */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-dhanekula-600" />
              Pedagogical Framework & Workflow
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {selectedMethod.detailedDescription ||
                'This teaching-learning strategy is systematically applied in Third-Year B.Tech ECE modules to optimize learning outcomes, ensure active student participation, and provide continuous evaluation metrics.'}
            </p>
          </div>

          {/* Attached Courseware & Digital Resources */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-dhanekula-600" />
                Attached Courseware & Study Materials ({methodResources.length})
              </h4>

              {role === 'faculty' && (
                <button
                  onClick={() => setShowAddResource(!showAddResource)}
                  className="px-3 py-1 rounded-xl bg-dhanekula-100 dark:bg-dhanekula-950 text-dhanekula-700 dark:text-dhanekula-300 font-bold text-xs flex items-center gap-1 hover:bg-dhanekula-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Attach Material</span>
                </button>
              )}
            </div>

            {/* DRAG & DROP ATTACH MATERIAL FORM FOR FACULTY */}
            {showAddResource && (
              <form onSubmit={handleCreateResource} className="p-5 rounded-2xl bg-dhanekula-50/90 dark:bg-dhanekula-950/60 border border-dhanekula-200 dark:border-dhanekula-800 space-y-4">
                <h5 className="text-xs font-black text-dhanekula-900 dark:text-dhanekula-300 uppercase tracking-wider">
                  Drag & Drop Local File to Attach
                </h5>

                {/* DRAG AND DROP ZONE */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center space-y-2 cursor-pointer transition-all ${
                    isDraggingFile
                      ? 'border-dhanekula-royal bg-dhanekula-100 dark:bg-dhanekula-900 scale-105'
                      : 'border-dhanekula-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-dhanekula-500'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-dhanekula-royal mx-auto animate-pulse" />
                  <div className="text-xs text-slate-700 dark:text-slate-200">
                    <span className="font-extrabold text-dhanekula-royal dark:text-dhanekula-300">
                      Drag & Drop file from your local computer here
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">or click to choose file from desktop</p>
                  </div>

                  {resFileName && (
                    <div className="pt-2 flex items-center justify-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Attached: {resFileName} ({resFileSize})</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resource Title (Auto-updated from dropped file)
                    </label>
                    <input
                      type="text"
                      placeholder="Title of attached file"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Material Type
                    </label>
                    <select
                      value={resType}
                      onChange={(e) => setResType(e.target.value as any)}
                      className="w-full p-2.5 text-xs rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Lecture</option>
                      <option value="simulation">Simulation File (Proteus/MATLAB)</option>
                      <option value="quiz">Interactive Quiz</option>
                      <option value="code">Source Code / Script</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-dhanekula-navy text-white hover:bg-dhanekula-royal shadow-md"
                  >
                    Save Attached File
                  </button>
                </div>
              </form>
            )}

            {/* Resources List */}
            {methodResources.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                No files uploaded yet for this method. Faculty members can attach resources above.
              </p>
            ) : (
              <div className="space-y-2">
                {methodResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-dhanekula-100 text-dhanekula-700 dark:bg-dhanekula-950 dark:text-dhanekula-300">
                        {res.type === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : res.type === 'simulation' ? (
                          <Cpu className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {res.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {res.subject} • Added by {res.addedBy}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {role === 'faculty' && (
                        <button
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete attached file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedMethod(null);
                          setViewingResource(res);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dhanekula-navy hover:bg-dhanekula-royal text-white text-xs font-bold transition-all shrink-0 shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Access File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photos & Public Media Submissions */}
          <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="h-4 w-4 text-emerald-600" />
                Photos & Media ({approvedMedia.length})
              </h4>
              <button
                onClick={() => setShowSubmitMediaModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-250/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors btn-micro-interaction flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Share Your Media</span>
              </button>
            </div>

            {approvedMedia.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                No verified media shared yet. Be the first to submit photos or document records above!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {approvedMedia.map((media) => {
                  const isImg = ['jpg', 'jpeg', 'png', 'webp'].some(ext => media.file_type.toLowerCase().includes(ext) || media.file_name.toLowerCase().endsWith(ext));
                  const isVideo = ['mp4', 'webm'].some(ext => media.file_type.toLowerCase().includes(ext) || media.file_name.toLowerCase().endsWith(ext));

                  return (
                    <div
                      key={media.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        {/* Media Preview Container */}
                        {isImg && (
                          <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-105 dark:bg-slate-950">
                            <img
                              src={media.file_path}
                              alt={media.file_name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        {isVideo && (
                          <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-black">
                            <video
                              src={media.file_path}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {!isImg && !isVideo && (
                          <div className="w-full h-16 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-55 dark:bg-slate-850 flex items-center gap-2.5 px-3">
                            <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-[11px] block truncate text-slate-850 dark:text-slate-200">{media.file_name}</span>
                              <span className="text-[9px] text-slate-450 block uppercase tracking-wider">{media.file_type.split('/').pop()} Document</span>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {media.description && (
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed italic bg-slate-50/50 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                            "{media.description}"
                          </p>
                        )}
                      </div>

                      {/* Submitter info bar */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-[10px]">
                        <div>
                          <span className="font-semibold text-slate-400 block">Submitted by:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">{media.submitter_name}</span>
                        </div>
                        <a
                          href={media.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition-all text-slate-700 dark:text-slate-300"
                        >
                          <Download className="h-3 w-3" />
                          <span>View file</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Media upload form modal trigger */}
          <MediaSubmissionModal
            isOpen={showSubmitMediaModal}
            onClose={() => {
              setShowSubmitMediaModal(false);
              refreshMedia();
            }}
            defaultMethodId={selectedMethod.id}
          />

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedMethod(null)}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Close Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
