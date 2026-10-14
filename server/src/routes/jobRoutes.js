const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobCategories,
  getRecommendedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Recruiter specific list (placed before :id parameter)
router.get('/recruiter/my-jobs', protect, authorize('RECRUITER'), getRecruiterJobs);
router.get('/recommended', protect, authorize('JOB_SEEKER'), getRecommendedJobs);

// Public job search & details
router.get('/categories', getJobCategories);
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter management
router.post('/', protect, authorize('RECRUITER'), createJob);
router.put('/:id', protect, authorize('RECRUITER'), updateJob);
router.delete('/:id', protect, authorize('RECRUITER'), deleteJob);

module.exports = router;
