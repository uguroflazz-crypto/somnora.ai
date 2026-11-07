import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400';

  return (
    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl border backdrop-blur-md animate-slide-up z-50 ${bgColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
        <p className="font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
