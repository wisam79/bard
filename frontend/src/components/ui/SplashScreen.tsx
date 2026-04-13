import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark font-arabic overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/7 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[140px]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
          <div className="absolute w-2 h-2 bg-primary-400/35 rounded-full animate-orbit" style={{ animationDuration: '15s' }} />
          <div className="absolute w-1.5 h-1.5 bg-primary-300/25 rounded-full animate-orbit" style={{ animationDuration: '20s', animationDelay: '-5s' }} />
          <div className="absolute w-1 h-1 bg-primary-200/15 rounded-full animate-orbit" style={{ animationDuration: '25s', animationDelay: '-10s' }} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-10 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/25 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-28 h-28 rounded-[2rem] premium-gradient-bg flex items-center justify-center shadow-2xl shadow-primary-500/35 border border-white/15 animate-float">
            <span className="text-5xl font-black text-white tracking-tight">B</span>
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-5xl font-black text-white tracking-tight">
            Bard
          </h1>
          <div className="flex items-center gap-2 justify-center">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary-500/40" />
            <p className="text-[11px] text-white/35 font-bold uppercase tracking-[0.4em]">
              Premium POS Engine
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary-500/40" />
          </div>
        </div>

        <div className="w-72 h-[3px] bg-white/8 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 rounded-full animate-loading-bar shadow-lg shadow-primary-500/50" />
        </div>

        <div className="flex items-center gap-3 text-[9px] font-bold text-white/25 uppercase tracking-[0.3em] mt-6">
          <div className="w-1 h-1 rounded-full bg-primary-500/40" />
          <span>v3.0.0</span>
          <div className="w-px h-2 bg-white/15" />
          <span>Stable</span>
          <div className="w-1 h-1 rounded-full bg-primary-500/40" />
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
