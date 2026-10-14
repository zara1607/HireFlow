import React from 'react';
import { ChatInterface } from '../../components/chat/ChatInterface';

export const RecruiterChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Recruiter Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Communicate in real time with candidates across all your open postings.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};
