import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  FileText,
  Video,
  Code,
  Cpu,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  FileCheck,
  ZoomIn,
  ZoomOut,
  GraduationCap
} from 'lucide-react';

export const ResourceViewerModal: React.FC = () => {
  const { viewingResource, setViewingResource, setIsDailyQuizOpen, showToast } = useApp();

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [copiedCode, setCopiedCode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!viewingResource) return null;

  const res = viewingResource;
  const isVideo = res.type === 'video';
  const isPdf = res.type === 'pdf' || res.type === 'paper';
  const isCode = res.type === 'code';
  const isSimulation = res.type === 'simulation';
  const isQuiz = res.type === 'quiz';

  const handleDownload = () => {
    // Generate actual simulated file download
    const fileName = res.fileName || `${res.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${res.type === 'pdf' ? 'pdf' : res.type === 'code' ? 'v' : res.type === 'simulation' ? 'pdsprj' : 'mp4'}`;
    const content = res.description + '\n\n' + (res.contentSnippet || 'Dhanekula Institute of Engineering and Technology (Autonomous)\nDepartment of Electronics & Communication Engineering\nCourseware Material: ' + res.title);
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    showToast(`Downloading file: ${fileName}`);
  };

  const handleCopyCode = () => {
    const codeSnippet = res.contentSnippet || `module dsp_filter (\n    input wire clk,\n    input wire rst,\n    input wire [15:0] sample_in,\n    output reg [15:0] sample_out\n);\n    // Dhanekula Institute ECE Verilog Implementation\n    always @(posedge clk or posedge rst) begin\n        if (rst) sample_out <= 16'h0000;\n        else sample_out <= sample_in >> 1;\n    end\nendmodule`;
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-dhanekula-navy via-dhanekula-royal to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-dhanekula-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              {isVideo && <Video className="h-6 w-6 text-sky-300" />}
              {isPdf && <FileText className="h-6 w-6 text-emerald-300" />}
              {isCode && <Code className="h-6 w-6 text-amber-300" />}
              {isSimulation && <Cpu className="h-6 w-6 text-purple-300" />}
              {isQuiz && <Sparkles className="h-6 w-6 text-rose-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/20">
                  {res.cohort} Cohort
                </span>
                <span className="text-xs text-dhanekula-200 font-semibold">
                  {res.subject}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {res.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setViewingResource(null)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Viewer Workspace */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* File Metadata Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">File Name:</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                {res.fileName || `${res.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${res.type === 'pdf' ? 'pdf' : res.type === 'code' ? 'v' : res.type === 'simulation' ? 'pdsprj' : 'mp4'}`}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">Uploaded By:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{res.addedBy}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium block">Date Added:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{res.dateAdded}</span>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-dhanekula-navy hover:bg-dhanekula-royal text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="space-y-4">
            
            {/* VIDEO PLAYER PREVIEW */}
            {isVideo && (
              <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 text-white p-4 space-y-4 shadow-xl">
                <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-dhanekula-navy flex items-center justify-center border border-slate-800 group">
                  <div className="text-center space-y-3">
                    <button
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="h-16 w-16 mx-auto rounded-full bg-dhanekula-royal text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      {isPlayingVideo ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                    </button>
                    <p className="text-xs font-bold text-slate-300">
                      {isPlayingVideo ? 'Playing Pre-Class Video Module...' : 'Click to Play Pre-Class Lecture Video'}
                    </p>
                  </div>

                  {/* Top Overlay Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-sky-300">
                    HD 1080p • Flipped Classroom Lecture
                  </div>
                </div>

                {/* Progress Controls */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>06:18</span>
                    <span>18:30</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-dhanekula-royal rounded-full" style={{ width: `${videoProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* PDF / DOCUMENT PREVIEW */}
            {isPdf && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-dhanekula-royal" />
                    <span>PDF Document Preview (Page 1 of 6)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-[11px]">{zoomLevel}%</span>
                    <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* PDF Page View Sheet */}
                <div
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-lg space-y-4 text-slate-800 dark:text-slate-200 transition-transform origin-top"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <div className="border-b pb-4 space-y-1">
                    <span className="text-[10px] font-black uppercase text-dhanekula-royal tracking-widest">
                      Dhanekula Institute of Engineering and Technology (Autonomous)
                    </span>
                    <h3 className="text-lg font-black">{res.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{res.subject} • Third-Year B.Tech ECE Syllabus</p>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <p className="font-semibold">
                      <strong>Executive Summary & Module Objectives:</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {res.description}
                    </p>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      1. Architectural Principles of Differentiated Learning.<br />
                      2. Step-by-Step Derivations and Numerical Implementations.<br />
                      3. Lab Verification on MATLAB & Proteus Workspaces.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CODE PREVIEW */}
            {isCode && (
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-white">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="font-mono text-amber-400">Verilog HDL Code Snippet</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
{res.contentSnippet || `module dsp_filter (\n    input wire clk,\n    input wire rst,\n    input wire [15:0] sample_in,\n    output reg [15:0] sample_out\n);\n    // Dhanekula Institute ECE Verilog Implementation\n    always @(posedge clk or posedge rst) begin\n        if (rst) sample_out <= 16'h0000;\n        else sample_out <= sample_in >> 1;\n    end\nendmodule`}
                </pre>
              </div>
            )}

            {/* SIMULATION PREVIEW */}
            {isSimulation && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-purple-400" />
                    Proteus & MATLAB Simulation Project Workspace
                  </h4>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-950 text-purple-300 border border-purple-800">
                    .pdsprj / .slx File
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {res.description}
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-400 space-y-1">
                  <div>% Dhanekula ECE MATLAB Simulation Script</div>
                  <div>fs = 8000; t = 0:1/fs:1;</div>
                  <div>x = sin(2*pi*1000*t);</div>
                  <div>y = filter(b, a, x); plot(t(1:100), y(1:100));</div>
                </div>
              </div>
            )}

            {/* QUIZ LAUNCHER PREVIEW */}
            {isQuiz && (
              <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center space-y-4">
                <Sparkles className="h-12 w-12 mx-auto text-white" />
                <h3 className="text-xl font-black">Interactive 5-Question Daily Concept Quiz</h3>
                <p className="text-xs text-amber-100 max-w-md mx-auto">
                  {res.description}
                </p>
                <button
                  onClick={() => {
                    setViewingResource(null);
                    setIsDailyQuizOpen(true);
                  }}
                  className="px-6 py-3 rounded-2xl bg-white text-amber-950 font-black text-xs shadow-xl hover:bg-amber-50 transition-all"
                >
                  Start Quiz Now
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <GraduationCap className="h-4 w-4 text-dhanekula-royal" />
            <span>Dhanekula Institute of Engineering and Technology (Autonomous)</span>
          </div>

          <button
            onClick={() => setViewingResource(null)}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
