import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { ApplicantPipeline } from '../../components/applications/ApplicantPipeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { ArrowLeft, Briefcase, MapPin, Users } from 'lucide-react';

export const RecruiterApplicantsPipelinePage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const [jobRes, appsRes] = await Promise.all([
        jobService.getJobById(id),
        applicationService.getJobApplicants(id),
      ]);

      if (jobRes.success) setJob(jobRes.job);
      if (appsRes.success) setApplicants(appsRes.applicants);
    } catch (err) {
      console.error('Failed to load job applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
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
    return <LoadingSpinner fullScreen={false} text="Loading applicant pipeline..." />;
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to All Job Postings
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">{job?.title}</h1>
            <Badge variant={job?.status === 'OPEN' ? 'success' : 'danger'} size="sm">
              {job?.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {job?.location} • {job?.employmentType?.replace('_', ' ')}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>{applicants.length} Total Applicants</span>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <ApplicantPipeline
        applicants={applicants}
        onStatusChange={handleStatusChange}
        onApplicationUpdate={handleApplicationUpdate}
      />
    </div>
  );
};
