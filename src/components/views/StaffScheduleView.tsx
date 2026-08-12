import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  X,
  Filter,
  MapPin,
  RefreshCw,
  Plus,
  Bell,
} from 'lucide-react';
import { ShiftItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface StaffScheduleViewProps {
  shifts: ShiftItem[];
  onResolveConflict: (shiftId: string, newStartTime: string, newEndTime: string) => void;
  onUpdateShiftStatus?: (shiftId: string, newStatus: ShiftItem['status']) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({
  shifts,
  onResolveConflict,
  onUpdateShiftStatus,
  onOpenCopilot,
}) => {
  const { addToast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedShift, setSelectedShift] = useState<ShiftItem | null>(null);

  const [newStart, setNewStart] = useState('17:30');
  const [newEnd, setNewEnd] = useState('21:00');

  const filteredShifts = shifts.filter((s) => {
    if (selectedDepartment === 'All') return true;
    return s.department === selectedDepartment;
  });

  const conflictShifts = shifts.filter((s) => s.status === 'Conflict');

  const handleStatusChange = (shift: ShiftItem, newStatus: ShiftItem['status']) => {
    if (onUpdateShiftStatus) {
      onUpdateShiftStatus(shift.id, newStatus);
    }

    if (selectedShift && selectedShift.id === shift.id) {
      setSelectedShift({ ...selectedShift, status: newStatus });
    }

    if (newStatus === 'Conflict' || newStatus === 'Cancelled') {
      addToast({
        type: 'alert',
        title: '🚨 Shift Status Alert',
        message: `Shift status for ${shift.staffName} (${shift.eventName}) changed to ${newStatus.toUpperCase()}!`,
        category: 'staff',
      });
    } else if (newStatus === 'Confirmed' || newStatus === 'Completed') {
      addToast({
        type: 'success',
        title: '✅ Shift Status Updated',
        message: `Shift status for ${shift.staffName} (${shift.eventName}) set to ${newStatus.toUpperCase()}.`,
        category: 'staff',
      });
    } else {
      addToast({
        type: 'info',
        title: '🗓️ Shift Status Changed',
        message: `Shift status for ${shift.staffName} (${shift.eventName}) changed to ${newStatus}.`,
        category: 'staff',
      });
    }
  };

  const handleApplyResolve = () => {
    if (!selectedShift) return;
    onResolveConflict(selectedShift.id, newStart, newEnd);

    addToast({
      type: 'success',
      title: '✅ Shift Conflict Resolved',
      message: `Shift double-booking for ${selectedShift.staffName} (${selectedShift.eventName}) resolved & confirmed (${newStart} - ${newEnd}).`,
      category: 'staff',
    });

    setSelectedShift(null);
  };

  const handleSimulateShiftStatusToast = () => {
    const target = shifts[0];
    if (target) {
      const nextStatus = target.status === 'Confirmed' ? 'In Progress' : 'Confirmed';
      handleStatusChange(target, nextStatus);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Staff Schedule & Workload Capacity
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Weekly roster, shift assignments, crew workload heatmaps, and double-booking conflict mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateShiftStatusToast}
            className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30 text-indigo-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-md"
            title="Simulate Shift Status Toast Notification"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            Simulate Shift Status Toast
          </button>
          <button
            onClick={() =>
              onOpenCopilot('Analyze current crew double-bookings and suggest an optimal re-allocation schedule.')
            }
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            AI Conflict Solver
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if any conflicts exist */}
      {conflictShifts.length > 0 && (
        <div className="glass-card bg-gradient-to-r from-rose-950/60 via-slate-950/80 to-amber-950/50 border border-rose-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 animate-pulse shrink-0 backdrop-blur-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {conflictShifts.length} Shift Overlap / Double-Booking Conflict Detected!
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Stage Hands Crew A is assigned to both Riyadh Gala and KAICC Tech Summit on Nov 15.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedShift(conflictShifts[0])}
            className="bg-rose-500/80 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shrink-0 shadow-lg border border-rose-400/30 backdrop-blur-md"
          >
            Resolve Conflict Now
          </button>
        </div>
      )}

      {/* Dept Filter Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        {['All', 'A/V Tech', 'Stage Hands', 'Hospitality', 'Logistics', 'Security'].map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDepartment === dept
                ? 'glass-btn-primary text-slate-100 shadow-md'
                : 'glass-btn text-slate-300 hover:text-white'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Shift Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.map((sft) => (
          <div
            key={sft.id}
            onClick={() => setSelectedShift(sft)}
            className={`p-5 rounded-2xl transition-all cursor-pointer ${
              sft.status === 'Conflict'
                ? 'glass-card border-rose-500/60 hover:border-rose-400 shadow-lg shadow-rose-950/30'
                : 'glass-card hover:border-white/30 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={sft.staffAvatar}
                  alt={sft.staffName}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{sft.staffName}</h3>
                  <p className="text-[11px] text-amber-300 font-medium">{sft.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    sft.status === 'Conflict'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : sft.status === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : sft.status === 'In Progress'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {sft.status}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{sft.date}</span>
                <span className="text-amber-300 font-bold ml-auto">{sft.startTime} - {sft.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{sft.location}</span>
              </div>
              <div className="text-[11px] text-slate-400 italic">Event: {sft.eventName}</div>
            </div>

            {sft.conflictNote && (
              <div className="mt-3 p-2 bg-rose-500/20 border border-rose-500/30 rounded-lg text-[11px] text-rose-200 font-medium backdrop-blur-md">
                ⚠️ {sft.conflictNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Capacity & Workload Heatmap Section */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-display">
          Weekly Workload Heatmap
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={day} className="glass-card p-3 rounded-xl space-y-2">
              <p className="font-bold text-slate-300">{day}</p>
              <div
                className={`h-2 rounded-full ${
                  idx === 3 ? 'bg-rose-400' : idx === 4 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <p className="text-[10px] text-slate-400">{idx === 3 ? '98% Over' : '72% Capacity'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Detail / Resolve Conflict Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">
                {selectedShift.status === 'Conflict' ? 'Resolve Shift Double-Booking' : 'Shift Inspector'}
              </h3>
              <button onClick={() => setSelectedShift(null)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 glass-card rounded-xl flex items-center gap-3">
                <img src={selectedShift.staffAvatar} alt={selectedShift.staffName} className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20" />
                <div>
                  <p className="font-bold text-slate-100 text-sm">{selectedShift.staffName}</p>
                  <p className="text-amber-300 font-medium">{selectedShift.role} ({selectedShift.department})</p>
                </div>
              </div>

              {selectedShift.conflictNote && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 font-medium backdrop-blur-md">
                  {selectedShift.conflictNote}
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Change Shift Status</label>
                <select
                  value={selectedShift.status}
                  onChange={(e) => handleStatusChange(selectedShift, e.target.value as ShiftItem['status'])}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Confirmed" className="bg-slate-950 text-slate-100">Confirmed ✅</option>
                  <option value="In Progress" className="bg-slate-950 text-slate-100">In Progress ⏳</option>
                  <option value="Pending" className="bg-slate-950 text-slate-100">Pending ⏱️</option>
                  <option value="Conflict" className="bg-slate-950 text-slate-100">Conflict 🚨</option>
                  <option value="Completed" className="bg-slate-950 text-slate-100">Completed 🎉</option>
                  <option value="Cancelled" className="bg-slate-950 text-slate-100">Cancelled ❌</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Re-adjust Shift Start Time</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Re-adjust Shift End Time</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedShift(null)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyResolve}
                  className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg"
                >
                  Apply & Resolve Overlap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
