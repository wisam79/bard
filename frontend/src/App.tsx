import React, { Suspense, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { MainLayout } from '@/components/layout/MainLayout';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { LoginScreen } from '@/components/ui/LoginScreen';
import { ToastContainer } from '@/components/ui/ToastContainer';

const App: React.FC = () => {
  const { theme, appState, setAppState } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState('app');
    }, 1500);
    return () => clearTimeout(timer);
  }, [setAppState]);

  return (
    <div className="h-screen w-screen overflow-hidden font-arabic">
      {appState === 'splash' && <SplashScreen />}
      {appState === 'app' && !isAuthenticated && <LoginScreen />}
      {appState === 'app' && isAuthenticated && (
        <Suspense fallback={<SplashScreen />}>
          <MainLayout />
        </Suspense>
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
