import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatSalary, getStatusConfig, APPLICATION_STATUSES } from '../../utils/constants';
import {
  FileCheck2,
  Building,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await applicationService.getMyApplications(statusFilter);
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load applications. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  useEffect(() => {
    if (!socket) return;

    const onApplicationUpdated = ({ applicationId, status }) => {
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
      );
    };

    socket.on('application_updated', onApplicationUpdated);
    return () => socket.off('application_updated', onApplicationUpdated);
  }, [socket]);

  const handleStartChat = async (recruiterId, jobId) => {
    try {
      const res = await chatService.getOrCreateConversation(recruiterId, jobId);
      if (res.success && res.conversation) {
        navigate('/candidate/chat', { state: { activeConversationId: res.conversation._id } });
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  const tabs = [
    { label: 'All Applications', value: 'ALL' },
    ...APPLICATION_STATUSES.map((s) => ({ label: s.label, value: s.value })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          My Job Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review application status, inspect submission details, and message recruiters.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingSpinner fullScreen={false} text="Loading applications..." />
      ) : error ? (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={fetchApplications} className="font-semibold underline">Retry</button>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications found"
          description="You haven't submitted any applications matching this status."
          actionLabel="Find Opportunities"
          onAction={() => navigate('/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusCfg = getStatusConfig(app.status);

            return (
              <div
                key={app._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm border border-slate-200 shrink-0">
                      {app.job?.company?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.job?.title || 'Job Position'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {app.job?.company}
                        <span className="mx-2">•</span>
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {app.job?.location}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-3 self-start sm:self-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} mr-1.5`} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Cover Letter preview if exists */}
                {app.coverLetter && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Submitted Note:
                    </span>
                    <p className="line-clamp-2 italic">"{app.coverLetter}"</p>
                  </div>
                )}

                {app.interview?.scheduledAt && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Interview scheduled</h4>
                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {new Date(app.interview.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          {' · '}{app.interview.durationMinutes} minutes
                        </p>
                        {app.interview.location && <p className="mt-1 text-xs text-slate-600">{app.interview.location}</p>}
                        {app.interview.message && <p className="mt-2 text-xs text-slate-600">{app.interview.message}</p>}
                      </div>
                      {app.interview.meetingUrl && (
                        <a href={app.interview.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">
                          Join interview <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer metadata & actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Applied on {formatDate(app.createdAt)}
                    </span>
                    {app.resume?.originalName && (
                      <span className="text-slate-400">
                        Resume: {app.resume.originalName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {app.recruiter?._id && (
                      <button
                        onClick={() => handleStartChat(app.recruiter._id, app.job?._id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Recruiter</span>
                      </button>
                    )}
                    {app.job?._id && (
                      <Link
                        to={`/jobs/${app.job._id}`}
                        className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        <span>View Job Post</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
