export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'REMOTE', label: 'Remote' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Entry Level (0-2 yrs)' },
  { value: 'MID', label: 'Mid Level (2-5 yrs)' },
  { value: 'SENIOR', label: 'Senior Level (5-8 yrs)' },
  { value: 'LEAD', label: 'Lead / Principal (8+ yrs)' },
  { value: 'EXECUTIVE', label: 'Executive / Director' },
];

export const JOB_CATEGORIES = [
  'Software Engineering',
  'Full Stack',
  'Backend',
  'Frontend',
  'AI / ML',
  'Data',
  'Cloud / DevOps',
  'Cybersecurity',
  'Mobile',
  'UI / UX',
  'QA',
  'Product',
  'Analytics',
  'Marketing',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Other',
];

export const APPLICATION_STATUSES = [
  {
    value: 'APPLIED',
    label: 'Applied',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  {
    value: 'SHORTLISTED',
    label: 'Shortlisted',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  {
    value: 'INTERVIEW',
    label: 'Interviewing',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    value: 'HIRED',
    label: 'Hired',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    value: 'REJECTED',
    label: 'Declined',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
];

export const getStatusConfig = (status) => {
  return (
    APPLICATION_STATUSES.find((s) => s.value === status) || {
      value: status,
      label: status,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400',
    }
  );
};

export const formatSalary = (min, max) => {
  if (!min && !max) return 'Competitive';
  const formatNum = (num) =>
    num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
  if (min && max) return `${formatNum(min)} - ${formatNum(max)} / yr`;
  if (min) return `From ${formatNum(min)} / yr`;
  return `Up to ${formatNum(max)} / yr`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};
