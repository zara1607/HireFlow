import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="text-6xl font-extrabold text-slate-300 mb-2">404</span>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for doesn't exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
      >
        <Home className="w-4 h-4 mr-1.5" />
        Return to Home
      </Link>
    </div>
  );
};
