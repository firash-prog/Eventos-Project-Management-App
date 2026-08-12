import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  CheckSquare,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  Zap,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { EventItem, User, ActivityLog, Alert } from '../../types';

interface DashboardViewProps {
  currentUser: User;
  events: EventItem[];
  activities: ActivityLog[];
  alerts: Alert[];
  onNavigateTab: (tab: any) => void;
  onOpenNewEvent: () => void;
  onOpenCopilot: (prompt?: string) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  events,
  activities,
  alerts,
  onNavigateTab,
  onOpenNewEvent,
  onOpenCopilot,
  onSelectEvent,
}) => {
  // Live countdown timer state for upcoming premiere
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAllocated = events.reduce((sum, e) => sum + e.budgetAllocated, 0);
  const totalSpent = events.reduce((sum, e) => sum + e.budgetSpent, 0);
  const budgetPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const activeEvents = events.filter((e) => e.status === 'In Progress');
  const upcomingEvents = events.filter((e) => e.status === 'Planning' || e.status === 'In Progress');
  const allTasks = events.flatMap((e) => e.tasks || []);
  const openTasks = allTasks.filter((t) => t.status !== 'Done');
  const highPriorityTasks = openTasks.filter((t) => t.priority === 'High');
  const nextEvent = events[0] || null;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Welcome & Command Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
              Welcome back, {currentUser.name}
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-md">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-300 mt-1">
            Command Dashboard • Real-time event monitoring, budget utilization & live site readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenCopilot('Summarize executive KPI status and recommend top 3 focus areas today.')}
            className="flex items-center gap-2 glass-btn text-slate-200 hover:text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Executive Summary
          </button>
          <button
            onClick={onOpenNewEvent}
            className="flex items-center gap-1.5 glass-btn-amber font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Premiere
          </button>
        </div>
      </div>

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Events Bento */}
        <div
          onClick={() => onNavigateTab('events')}
          className="glass-card rounded-2xl p-5 cursor-pointer transition-all group hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Events</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-all backdrop-blur-md">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100">{activeEvents.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2 this quarter
          </p>
        </div>

        {/* Deadlines Bento */}
        <div
          onClick={() => onNavigateTab('events')}
          className="glass-card rounded-2xl p-5 cursor-pointer transition-all group hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deadlines in 7D</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-all backdrop-blur-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300">{upcomingEvents.length}</div>
          <p className="text-[11px] text-slate-300 font-medium mt-2">
            {upcomingEvents.length === 0 ? 'No upcoming deadlines' : `${upcomingEvents.length} Active Events`}
          </p>
        </div>

        {/* Budget Utilization Gauge Bento */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="glass-card rounded-2xl p-5 cursor-pointer transition-all group hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Util.</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-all backdrop-blur-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100">{budgetPercent}%</div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-400 to-amber-300 h-1.5 rounded-full" style={{ width: `${budgetPercent}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            SAR {(totalSpent / 1000000).toFixed(2)}M / {(totalAllocated / 1000000).toFixed(2)}M
          </p>
        </div>

        {/* Open Tasks Bento */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 backdrop-blur-md">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100">{openTasks.length}</div>
          <p className="text-[11px] text-rose-400 font-medium mt-2">{highPriorityTasks.length} High Priority</p>
        </div>

        {/* Team Capacity Bento */}
        <div
          onClick={() => onNavigateTab('staff')}
          className="glass-card rounded-2xl p-5 cursor-pointer transition-all group hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">Command Operational</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all backdrop-blur-md">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">100%</div>
          <p className="text-[11px] text-emerald-300 font-medium mt-2">All Crews Ready</p>
        </div>
      </div>

      {/* Featured Countdown Banner */}
      <div className="glass-card bg-gradient-to-r from-indigo-950/50 via-slate-950/80 to-purple-950/50 border border-white/15 rounded-2xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold backdrop-blur-md">
              <Play className="w-3 h-3 fill-amber-300" /> {nextEvent ? 'NEXT FLAGSHIP PREMIERE' : 'SYSTEM READY'}
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-100 font-display">
              {nextEvent ? nextEvent.name : 'Workspace Ready — No Active Flagship Events'}
            </h2>
            <p className="text-xs text-slate-300">
              {nextEvent ? `${nextEvent.venue} • Client: ${nextEvent.client}` : 'Create your first event from the events directory to launch live operations.'}
            </p>
          </div>

          {nextEvent ? (
            /* Countdown Clock */
            <div className="flex items-center gap-3">
              <div className="text-center bg-white/[0.05] border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[60px] shadow-inner">
                <div className="text-xl font-black text-amber-300">{timeLeft.days}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Days</div>
              </div>
              <span className="text-amber-400/60 font-black text-xl">:</span>
              <div className="text-center bg-white/[0.05] border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[60px] shadow-inner">
                <div className="text-xl font-black text-amber-300">{timeLeft.hours}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Hours</div>
              </div>
              <span className="text-amber-400/60 font-black text-xl">:</span>
              <div className="text-center bg-white/[0.05] border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[60px] shadow-inner">
                <div className="text-xl font-black text-amber-300">{timeLeft.minutes}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Mins</div>
              </div>
              <span className="text-amber-400/60 font-black text-xl">:</span>
              <div className="text-center bg-white/[0.05] border border-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl min-w-[60px] shadow-inner">
                <div className="text-xl font-black text-amber-300">{timeLeft.seconds}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Secs</div>
              </div>

              <button
                onClick={() => onSelectEvent(nextEvent)}
                className="ml-2 glass-btn-amber font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5"
              >
                Workspace <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenNewEvent}
              className="glass-btn-amber font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create New Event
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Premieres & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Premieres Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Flagship Premieres Directory
            </h2>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline flex items-center gap-1 font-semibold"
            >
              View All Events ({events.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-500" />
                <p className="text-sm font-bold text-slate-300">No events found</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Demo data has been cleared. Click below to add your first real event.
                </p>
                <button
                  onClick={onOpenNewEvent}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> New Premiere
                </button>
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="p-5 rounded-2xl glass-card bg-slate-950/60 border border-white/10 hover:border-white/25 cursor-pointer transition-all group hover:scale-[1.01]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-300">{evt.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            evt.status === 'In Progress'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : evt.status === 'Finalizing'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-white/10 text-slate-300 border border-white/15'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-slate-300">{evt.client} • {evt.venue}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Budget Allocated</div>
                      <div className="text-sm font-bold text-slate-100">
                        SAR {evt.budgetAllocated.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Team */}
                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10">
                    <div className="flex-1 max-w-xs">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Site Readiness</span>
                        <span className="font-bold text-amber-300">{evt.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-1.5 rounded-full" style={{ width: `${evt.completionPercent}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center -space-x-2">
                      {evt.team.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.avatar}
                          alt={m.name}
                          title={`${m.name} (${m.role})`}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-950 shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>Live Audit Activity</span>
            <Activity className="w-4 h-4 text-amber-300" />
          </h2>

          <div className="glass-card rounded-2xl p-4 space-y-4">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent audit activity logged.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs border-b border-white/10 last:border-0 pb-3 last:pb-0">
                  <img src={act.avatar} alt={act.user} className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/15" />
                  <div>
                    <p className="text-slate-200">
                      <span className="font-bold text-indigo-300">{act.user}</span> {act.action}{' '}
                      <span className="text-slate-300 italic">{act.target}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{act.timeAgo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
