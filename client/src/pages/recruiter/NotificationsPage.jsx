import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { EmptyState } from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../utils/constants';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';

export const RecruiterNotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const navigate = useNavigate();

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Hiring Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Realtime notifications when new candidates apply or send direct messages.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterUnreadOnly
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {displayedNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are caught up! When applicants submit materials or send messages, alerts will arrive here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {displayedNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition ${
                !n.isRead ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    !n.isRead
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.link && (
                <div className="shrink-0 text-slate-400 hover:text-emerald-600 p-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
