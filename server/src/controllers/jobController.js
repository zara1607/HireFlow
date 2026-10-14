const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const jobSorts = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  salary_asc: { salaryMin: 1, createdAt: -1 },
  salary_desc: { salaryMax: -1, createdAt: -1 },
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      employmentType,
      experienceLevel,
      category,
      salaryMin,
      salaryMax,
      skills,
    } = req.body;

    if (!title || !description || !company || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, company, and location',
      });
    }

    const job = await Job.create({
      recruiter: req.user._id,
      title,
      description,
      company,
      location,
      employmentType: employmentType || 'FULL_TIME',
      experienceLevel: experienceLevel || 'MID',
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      skills: Array.isArray(skills) ? skills : typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      category,
      status: 'OPEN',
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs with search and filtering
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      employmentType,
      experienceLevel,
      category,
      salaryMin,
      salaryMax,
      featured,
      status = 'OPEN',
      page = 1,
      limit = 12,
      sort = 'newest',
    } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (keyword && keyword.trim() !== '') {
      const regex = new RegExp(escapeRegex(keyword.trim()), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { company: regex },
        { skills: { $in: [regex] } },
      ];
    }

    if (location && location.trim() !== '') {
      query.location = new RegExp(escapeRegex(location.trim()), 'i');
    }

    if (employmentType && employmentType !== 'ALL') {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'ALL') {
      query.experienceLevel = experienceLevel;
    }

    if (category && category !== 'ALL') query.category = category;
    if (featured === 'true') query.featured = true;
    if (salaryMin !== undefined && Number.isFinite(Number(salaryMin))) {
      query.salaryMax = { $gte: Number(salaryMin) };
    }
    if (salaryMax !== undefined && Number.isFinite(Number(salaryMax))) {
      query.salaryMin = { ...(query.salaryMin || {}), $lte: Number(salaryMax) };
    }

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12));
    const skip = (currentPage - 1) * pageSize;
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email companyName companyLocation companyWebsite')
      .sort(jobSorts[sort] || jobSorts.newest)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter',
      'name email companyName companyDescription companyWebsite companyLocation'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Ensure user is the job owner
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job posting',
      });
    }

    const fields = [
      'title',
      'description',
      'company',
      'location',
      'category',
      'employmentType',
      'experienceLevel',
      'salaryMin',
      'salaryMax',
      'status',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (req.body.skills !== undefined) {
      job.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : typeof req.body.skills === 'string'
        ? req.body.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job posting',
      });
    }

    // Delete related applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs for current recruiter with applicant counts
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter only)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

    // Aggregate applicant counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        const interviewCount = await Application.countDocuments({ job: job._id, status: 'INTERVIEW' });
        const hiredCount = await Application.countDocuments({ job: job._id, status: 'HIRED' });
        return {
          ...job.toObject(),
          applicantCount,
          interviewCount,
          hiredCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

const getJobCategories = async (req, res, next) => {
  try {
    const categories = await Job.distinct('category', { status: 'OPEN' });
    res.status(200).json({ success: true, categories: categories.filter(Boolean).sort() });
  } catch (err) {
    next(err);
  }
};

const getRecommendedJobs = async (req, res, next) => {
  try {
    const candidate = await User.findById(req.user._id).select('skills');
    const appliedJobIds = await Application.distinct('job', { candidate: req.user._id });
    const jobs = await Job.find({ status: 'OPEN', _id: { $nin: appliedJobIds } })
      .populate('recruiter', 'name companyName companyLocation companyWebsite')
      .sort({ featured: -1, createdAt: -1 })
      .limit(100);
    const skills = new Set((candidate?.skills || []).map((skill) => skill.toLowerCase().trim()));
    const recommendations = jobs
      .map((job) => {
        const matchedSkills = job.skills.filter((skill) => skills.has(skill.toLowerCase().trim()));
        return { job, matchedSkills, score: matchedSkills.length };
      })
      .sort((left, right) => right.score - left.score || right.job.createdAt - left.job.createdAt)
      .slice(0, 4)
      .map(({ job, matchedSkills, score }) => ({
        ...job.toObject(),
        matchScore: score,
        matchedSkills,
      }));

    res.status(200).json({ success: true, jobs: recommendations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobCategories,
  getRecommendedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
};
