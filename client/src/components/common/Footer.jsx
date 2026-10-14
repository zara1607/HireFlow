import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Shield, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Hire<span className="text-emerald-600">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm">
              The modern recruitment platform connecting high-growth companies with exceptional candidates through streamlined hiring pipelines and realtime communication.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="inline-flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Role-Protected Auth
              </span>
              <span className="inline-flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                Realtime Messaging
              </span>
            </div>
          </div>

          {/* Candidate links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/jobs" className="hover:text-emerald-600 transition">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidate/profile" className="hover:text-emerald-600 transition">
                  Candidate Profile
                </Link>
              </li>
              <li>
                <Link to="/candidate/applications" className="hover:text-emerald-600 transition">
                  Track Applications
                </Link>
              </li>
              <li>
                <Link to="/candidate/chat" className="hover:text-emerald-600 transition">
                  Direct Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiter links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Recruiters
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link to="/recruiter/jobs/new" className="hover:text-emerald-600 transition">
                  Post a Position
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-emerald-600 transition">
                  Recruiter Pipeline
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="hover:text-emerald-600 transition">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link to="/recruiter/chat" className="hover:text-emerald-600 transition">
                  Candidate Chat
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} HireFlow Inc. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Engineered with React, Node.js, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};
