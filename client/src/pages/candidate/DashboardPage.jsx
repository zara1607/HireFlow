import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { formatSalary, formatDate, formatTimeAgo, getStatusConfig } from '../../utils/constants';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Upload,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export const CandidateDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const [appRes, jobRes] = await Promise.all([
          applicationService.getMyApplications(),
          jobService.getRecommendedJobs(),
        ]);

        setApplications(Array.isArray(appRes.applications) ? appRes.applications : []);
        setRecommendedJobs(Array.isArray(jobRes.jobs) ? jobRes.jobs : []);
      } catch (err) {
        console.error('Failed to load candidate dashboard:', err);
        setError(err.response?.data?.message || 'Could not load your dashboard. Try again.');
      } finally {
        setLoading(false);
      }
    };

    if (authLoading || !user) return;
    loadDashboardData();
  }, [retryCount, authLoading, user?._id]);

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

  if (authLoading) {
    return <LoadingSpinner fullScreen={false} text="Loading your candidate overview..." />;
  }

  if (!user) {
    return (
      <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        Your candidate account could not be loaded. Sign in again and retry.
      </p>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading your candidate overview..." />;
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <span>{error}</span>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button>
      </div>
    );
  }

  // Calculate summary counts
  const totalApps = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const interviewCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const hiredCount = applications.filter((a) => a.status === 'HIRED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            Job Seeker Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {user?.headline || 'Update your profile to attract opportunities.'} Track your submitted applications and interview stages below.
          </p>
        </div>

        {/* Resume prompt if not yet uploaded */}
        {!user?.resume?.filename && (
          <div className="mt-6 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-slate-200">
              You haven't uploaded a resume yet.
            </span>
            <Link
              to="/candidate/profile"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              Upload Now
            </Link>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Submitted</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{totalApps}</span>
          <p className="text-[11px] text-slate-400 mt-1">Total job applications</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Shortlisted</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{shortlistedCount}</span>
          <p className="text-[11px] text-slate-400 mt-1">Passed initial review</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Interviews</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{interviewCount}</span>
          <p className="text-[11px] text-slate-400 mt-1">Interview rounds active</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Offers / Hired</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{hiredCount}</span>
          <p className="text-[11px] text-slate-400 mt-1">Successful placements</p>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500">
              Your real-time pipeline status across applied positions
            </p>
          </div>
          <Link
            to="/candidate/applications"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No applications submitted yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
              Explore the job marketplace and submit your first application with one click.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
            >
              Browse Open Roles
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((app) => {
              const statusCfg = getStatusConfig(app.status);

              return (
                <div
                  key={app._id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {app.job?.company?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {app.job?.title || 'Position'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.job?.company} • Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} mr-1.5`} />
                      {statusCfg.label}
                    </span>
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      View Role
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Openings */}
      {recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recommended Opportunities</h2>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{job.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {job.company} • {job.location}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
                    {job.matchScore > 0 ? `${job.matchScore} skill match${job.matchScore === 1 ? '' : 'es'}` : formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
                <Link
                  to={`/jobs/${job._id}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
