import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatSalary } from '../../utils/constants';
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Kanban,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const RecruiterJobsListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await jobService.getRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load job postings. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await jobService.updateJob(job._id, { status: newStatus });
      if (res.success) {
        setJobs(jobs.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting and its associated applications?')) {
      return;
    }
    try {
      const res = await jobService.deleteJob(jobId);
      if (res.success) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this job.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading your job postings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your company's open positions, track applicants, and adjust vacancy visibility.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Job</span>
        </Link>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={fetchJobs} className="font-semibold underline">Retry</button>
        </div>
      )}

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings posted yet"
          description="Create your first job listing to begin receiving candidate applications."
          actionLabel="Post a Job Now"
          onAction={() => navigate('/recruiter/jobs/new')}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <Badge variant={job.status === 'OPEN' ? 'success' : 'danger'} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.location} • {job.employmentType.replace('_', ' ')} • Posted {formatDate(job.createdAt)}
                  </p>
                </div>

                {/* Pipeline link button */}
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>View Pipeline ({job.applicantCount || 0})</span>
                </Link>
              </div>

              {/* Counts metrics bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl text-center">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Total Applicants</span>
                  <span className="text-sm font-bold text-slate-800">{job.applicantCount || 0}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Interviewing</span>
                  <span className="text-sm font-bold text-amber-600">{job.interviewCount || 0}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Hired</span>
                  <span className="text-sm font-bold text-emerald-600">{job.hiredCount || 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(job)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
                  >
                    {job.status === 'OPEN' ? 'Close Position' : 'Reopen Position'}
                  </button>
                  <Link
                    to={`/jobs/${job._id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Public Preview</span>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                    title="Edit Job"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
