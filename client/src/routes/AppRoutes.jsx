import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public pages
import { LandingPage } from '../pages/common/LandingPage';
import { LoginPage } from '../pages/common/LoginPage';
import { RegisterPage } from '../pages/common/RegisterPage';
import { JobMarketplacePage } from '../pages/common/JobMarketplacePage';
import { JobDetailsPage } from '../pages/common/JobDetailsPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

// Candidate pages
import { CandidateDashboardPage } from '../pages/candidate/DashboardPage';
import { CandidateProfilePage } from '../pages/candidate/ProfilePage';
import { CandidateApplicationsPage } from '../pages/candidate/ApplicationsPage';
import { SavedJobsPage } from '../pages/candidate/SavedJobsPage';
import { CandidateChatPage } from '../pages/candidate/ChatPage';
import { CandidateNotificationsPage } from '../pages/candidate/NotificationsPage';

// Recruiter pages
import { RecruiterDashboardPage } from '../pages/recruiter/DashboardPage';
import { RecruiterProfilePage } from '../pages/recruiter/ProfilePage';
import { RecruiterJobsListPage } from '../pages/recruiter/JobsListPage';
import { RecruiterCreateJobPage } from '../pages/recruiter/CreateJobPage';
import { RecruiterEditJobPage } from '../pages/recruiter/EditJobPage';
import { RecruiterApplicantsPipelinePage } from '../pages/recruiter/ApplicantsPipelinePage';
import { RecruiterChatPage } from '../pages/recruiter/ChatPage';
import { RecruiterNotificationsPage } from '../pages/recruiter/NotificationsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobMarketplacePage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
      </Route>

      {/* Candidate Portal Routes (Protected: JOB_SEEKER only) */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="saved-jobs" element={<SavedJobsPage />} />
        <Route path="chat" element={<CandidateChatPage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
      </Route>

      {/* Recruiter Portal Routes (Protected: RECRUITER only) */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboardPage />} />
        <Route path="profile" element={<RecruiterProfilePage />} />
        <Route path="jobs" element={<RecruiterJobsListPage />} />
        <Route path="jobs/new" element={<RecruiterCreateJobPage />} />
        <Route path="jobs/:id/edit" element={<RecruiterEditJobPage />} />
        <Route path="jobs/:id/applicants" element={<RecruiterApplicantsPipelinePage />} />
        <Route path="chat" element={<RecruiterChatPage />} />
        <Route path="notifications" element={<RecruiterNotificationsPage />} />
      </Route>

      {/* 404 Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
