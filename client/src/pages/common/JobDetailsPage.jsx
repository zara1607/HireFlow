import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { ApplyModal } from '../../components/jobs/ApplyModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { formatSalary, formatDate, formatTimeAgo } from '../../utils/constants';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  ArrowLeft,
  Globe,
  Share2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobById(id);
        if (res.success && res.job) {
          setJob(res.job);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const loadApplicationState = async () => {
      if (!isAuthenticated || !isCandidate || !id) {
        setExistingApplication(null);
        return;
      }
      try {
        const res = await applicationService.getMyApplications('ALL');
        if (res.success) {
          const match = res.applications.find((app) => app.job?._id === id);
          setExistingApplication(match || null);
        }
      } catch {
        setExistingApplication(null);
      }
    };

    loadApplicationState();
  }, [id, isAuthenticated, isCandidate]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading role specifications..." />;
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Job Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This job listing may have expired or been removed.'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Job Board
        </Link>
      </div>
    );
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isCandidate) {
      alert('Only registered Job Seekers can apply for roles. Please use a candidate account.');
      return;
    }
    setIsApplyModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to All Jobs
        </Link>
      </div>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  {job.company}
                </span>
                <Badge variant={job.status === 'OPEN' ? 'success' : 'danger'} size="sm">
                  {job.status}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.employmentType.replace('_', ' ')}
                </span>
                <span className="flex items-center text-slate-400">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Posted {formatTimeAgo(job.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center space-x-3 shrink-0">
            {job.status === 'OPEN' ? (
              existingApplication ? (
                <Link
                  to="/candidate/applications"
                  className="w-full md:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl transition text-center"
                >
                  Already Applied — View Status
                </Link>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition shadow-md shadow-emerald-600/20"
                >
                  Apply for this Position
                </button>
              )
            ) : (
              <span className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-semibold rounded-xl">
                Position Closed
              </span>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">Compensation</span>
            <span className="text-xs font-bold text-slate-800">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">Experience Level</span>
            <span className="text-xs font-bold text-slate-800">
              {job.experienceLevel}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">Employment Type</span>
            <span className="text-xs font-bold text-slate-800">
              {job.employmentType.replace('_', ' ')}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium block">Location Model</span>
            <span className="text-xs font-bold text-slate-800">
              {job.location}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Description and Company Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Job Overview & Responsibilities
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                {job.description}
              </div>
            </div>

            {/* Skills & Technologies */}
            {job.skills && job.skills.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Required Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Company & Recruiter Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About the Hiring Team
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{job.company}</h4>
                {job.recruiter?.companyLocation && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {job.recruiter.companyLocation}
                  </p>
                )}
              </div>

              {job.recruiter?.companyDescription && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.recruiter.companyDescription}
                </p>
              )}

              {job.recruiter?.companyWebsite && (
                <a
                  href={
                    job.recruiter.companyWebsite.startsWith('http')
                      ? job.recruiter.companyWebsite
                      : `https://${job.recruiter.companyWebsite}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Visit Company Website
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={job}
          onSuccess={async () => {
            try {
              const res = await applicationService.getMyApplications('ALL');
              if (res.success) {
                const match = res.applications.find((app) => app.job?._id === job._id);
                setExistingApplication(match || null);
              }
            } catch {
              /* refresh optional */
            }
          }}
        />
      )}
    </div>
  );
};
