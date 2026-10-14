const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  getAllRecruiterApplicants,
  updateApplicationStatus,
  updateRecruiterNotes,
  scheduleInterview,
  downloadResume,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');

// Candidate routes
router.post(
  '/',
  protect,
  authorize('JOB_SEEKER'),
  uploadMiddleware.single('resume'),
  applyForJob
);
router.get('/my-applications', protect, authorize('JOB_SEEKER'), getMyApplications);

// Recruiter routes
router.get('/recruiter/all', protect, authorize('RECRUITER'), getAllRecruiterApplicants);
router.get('/job/:jobId', protect, authorize('RECRUITER'), getJobApplicants);
router.patch('/:id/status', protect, authorize('RECRUITER'), updateApplicationStatus);
router.patch('/:id/notes', protect, authorize('RECRUITER'), updateRecruiterNotes);
router.put('/:id/interview', protect, authorize('RECRUITER'), scheduleInterview);

// Shared route (authorized candidate or recruiter)
router.get('/:id/resume', protect, downloadResume);

module.exports = router;
