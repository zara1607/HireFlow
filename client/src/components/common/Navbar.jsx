import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  FileText,
  LayoutDashboard,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from './Badge';

export const Navbar = () => {
  const { user, isAuthenticated, isRecruiter, isCandidate, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Hire<span className="text-emerald-600">Flow</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/jobs"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  isActive('/jobs')
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Jobs
              </Link>

              {isAuthenticated && isCandidate && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/candidate/dashboard')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/applications"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/candidate/applications')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Applications
                  </Link>
                  <Link
                    to="/candidate/chat"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/candidate/chat')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Messages
                  </Link>
                </>
              )}

              {isAuthenticated && isRecruiter && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/recruiter/dashboard')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/recruiter/jobs')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Job Postings
                  </Link>
                  <Link
                    to="/recruiter/chat"
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive('/recruiter/chat')
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Messages
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Recruiter Quick Post Job button */}
                {isRecruiter && (
                  <Link
                    to="/recruiter/jobs/new"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post a Job</span>
                  </Link>
                )}

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <Badge variant="danger" size="sm">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.link) navigate(n.link);
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3 hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3 ${
                                !n.isRead ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                                <Bell className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {n.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 text-center">
                        <Link
                          to={isRecruiter ? '/recruiter/notifications' : '/candidate/notifications'}
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <div className="mt-1.5">
                          <Badge variant={isRecruiter ? 'purple' : 'emerald'} size="sm">
                            {isRecruiter ? 'Recruiter' : 'Job Seeker'}
                          </Badge>
                        </div>
                      </div>

                      <Link
                        to={isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to={isRecruiter ? '/recruiter/profile' : '/candidate/profile'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={() => navigate(isRecruiter ? '/recruiter/notifications' : '/candidate/notifications')}
                className="relative p-2 text-slate-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Jobs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              {isCandidate && (
                <Link
                  to="/candidate/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Applications
                </Link>
              )}
              {isRecruiter && (
                <>
                  <Link
                    to="/recruiter/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Job Postings
                  </Link>
                  <Link
                    to="/recruiter/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    + Post a New Job
                  </Link>
                </>
              )}
              <Link
                to={isRecruiter ? '/recruiter/chat' : '/candidate/chat'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Messages
              </Link>
              <Link
                to={isRecruiter ? '/recruiter/profile' : '/candidate/profile'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
