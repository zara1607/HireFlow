import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 space-x-3">
      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      <span className="text-slate-600 font-medium text-sm">{text}</span>
    </div>
  );
};
