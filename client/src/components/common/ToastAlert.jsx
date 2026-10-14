import React from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const ToastAlert = () => {
  const { toastNotification, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (!toastNotification) return null;

  const handleClick = () => {
    if (toastNotification.link) {
      navigate(toastNotification.link);
    }
    dismissToast();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between space-x-3">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={handleClick}
        >
          <h4 className="text-sm font-semibold text-slate-100 mb-0.5">
            {toastNotification.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2">
            {toastNotification.message}
          </p>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
