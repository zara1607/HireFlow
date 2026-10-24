const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is closed and no longer accepting applications',
      });
    }

    // Check if candidate already applied
    const existing = await Application.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position',
      });
    }

    // Determine resume to attach
    let resumeData = null;
    if (req.file) {
      resumeData = {
        url: `/uploads/resumes/${req.file.filename}`,
        filename: req.file.filename,
        originalName: req.file.originalname,
      };
      // Also update candidate profile resume if not set
      if (!req.user.resume) {
        req.user.resume = {
          ...resumeData,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
        };
        await req.user.save();
      }
    } else if (req.user.resume && req.user.resume.filename) {
      resumeData = {
        url: req.user.resume.url,
        filename: req.user.resume.filename,
        originalName: req.user.resume.originalName,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume or add a resume to your profile before applying',
      });
    }

    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      recruiter: job.recruiter,
      resume: resumeData,
      coverLetter: coverLetter || '',
      status: 'APPLIED',
    });

    // Create notification for recruiter
    try {
      const notif = await Notification.create({
        recipient: job.recruiter,
        sender: req.user._id,
        type: 'NEW_APPLICANT',
        title: 'New Job Application',
        message: `${req.user.name} applied for "${job.title}" at ${job.company}`,
        link: `/recruiter/jobs/${job._id}/applicants`,
      });

      // Emit realtime notification via socket if available
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${job.recruiter.toString()}`).emit('notification', notif);
      }
    } catch (notifErr) {
      console.error('Failed to create recruiter notification:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications submitted by logged-in candidate
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker only)
const getMyApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { candidate: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .select('-notes')
      .populate('job', 'title company location employmentType experienceLevel salaryMin salaryMax status')
      .populate('recruiter', 'name email companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applicants for a specific job (Recruiter only)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Verify recruiter owns this job
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants for this job',
      });
    }

    const { status } = req.query;
    const query = { job: req.params.jobId };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const applicants = await Application.find(query)
      .populate('candidate', 'name email headline bio skills education experience resume avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      job,
      count: applicants.length,
      applicants,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applicants across all recruiter jobs
// @route   GET /api/applications/recruiter/all
// @access  Private (Recruiter only)
const getAllRecruiterApplicants = async (req, res, next) => {
  try {
    const { status, jobId } = req.query;
    const query = { recruiter: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (jobId && jobId !== 'ALL') {
      query.job = jobId;
    }

    const applicants = await Application.find(query)
      .populate('candidate', 'name email headline bio skills education experience resume avatar')
      .populate('job', 'title company location employmentType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Recruiter pipeline management)
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company')
      .populate('candidate', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify recruiter owns this application
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this application',
      });
    }

    application.status = status;
    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    // Create notification for candidate
    try {
      const statusLabels = {
        SHORTLISTED: 'Your application has been Shortlisted! 🎉',
        INTERVIEW: 'You have been invited for an Interview! 📞',
        HIRED: 'Congratulations! You have been marked as Hired! 🚀',
        REJECTED: 'Update regarding your application',
        APPLIED: 'Your application status was updated to Applied',
      };

      const notif = await Notification.create({
        recipient: application.candidate._id,
        sender: req.user._id,
        type: 'APPLICATION_STATUS_CHANGED',
        title: `Application Status: ${status}`,
        message: `${statusLabels[status] || `Status updated to ${status}`} for position "${application.job.title}" at ${application.job.company}.`,
        link: '/candidate/applications',
      });

      // Emit realtime socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${application.candidate._id.toString()}`).emit('notification', notif);
        io.to(`user_${application.candidate._id.toString()}`).emit('application_updated', {
          applicationId: application._id,
          status,
        });
      }
    } catch (notifErr) {
      console.error('Failed to notify candidate:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

const updateRecruiterNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (typeof notes !== 'string' || notes.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Private notes must be text under 5000 characters',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this application' });
    }

    application.notes = notes.trim();
    await application.save();
    res.status(200).json({ success: true, notes: application.notes });
  } catch (err) {
    next(err);
  }
};

const scheduleInterview = async (req, res, next) => {
  try {
    const scheduledAt = new Date(req.body.scheduledAt);
    const durationMinutes = Number(req.body.durationMinutes || 45);
    const meetingUrl = String(req.body.meetingUrl || '').trim();

    if (!req.body.scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'Choose a valid future interview time' });
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) {
      return res.status(400).json({ success: false, message: 'Interview duration must be between 15 and 240 minutes' });
    }
    if (meetingUrl) {
      try {
        if (!['http:', 'https:'].includes(new URL(meetingUrl).protocol)) throw new Error('Invalid protocol');
      } catch {
        return res.status(400).json({ success: false, message: 'Enter a valid http or https meeting link' });
      }
    }

    const application = await Application.findById(req.params.id)
      .populate('job', 'title company')
      .populate('candidate', 'name');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this application' });
    }

    application.interview = {
      scheduledAt,
      durationMinutes,
      location: String(req.body.location || '').trim(),
      meetingUrl,
      message: String(req.body.message || '').trim(),
      updatedAt: new Date(),
    };
    application.status = 'INTERVIEW';
    await application.save();

    try {
      const notification = await Notification.create({
        recipient: application.candidate._id,
        sender: req.user._id,
        type: 'APPLICATION_STATUS_CHANGED',
        title: 'Interview scheduled',
        message: `An interview for ${application.job.title} is scheduled for ${scheduledAt.toLocaleString()}.`,
        link: '/candidate/applications',
      });
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${application.candidate._id}`).emit('notification', notification);
        io.to(`user_${application.candidate._id}`).emit('application_updated', {
          applicationId: application._id,
          status: application.status,
        });
      }
    } catch (notificationError) {
      console.error('Failed to notify candidate about interview:', notificationError.message);
    }

    res.status(200).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @desc    Download / view resume file securely
// @route   GET /api/applications/:id/resume
// @access  Private (Candidate owner or Job Recruiter owner)
const downloadResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check authorization: must be the candidate or the recruiter
    const isCandidate = application.candidate.toString() === req.user._id.toString();
    const isRecruiter = application.recruiter.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resume',
      });
    }

    if (!application.resume || !application.resume.filename) {
      return res.status(404).json({
        success: false,
        message: 'No resume file found for this application',
      });
    }

    if (application.resume.url?.startsWith('cloudinary://')) {
      const signedUrl = cloudinary.url(application.resume.filename, {
        resource_type: 'raw',
        type: 'authenticated',
        sign_url: true,
        secure: true,
      });
      return res.redirect(302, signedUrl);
    }

    if (application.resume.url?.startsWith('https://res.cloudinary.com/')) {
      return res.redirect(302, application.resume.url);
    }

    // Safe path resolution
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    const safeFilename = path.basename(application.resume.filename);
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file does not exist on the server',
      });
    }

    res.download(filePath, application.resume.originalName || 'resume.pdf');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  getAllRecruiterApplicants,
  updateApplicationStatus,
  updateRecruiterNotes,
  scheduleInterview,
  downloadResume,
};
