import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BellOff,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Box,
  FileText,
  Radio,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Alert, ActivityLog, EventItem } from '../../types';

interface CommandCenterViewProps {
  alerts: Alert[];
  activities: ActivityLog[];
  events: EventItem[];
  onSnoozeAlert: (alertId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onOpenCopilot: (prompt?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  alerts,
  activities,
  events,
  onSnoozeAlert,
  onAcknowledgeAlert,
  onOpenCopilot,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const urgentCount = alerts.filter((a) => a.severity === 'urgent' && !a.snoozed && !a.acknowledged).length;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="glass-card bg-gradient-to-r from-rose-950/40 via-slate-950/80 to-indigo-950/40 border border-white/15 rounded-2xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 animate-ping text-rose-400" />
              Real-Time Command Status
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
              Command Center Operations
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl">
              High-priority alerts, double-booking conflicts, financial budget variances, and automated escalation protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenCopilot('Run comprehensive command center audit and summarize all active critical risks.')}
              className="glass-btn-amber font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-amber-300 stroke-none" />
              AI Risk Audit
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium">Critical Urgent Alerts</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{urgentCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 backdrop-blur-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium">Active Events Monitored</p>
            <p className="text-2xl font-black text-slate-100 mt-1">{events.filter(e => e.status === 'In Progress').length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 backdrop-blur-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium">Double-Booking Conflicts</p>
            <p className="text-2xl font-black text-amber-400 mt-1">1 Crew</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 backdrop-blur-md">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium">Budget Variances Exceeded</p>
            <p className="text-2xl font-black text-slate-100 mt-1">SAR 42.5K</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 backdrop-blur-md">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {['all', 'staffing', 'financial', 'logistics', 'vendor'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedCategory === cat
                ? 'glass-btn-primary text-slate-100 shadow-md'
                : 'glass-btn text-slate-400 hover:text-slate-100'
            }`}
          >
            {cat} Alerts
          </button>
        ))}
      </div>

      {/* Main Alert Cards Feed & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alert Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>Priority Incident Stream</span>
            <span className="text-xs text-slate-400 lowercase">Showing {filteredAlerts.length} items</span>
          </h2>

          <div className="space-y-3">
            {filteredAlerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alt.severity === 'urgent'
                    ? 'glass-card bg-slate-950/80 border-rose-500/40 hover:border-rose-500/70 shadow-lg'
                    : 'glass-card bg-slate-950/60 border-white/10 hover:border-white/20'
                } ${alt.snoozed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        alt.severity === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{alt.category.toUpperCase()}</span>
                    {alt.eventName && (
                      <span className="text-xs text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                        {alt.eventName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alt.timestamp}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2">{alt.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{alt.description}</p>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {alt.category === 'staffing' && (
                      <button
                        onClick={() => onNavigateTab('staff')}
                        className="glass-btn-amber text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        Resolve Staff Conflict <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {alt.category === 'financial' && (
                      <button
                        onClick={() => onNavigateTab('budget')}
                        className="glass-btn-amber text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        Inspect Invoice <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onOpenCopilot(`Provide immediate resolution steps for alert: "${alt.title}" - ${alt.description}`)
                      }
                      className="glass-btn text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ask AI Copilot
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSnoozeAlert(alt.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-all"
                      title="Snooze alert 1 hour"
                    >
                      <BellOff className="w-3.5 h-3.5" /> {alt.snoozed ? 'Unsnooze' : 'Snooze 1h'}
                    </button>
                    <button
                      onClick={() => onAcknowledgeAlert(alt.id)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs flex items-center gap-1 font-semibold transition-all border border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Operations Activity Stream */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Live Field Activity Log
          </h2>

          <div className="glass-card rounded-2xl p-4 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs border-b border-white/10 last:border-0 pb-3 last:pb-0">
                <img src={act.avatar} alt={act.user} className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/15" />
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">
                    <span className="font-bold text-indigo-300">{act.user}</span> {act.action}{' '}
                    <span className="text-slate-300 italic">{act.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{act.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Escalation Protocol Box */}
          <div className="glass-card rounded-2xl p-5 space-y-3 border-amber-500/30">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Operations Escalation Protocol
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an operational alert remains unresolved after 60 minutes, the Command Center automatically triggers direct SMS & Pager duty notifications to Executive Directors.
            </p>
            <button
              onClick={() => onOpenCopilot('Trigger manual crisis broadcast test for Command Center.')}
              className="w-full glass-btn text-slate-200 font-bold py-2 rounded-xl text-xs transition-all hover:text-white"
            >
              Test Crisis Broadcast System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
