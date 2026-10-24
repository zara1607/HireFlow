import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Building,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/jobs/JobCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const LandingPage = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [catalogRetry, setCatalogRetry] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError('');
        
        // FIXED: Changed status from 'OPEN' to 'published' to match backend
        const [featured, latest, categoryResult] = await Promise.all([
          jobService.getJobs({ status: 'published', featured: true, limit: 3 }),
          jobService.getJobs({ status: 'published', limit: 6, sort: 'newest' }),
          jobService.getJobCategories(),
        ]);
        
        if (!active) return;
        
        setFeaturedJobs(featured.jobs || featured.data?.jobs || []);
        setLatestJobs(latest.jobs || latest.data?.jobs || []);
        
        // Safeguard: Backend might return objects (e.g. {name: 'Tech'}) or strings
        const rawCategories = categoryResult.categories || categoryResult.data?.categories || [];
        const formattedCategories = rawCategories.map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
        
        setCategories(formattedCategories);
      } catch (error) {
        if (active) {
          console.error("Catalog Load Error:", error);
          setCatalogError(error.response?.data?.message || 'Job listings are temporarily unavailable.');
        }
      } finally {
        if (active) setCatalogLoading(false);
      }
    };
    loadCatalog();
    return () => { active = false; };
  }, [catalogRetry]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modern Hiring Infrastructure For Teams & Talent</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Where Top Candidates & Fast-Growing Companies{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Align In Real Time
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate black-box applications and scattered recruitment emails.
            HireFlow provides interactive recruitment pipelines, verified resumes, and direct recruiter-candidate messaging.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-3xl mx-auto bg-white p-2 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, tech stack, or keyword..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex-1 flex items-center px-3 py-2 bg-slate-50 rounded-xl">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, region, or 'Remote'..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 shrink-0"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Stats / Highlights */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-xs font-medium text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Full Pipeline Transparency</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Direct In-App Candidate Messaging</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Artificial Gatekeepers</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-700">The live marketplace</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Find your next role</h2>
          </div>
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">All open roles <ArrowRight className="h-4 w-4" /></Link>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category, idx) => (
              <button 
                key={idx} 
                type="button" 
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(category)}`)} 
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {catalogLoading ? (
          <LoadingSpinner fullScreen={false} text="Loading open roles..." />
        ) : catalogError ? (
          <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{catalogError}</span>
            <button type="button" onClick={() => setCatalogRetry((retry) => retry + 1)} className="font-semibold underline">Retry</button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Featured opportunities</h3>
              {featuredJobs.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featuredJobs.map((job) => <JobCard key={job._id} job={job} />)}
                </div>
              ) : <p className="text-sm text-slate-500">New featured roles are being added. Explore all current openings below.</p>}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Latest openings</h3>
              {latestJobs.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {latestJobs.map((job) => <JobCard key={job._id} job={job} />)}
                </div>
              ) : <p className="text-sm text-slate-500">There are no open jobs right now. Check back soon.</p>}
            </div>
          </>
        )}
      </section>

      {/* Dual Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Candidate Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200/90 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              For Job Seekers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Never wonder about your application status again. Get direct visibility into your recruitment stage with real-time updates.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 mb-8">
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>One-click apply with uploaded resume or profile document</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Live tracking: Applied → Shortlisted → Interview → Offer</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Instant chat with verified recruiters</span>
              </li>
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-1 transition"
            >
              <span>Create Candidate Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 border border-slate-200/90 shadow-sm relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              For Hiring Teams
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Manage your entire recruitment pipeline from post to hire with an intuitive Kanban stage board and direct candidate outreach.
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 mb-8">
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Post jobs with targeted salary ranges, skills & employment models</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Manage applicants visually across 5 structured stages</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>Secure resume downloads & integrated candidate chat</span>
              </li>
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-1 transition"
            >
              <span>Post a Job Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How HireFlow Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            A frictionless, transparent experience engineered to connect great talent with forward-thinking teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Create an Account</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign up as a Job Seeker to build your professional profile and resume, or as a Recruiter to showcase your company.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Connect & Apply</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore filtered opportunities with transparent compensation, or post listings and immediately receive qualified applications.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pipeline & Realtime Chat</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your stage progress with live notifications and communicate directly through instant in-app messaging.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto leading-tight">
            Ready to Streamline Your Hiring & Job Search?
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Join HireFlow today and experience modern recruitment without friction, artificial delays, or spam.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-white/20"
            >
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};