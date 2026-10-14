const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45, min: 15, max: 240 },
    location: { type: String, trim: true, default: '' },
    meetingUrl: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
      index: true,
    },
    resume: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'APPLIED',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [5000, 'Private notes cannot exceed 5000 characters'],
    },
    interview: {
      type: interviewSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: candidate cannot apply to the same job twice
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
