import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const ResumeUpload = () => {
  const { user, uploadResume } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const inputRef = useRef(null);
  const resume = user?.resume;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setMessage({ type: 'error', text: 'Choose a PDF, DOC, or DOCX file.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'The resume must be 5MB or smaller.' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await uploadResume(formData);
      setMessage({ type: 'success', text: 'Resume uploaded successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Resume upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <FileText className="h-5 w-5 text-emerald-600" />
        Resume
      </h2>
      <p className="mt-2 text-xs text-slate-500">
        Upload a PDF, DOC, or DOCX file up to 5MB. Your saved resume can be used when applying for jobs.
      </p>

      {resume?.filename && (
        <p className="mt-4 text-sm text-slate-700">
          Current file: <span className="font-semibold">{resume.originalName || 'Resume uploaded'}</span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={uploading}
        className="sr-only"
        aria-label="Choose resume file"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Uploading...' : resume?.filename ? 'Replace resume' : 'Select resume file'}
      </button>

      {message.text && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`mt-3 flex items-center gap-2 text-xs ${
            message.type === 'error' ? 'text-rose-700' : 'text-emerald-700'
          }`}
        >
          {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {message.text}
        </p>
      )}
    </section>
  );
};
