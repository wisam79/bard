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
const Invoices = lazy(() => import('@/pages/Invoices'));
const Reports = lazy(() => import('@/pages/Reports'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Settings = lazy(() => import('@/pages/Settings'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-brand-dark/20 h-full">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-primary-500/20" />
  </div>
);

export const MainLayout: React.FC = () => {
  const { activeView } = useAppStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  // Register global keyboard shortcuts
  useKeyboardShortcuts({
    onCommandPalette: openCommandPalette,
    onEscape: closeCommandPalette,
  });

  const renderPage = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'sales':     return <Sales />;
      case 'products':  return <Products />;
      case 'customers': return <Customers />;
      case 'finance':   return <Finance />;
      case 'invoices':  return <Invoices />;
      case 'reports':   return <Reports />;
      case 'inventory': return <Inventory />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-brand-dark overflow-hidden font-arabic">
      <NativeTitleBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/5 dark:bg-primary-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary-400/5 dark:bg-purple-600/10 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
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
          
          {/* Global Status Bar */}
          <div className="h-8 bg-brand-surface/80 dark:bg-brand-dark/80 backdrop-blur-md border-t border-brand-border/30 flex items-center justify-between px-6 text-[10px] font-black tracking-widest text-brand-accent/40 uppercase">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                <span>النظام متصل</span>
              </div>
              <div className="w-px h-3 bg-brand-border/30 hidden sm:block" />
              <span className="hidden sm:inline">آخر مزامنة: الآن</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">الإصدار 3.0.0</span>
              <div className="w-px h-3 bg-brand-border/30 hidden sm:block" />
              <span className="text-primary-500 dark:text-primary-400">BARD ENGINE ACTIVE</span>
            </div>
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={closeCommandPalette} />
    </div>
  );
};
