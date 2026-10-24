const User = require('../models/User');
const Job = require('../models/Job');
const fs = require('fs');
const { cloudinary, cloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Common fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    if (user.role === 'JOB_SEEKER') {
      if (req.body.headline !== undefined) user.headline = req.body.headline;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (Array.isArray(req.body.skills)) user.skills = req.body.skills;
      if (Array.isArray(req.body.education)) user.education = req.body.education;
      if (Array.isArray(req.body.experience)) user.experience = req.body.experience;
    } else if (user.role === 'RECRUITER') {
      if (req.body.companyName !== undefined) user.companyName = req.body.companyName;
      if (req.body.companyDescription !== undefined) user.companyDescription = req.body.companyDescription;
      if (req.body.companyWebsite !== undefined) user.companyWebsite = req.body.companyWebsite;
      if (req.body.companyLocation !== undefined) user.companyLocation = req.body.companyLocation;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload candidate resume
// @route   POST /api/users/resume
// @access  Private (Job Seeker only)
const uploadResume = async (req, res, next) => {
  let uploadedAsset;
  let responseSent = false;
  let removeTemporaryFile = false;

  try {
    if (!req.file) {
      responseSent = true;
      return res.status(400).json({
        success: false,
        message: 'Please select a resume file to upload (PDF, DOC, or DOCX)',
      });
    }

    removeTemporaryFile = cloudinaryConfigured || process.env.NODE_ENV === 'production';
    if (!cloudinaryConfigured && process.env.NODE_ENV === 'production') {
      const error = new Error('Resume storage is not configured. Set the Cloudinary environment variables.');
      error.statusCode = 503;
      throw error;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      responseSent = true;
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let fileUrl = `/uploads/resumes/${req.file.filename}`;
    let filename = req.file.filename;

    if (cloudinaryConfigured) {
      uploadedAsset = await cloudinary.uploader.upload(req.file.path, {
        folder: 'hireflow/resumes',
        resource_type: 'raw',
        type: 'authenticated',
        use_filename: true,
        unique_filename: true,
      });
      fileUrl = `cloudinary://${uploadedAsset.public_id}`;
      filename = uploadedAsset.public_id;
    }

    user.resume = {
      url: fileUrl,
      filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    await user.save();

    responseSent = true;
    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: user.resume,
    });
  } catch (err) {
    if (uploadedAsset && !responseSent) {
      try {
        await cloudinary.uploader.destroy(uploadedAsset.public_id, {
          resource_type: 'raw',
          type: 'authenticated',
        });
      } catch (cleanupError) {
        console.error('Failed to remove an unreferenced resume from Cloudinary:', cleanupError);
      }
    }
    next(err);
  } finally {
    if (removeTemporaryFile && req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error('Failed to remove temporary resume upload:', cleanupError);
        }
      }
    }
  }
};

// @desc    Get candidate profile by ID
// @route   GET /api/users/candidate/:id
// @access  Private
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await User.findOne({
      _id: req.params.id,
      role: 'JOB_SEEKER',
    }).select('-password');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (err) {
    next(err);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'recruiter', select: 'name companyName companyLocation' },
    });
    res.status(200).json({
      success: true,
      jobs: (user?.savedJobs || []).filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, status: 'OPEN' });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Open job not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user.savedJobs.some((savedId) => savedId.toString() === job._id.toString())) {
      user.savedJobs.push(job._id);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Job saved successfully' });
  } catch (err) {
    next(err);
  }
};

const removeSavedJob = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { savedJobs: req.params.jobId } }
    );
    res.status(200).json({ success: true, message: 'Saved job removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  getCandidateById,
  getSavedJobs,
  saveJob,
  removeSavedJob,
};
