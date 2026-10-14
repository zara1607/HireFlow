import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, DollarSign, Calendar, ArrowRight, Bookmark } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatSalary, formatTimeAgo } from '../../utils/constants';

export const JobCard = ({ job, onApply, isSaved = false, onToggleSave }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Company & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 shrink-0">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center mt-0.5">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job)}
                aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                title={isSaved ? 'Remove saved job' : 'Save job'}
                className={`p-2 rounded-lg border transition ${isSaved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
            <Badge variant="blue" size="sm">
              {job.employmentType.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {job.category && (
          <span className="inline-flex mb-3 px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
            {job.category}
          </span>
        )}

        {/* Location & Salary */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 mb-3.5">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {job.location}
          </span>
          <span className="flex items-center font-medium text-slate-700">
            <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-500" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {formatTimeAgo(job.createdAt)}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Skill tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center space-x-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onApply && (
          <button
            onClick={() => onApply(job)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};
