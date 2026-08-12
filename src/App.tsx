import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  NavigationTab,
  User,
  Alert,
  EventItem,
  ShiftItem,
  AssetItem,
  VendorItem,
  BudgetItem,
  ActivityLog,
  ClientDocument,
  RFQDocument,
} from './types';
import {
  initialUsers,
  initialAlerts,
  initialEvents,
  initialShifts,
  initialAssets,
  initialVendors,
  initialBudgets,
  initialActivities,
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandCopilotDrawer } from './components/CommandCopilotDrawer';

import { CommandCenterView } from './components/views/CommandCenterView';
import { DashboardView } from './components/views/DashboardView';
import { ClientCRMView } from './components/views/ClientCRMView';
import { RFQDirectoryView } from './components/views/RFQDirectoryView';
import { EventsDirectoryView } from './components/views/EventsDirectoryView';
import { StaffScheduleView } from './components/views/StaffScheduleView';
import { InventoryView } from './components/views/InventoryView';
import { VendorsView } from './components/views/VendorsView';
import { BudgetView } from './components/views/BudgetView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LoginModal } from './components/auth/LoginModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';

// Initial Seed Data for Phase 2 CRM & RFQs
const initialClientsSeed: ClientDocument[] = [
  {
    id: 'cli-1',
    name: 'Ministry of Culture (MoC)',
    clientType: 'EXISTING',
    contactPerson: 'Fahad Al-Qahtani',
    email: 'f.qahtani@moc.gov.sa',
    phone: '+966 50 123 4567',
    address: 'Riyadh Cultural District, KSA',
    commercialRegister: '1010892341',
    notes: 'Key VIP account. Standard net-30 payment schedule.',
    createdById: 'usr-ceo',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Aramco Energy & Heritage',
    clientType: 'EXISTING',
    contactPerson: 'Sarah Al-Ghamdi',
    email: 's.ghamdi@aramco.com',
    phone: '+966 53 987 6543',
    address: 'Dammam HQ Compound, Eastern Province',
    commercialRegister: '2050119283',
    notes: 'High-volume fabrication partner.',
    createdById: 'usr-ceo',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
];

const initialRfqsSeed: RFQDocument[] = [
  {
    id: 'rfq-1',
    rfqNumber: 'RFQ-2026-001',
    clientId: 'cli-1',
    clientName: 'Ministry of Culture (MoC)',
    receivedDate: '2026-08-10',
    receivedByUid: 'usr-ceo',
    receivedByName: 'Yaqoub Al Dossary (CEO)',
    title: 'Dammam Heritage Pavilion & Wooden Arches',
    rawDetails:
      'Fabrication of 4x CNC wooden arches with matte painting finish, heavy-duty lighting trussing, and VIP lounge seating.',
    status: 'PENDING_ITEM_SPLIT',
    assignedPricerUids: ['usr-production-lead', 'usr-procurement'],
    items: [
      {
        id: 'item-101',
        title: 'CNC Wooden Entrance Arches (4 Sets)',
        description: '18mm MDF with fire-retardant matte paint coat',
        quantity: 4,
        unit: 'set',
        type: 'IN_HOUSE',
        category: 'CARPENTRY',
        assignedDept: 'PRODUCTION',
        assignedUserUid: 'usr-production-lead',
        assignedUserName: 'Ahmed (Workshop Lead)',
      },
      {
        id: 'item-102',
        title: 'Outdoor Waterproof LED Wall (12m x 4m)',
        description: 'P2.9 High refresh rate outdoor screen',
        quantity: 1,
        unit: 'lump_sum',
        type: 'SUBCONTRACTED',
        category: 'AV',
        assignedDept: 'PROCUREMENT',
        assignedUserUid: 'usr-procurement',
        assignedUserName: 'Duniya (Procurement Officer)',
      },
      {
        id: 'item-103',
        title: 'Site Setup & Rigging Manpower (3 Days)',
        description: 'Certified riggers & carpenters onsite in Khobar',
        quantity: 12,
        unit: 'pcs',
        type: 'UNASSIGNED',
        category: 'MANPOWER',
      },
    ],
    createdById: 'usr-ceo',
    createdAt: '2026-08-10T14:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
  },
];

function EventosAppContent() {
  const { user: authUser, isLoading, mustChangePassword } = useAuth();
  const [showManualPasswordModal, setShowManualPasswordModal] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Phase 2 CRM & RFQ State
  const [clients, setClients] = useState<ClientDocument[]>(() => {
    const saved = localStorage.getItem('eventos_clients');
    return saved ? JSON.parse(saved) : initialClientsSeed;
  });

  const [rfqs, setRfqs] = useState<RFQDocument[]>(() => {
    const saved = localStorage.getItem('eventos_rfqs');
    return saved ? JSON.parse(saved) : initialRfqsSeed;
  });

  const [rfqInitialClientId, setRfqInitialClientId] = useState<string | undefined>();

  // Persistent App State with LocalStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('eventos_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('eventos_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0];
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('eventos_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('eventos_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [shifts, setShifts] = useState<ShiftItem[]>(() => {
    const saved = localStorage.getItem('eventos_shifts');
    return saved ? JSON.parse(saved) : initialShifts;
  });

  const [assets, setAssets] = useState<AssetItem[]>(() => {
    const saved = localStorage.getItem('eventos_assets');
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    const saved = localStorage.getItem('eventos_vendors');
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [budgets, setBudgets] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('eventos_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('eventos_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  // Automatically clear old cached demo data from localStorage on boot
  useEffect(() => {
    if (!localStorage.getItem('eventos_demo_cleared_v2')) {
      localStorage.removeItem('eventos_alerts');
      localStorage.removeItem('eventos_events');
      localStorage.removeItem('eventos_shifts');
      localStorage.removeItem('eventos_assets');
      localStorage.removeItem('eventos_vendors');
      localStorage.removeItem('eventos_budgets');
      localStorage.removeItem('eventos_activities');
      setAlerts([]);
      setEvents([]);
      setShifts([]);
      setAssets([]);
      setVendors([]);
      setBudgets([]);
      setActivities([]);
      localStorage.setItem('eventos_demo_cleared_v2', 'true');
    }
  }, []);

  // Sync persistent state changes back to localStorage
  useEffect(() => {
    localStorage.setItem('eventos_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('eventos_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('eventos_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('eventos_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('eventos_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('eventos_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('eventos_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('eventos_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('eventos_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  // Selected event workspace modal state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // AI Copilot Drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Sync authUser to currentUser when logged in
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Alert Handlers
  const handleSnoozeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, snoozed: !a.snoozed } : a))
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  // Staff Conflict Resolution
  const handleResolveShiftConflict = (shiftId: string, newStart: string, newEnd: string) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              status: 'Confirmed',
              startTime: newStart,
              endTime: newEnd,
              conflictNote: undefined,
            }
          : s
      )
    );

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      user: authUser?.name || currentUser.name,
      avatar: authUser?.avatar || currentUser.avatar,
      action: 'resolved double-booking shift conflict',
      target: `Adjusted times to ${newStart}-${newEnd}`,
      timeAgo: 'Just now',
      category: 'staff',
    };
    setActivities((prev) => [newLog, ...prev]);
  };

  const handleUpdateShiftStatus = (shiftId: string, newStatus: ShiftItem['status']) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId
          ? {
              ...s,
              status: newStatus,
              conflictNote: newStatus === 'Conflict' ? s.conflictNote || 'Shift overlap conflict' : undefined,
            }
          : s
      )
    );
  };

  // Open Copilot Helper
  const handleOpenCopilot = (prompt?: string) => {
    setCopilotInitialPrompt(prompt || '');
    setIsCopilotOpen(true);
  };

  const urgentAlertCount = alerts.filter((a) => a.severity === 'urgent' && !a.snoozed && !a.acknowledged).length;
  const conflictCount = shifts.filter((s) => s.status === 'Conflict').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <span className="font-extrabold text-xl font-display">E</span>
        </div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
          Authenticating Eventos Command Guard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-slate-950 antialiased relative overflow-x-hidden">
      {/* Login Modal Overlay when unauthenticated */}
      <LoginModal isOpen={!authUser} />

      {/* Forced / Manual Password Change Modal */}
      <ChangePasswordModal
        isOpen={mustChangePassword || showManualPasswordModal}
        isForced={mustChangePassword}
        onClose={() => setShowManualPasswordModal(false)}
      />

      {/* Background Frosted Glass Mesh Circles */}
      <div className="mesh-circle circle-1" />
      <div className="mesh-circle circle-2" />
      <div className="mesh-circle circle-3" />

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        urgentAlertCount={urgentAlertCount}
        conflictCount={conflictCount}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Header Bar */}
        <Header
          currentUser={authUser || currentUser}
          users={users}
          alerts={alerts}
          onSelectUser={setCurrentUser}
          onOpenCopilot={handleOpenCopilot}
          onOpenNewEvent={() => setActiveTab('events')}
          onNavigateTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenChangePassword={() => setShowManualPasswordModal(true)}
        />

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {[
            { id: 'command-center', label: 'Command Center' },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'clients', label: 'Client CRM' },
            { id: 'rfqs', label: 'RFQ Intake' },
            { id: 'events', label: 'Events' },
            { id: 'staff', label: 'Staff' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'vendors', label: 'Vendors' },
            { id: 'budget', label: 'Budget' },
            { id: 'reports', label: 'Reports' },
            { id: 'settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 bg-slate-900 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Component Switcher */}
        <main className="flex-1 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'command-center' && (
                <CommandCenterView
                  alerts={alerts}
                  activities={activities}
                  events={events}
                  onSnoozeAlert={handleSnoozeAlert}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onOpenCopilot={handleOpenCopilot}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  currentUser={authUser || currentUser}
                  events={events}
                  activities={activities}
                  alerts={alerts}
                  onNavigateTab={setActiveTab}
                  onOpenNewEvent={() => setActiveTab('events')}
                  onOpenCopilot={handleOpenCopilot}
                  onSelectEvent={(evt) => {
                    setSelectedEvent(evt);
                    setActiveTab('events');
                  }}
                />
              )}

              {activeTab === 'clients' && (
                <ClientCRMView
                  clients={clients}
                  rfqs={rfqs}
                  currentUserRole={authUser?.role || currentUser.role}
                  userDepartment={authUser?.department || currentUser.department}
                  onAddClient={(newClient) => {
                    const created: ClientDocument = {
                      ...newClient,
                      id: `cli-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setClients((prev) => [created, ...prev]);
                  }}
                  onOpenNewRFQWithClient={(clientId) => {
                    setRfqInitialClientId(clientId);
                    setActiveTab('rfqs');
                  }}
                />
              )}

              {activeTab === 'rfqs' && (
                <RFQDirectoryView
                  rfqs={rfqs}
                  clients={clients}
                  users={users}
                  initialSelectedClientId={rfqInitialClientId}
                  onAddRFQ={(newRFQ) => {
                    const created: RFQDocument = {
                      ...newRFQ,
                      id: `rfq-${Date.now()}`,
                      rfqNumber: `RFQ-2026-00${rfqs.length + 1}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setRfqs((prev) => [created, ...prev]);
                    setRfqInitialClientId(undefined);
                  }}
                  onUpdateRFQ={(updatedRFQ) => {
                    setRfqs((prev) => prev.map((r) => (r.id === updatedRFQ.id ? updatedRFQ : r)));
                  }}
                  onAddClientInline={(newClient) => {
                    const created: ClientDocument = {
                      ...newClient,
                      id: `cli-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    setClients((prev) => [created, ...prev]);
                    return created;
                  }}
                />
              )}

              {activeTab === 'events' && (
                <EventsDirectoryView
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                  onAddEvent={(newEvent) => setEvents((prev) => [newEvent, ...prev])}
                  onUpdateEvent={(updatedEvent) =>
                    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
                  }
                  onOpenCopilot={handleOpenCopilot}
                />
              )}

              {activeTab === 'staff' && (
                <StaffScheduleView
                  shifts={shifts}
                  onResolveConflict={handleResolveShiftConflict}
                  onUpdateShiftStatus={handleUpdateShiftStatus}
                  onOpenCopilot={handleOpenCopilot}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  assets={assets}
                  onAddAsset={(newAsset) => setAssets((prev) => [newAsset, ...prev])}
                  onUpdateAsset={(updatedAsset) =>
                    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)))
                  }
                  onOpenCopilot={handleOpenCopilot}
                />
              )}

              {activeTab === 'vendors' && (
                <VendorsView
                  vendors={vendors}
                  onAddVendor={(newVendor) => setVendors((prev) => [newVendor, ...prev])}
                  onOpenCopilot={handleOpenCopilot}
                />
              )}

              {activeTab === 'budget' && (
                <BudgetView
                  budgets={budgets}
                  onAddBudget={(newItem) => setBudgets((prev) => [newItem, ...prev])}
                  onUpdateBudget={(updatedItem) =>
                    setBudgets((prev) => prev.map((b) => (b.id === updatedItem.id ? updatedItem : b)))
                  }
                  onOpenCopilot={handleOpenCopilot}
                />
              )}

              {activeTab === 'reports' && <ReportsView onOpenCopilot={handleOpenCopilot} />}

              {activeTab === 'settings' && (
                <SettingsView
                  users={users}
                  currentUser={authUser || currentUser}
                  onSelectUser={setCurrentUser}
                  onUpdateUserPermissions={(userId, newPerms) =>
                    setUsers((prev) =>
                      prev.map((u) => (u.id === userId ? { ...u, permissions: newPerms } : u))
                    )
                  }
                  onAddUser={(newUser) => setUsers((prev) => [...prev, newUser])}
                  onOpenCopilot={handleOpenCopilot}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* AI Copilot Drawer Component */}
      <CommandCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotInitialPrompt}
        contextData={{
          activeTab,
          currentUser: authUser || currentUser,
          urgentAlertCount,
          activeEvents: events.length,
          totalBudget: budgets.reduce((sum, b) => sum + b.estimatedAmount, 0),
          actualSpent: budgets.reduce((sum, b) => sum + b.actualAmount, 0),
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <EventosAppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
