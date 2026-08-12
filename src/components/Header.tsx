import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Plus,
  Shield,
  User as UserIcon,
  ChevronDown,
  AlertTriangle,
  LogOut,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { User, Alert } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentUser: User;
  users: User[];
  alerts: Alert[];
  onSelectUser: (user: User) => void;
  onOpenCopilot: (initialPrompt?: string) => void;
  onOpenNewEvent: () => void;
  onNavigateTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenChangePassword?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  alerts,
  onSelectUser,
  onOpenCopilot,
  onOpenNewEvent,
  onNavigateTab,
  searchQuery,
  setSearchQuery,
  onOpenChangePassword,
}) => {
  const { user: authUser, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const activeAlerts = alerts.filter((a) => !a.acknowledged && !a.snoozed);
  const urgentCount = activeAlerts.filter((a) => a.severity === 'urgent').length;

  const displayUser = authUser || currentUser;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xl">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, assets, staff, invoices, vendors (Press '/' to focus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400/80 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & Profile Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* AI Copilot Button */}
        <button
          onClick={() => onOpenCopilot()}
          className="flex items-center gap-2 glass-btn-primary text-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AI Command Copilot</span>
        </button>

        {/* Quick Action Button */}
        <button
          onClick={onOpenNewEvent}
          className="flex items-center gap-1.5 glass-btn-amber font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">New Event</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertDropdown(!showAlertDropdown)}
            className="relative p-2 rounded-xl glass-btn text-slate-300 hover:text-white transition-all"
            title="Command Center Alerts"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {urgentCount}
              </span>
            )}
          </button>

          {showAlertDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-sm text-slate-100">
                    Live Urgent Alerts ({activeAlerts.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowAlertDropdown(false);
                    onNavigateTab('command-center');
                  }}
                  className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline"
                >
                  View Command Center
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {activeAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    All clear! No active urgent alerts.
                  </p>
                ) : (
                  activeAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            alt.severity === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="text-[10px] text-slate-400">{alt.timestamp}</span>
                      </div>
                      <p className="font-medium text-slate-100 mb-1">{alt.title}</p>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{alt.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl glass-btn text-slate-200 transition-all"
          >
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-400/50"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-100 leading-tight">{displayUser.name}</div>
              <div className="text-[10px] text-amber-300 font-medium">
                {displayUser.role} {displayUser.username ? `(@${displayUser.username})` : ''}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-card bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 p-3 space-y-2">
              <div className="px-2 py-1.5 border-b border-white/10">
                <p className="text-xs font-semibold text-slate-100">{displayUser.name}</p>
                <p className="text-[11px] text-amber-300 font-mono">@{displayUser.username || 'guest'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <Shield className="w-3 h-3" />
                  {displayUser.role}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigateTab('settings');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/[0.08] flex items-center gap-2 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>RBAC & User Governance</span>
                </button>

                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenChangePassword();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/[0.08] flex items-center gap-2 font-medium"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Change Password</span>
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-500/15 flex items-center gap-2 font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
