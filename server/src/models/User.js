const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  school: { type: String, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: String },
  endYear: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true },
  title: { type: String, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
  current: { type: Boolean, default: false },
});

const resumeSchema = new mongoose.Schema({
  url: { type: String },
  filename: { type: String },
  originalName: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['JOB_SEEKER', 'RECRUITER'],
        message: '{VALUE} is not a valid role. Choose JOB_SEEKER or RECRUITER',
      },
      required: [true, 'Please select a role'],
    },
    avatar: {
      type: String,
      default: '',
    },
    // Recruiter specific fields
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    companyDescription: {
      type: String,
      trim: true,
      default: '',
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    companyLocation: {
      type: String,
      trim: true,
      default: '',
    },
    // Job Seeker specific fields
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    resume: {
      type: resumeSchema,
      default: null,
    },
    savedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform to strip password when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
