import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(!!user?.resume?.filename);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!useProfileResume && !resumeFile) {
      setError('Please attach a resume file or use your saved profile resume.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);

      if (!useProfileResume && resumeFile) {
        formData.append('resume', resumeFile);
      }

      await applicationService.applyForJob(formData);
      setAppliedSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${job.title}`}
      maxWidth="max-w-lg"
    >
      {appliedSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Application Submitted!</h3>
          <p className="text-sm text-slate-500">
            The hiring team at {job.company} has been notified of your application.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Position</p>
            <p className="text-sm font-bold text-slate-800">{job.title}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {job.company} • {job.location}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Resume Choice */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Resume Document
            </label>

            {user?.resume?.filename && (
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="useProfileResume"
                  checked={useProfileResume}
                  onChange={(e) => setUseProfileResume(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="useProfileResume" className="text-xs text-slate-600 cursor-pointer flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Use profile resume ({user.resume.originalName})
                </label>
              </div>
            )}

            {(!useProfileResume || !user?.resume?.filename) && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-500 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    Upload a file
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                {resumeFile && (
                  <p className="text-xs font-medium text-slate-700 mt-2 bg-slate-100 py-1 px-2 rounded-lg truncate">
                    Selected: {resumeFile.name}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Cover Note / Pitch (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {coverLetter.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight why you're a great fit for this position..."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Submitting...' : 'Confirm Application'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
