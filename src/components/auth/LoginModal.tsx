import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or account disabled.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      {/* Background glowing gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/10 via-indigo-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 text-amber-300 shadow-inner mb-1">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            EVENTOS <span className="text-amber-400">v8.0</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            ElitePro Executive Operations & Command Portal
          </p>
          <p className="text-[11px] text-slate-400 font-arabic dir-rtl">
            نظام إدارة الفعاليات الملكية والرفيعة المستوى
          </p>
        </div>

        {/* Demo Helper Pill */}
        <div className="p-3 glass-card rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] text-amber-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Default Superadmin Credentials:</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-300">
            <span>Username: <strong className="text-amber-300">superadmin</strong></span>
            <span>Password: <strong className="text-amber-300">Eventos#Royal2026!ChangeMe</strong></span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold flex items-center justify-between">
              <span>Username / اسم المستخدم</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. superadmin"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-semibold flex items-center justify-between">
              <span>Password / كلمة المرور</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl glass-btn-amber font-bold text-slate-950 shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-white/10 pt-4 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Internal Authorized Personnel Only • Protected by Eventos RBAC Guard
          </p>
        </div>
      </div>
    </div>
  );
};
