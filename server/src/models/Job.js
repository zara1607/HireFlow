const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: 'Software Engineering',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'FULL_TIME',
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'],
        message: '{VALUE} is not a valid experience level',
      },
      default: 'MID',
    },
    salaryMin: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching & filtering
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ employmentType: 1, experienceLevel: 1, location: 1, status: 1, category: 1 });

module.exports = mongoose.model('Job', jobSchema);
