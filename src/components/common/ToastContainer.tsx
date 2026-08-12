import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Package,
  Users,
  Calendar,
  Bell,
} from 'lucide-react';
import { ToastNotification } from '../../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isWarning = toast.type === 'warning';
          const isAlert = toast.type === 'alert';
          const isSuccess = toast.type === 'success';

          let icon = <Info className="w-5 h-5 text-indigo-400" />;
          let borderClass = 'border-indigo-500/40 shadow-indigo-950/40';
          let bgClass = 'bg-slate-900/90';
          let badgeBg = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

          if (isWarning) {
            icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
            borderClass = 'border-amber-500/60 shadow-amber-950/50';
            bgClass = 'bg-slate-900/95';
            badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
          } else if (isAlert) {
            icon = <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />;
            borderClass = 'border-rose-500/60 shadow-rose-950/50';
            bgClass = 'bg-slate-900/95';
            badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
          } else if (isSuccess) {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            borderClass = 'border-emerald-500/50 shadow-emerald-950/40';
            bgClass = 'bg-slate-900/90';
            badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          }

          let CategoryIcon = Bell;
          if (toast.category === 'inventory') CategoryIcon = Package;
          if (toast.category === 'staff') CategoryIcon = Users;
          if (toast.category === 'event') CategoryIcon = Calendar;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${borderClass} ${bgClass} text-slate-100 flex items-start gap-3 relative overflow-hidden group`}
            >
              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isWarning
                    ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                    : isAlert
                    ? 'bg-gradient-to-r from-rose-500 to-rose-300'
                    : isSuccess
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                    : 'bg-gradient-to-r from-indigo-500 to-amber-400'
                }`}
              />

              {/* Toast Icon */}
              <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-100 tracking-tight leading-tight">
                    {toast.title}
                  </span>
                  {toast.category && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeBg}`}
                    >
                      <CategoryIcon className="w-2.5 h-2.5" />
                      {toast.category}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-snug break-words">
                  {toast.message}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {toast.timestamp}
                  </span>

                  {toast.action && (
                    <button
                      onClick={() => {
                        toast.action?.onClick();
                        onDismiss(toast.id);
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors ml-auto"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
