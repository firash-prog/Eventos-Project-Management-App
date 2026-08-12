import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  CalendarDays,
  Users,
  Box,
  Store,
  Receipt,
  BarChart3,
  Settings,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onNavigateTab: (tab: NavigationTab) => void;
  urgentAlertCount: number;
  conflictCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigateTab,
  urgentAlertCount,
  conflictCount,
}) => {
  const navItems = [
    {
      id: 'command-center' as NavigationTab,
      label: 'Command Center',
      icon: ShieldAlert,
      badge: urgentAlertCount > 0 ? urgentAlertCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'events' as NavigationTab,
      label: 'Events Directory',
      icon: CalendarDays,
    },
    {
      id: 'staff' as NavigationTab,
      label: 'Staff & Capacity',
      icon: Users,
      badge: conflictCount > 0 ? conflictCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
    },
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventory & Assets',
      icon: Box,
    },
    {
      id: 'vendors' as NavigationTab,
      label: 'Vendors & Partners',
      icon: Store,
    },
    {
      id: 'budget' as NavigationTab,
      label: 'Budget & Finance',
      icon: Receipt,
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Roles & Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/65 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex z-20 shadow-2xl">
      {/* Brand & Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center justify-between backdrop-blur-md bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-indigo-500/25 border border-white/20">
              <Zap className="w-5 h-5 fill-slate-950 stroke-none" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-slate-100 text-base font-display">
                  EVENTOS
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Elite Event Command</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/20 text-indigo-200 font-bold border border-indigo-500/40 shadow-lg shadow-indigo-500/15 backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] border border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
                      item.badgeColor || 'bg-slate-800/80 text-slate-300 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Operational Footer */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02] backdrop-blur-md">
        <div className="p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-inner">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> System Active
            </p>
            <p className="text-[10px] text-slate-400">99.8% Command Uptime</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
