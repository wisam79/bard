import React, { useState } from 'react';
import { useAuthStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ShieldCheck, Activity, ArrowLeft, Sparkles } from 'lucide-react';

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
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [-20, 20, -20],
            y: [-20, 20, -20]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[900px] h-[900px] bg-primary-600/10 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/3" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [50, -50, 50],
            y: [30, -30, 30]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-violet-600/8 rounded-full blur-[180px] translate-x-1/2 translate-y-1/2" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[160px]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] p-6 relative"
      >
        <div className="relative group">
          {/* Animated border glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/20 via-violet-500/20 to-primary-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-shift"></div>
          
          <div className="relative bg-brand-surface/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-10">
              <div className="flex flex-col items-center gap-7 mb-10 relative text-center">
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-primary-500/30 blur-[30px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="relative w-24 h-24 rounded-[2rem] premium-gradient-bg flex items-center justify-center shadow-2xl shadow-primary-500/40 border border-white/20">
                    <span className="text-4xl font-black text-white">B</span>
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-transparent via-white/20 to-transparent" 
                    />
                  </div>
                </motion.div>
                <div className="space-y-3">
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-white tracking-tight"
                  >
                    Bard
                  </motion.h1>
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex items-center gap-2 justify-center"
                  >
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary-500/50" />
                    <div className="flex items-center gap-1.5 text-primary-400 font-bold text-[10px] uppercase tracking-[0.3em] px-2">
                      <Activity size={12} className="text-primary-500 animate-pulse" />
                      <span>Enterprise POS</span>
                    </div>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary-500/50" />
                  </motion.div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <User size={12} className="text-primary-500/60" />
                    اسم المستخدم
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-semibold placeholder:text-white/20 focus:bg-white/[0.08] focus:border-primary-500/50 transition-all duration-300 outline-none"
                      placeholder="admin"
                      autoFocus
                    />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Lock size={12} className="text-primary-500/60" />
                    كلمة المرور
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-semibold placeholder:text-white/20 focus:bg-white/[0.08] focus:border-primary-500/50 transition-all duration-300 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className="flex items-center gap-3 text-xs font-semibold text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 overflow-hidden"
                      role="alert"
                    >
                      <ShieldCheck size={18} className="text-rose-500 shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4"
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-15 group overflow-hidden rounded-2xl premium-gradient-bg text-white font-bold text-base transition-all active:scale-[0.98] shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient" />
                    <div className="relative flex items-center justify-center gap-3">
                      {isLoading ? (
                        <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>تسجيل الدخول</span>
                          <motion.div
                            animate={{ x: [0, -4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowLeft size={20} />
                          </motion.div>
                        </>
                      )}
                    </div>
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center gap-4 mt-12"
        >
          <div className="flex items-center gap-3 text-white/20">
            <Sparkles size={14} className="animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
              V3.0.0 Stable Build
            </p>
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <p className="text-[9px] font-medium text-white/10 uppercase tracking-[0.2em]">
            Bard Technology Solutions © 2026
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
