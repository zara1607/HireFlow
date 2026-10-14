import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { ApplicantPipeline } from '../../components/applications/ApplicantPipeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  Filter,
} from 'lucide-react';

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [jobsRes, applicantsRes] = await Promise.all([
        jobService.getRecruiterJobs(),
        applicationService.getAllRecruiterApplicants(),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs);
      if (applicantsRes.success) setApplicants(applicantsRes.applicants);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the recruiter dashboard. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [retryCount]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to update applicant status:', err);
    }
  };

  const handleApplicationUpdate = (appId, updates) => {
    setApplicants((previous) => previous.map((application) => (
      application._id === appId
        ? {
            ...application,
            ...updates,
            candidate: updates.candidate ? { ...application.candidate, ...updates.candidate } : application.candidate,
            job: updates.job ? { ...application.job, ...updates.job } : application.job,
          }
        : application
    )));
  };

  if (loading) {
    return <LoadingSpinner fullScreen={false} text="Loading recruiter dashboard..." />;
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <span>{error}</span>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="font-semibold underline">Retry</button>
      </div>
    );
  }

  // Filter applicants by chosen job if selected
  const filteredApplicants =
    selectedJobFilter === 'ALL'
      ? applicants
      : applicants.filter((a) => a.job?._id === selectedJobFilter);

  // Metrics
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;
  const totalApplicants = applicants.length;
  const inInterviewCount = applicants.filter((a) => a.status === 'INTERVIEW').length;
  const hiredCount = applicants.filter((a) => a.status === 'HIRED').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            Recruiter Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {user?.companyName || 'Hiring Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Manage your open headcount, candidate interview stages, and resume evaluations across teams.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition shadow-lg shrink-0 self-start md:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Position</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Roles</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{openJobs}</span>
          <p className="text-[11px] text-slate-400 mt-1">{totalJobs} total postings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Applicants</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{totalApplicants}</span>
          <p className="text-[11px] text-slate-400 mt-1">Across all requisitions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">In Interview</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{inInterviewCount}</span>
          <p className="text-[11px] text-slate-400 mt-1">Interviews scheduled</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Hires</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-900">{hiredCount}</span>
          <p className="text-[11px] text-slate-400 mt-1">Offers accepted</p>
        </div>
      </div>

      {/* Recruiter Applicant Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recruitment Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Move candidates through recruitment stages and review applicant credentials
            </p>
          </div>

          {/* Job Filter selector */}
          {jobs.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Requisitions ({applicants.length})</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.applicantCount || 0})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pipeline Board */}
        <ApplicantPipeline
          applicants={filteredApplicants}
          onStatusChange={handleStatusChange}
          onApplicationUpdate={handleApplicationUpdate}
        />
      </div>
    </div>
  );
};
