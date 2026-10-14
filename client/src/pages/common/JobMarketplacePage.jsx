import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { JobCard } from '../../components/jobs/JobCard';
import { ApplyModal } from '../../components/jobs/ApplyModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES } from '../../utils/constants';
import { Search, MapPin, Filter, X, Briefcase, Bookmark } from 'lucide-react';

export const JobMarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(JOB_CATEGORIES);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [error, setError] = useState('');

  // Draft search values are applied only when the search form is submitted.
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [search, setSearch] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
  });
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || 'ALL');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Apply modal
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {
          page: currentPage,
          limit: 12,
          status: 'OPEN',
          sort,
        };
        if (search.keyword.trim()) params.keyword = search.keyword.trim();
        if (search.location.trim()) params.location = search.location.trim();
        if (employmentType !== 'ALL') params.employmentType = employmentType;
        if (experienceLevel !== 'ALL') params.experienceLevel = experienceLevel;
        if (category !== 'ALL') params.category = category;
        if (salaryMin) params.salaryMin = salaryMin;
        if (salaryMax) params.salaryMax = salaryMax;

        const res = await jobService.getJobs(params);
        if (!active) return;
        setJobs(res.jobs || []);
        setTotalJobs(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load jobs. Check your connection and try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobs();
    return () => { active = false; };
  }, [currentPage, employmentType, experienceLevel, category, sort, salaryMin, salaryMax, search, retryKey]);

  useEffect(() => {
    let active = true;
    jobService.getJobCategories().then((res) => {
      if (active && res.categories?.length) setCategories(res.categories);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && isCandidate) {
      authService.getSavedJobs().then((res) => {
        if (active) setSavedJobIds(new Set((res.jobs || []).map((job) => job._id)));
      }).catch(() => {});
    } else {
      setSavedJobIds(new Set());
    }
    return () => { active = false; };
  }, [isAuthenticated, isCandidate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearch({ keyword, location });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setEmploymentType('ALL');
    setExperienceLevel('ALL');
    setCategory('ALL');
    setSort('newest');
    setSalaryMin('');
    setSalaryMax('');
    setCurrentPage(1);
    setSearch({ keyword: '', location: '' });
  };

  const handleToggleSaved = async (job) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const isSaved = savedJobIds.has(job._id);
    try {
      if (isSaved) await authService.removeSavedJob(job._id);
      else await authService.saveJob(job._id);
      setSavedJobIds((previous) => {
        const next = new Set(previous);
        if (isSaved) next.delete(job._id);
        else next.add(job._id);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update saved jobs. Please try again.');
    }
  };

  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isCandidate) {
      alert('Only registered Job Seekers can apply for positions. Please log into a candidate account.');
      return;
    }
    setSelectedJobForApply(job);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="max-w-3xl mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Explore Open Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover verified career opportunities with clear requirements and direct recruiter communication.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by job title, skill, or company..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }} className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
              <option value="ALL">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }} className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary_desc">Highest salary</option>
              <option value="salary_asc">Lowest salary</option>
            </select>
            <input type="number" min="0" value={salaryMin} onChange={(e) => { setSalaryMin(e.target.value); setCurrentPage(1); }} placeholder="Minimum salary" aria-label="Minimum salary" className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2" />
            <input type="number" min="0" value={salaryMax} onChange={(e) => { setSalaryMax(e.target.value); setCurrentPage(1); }} placeholder="Maximum salary" aria-label="Maximum salary" className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2" />
            <div className="text-xs text-slate-500 flex items-center sm:justify-end">{totalJobs} open roles</div>
          </div>

          <div className="flex-1 flex items-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by city, state, or Remote..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-2xl transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter Badges Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter By:</span>
            </div>

            {/* Employment Type */}
            <select
              value={employmentType}
              onChange={(e) => {
                setEmploymentType(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All Employment Types</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Experience Level */}
            <select
              value={experienceLevel}
              onChange={(e) => {
                setExperienceLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All Experience Levels</option>
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>

            {(keyword || location || employmentType !== 'ALL' || experienceLevel !== 'ALL' || category !== 'ALL' || salaryMin || salaryMax || sort !== 'newest') && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-rose-50 font-medium transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-slate-500">Page {currentPage} of {totalPages}</div>
        </div>
      </div>

      {/* Jobs Listing Grid */}
      {loading ? (
        <LoadingSpinner fullScreen={false} text="Searching available opportunities..." />
      ) : error ? (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <button onClick={() => setRetryKey((key) => key + 1)} className="font-semibold underline">Retry</button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs matching your criteria"
          description="Try broadening your search keyword or clearing the selected employment and experience filters."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={isCandidate ? handleApplyClick : null}
              isSaved={savedJobIds.has(job._id)}
              onToggleSave={isCandidate ? handleToggleSaved : null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-slate-500 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          job={selectedJobForApply}
          onSuccess={() => {
            // Optional callback
          }}
        />
      )}
    </div>
  );
};
