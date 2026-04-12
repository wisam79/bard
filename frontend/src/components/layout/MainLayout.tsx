import React, { lazy, Suspense, useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store';
import { NativeTitleBar } from './NativeTitleBar';
import CommandPalette from '@/components/features/CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

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
      <span className="text-[10px] font-bold text-brand-accent/20 dark:text-white/15 uppercase tracking-[0.2em]">جاري التحميل</span>
    </div>
  </div>
);

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
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/[0.03] dark:bg-primary-600/[0.04] rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-400/[0.02] dark:bg-purple-600/[0.04] rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <Sidebar />

        <main
          className="flex-1 overflow-hidden relative flex flex-col"
          data-testid="main-layout"
          data-active-view={activeView}
        >
          <div className="flex-1 overflow-hidden relative flex flex-col animate-fade-in">
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </div>

          <div className="h-7 bg-brand-surface/40 dark:bg-[#252526]/80 backdrop-blur-xl border-t border-brand-border/15 dark:border-white/[0.04] flex items-center justify-between px-5 text-[9px] font-bold tracking-[0.15em] text-brand-accent/25 dark:text-white/15 uppercase">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span>متصل</span>
              </div>
              <div className="w-px h-2.5 bg-brand-border/20 dark:bg-white/[0.06]" />
              <span className="hidden sm:inline">آخر مزامنة: الآن</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">v3.0.0</span>
              <div className="w-px h-2.5 bg-brand-border/20 dark:bg-white/[0.06]" />
              <span className="text-primary-500/50 dark:text-primary-400/40">Bard Engine</span>
            </div>
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
};
