import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Video, Download, Plus, Trash2, Cpu, Sparkles, X, Upload, Eye, CheckCircle2, FileCheck } from 'lucide-react';
import { CoursewareResource, CohortType } from '../types';

export const CoursewareResources: React.FC = () => {
  const { role, resources, addResource, deleteResource, setViewingResource, showToast } = useApp();

  const [selectedCohort, setSelectedCohort] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [resourceSearch, setResourceSearch] = useState<string>('');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [subject, setSubject] = useState('Digital Signal Processing');
  const [cohort, setCohort] = useState<CohortType | 'All'>('Group A');
  const [type, setType] = useState<'video' | 'pdf' | 'quiz' | 'simulation' | 'code'>('pdf');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjects = ['All', 'Digital Signal Processing', 'Communication Systems', 'Analog Electronics', 'VLSI Design', 'Microcontrollers', 'Circuit Theory'];

  const filteredResources = resources.filter((res) => {
    const matchesCohort = selectedCohort === 'All' || res.cohort === selectedCohort || res.cohort === 'All';
    const matchesSubject = selectedSubject === 'All' || res.subject === selectedSubject;
    const matchesSearch =
      resourceSearch === '' ||
      res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      res.description.toLowerCase().includes(resourceSearch.toLowerCase());
    return matchesCohort && matchesSubject && matchesSearch;
  });

  const processSelectedFile = (file: File) => {
    setFileName(file.name);
    
    // Auto calculate file size string
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`);

    // Auto set title if empty
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setTitle(titleWithoutExt);

    // Auto detect material type from extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'doc' || ext === 'docx') setType('pdf');
    else if (ext === 'mp4' || ext === 'mkv' || ext === 'webm' || ext === 'avi') setType('video');
    else if (ext === 'v' || ext === 'sv' || ext === 'py' || ext === 'cpp' || ext === 'c' || ext === 'js') setType('code');
    else if (ext === 'pdsprj' || ext === 'slx' || ext === 'mat' || ext === 'sch') setType('simulation');

    setUrl(URL.createObjectURL(file));
    showToast(`File selected: ${file.name} (${sizeInMB} MB)`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
      if (!isUploadModalOpen) {
        setIsUploadModalOpen(true);
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newRes: CoursewareResource = {
      id: `res-${Date.now()}`,
      title,
      fileName: fileName || `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${type === 'pdf' ? 'pdf' : type === 'code' ? 'v' : type === 'simulation' ? 'pdsprj' : 'mp4'}`,
      fileSize: fileSize || '2.4 MB',
      type,
      subject,
      cohort,
      url: url || `https://dhanekula.ac.in/courseware/${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: description || `Uploaded digital courseware material for ${subject}`,
      addedBy: 'Dhanekula Faculty',
      dateAdded: new Date().toISOString().split('T')[0],
      downloads: 0,
      contentSnippet: `Dhanekula Institute of Engineering and Technology (Autonomous)\nDepartment of Electronics & Communication Engineering\nUploaded Courseware File: ${title}`,
    };

    addResource(newRes);
    setIsUploadModalOpen(false);
    setTitle('');
    setFileName('');
    setFileSize('');
    setUrl('');
    setDescription('');
  };

  const handleDelete = (id: string, fileTitle: string) => {
    if (confirm(`Are you sure you want to delete "${fileTitle}"?`)) {
      deleteResource(id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-6 animate-fade-in relative"
    >
      {/* Global Drag-and-Drop Overlay Indicator */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-dhanekula-navy/90 backdrop-blur-md border-4 border-dashed border-white flex flex-col items-center justify-center text-white space-y-4 animate-fade-in pointer-events-none">
          <Upload className="h-20 w-20 text-white animate-bounce" />
          <h2 className="text-3xl font-black">Drop Your Local File Here to Upload</h2>
          <p className="text-sm font-semibold text-dhanekula-200">
            Dhanekula Institute of Engineering and Technology (Autonomous) Courseware Repository
          </p>
        </div>
      )}

      {/* Header & Faculty Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-dhanekula-royal" />
            Digital Courseware Repository ({filteredResources.length} Materials)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Drag & Drop local files anywhere or click Upload to attach study materials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Faculty Upload Button */}
          {role === 'faculty' && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dhanekula-navy hover:bg-dhanekula-royal text-white font-bold text-xs shadow-md hover:scale-105 transition-all shrink-0"
            >
              <Upload className="h-4 w-4" />
              <span>Drag & Drop / Upload File</span>
            </button>
          )}

          {/* Filters */}
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
          >
            <option value="All">All Cohorts</option>
            <option value="Group A">Group A – ALC</option>
            <option value="Group B">Group B – FLC</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((res) => {
          const isGroupA = res.cohort === 'Group A';

          return (
            <div
              key={res.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 hover:border-dhanekula-500 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isGroupA
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : res.cohort === 'Group B'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    {res.cohort}
                  </span>

                  {/* Delete Button for Faculty */}
                  {role === 'faculty' && (
                    <button
                      onClick={() => handleDelete(res.id, res.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete Material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-dhanekula-royal transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Subject: <strong className="text-slate-900 dark:text-white">{res.subject}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{res.dateAdded}</span>

                <button
                  onClick={() => setViewingResource(res)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-dhanekula-navy hover:bg-dhanekula-royal text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Access File</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag and Drop Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-dhanekula-100 dark:bg-dhanekula-950 text-dhanekula-700 dark:text-dhanekula-300 rounded-2xl border border-dhanekula-200 dark:border-dhanekula-800">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Upload Digital Courseware File</h3>
                <p className="text-xs text-slate-500 font-semibold">Dhanekula Institute of Engineering and Technology (Autonomous)</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* DRAG AND DROP ZONE */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed text-center space-y-2 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-dhanekula-royal bg-dhanekula-50 dark:bg-dhanekula-950/80 scale-105'
                    : 'border-dhanekula-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-dhanekula-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="h-10 w-10 text-dhanekula-royal mx-auto animate-pulse" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-black text-dhanekula-royal dark:text-dhanekula-300">
                    Drag & Drop file from your local machine here
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">or click to browse your desktop</p>
                </div>

                {fileName && (
                  <div className="pt-2 flex items-center justify-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selected: {fileName} ({fileSize})</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title (Auto-updated from dropped file)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flipped Lecture Slides: VLSI System Layout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Area
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    {subjects.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Cohort
                  </label>
                  <select
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Group A">Group A – ALC</option>
                    <option value="Group B">Group B – FLC</option>
                    <option value="All">All Students</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Material Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video Lecture</option>
                    <option value="simulation">Simulation File (Proteus/MATLAB)</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="code">Source Code / Verilog Script</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Name / Download URL
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-detected or custom URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short explanation of file contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-dhanekula-navy text-white hover:bg-dhanekula-royal shadow-md"
                >
                  Confirm & Upload File
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
