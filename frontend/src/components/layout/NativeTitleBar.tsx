import React from 'react';
import { Minus, Square, X } from 'lucide-react';

export const NativeTitleBar: React.FC = () => {
  return (
    <div className="h-10 bg-brand-surface border-b border-brand-border flex items-center justify-between select-none drag-region shadow-sm relative z-50">
      <div className="px-4 flex items-center gap-3">
        <div className="w-5 h-5 rounded-lg bg-primary-500 flex items-center justify-center">
          <span className="text-[10px] font-black dark:text-white text-gray-900">B</span>
        </div>
        <span className="text-[10px] font-black text-brand-accent/60 uppercase tracking-[0.2em]">Bard • نظام إدارة المبيعات المتطور</span>
      </div>
      <div className="flex no-drag h-full">
        <button
          onClick={() => window.runtime?.WindowMinimise()}
          className="w-12 h-full flex items-center justify-center hover:bg-brand-border/50 text-brand-accent/40 hover:dark:text-white text-gray-900 transition-all"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => window.runtime?.WindowMaximise()}
          className="w-12 h-full flex items-center justify-center hover:bg-brand-border/50 text-brand-accent/40 hover:dark:text-white text-gray-900 transition-all"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => window.runtime?.Quit()}
          className="w-12 h-full flex items-center justify-center hover:bg-red-500 text-brand-accent/40 hover:text-white transition-all"
        >
          <X size={18} />
        </button>
      </div>
      <style>{`
        .drag-region {
          -webkit-app-region: drag;
        }
        .no-drag {
          -webkit-app-region: no-drag;
        }
      `}</style>
    </div>
  );
};
