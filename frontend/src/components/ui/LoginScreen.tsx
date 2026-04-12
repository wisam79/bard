import React, { useState } from 'react';
import { useAuthStore } from '@/store';
import { Lock, User, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark overflow-hidden font-arabic"
      data-testid="login-screen"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[900px] h-[900px] bg-primary-600/6 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-violet-600/5 rounded-full blur-[180px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/3 rounded-full blur-[160px]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="w-full max-w-[440px] p-6 relative animate-fade-in-scale">
        <div className="relative rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-white/[0.02] rounded-[2rem]" />
          <div className="absolute inset-0 border border-white/[0.08] rounded-[2rem]" />
          <div className="absolute inset-0 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem]" />

          <div className="relative p-10">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/8 rounded-full blur-[60px]" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-violet-500/6 rounded-full blur-[50px]" />

            <div className="flex flex-col items-center gap-7 mb-10 relative text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary-500/15 blur-[30px] rounded-full group-hover:bg-primary-500/25 transition-all duration-700" />
                <div className="relative w-20 h-20 rounded-[1.5rem] premium-gradient-bg flex items-center justify-center shadow-xl shadow-primary-500/25 border border-white/10 transition-transform duration-500 group-hover:scale-105">
                  <span className="text-3xl font-black text-white">B</span>
                  <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
              </div>
              <div className="space-y-2.5">
                <h1 className="text-3xl font-black text-white tracking-tight">Bard</h1>
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-px w-6 bg-gradient-to-r from-transparent to-primary-500/30" />
                  <div className="flex items-center gap-1.5 text-primary-400/40 font-bold text-[10px] uppercase tracking-[0.25em]">
                    <Activity size={10} className="text-primary-500/60 animate-pulse" />
                    <span>Premium POS</span>
                  </div>
                  <div className="h-px w-6 bg-gradient-to-l from-transparent to-primary-500/30" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mr-2 flex items-center gap-2">
                  <User size={11} className="text-primary-400/30" />
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-label="اسم المستخدم"
                  data-testid="login-username"
                  className="w-full h-13 bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 text-white font-semibold placeholder:text-white/10 focus:bg-white/[0.07] focus:border-primary-500/30 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-300 outline-none"
                  placeholder="admin"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mr-2 flex items-center gap-2">
                  <Lock size={11} className="text-primary-400/30" />
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="كلمة المرور"
                  data-testid="login-password"
                  className="w-full h-13 bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 text-white font-semibold placeholder:text-white/10 focus:bg-white/[0.07] focus:border-primary-500/30 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-300 outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div
                  className="flex items-center gap-3 text-xs font-semibold text-rose-400 bg-rose-500/[0.06] p-4 rounded-xl border border-rose-500/10 animate-fade-in"
                  role="alert"
                >
                  <ShieldCheck size={18} className="text-rose-500/40 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  data-testid="login-submit"
                  className="relative w-full h-13 group overflow-hidden rounded-xl premium-gradient-bg text-white font-bold text-[15px] transition-all active:scale-[0.98] shadow-[0_8px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:shadow-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>دخول للنظام</span>
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <p className="text-[9px] font-bold text-white/15 uppercase tracking-[0.3em]">
            v3.0.0 · Stable · Bard.io
          </p>
          <div className="w-1 h-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
};
