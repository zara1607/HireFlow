import React from 'react';
import { ChatInterface } from '../../components/chat/ChatInterface';

export const CandidateChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Candidate Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Realtime direct messaging with hiring managers and recruiters.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};
