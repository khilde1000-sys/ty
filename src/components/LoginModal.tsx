import React, { useState } from 'react';
import { ShieldAlert, KeyRound, User, Lock, ArrowLeft, Terminal, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const u = username.trim().toUpperCase();
    const p = password.trim().toUpperCase();

    // Check credentials (case-insensitive for best user experience)
    if (u === 'K@AAA@K' && p === 'QPLKMAZX') {
      localStorage.setItem('yuc_auth_session', 'authenticated');
      setTimeout(() => {
        onLoginSuccess();
        setIsLoading(false);
      }, 150);
    } else {
      setTimeout(() => {
        setError('بيانات الدخول غير صحيحة! يرجى التأكد من اسم المستخدم وكلمة المرور بدقة.');
        setIsLoading(false);
      }, 200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Cyber Neon Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">كلية اليرموك الجامعة</h2>
          <p className="text-xs sm:text-sm text-cyan-400 font-bold mt-1">
            قسم هندسة تكنولوجيا الأمن السيبراني
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>بوابة تسجيل الحضور الذكية | المرحلة الثانية</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              اسم المستخدم (User ID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                dir="ltr"
                autoComplete="username"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
              كلمة المرور (Security Key)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-cyan-400 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                <span>دخول النظام</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
