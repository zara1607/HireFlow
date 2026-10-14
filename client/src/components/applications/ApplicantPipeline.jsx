import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronRight,
  UserCheck,
  XCircle,
  MoreVertical,
  CheckCircle,
  CalendarClock,
  Save,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatTimeAgo, APPLICATION_STATUSES } from '../../utils/constants';
import { chatService } from '../../services/chatService';
import { applicationService } from '../../services/applicationService';

export const ApplicantPipeline = ({ applicants = [], onStatusChange, onApplicationUpdate, refreshing = false }) => {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [startingChat, setStartingChat] = useState(false);
  const [privateNotes, setPrivateNotes] = useState('');
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: '',
    durationMinutes: '45',
    location: '',
    meetingUrl: '',
    message: '',
  });
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);
  const [detailError, setDetailError] = useState('');

  const openCandidate = (application) => {
    setSelectedCandidate(application);
    setPrivateNotes(application.notes || '');
    const interview = application.interview;
    setInterviewForm({
      scheduledAt: interview?.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 16) : '',
      durationMinutes: String(interview?.durationMinutes || 45),
      location: interview?.location || '',
      meetingUrl: interview?.meetingUrl || '',
      message: interview?.message || '',
    });
    setDetailError('');
  };

  const handleSavePrivateNotes = async () => {
    try {
      setSavingNotes(true);
      setDetailError('');
      await applicationService.updateRecruiterNotes(selectedCandidate._id, privateNotes);
      onApplicationUpdate?.(selectedCandidate._id, { notes: privateNotes });
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not save private notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleScheduleInterview = async (event) => {
    event.preventDefault();
    try {
      setSavingInterview(true);
      setDetailError('');
      const response = await applicationService.scheduleInterview(selectedCandidate._id, {
        ...interviewForm,
        durationMinutes: Number(interviewForm.durationMinutes),
      });
      const updatedApplication = response.application;
      setSelectedCandidate((current) => ({ ...current, ...updatedApplication }));
      onApplicationUpdate?.(selectedCandidate._id, { ...updatedApplication, status: 'INTERVIEW' });
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Could not schedule this interview.');
    } finally {
      setSavingInterview(false);
    }
  };

  const columns = [
    { key: 'APPLIED', label: 'Applied', color: 'border-blue-400 bg-blue-50/50' },
    { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-purple-400 bg-purple-50/50' },
    { key: 'INTERVIEW', label: 'Interviewing', color: 'border-amber-400 bg-amber-50/50' },
    { key: 'HIRED', label: 'Hired', color: 'border-emerald-400 bg-emerald-50/50' },
    { key: 'REJECTED', label: 'Declined', color: 'border-rose-400 bg-rose-50/50' },
  ];

  const handleStartChat = async (candidateId, jobId) => {
    try {
      setStartingChat(true);
      const res = await chatService.getOrCreateConversation(candidateId, jobId);
      if (res.success && res.conversation) {
        navigate('/recruiter/chat', { state: { activeConversationId: res.conversation._id } });
      }
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
    } finally {
      setStartingChat(false);
    }
  };

  const handleDownloadResume = async (appId) => {
    try {
      await applicationService.downloadResume(appId);
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
  };

  return (
    <div>
      {/* 5-Column Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApplicants = applicants.filter((a) => a.status === col.key);

          return (
            <div
              key={col.key}
              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 font-bold text-xs shadow-xs border border-slate-200">
                  {colApplicants.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colApplicants.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No candidates
                  </div>
                ) : (
                  colApplicants.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200/90 hover:shadow-md transition space-y-2.5"
                    >
                      {/* Candidate Avatar & Name */}
                      <div className="flex items-start justify-between">
                        <button
                          type="button"
                          className="flex items-center space-x-2.5 text-left"
                          onClick={() => openCandidate(app)}
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {app.candidate?.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate hover:text-emerald-600 transition">
                              {app.candidate?.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {app.candidate?.headline || 'Candidate'}
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Job title context if viewing all */}
                      {app.job?.title && (
                        <p className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded truncate">
                          {app.job.title}
                        </p>
                      )}

                      {/* Skills snippet */}
                      {app.candidate?.skills && app.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.candidate.skills.slice(0, 2).map((skill, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.candidate.skills.length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{app.candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action buttons: Download Resume, Chat, Next stage */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          {app.resume?.filename && (
                            <button
                              onClick={() => handleDownloadResume(app._id)}
                              title="Download Resume"
                              className="p-1 rounded hover:bg-slate-100 hover:text-emerald-600 transition"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStartChat(app.candidate?._id, app.job?._id)}
                            title="Direct Message"
                            className="p-1 rounded hover:bg-slate-100 hover:text-indigo-600 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Status Select dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange(app._id, e.target.value)}
                          className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="SHORTLISTED">Shortlist</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="HIRED">Hire</option>
                          <option value="REJECTED">Decline</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title="Candidate Profile & Application"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {detailError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{detailError}</p>}
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {selectedCandidate.candidate?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedCandidate.candidate?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCandidate.candidate?.email}
                  </p>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">
                    {selectedCandidate.candidate?.headline || 'No headline provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleStartChat(
                      selectedCandidate.candidate?._id,
                      selectedCandidate.job?._id
                    );
                    setSelectedCandidate(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Application Cover Note */}
            {selectedCandidate.coverLetter && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Note / Cover Letter
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line">
                  {selectedCandidate.coverLetter}
                </p>
              </div>
            )}

            <section className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Recruiter private notes</h4>
                  <p className="text-[11px] text-slate-500">Only your hiring team can see these notes.</p>
                </div>
                <button type="button" onClick={handleSavePrivateNotes} disabled={savingNotes} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">
                  <Save className="h-3.5 w-3.5" />{savingNotes ? 'Saving' : 'Save notes'}
                </button>
              </div>
              <textarea value={privateNotes} onChange={(event) => setPrivateNotes(event.target.value)} maxLength={5000} rows={3} placeholder="Add evaluation notes for your hiring team..." className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none" />
            </section>

            <form onSubmit={handleScheduleInterview} className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-amber-700" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{selectedCandidate.interview ? 'Update interview' : 'Schedule interview'}</h4>
                  <p className="text-[11px] text-slate-500">The candidate receives an in-app notification.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-[11px] font-semibold text-slate-600">Date and time
                  <input required type="datetime-local" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} value={interviewForm.scheduledAt} onChange={(event) => setInterviewForm({ ...interviewForm, scheduledAt: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
                </label>
                <label className="text-[11px] font-semibold text-slate-600">Duration
                  <select value={interviewForm.durationMinutes} onChange={(event) => setInterviewForm({ ...interviewForm, durationMinutes: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                    {[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-semibold text-slate-600">Location or call details
                  <input value={interviewForm.location} onChange={(event) => setInterviewForm({ ...interviewForm, location: event.target.value })} placeholder="Office address or video call" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
                </label>
                <label className="text-[11px] font-semibold text-slate-600">Meeting link
                  <input type="url" value={interviewForm.meetingUrl} onChange={(event) => setInterviewForm({ ...interviewForm, meetingUrl: event.target.value })} placeholder="https://..." className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs" />
                </label>
              </div>
              <label className="block text-[11px] font-semibold text-slate-600">Message for candidate
                <textarea rows={2} maxLength={1000} value={interviewForm.message} onChange={(event) => setInterviewForm({ ...interviewForm, message: event.target.value })} placeholder="Share an agenda or anything they should prepare." className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-3 text-xs" />
              </label>
              <button type="submit" disabled={savingInterview} className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                <CalendarClock className="h-3.5 w-3.5" />{savingInterview ? 'Saving interview...' : 'Save interview'}
              </button>
            </form>

            {/* Candidate Bio */}
            {selectedCandidate.candidate?.bio && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  About Candidate
                </h4>
                <p className="text-xs text-slate-600 whitespace-pre-line">
                  {selectedCandidate.candidate.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {selectedCandidate.candidate?.skills &&
              selectedCandidate.candidate.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Skills & Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.candidate.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Resume Button */}
            {selectedCandidate.resume?.filename && (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {selectedCandidate.resume.originalName || 'Candidate Resume'}
                    </p>
                    <p className="text-[11px] text-slate-500">Verified applicant attachment</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadResume(selectedCandidate._id)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resume</span>
                </button>
              </div>
            )}

            {/* Move Status Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Change Status:</span>
              <div className="flex flex-wrap gap-2">
                {['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onStatusChange(selectedCandidate._id, st);
                      setSelectedCandidate((prev) => ({ ...prev, status: st }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedCandidate.status === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
