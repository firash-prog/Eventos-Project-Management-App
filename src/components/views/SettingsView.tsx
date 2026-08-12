import React, { useState } from 'react';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Plus,
  UserCheck,
  Lock,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { UserAndRoleManagementView } from './UserAndRoleManagementView';

interface SettingsViewProps {
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onUpdateUserPermissions: (userId: string, permissions: any) => void;
  onAddUser: (newUser: User) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  users,
  currentUser,
  onSelectUser,
  onUpdateUserPermissions,
  onAddUser,
  onOpenCopilot,
}) => {
  const [subTab, setSubTab] = useState<'server_rbac' | 'perspective_matrix'>('server_rbac');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Event Producer');
  const [newDept, setNewDept] = useState('Production');

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const created: User = {
      id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: newRole,
      department: newDept,
      status: 'Active',
      permissions: {
        viewEvents: true,
        editEvents: newRole === 'Admin' || newRole === 'Event Producer' || newRole === 'Operations Manager',
        viewFinancials: newRole === 'Admin' || newRole === 'Finance Specialist',
        approveBudget: newRole === 'Admin' || newRole === 'Finance Specialist',
        manageUsers: newRole === 'Admin',
        resolveConflicts: newRole === 'Admin' || newRole === 'Operations Manager',
        manageRoles: newRole === 'Admin',
        manageInventory: newRole === 'Admin' || newRole === 'Event Producer' || newRole === 'Operations Manager' || newRole === 'Logistics Coordinator',
        manageVendors: newRole === 'Admin' || newRole === 'Event Producer' || newRole === 'Finance Specialist',
      },
    };

    onAddUser(created);
    setShowInviteModal(false);
    setNewName('');
    setNewEmail('');
  };

  const togglePerm = (user: User, permKey: string) => {
    const updated = {
      ...user.permissions,
      [permKey]: !(user.permissions as any)[permKey],
    };
    onUpdateUserPermissions(user.id, updated);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setSubTab('server_rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'server_rbac'
              ? 'glass-card border-amber-400/50 text-amber-300 bg-amber-500/10'
              : 'glass-btn text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Server RBAC & Staff Accounts</span>
        </button>

        <button
          onClick={() => setSubTab('perspective_matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'perspective_matrix'
              ? 'glass-card border-indigo-400/50 text-indigo-300 bg-indigo-500/10'
              : 'glass-btn text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <span>Perspective Test Mode & Matrix</span>
        </button>
      </div>

      {subTab === 'server_rbac' ? (
        <UserAndRoleManagementView />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-display">
                Role & Security Access Control
              </h1>
              <p className="text-xs lg:text-sm text-slate-400 mt-1">
                Role-based access matrix, module permission enforcement, user perspectives, and security governance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenCopilot('Audit user permissions matrix and recommend security hardening steps.')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
                AI Security Audit
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Invite Member
              </button>
            </div>
          </div>

          {/* Perspective Switcher */}
          <div className="glass-card bg-gradient-to-r from-indigo-950/40 via-slate-950/80 to-slate-950/90 border border-white/20 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2 font-display">
              <UserCheck className="w-4 h-4 text-amber-300" /> Active Perspective Test Mode
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Select a team member below to test how the entire command center transforms based on their specific role permissions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {users.map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => onSelectUser(usr)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    usr.id === currentUser.id
                      ? 'glass-card border-amber-400/60 ring-2 ring-amber-400/40 shadow-lg bg-amber-500/10'
                      : 'glass-card border-white/10 hover:border-white/25 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img src={usr.avatar} alt={usr.name} className="w-6 h-6 rounded-md object-cover ring-1 ring-white/20" />
                    <span className="font-bold text-xs text-slate-100 truncate">{usr.name}</span>
                  </div>
                  <p className="text-[10px] text-amber-300 font-semibold">{usr.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Permission Matrix Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-display">
                Module Permission Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="p-4">User & Role</th>
                    <th className="p-4 text-center">View Events</th>
                    <th className="p-4 text-center">Edit Events</th>
                    <th className="p-4 text-center">View Financials</th>
                    <th className="p-4 text-center">Approve Budget</th>
                    <th className="p-4 text-center">Resolve Conflicts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/[0.05] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20" />
                          <div>
                            <div className="font-bold text-slate-100">{usr.name}</div>
                            <div className="text-[10px] text-amber-300 font-medium">{usr.role} • {usr.department}</div>
                          </div>
                        </div>
                      </td>

                      {[
                        'viewEvents',
                        'editEvents',
                        'viewFinancials',
                        'approveBudget',
                        'resolveConflicts',
                      ].map((permKey) => {
                        const isGranted = (usr.permissions as any)[permKey];
                        return (
                          <td key={permKey} className="p-4 text-center">
                            <button
                              onClick={() => togglePerm(usr, permKey)}
                              className={`p-1.5 rounded-lg border text-xs transition-all ${
                                isGranted
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 backdrop-blur-md'
                                  : 'bg-white/5 border-white/10 text-slate-500'
                              }`}
                            >
                              {isGranted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisal Al-Otaibi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="faisal.o@eventos.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Admin" className="bg-slate-950 text-slate-100">Admin</option>
                  <option value="Event Producer" className="bg-slate-950 text-slate-100">Event Producer</option>
                  <option value="Operations Manager" className="bg-slate-950 text-slate-100">Operations Manager</option>
                  <option value="Logistics Coordinator" className="bg-slate-950 text-slate-100">Logistics Coordinator</option>
                  <option value="Finance Specialist" className="bg-slate-950 text-slate-100">Finance Specialist</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
