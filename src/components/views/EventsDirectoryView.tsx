import React, { useState } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { EventItem, EventTask, Milestone } from '../../types';

interface EventsDirectoryViewProps {
  events: EventItem[];
  selectedEvent: EventItem | null;
  onSelectEvent: (event: EventItem | null) => void;
  onAddEvent: (newEvent: EventItem) => void;
  onUpdateEvent: (updatedEvent: EventItem) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const EventsDirectoryView: React.FC<EventsDirectoryViewProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onAddEvent,
  onUpdateEvent,
  onOpenCopilot,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Workspace tab inside Event Detail Modal
  const [workspaceTab, setWorkspaceTab] = useState<'overview' | 'milestones' | 'tasks' | 'files'>('overview');

  // New Event Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventClient, setNewEventClient] = useState('');
  const [newEventType, setNewEventType] = useState<'Gala' | 'Conference' | 'Exhibition' | 'Concert' | 'Product Launch'>('Gala');
  const [newEventVenue, setNewEventVenue] = useState('');
  const [newEventBudget, setNewEventBudget] = useState(500000);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    const matchesType = typeFilter === 'All' || evt.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventClient) return;

    const created: EventItem = {
      id: `evt-${Date.now()}`,
      name: newEventName,
      code: `EVT-${newEventName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      client: newEventClient,
      type: newEventType,
      status: 'Planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      location: newEventVenue || 'Riyadh Main Hall',
      venue: newEventVenue || 'Riyadh Main Hall',
      budgetAllocated: Number(newEventBudget),
      budgetSpent: 0,
      completionPercent: 10,
      team: [
        { name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', role: 'Executive Producer' },
      ],
      milestones: [
        { id: `m-${Date.now()}`, title: 'Initial Venue Contract & Technical Rider', date: '2026-11-20', completed: false },
      ],
      tasks: [
        { id: `t-${Date.now()}`, title: 'Draft Audio/Visual Requirements Document', assignee: 'Alex Morgan', dueDate: '2026-11-18', status: 'To Do', priority: 'High' },
      ],
      files: [],
    };

    onAddEvent(created);
    setShowAddModal(false);
    setNewEventName('');
    setNewEventClient('');
  };

  const toggleMilestone = (evt: EventItem, milestoneId: string) => {
    const updated = {
      ...evt,
      milestones: evt.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    };
    onUpdateEvent(updated);
    if (selectedEvent && selectedEvent.id === evt.id) {
      onSelectEvent(updated);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
            Events Directory & Workspaces
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Comprehensive premiere portfolio, technical riders, milestone timelines, and site readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Event
          </button>
        </div>
      </div>

      {/* Filter & View Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
          >
            <option value="All" className="bg-slate-950 text-slate-100">All Statuses</option>
            <option value="In Progress" className="bg-slate-950 text-slate-100">In Progress</option>
            <option value="Finalizing" className="bg-slate-950 text-slate-100">Finalizing</option>
            <option value="Planning" className="bg-slate-950 text-slate-100">Planning</option>
            <option value="Completed" className="bg-slate-950 text-slate-100">Completed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-400"
          >
            <option value="All" className="bg-slate-950 text-slate-100">All Event Types</option>
            <option value="Gala" className="bg-slate-950 text-slate-100">Gala</option>
            <option value="Conference" className="bg-slate-950 text-slate-100">Conference</option>
            <option value="Exhibition" className="bg-slate-950 text-slate-100">Exhibition</option>
            <option value="Product Launch" className="bg-slate-950 text-slate-100">Product Launch</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/[0.05] border border-white/10 p-1 rounded-xl self-end md:self-auto backdrop-blur-md">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'list' ? 'glass-btn-primary text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'grid' ? 'glass-btn-primary text-slate-100 font-bold' : 'text-slate-400 hover:text-slate-100'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Directory Table or Grid */}
      {viewMode === 'list' ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Event & Code</th>
                  <th className="p-4">Client & Venue</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Site Readiness</th>
                  <th className="p-4">Budget Track</th>
                  <th className="p-4">Team</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="hover:bg-white/[0.05] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-100 text-sm">{evt.name}</div>
                      <div className="text-[11px] font-mono text-amber-300">{evt.code}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200 font-medium">{evt.client}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {evt.venue}
                      </div>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 w-36">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-300 font-semibold">{evt.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-300 h-1.5 rounded-full"
                          style={{ width: `${evt.completionPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-100 font-bold">
                        SAR {evt.budgetSpent.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Allocated: SAR {evt.budgetAllocated.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center -space-x-2">
                        {evt.team.map((m, idx) => (
                          <img
                            key={idx}
                            src={m.avatar}
                            alt={m.name}
                            title={m.name}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-950 shadow-md"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="glass-btn text-slate-200 hover:text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all"
                      >
                        Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="glass-card rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between space-y-4 group hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-300">{evt.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      evt.status === 'In Progress'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {evt.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{evt.client} • {evt.venue}</p>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Readiness</span>
                  <span className="font-bold text-amber-300">{evt.completionPercent}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${evt.completionPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-400">Budget Spent</span>
                  <span className="font-bold text-slate-100">SAR {evt.budgetSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Create New Premiere Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Sea International Film Premiere 2026"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Client / Authority</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ministry of Culture / Red Sea Film Fest"
                  value={newEventClient}
                  onChange={(e) => setNewEventClient(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e: any) => setNewEventType(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Gala" className="bg-slate-950 text-slate-100">Gala</option>
                    <option value="Conference" className="bg-slate-950 text-slate-100">Conference</option>
                    <option value="Exhibition" className="bg-slate-950 text-slate-100">Exhibition</option>
                    <option value="Concert" className="bg-slate-950 text-slate-100">Concert</option>
                    <option value="Product Launch" className="bg-slate-950 text-slate-100">Product Launch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Venue Location</label>
                  <input
                    type="text"
                    placeholder="e.g. AlUla Maraya Concert Hall"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Allocated Budget (SAR)</label>
                <input
                  type="number"
                  required
                  value={newEventBudget}
                  onChange={(e) => setNewEventBudget(Number(e.target.value))}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Event Workspace Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-4xl p-6 lg:p-8 space-y-6 shadow-2xl my-8 border border-white/20">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-amber-300">{selectedEvent.code}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {selectedEvent.status}
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-100 font-display">{selectedEvent.name}</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Client: <span className="text-slate-100 font-semibold">{selectedEvent.client}</span> • Venue: {selectedEvent.venue}
                </p>
              </div>

              <button
                onClick={() => onSelectEvent(null)}
                className="p-2 text-slate-300 hover:text-white glass-btn rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview & Readiness' },
                { id: 'milestones', label: `Milestones (${selectedEvent.milestones.length})` },
                { id: 'tasks', label: `Tasks (${selectedEvent.tasks.length})` },
                { id: 'files', label: `Files & Riders (${selectedEvent.files.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setWorkspaceTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    workspaceTab === tab.id
                      ? 'glass-btn-primary text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={() =>
                  onOpenCopilot(`Generate a detailed technical risk breakdown for event workspace: ${selectedEvent.name}`)
                }
                className="ml-auto flex items-center gap-1.5 glass-btn text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold hover:text-amber-200 transition-all whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" /> Workspace AI Brief
              </button>
            </div>

            {/* Tab Contents */}
            {workspaceTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 rounded-2xl">
                    <p className="text-xs text-slate-400">Allocated Budget</p>
                    <p className="text-xl font-bold text-slate-100 mt-1">
                      SAR {selectedEvent.budgetAllocated.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl">
                    <p className="text-xs text-slate-400">Actual Spend to Date</p>
                    <p className="text-xl font-bold text-amber-300 mt-1">
                      SAR {selectedEvent.budgetSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl">
                    <p className="text-xs text-slate-400">Site Readiness</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      {selectedEvent.completionPercent}%
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Assigned Production Team</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedEvent.team.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl text-xs">
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
                        <div>
                          <p className="font-bold text-slate-200">{m.name}</p>
                          <p className="text-[10px] text-amber-300">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {workspaceTab === 'milestones' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Milestone Progress Checklist</h4>
                <div className="space-y-2">
                  {selectedEvent.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      onClick={() => toggleMilestone(selectedEvent, ms.id)}
                      className="p-3 glass-card rounded-xl flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ms.completed}
                          onChange={() => {}}
                          className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                        />
                        <span className={`font-semibold ${ms.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {ms.title}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">{ms.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workspaceTab === 'tasks' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational Action Items</h4>
                <div className="space-y-2">
                  {selectedEvent.tasks.map((tsk) => (
                    <div key={tsk.id} className="p-3 glass-card rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{tsk.title}</p>
                        <p className="text-[10px] text-slate-400">Assignee: {tsk.assignee} • Due: {tsk.dueDate}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                        {tsk.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workspaceTab === 'files' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Riders & Technical CAD Drawings</h4>
                {selectedEvent.files.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No technical riders uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvent.files.map((fl) => (
                      <div key={fl.id} className="p-3 glass-card rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-300" />
                          <div>
                            <p className="font-bold text-slate-200">{fl.name}</p>
                            <p className="text-[10px] text-slate-400">{fl.size} • Uploaded {fl.uploadDate}</p>
                          </div>
                        </div>
                        <button className="text-xs text-amber-300 font-bold hover:underline">Download</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
