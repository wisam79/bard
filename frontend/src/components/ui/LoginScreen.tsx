import React, { useState } from 'react';
import { useAuthStore } from '@/store';
import { Lock, User, LogIn, ShieldCheck, Activity } from 'lucide-react';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
};

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error: unknown) {
      setError(`خطأ: ${getErrorMessage(error)}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050b14] overflow-hidden font-arabic transition-colors duration-200"
      data-testid="login-screen"
    >
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[160px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <div className="w-full max-w-md p-6 relative animate-fade-in">
        <div className="glass-frosted !bg-white/5 border border-white/5 rounded-[3rem] p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-[60px]" />

          <div className="flex flex-col items-center gap-8 mb-12 relative text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/50 rotate-12 cursor-default hover:rotate-0 hover:scale-110 transition-all duration-300">
              <span className="text-4xl font-black text-white -rotate-12 group-hover:rotate-0 transition-transform">B</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight text-shadow-lg">Bard</h1>
              <div className="flex items-center gap-2 justify-center text-primary-400/50 font-black text-[10px] uppercase tracking-[0.3em]">
                <Activity size={12} className="text-primary-500 animate-pulse" />
                <span>Premium POS Engine</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em] mr-1 flex items-center gap-3">
                <User size={14} className="text-primary-400/50" />
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-label="اسم المستخدم"
                  data-testid="login-username"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:bg-white/[0.08] focus:border-primary-500/30 focus:ring-0 transition-all outline-none"
                  placeholder="Username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em] mr-1 flex items-center gap-3">
                <Lock size={14} className="text-primary-400/50" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="كلمة المرور"
                  data-testid="login-password"
                  className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white font-bold placeholder:text-white/10 focus:bg-white/[0.08] focus:border-primary-500/30 focus:ring-0 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-3 text-xs font-black text-rose-400 bg-rose-500/5 p-5 rounded-2xl border border-rose-500/10 shadow-inner animate-fade-in"
                role="alert"
              >
                <ShieldCheck size={20} className="text-rose-500/50" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-submit"
              className="relative w-full h-16 group overflow-hidden rounded-2xl bg-primary-500 text-white font-black text-lg transition-all active:scale-[0.98] shadow-[0_10px_40px_rgba(99,102,241,0.3)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-4">
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>دخول للنظام</span>
                    <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
          v3.0.0 • STABLE RELEASE • BARD.IO
        </p>
      </div>
    </div>
  );
};
