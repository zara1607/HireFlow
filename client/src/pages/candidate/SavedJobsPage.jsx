import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { authService } from '../../services/authService';
import { JobCard } from '../../components/jobs/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const SavedJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getSavedJobs();
      setJobs(response.jobs || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load saved jobs. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const removeSavedJob = async (job) => {
    try {
      await authService.removeSavedJob(job._id);
      setJobs((previous) => previous.filter((savedJob) => savedJob._id !== job._id));
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Could not remove this saved job.');
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">Keep promising roles together while you decide where to apply.</p>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <button type="button" onClick={loadSavedJobs} className="font-semibold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen={false} text="Loading saved jobs..." />
      ) : jobs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} isSaved onToggleSave={removeSavedJob} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Bookmark interesting roles from the marketplace and they will be collected here."
          actionLabel="Explore jobs"
          onAction={() => navigate('/jobs')}
        />
      )}
    </section>
  );
};