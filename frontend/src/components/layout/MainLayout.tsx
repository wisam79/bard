import React, { lazy, Suspense, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store';
import { NativeTitleBar } from './NativeTitleBar';
import CommandPalette from '@/components/features/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AnimatePresence, motion } from 'framer-motion';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Sales = lazy(() => import('@/pages/Sales'));
const Products = lazy(() => import('@/pages/Products'));
const Customers = lazy(() => import('@/pages/Customers'));
const Finance = lazy(() => import('@/pages/Finance'));
const Operations = lazy(() => import('@/pages/Operations'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      <span className="text-[10px] font-semibold text-brand-muted/30 dark:text-white/20 uppercase tracking-wider">جاري التحميل</span>
    </div>
  </div>
);

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

export const MainLayout: React.FC = () => {
  const { activeView } = useAppStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  useKeyboardShortcuts({
    onCommandPalette: openCommandPalette,
    onEscape: closeCommandPalette,
  });

  const renderPage = () => {
    switch (activeView) {
      case 'dashboard':   return <Dashboard />;
      case 'sales':       return <Sales />;
      case 'products':    return <Products />;
      case 'customers':   return <Customers />;
      case 'finance':     return <Finance />;
      case 'operations':  return <Operations />;
      case 'reports':     return <Reports />;
      case 'settings':    return <Settings />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-brand-dark overflow-hidden font-arabic">
      <NativeTitleBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/[0.05] dark:bg-primary-600/[0.06] rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-orbit" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-400/[0.03] dark:bg-purple-600/[0.06] rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none animate-float" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-400/[0.02] dark:bg-emerald-500/[0.03] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow" style={{ animationDuration: '4s' }} />

        <Sidebar />

        <main
          className="flex-1 overflow-hidden relative flex flex-col"
          data-testid="main-layout"
          data-active-view={activeView}
        >
          <div className="flex-1 overflow-hidden relative flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="flex-1 overflow-hidden"
              >
                <Suspense fallback={<PageLoader />}>
                  {renderPage()}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="h-7 bg-brand-surface/50 dark:bg-[#161930]/80 backdrop-blur-xl border-t border-brand-border/20 dark:border-white/[0.06] flex items-center justify-between px-5 text-[9px] font-semibold tracking-wider text-brand-muted/50 dark:text-white/25 uppercase">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-sm shadow-success-500/50" />
                <span>متصل</span>
              </div>
              <div className="w-px h-2.5 bg-brand-border/30 dark:bg-white/[0.08]" />
              <span className="hidden sm:inline">آخر مزامنة: الآن</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">v3.0.0</span>
              <div className="w-px h-2.5 bg-brand-border/30 dark:bg-white/[0.08]" />
              <span className="text-primary-500/50 dark:text-primary-400/40">Bard Engine</span>
            </div>
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
};
