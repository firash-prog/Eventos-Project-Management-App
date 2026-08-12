import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  KeyRound,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Lock,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { User, RoleDoc, PERMISSION_KEYS, PermissionKey, UserPermissions } from '../../types';
import { useAuth, authFetch, parseJsonResponse } from '../../context/AuthContext';

export const UserAndRoleManagementView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDoc | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoleId, setNewRoleId] = useState('event_producer');
  const [newDepartment, setNewDepartment] = useState('Event Operations');

  // Edit user form state
  const [editRoleId, setEditRoleId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'On Shift' | 'Away' | 'Inactive'>('Active');
  const [editMustChangePassword, setEditMustChangePassword] = useState(false);

  // New/Edit Role form state
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<UserPermissions>({
    viewEvents: true,
    editEvents: false,
    viewFinancials: false,
    approveBudget: false,
    manageUsers: false,
    manageRoles: false,
    resolveConflicts: false,
    manageInventory: false,
    manageVendors: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, rolesRes] = await Promise.all([
        authFetch('/api/auth/users'),
        authFetch('/api/auth/roles'),
      ]);

      const usersData = await parseJsonResponse(usersRes);
      const rolesData = await parseJsonResponse(rolesRes);

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (err: any) {
      setError(err.message || 'Error loading user and role governance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await authFetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          name: newName,
          email: newEmail,
          password: newPassword,
          roleId: newRoleId,
          department: newDepartment,
        }),
      });

      await parseJsonResponse(res);

      setShowCreateUserModal(false);
      setNewUsername('');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setError(null);
      const res = await authFetch(`/api/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: editRoleId,
          department: editDepartment,
          status: editStatus,
          mustChangePassword: editMustChangePassword,
        }),
      });

      await parseJsonResponse(res);

      setShowEditUserModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently revoke account "${username}"?`)) return;

    try {
      setError(null);
      const res = await authFetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
      });

      await parseJsonResponse(res);

      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await authFetch('/api/auth/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roleId.trim().toLowerCase().replace(/\s+/g, '_'),
          name: roleName,
          description: roleDescription,
          permissions: rolePermissions,
        }),
      });

      await parseJsonResponse(res);

      setShowCreateRoleModal(false);
      setRoleId('');
      setRoleName('');
      setRoleDescription('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      setError(null);
      const res = await authFetch(`/api/auth/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleName,
          description: roleDescription,
          permissions: rolePermissions,
        }),
      });

      await parseJsonResponse(res);

      setShowEditRoleModal(false);
      setSelectedRole(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (rId: string, rName: string) => {
    if (!confirm(`Are you sure you want to delete custom role "${rName}"?`)) return;

    try {
      setError(null);
      const res = await authFetch(`/api/auth/roles/${rId}`, {
        method: 'DELETE',
      });

      await parseJsonResponse(res);

      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-extrabold text-slate-100 font-display uppercase tracking-wider">
              Identity, Access & RBAC Governance
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            Server-enforced role permissions, username resolution, and internal staff provisioning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl glass-btn text-slate-300 hover:text-white flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeTab === 'users' ? (
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-4 py-2.5 rounded-xl glass-btn-amber font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Staff Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setRoleId('');
                setRoleName('');
                setRoleDescription('');
                setShowCreateRoleModal(true);
              }}
              className="px-4 py-2.5 rounded-xl glass-btn-primary font-bold text-xs text-white flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'glass-card border-amber-400/50 text-amber-300 bg-amber-500/10'
              : 'glass-btn text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'glass-card border-indigo-400/50 text-indigo-300 bg-indigo-500/10'
              : 'glass-btn text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Roles & Matrix ({roles.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS ROSTER */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden space-y-4">
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff users by name, username, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredUsers.length} of {users.length} Active Profiles
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-white/[0.04] backdrop-blur-md border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Role & Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Password Guard</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.05] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-amber-300 font-semibold">{u.username}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-200">{u.role}</span>
                      <p className="text-[10px] text-slate-400">{u.department}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : u.status === 'On Shift'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold backdrop-blur-md">
                          <ShieldAlert className="w-3 h-3" /> Forced Change
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditRoleId(u.roleId);
                            setEditDepartment(u.department);
                            setEditStatus(u.status);
                            setEditMustChangePassword(!!u.mustChangePassword);
                            setShowEditUserModal(true);
                          }}
                          className="p-1.5 rounded-lg glass-btn text-slate-300 hover:text-amber-300 transition-colors"
                          title="Edit User Role/Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={u.username === 'superadmin'}
                          className="p-1.5 rounded-lg glass-btn text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
                          title="Revoke Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="glass-card rounded-2xl p-5 space-y-4 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-100 font-display">{r.name}</h3>
                    {r.isSystem ? (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
                        System Protected
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                        Custom Role
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{r.description}</p>

                  <div className="space-y-1.5 border-t border-white/10 pt-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Granted Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {PERMISSION_KEYS.map((key) => {
                        const isGranted = r.permissions?.[key];
                        if (!isGranted) return null;
                        return (
                          <span
                            key={key}
                            className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono"
                          >
                            {key}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedRole(r);
                      setRoleName(r.name);
                      setRoleDescription(r.description);
                      setRolePermissions(r.permissions);
                      setShowEditRoleModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg glass-btn text-xs text-slate-200 font-semibold hover:text-white"
                  >
                    Configure Permissions
                  </button>

                  {!r.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(r.id, r.name)}
                      className="p-1.5 rounded-lg glass-btn text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: PROVISION NEW USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">Provision Staff Account</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Username (Internal UID)</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. tarek_mansoor"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tarek Mansoor"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Assign Role</label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-950 text-slate-100">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    required
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-300 font-medium pt-1">
                ⚡ Account will be created with mandatory "Force Password Change on First Login".
              </p>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER ACCOUNT */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">
                Edit Staff Account: {selectedUser.username}
              </h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Assigned Role</label>
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-950 text-slate-100">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Active" className="bg-slate-950 text-slate-100">Active</option>
                  <option value="On Shift" className="bg-slate-950 text-slate-100">On Shift</option>
                  <option value="Away" className="bg-slate-950 text-slate-100">Away</option>
                  <option value="Inactive" className="bg-slate-950 text-slate-100">Inactive (Disabled)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <input
                  type="checkbox"
                  id="forcePassCheck"
                  checked={editMustChangePassword}
                  onChange={(e) => setEditMustChangePassword(e.target.checked)}
                  className="rounded border-white/20 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="forcePassCheck" className="text-slate-200 font-semibold cursor-pointer">
                  Force Password Change on Next Login
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl glass-btn-amber font-bold shadow-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE / EDIT ROLE */}
      {(showCreateRoleModal || showEditRoleModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-display">
                {showCreateRoleModal ? 'Create Custom Role' : `Configure Role: ${selectedRole?.name}`}
              </h3>
              <button
                onClick={() => {
                  setShowCreateRoleModal(false);
                  setShowEditRoleModal(false);
                }}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={showCreateRoleModal ? handleCreateRole : handleEditRoleSubmit}
              className="space-y-4 text-xs"
            >
              {showCreateRoleModal && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Role ID (Unique Key)</label>
                  <input
                    type="text"
                    required
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    placeholder="e.g. stage_director"
                    className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Role Display Name</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Stage Director"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe duties and operational boundaries"
                  className="w-full glass-input rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  Permission Matrix Configuration:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {PERMISSION_KEYS.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-lg glass-card border border-white/5 hover:border-white/20 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!rolePermissions[key]}
                        onChange={(e) =>
                          setRolePermissions((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-white/20 text-indigo-500 focus:ring-indigo-400"
                      />
                      <span className="font-mono text-[11px] text-slate-200">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoleModal(false);
                    setShowEditRoleModal(false);
                  }}
                  className="px-4 py-2 rounded-xl glass-btn text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl glass-btn-primary font-bold shadow-lg">
                  Save Role Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
