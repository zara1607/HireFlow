import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Loader2,
  Download,
} from 'lucide-react';

export const CandidateProfilePage = () => {
  const { user, updateProfile, uploadResume } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState(user?.education || []);
  const [experience, setExperience] = useState(user?.experience || []);

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Skills handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      { school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' },
    ]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: '',
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        current: false,
      },
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Resume upload handler
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('resume', file);
      await uploadResume(formData);
      setStatusMessage({ type: 'success', text: 'Resume document uploaded successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload resume document.',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  // Save profile info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await updateProfile({
        name,
        headline,
        bio,
        skills,
        education,
        experience,
      });
      setStatusMessage({ type: 'success', text: 'Candidate profile saved successfully!' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Candidate Profile & Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your credentials, tech stack, and uploaded resume for seamless applications.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-2 text-xs font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Resume Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>Resume Document</span>
        </h2>
        <p className="text-xs text-slate-500">
          Accepted formats: PDF, DOC, DOCX up to 5MB. This document is automatically used when applying to jobs.
        </p>

        {user?.resume?.filename ? (
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {user.resume.originalName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Uploaded on {new Date(user.resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="cursor-pointer px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition">
                {uploadingResume ? 'Uploading...' : 'Replace Resume'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No resume on file</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Upload your resume to apply for positions quickly</p>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition">
              {uploadingResume ? 'Uploading...' : 'Select Resume File'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* General Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Account)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Headline / Title
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Bio / Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Briefly describe your career background and areas of expertise..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Skills & Tech Stack</h2>
          <p className="text-xs text-slate-500">
            Add skills so recruiters can match you with relevant openings.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. React, Node.js, GraphQL, PostgreSQL..."
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 transition"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span>Work Experience</span>
            </h2>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(idx, 'startDate', e.target.value)}
                      placeholder="e.g. Jan 2022"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleUpdateExperience(idx, 'endDate', e.target.value)}
                      placeholder="e.g. Present"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                    placeholder="Key contributions and achievements..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>Education</span>
            </h2>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">School / University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                      placeholder="University Name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree & Field</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
