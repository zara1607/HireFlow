const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  getCandidateById,
  getSavedJobs,
  saveJob,
  removeSavedJob,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/saved-jobs', protect, authorize('JOB_SEEKER'), getSavedJobs);
router.put('/saved-jobs/:jobId', protect, authorize('JOB_SEEKER'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('JOB_SEEKER'), removeSavedJob);
router.post(
  '/resume',
  protect,
  authorize('JOB_SEEKER'),
  uploadMiddleware.single('resume'),
  uploadResume
);
router.get('/candidate/:id', protect, getCandidateById);

module.exports = router;
