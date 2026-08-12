import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isForced?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
}) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onClose && !isForced) {
        setTimeout(onClose, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {isForced ? <ShieldAlert className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display">
              {isForced ? 'Forced Security Password Change' : 'Change Your Password'}
            </h3>
            <p className="text-xs text-slate-400">
              {isForced
                ? 'Your account requires an immediate password update before proceeding.'
                : 'Update your account credentials securely.'}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">New Password (Min. 8 characters)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
            {!isForced && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl glass-btn-amber font-bold text-slate-950 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
