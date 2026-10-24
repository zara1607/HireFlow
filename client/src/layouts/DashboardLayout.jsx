import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  Bookmark,
  MessageSquare,
  User,
  PlusCircle,
  Bell,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Navbar } from '../components/common/Navbar';
import { ToastAlert } from '../components/common/ToastAlert';
import { PageErrorBoundary } from '../components/common/PageErrorBoundary';

export const DashboardLayout = () => {
  const { isRecruiter, isCandidate } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/jobs', icon: Briefcase, label: 'Find Jobs' },
    { to: '/candidate/applications', icon: FileCheck2, label: 'My Applications' },
    { to: '/candidate/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/candidate/chat', icon: MessageSquare, label: 'Messages' },
    { to: '/candidate/profile', icon: User, label: 'Profile & Resume' },
    { to: '/candidate/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Recruiter Hub' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Manage Jobs' },
    { to: '/recruiter/jobs/new', icon: PlusCircle, label: 'Post a New Job' },
    { to: '/recruiter/chat', icon: MessageSquare, label: 'Candidate Chat' },
    { to: '/recruiter/profile', icon: Building, label: 'Company Profile' },
    { to: '/recruiter/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  const links = isRecruiter ? recruiterLinks : candidateLinks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm sticky top-24">
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;

                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge > 0 && (
                        <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="lg:col-span-4 min-w-0">
            <PageErrorBoundary key={location.pathname}>
              <Outlet />
            </PageErrorBoundary>
          </main>
        </div>
      </div>
      <ToastAlert />
    </div>
  );
};
