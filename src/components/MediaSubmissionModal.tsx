import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Upload, Check, AlertCircle, FileText, Film, Image } from 'lucide-react';

interface MediaSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMethodId?: string;
}

export const MediaSubmissionModal: React.FC<MediaSubmissionModalProps> = ({ isOpen, onClose, defaultMethodId = '' }) => {
  const { teachingMethods, submitMedia, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [methodId, setMethodId] = useState(defaultMethodId || (teachingMethods[0]?.id || ''));
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Allowed file extensions
  const allowedExtensions = [
    'jpg', 'jpeg', 'png', 'webp', // Images
    'mp4', 'webm',                // Videos
    'pdf', 'doc', 'docx', 'ppt', 'pptx' // Documents
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    // Size check: 10MB
    const maxSize = 10 * 1024 * 1024;

    if (!allowedExtensions.includes(fileExt)) {
      setError(`Unsupported format. Allowed formats: ${allowedExtensions.join(', ').toUpperCase()}`);
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 10MB.');
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!methodId) {
      setError('Please select a teaching method.');
      return;
    }
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('submitter_name', name.trim());
    if (email.trim()) {
      formData.append('submitter_email', email.trim());
    }
    formData.append('teaching_method_id', methodId);
    formData.append('description', description.trim());
    formData.append('file', file);

    try {
      const res = await submitMedia(formData);
      if (res.success) {
        setSubmitted(true);
        setSuccessMessage(res.message || 'Thank you! Your media has been submitted successfully and is waiting for approval.');
      } else {
        setError(res.error || 'Failed to submit media.');
      }
    } catch (err) {
      setError('An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset forms
    setName('');
    setEmail('');
    setMethodId(defaultMethodId || (teachingMethods[0]?.id || ''));
    setDescription('');
    setFile(null);
    setSubmitted(false);
    setError(null);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return <Image className="h-5 w-5 text-emerald-500" />;
    }
    if (['mp4', 'webm'].includes(ext)) {
      return <Film className="h-5 w-5 text-amber-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Share Photos & Media
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white text-base">Submission Received</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 px-4 leading-relaxed">
                {successMessage}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 btn-micro-interaction shadow-md"
            >
              Close
            </button>
          </div>
        ) : (
          /* FORM SCREEN */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 font-bold flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500 dark:text-slate-450">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dhanekula-500/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500 dark:text-slate-450">Your Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dhanekula.ac.in"
                disabled={loading}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dhanekula-500/50"
              />
            </div>

            {/* Method dropdown selection */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500 dark:text-slate-450">Teaching Method *</label>
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                disabled={loading || !!defaultMethodId}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-dhanekula-500/50"
              >
                {teachingMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.cohort})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-slate-500 dark:text-slate-450">Tell us about this media</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the activity, context, date, or student group..."
                disabled={loading}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-dhanekula-500/50"
              />
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 dark:text-slate-455">File Upload *</label>
              
              {!file ? (
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-dhanekula-500/60 dark:hover:border-dhanekula-500/60 bg-slate-50 dark:bg-slate-800/40 rounded-2xl cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-all select-none">
                  <Upload className="h-6 w-6 text-slate-400 mb-2 animate-bounce-slow" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Choose File</span>
                  <span className="text-[10px] text-slate-400 mt-1 max-w-[280px] text-center">
                    Supported: JPG, PNG, WEBP, MP4, WEBM, PDF, DOC, DOCX, PPT, PPTX.
                  </span>
                  <span className="text-[10px] font-bold text-dhanekula-royal dark:text-dhanekula-400 mt-0.5">
                    Max size: 10MB
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                    accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,.doc,.docx,.ppt,.pptx"
                  />
                </label>
              ) : (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold block text-slate-900 dark:text-white truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-450 block">{formatSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={loading}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all font-bold text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-750 hover:bg-slate-55 dark:hover:bg-slate-850 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-5 py-2.5 rounded-xl bg-dhanekula-royal text-white font-bold hover:bg-dhanekula-600 shadow-md shadow-dhanekula-royal/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Media'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
