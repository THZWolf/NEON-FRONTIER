import React from 'react';
import { ToastNotification } from '../types/game';

interface ToastProps {
  toast: ToastNotification | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const colorStyles = {
    cyan: 'border-[#66f4e8] text-[#66f4e8] shadow-[0_0_15px_rgba(102,244,232,0.3)]',
    pink: 'border-[#ff5fa2] text-[#ff5fa2] shadow-[0_0_15px_rgba(255,95,162,0.3)]',
    amber: 'border-[#ffd166] text-[#ffd166] shadow-[0_0_15px_rgba(255,209,102,0.3)]',
    default: 'border-[#31516b] text-[#eaf5ff]',
  }[toast.type || 'default'];

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className={`bg-[#091624]/95 backdrop-blur-md border px-4 py-1.5 rounded-full text-xs font-mono tracking-wide ${colorStyles}`}>
        {toast.text}
      </div>
    </div>
  );
};
