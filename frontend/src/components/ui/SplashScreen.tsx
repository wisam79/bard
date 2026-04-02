import React from 'react';

interface SplashScreenProps {}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark font-arabic overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 via-brand-dark to-brand-surface/10" />
      
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 animate-pulse" />
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/40 relative z-10 border border-white/10">
            <span className="text-4xl font-black dark:text-white text-gray-900">B</span>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-black dark:text-white text-gray-900 tracking-tight mb-2">Bard</h1>
          <p className="text-[10px] text-brand-accent/40 font-black uppercase tracking-[0.4em] mr-1">Smart POS Solutions</p>
        </div>

        <div className="w-64 h-1.5 bg-brand-surface rounded-full overflow-hidden border border-brand-border/30 relative">
          <div className="h-full bg-primary-500 rounded-full animate-loading-bar shadow-lg shadow-primary-500/50" />
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black text-brand-accent/20 uppercase tracking-widest mt-10">
          <div className="w-1 h-1 rounded-full bg-primary-500/50" />
          <span>نسخة التطوير 3.0.0</span>
          <div className="w-1 h-1 rounded-full bg-primary-500/50" />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </div>
  );
};
