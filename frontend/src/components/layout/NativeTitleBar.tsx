import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { wailsWindow } from '@/lib/wails';

export const NativeTitleBar: React.FC = () => {
  return (
    <div className="h-9 bg-brand-surface/60 dark:bg-[#252526] border-b border-brand-border/20 dark:border-white/[0.04] flex items-center justify-between select-none drag-region relative z-50 backdrop-blur-xl">
      <div className="px-4 flex items-center gap-3">
        <div className="w-4 h-4 rounded-md premium-gradient-bg flex items-center justify-center shadow-sm shadow-primary-500/20">
          <span className="text-[8px] font-black text-white">B</span>
        </div>
        <span className="text-[10px] font-bold text-brand-accent/30 dark:text-white/20 uppercase tracking-[0.15em]">Bard</span>
        <div className="w-px h-3 bg-brand-border/20 dark:bg-white/[0.06]" />
        <span className="text-[10px] font-medium text-brand-accent/20 dark:text-white/10">نظام إدارة المبيعات</span>
      </div>
      <div className="flex no-drag h-full">
        <button
          onClick={wailsWindow.minimise}
          className="w-11 h-full flex items-center justify-center hover:bg-brand-border/20 dark:hover:bg-white/[0.04] text-brand-accent/30 dark:text-white/20 hover:text-brand-accent/60 dark:hover:text-white/50 transition-all duration-200"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={wailsWindow.toggleMaximise}
          className="w-11 h-full flex items-center justify-center hover:bg-brand-border/20 dark:hover:bg-white/[0.04] text-brand-accent/30 dark:text-white/20 hover:text-brand-accent/60 dark:hover:text-white/50 transition-all duration-200"
        >
          <Square size={10} />
        </button>
        <button
          onClick={wailsWindow.quit}
          className="w-11 h-full flex items-center justify-center hover:bg-red-500/80 text-brand-accent/30 dark:text-white/20 hover:text-white transition-all duration-200"
        >
          <X size={15} />
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
