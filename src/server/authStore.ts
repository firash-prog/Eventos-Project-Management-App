import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { User, RoleDoc, UserPermissions, PERMISSION_KEYS } from '../types';
import { hashPassword, verifyPassword } from './auth';

/**
 * EVENTOS V8.0 AUTH SERVICE & DATA STORE
 * Server-enforced user profile, role, and permission manager backed by Firestore.
 */

// Load Firebase applet configuration
let firebaseConfig: any = {
  projectId: 'test-b1abc'
};
const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(cfgPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch (err) {
    console.warn('Could not parse firebase-applet-config.json, using default fallback config.');
  }
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Default Full System Permissions for Superadmin
export const SUPERADMIN_PERMISSIONS: UserPermissions = {
  viewEvents: true,
  editEvents: true,
  viewFinancials: true,
  approveBudget: true,
  manageUsers: true,
  manageRoles: true,
  resolveConflicts: true,
  manageInventory: true,
  manageVendors: true,
};

// Initial Seed Roles
const DEFAULT_SYSTEM_ROLES: RoleDoc[] = [
  {
    id: 'superadmin',
    name: 'Superadmin',
    description: 'Unrestricted enterprise control over users, roles, system security, and data.',
    isSystem: true,
    permissions: SUPERADMIN_PERMISSIONS,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full event, operational, and financial management privileges.',
    isSystem: true,
    permissions: {
      viewEvents: true,
      editEvents: true,
      viewFinancials: true,
      approveBudget: true,
      manageUsers: true,
      manageRoles: false,
      resolveConflicts: true,
      manageInventory: true,
      manageVendors: true,
    },
  },
  {
    id: 'event_producer',
    name: 'Event Producer',
    description: 'Directs event schedules, production milestones, and team tasks.',
    isSystem: true,
    permissions: {
      viewEvents: true,
      editEvents: true,
      viewFinancials: false,
      approveBudget: false,
      manageUsers: false,
      manageRoles: false,
      resolveConflicts: false,
      manageInventory: false,
      manageVendors: false,
    },
  },
  {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Oversees staff shifts, shift overlaps, and hardware asset allocation.',
    isSystem: true,
    permissions: {
      viewEvents: true,
      editEvents: false,
      viewFinancials: false,
      approveBudget: false,
      manageUsers: false,
      manageRoles: false,
      resolveConflicts: true,
      manageInventory: true,
      manageVendors: false,
    },
  },
  {
    id: 'logistics_coordinator',
    name: 'Logistics Coordinator',
    description: 'Tracks warehouse hardware check-ins/check-outs and vendor logistics.',
    isSystem: true,
    permissions: {
      viewEvents: true,
      editEvents: false,
      viewFinancials: false,
      approveBudget: false,
      manageUsers: false,
      manageRoles: false,
      resolveConflicts: false,
      manageInventory: true,
      manageVendors: true,
    },
  },
  {
    id: 'finance_specialist',
    name: 'Finance Specialist',
    description: 'Controls event line-item budgets, vendor quotes, and ZATCA compliance.',
    isSystem: true,
    permissions: {
      viewEvents: true,
      editEvents: false,
      viewFinancials: true,
      approveBudget: true,
      manageUsers: false,
      manageRoles: false,
      resolveConflicts: false,
      manageInventory: false,
      manageVendors: true,
    },
  },
];

/**
 * Seed system roles & initial superadmin account
 */
export async function bootstrapSystem(): Promise<void> {
  try {
    // 1. Ensure Roles exist
    for (const role of DEFAULT_SYSTEM_ROLES) {
      const rRef = doc(db, 'roles', role.id);
      const rSnap = await getDoc(rRef);
      if (!rSnap.exists()) {
        await setDoc(rRef, {
          ...role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Ensure Superadmin account exists
    const superUsername = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase();
    const superPassword = process.env.SUPERADMIN_PASSWORD || 'Eventos#Royal2026!ChangeMe';

    const uRef = doc(db, 'usernames', superUsername);
    const uSnap = await getDoc(uRef);

    if (!uSnap.exists()) {
      console.log(`[BOOTSTRAP] Provisioning initial superadmin account "${superUsername}"...`);
      const uid = `usr_${superUsername}_master`;
      const passHash = await hashPassword(superPassword);

      await setDoc(uRef, {
        username: superUsername,
        uid: uid,
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, 'users', uid), {
        id: uid,
        uid: uid,
        username: superUsername,
        name: 'ElitePro Superadmin',
        email: 'superadmin@eliteproeventsksa.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: 'Superadmin',
        roleId: 'superadmin',
        department: 'Executive Office',
        status: 'Active',
        mustChangePassword: true, // First login forced password change
        passwordHash: passHash,
        permissions: SUPERADMIN_PERMISSIONS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[BOOTSTRAP] Superadmin account "${superUsername}" created successfully!`);
    }
  } catch (err) {
    console.error('[BOOTSTRAP ERROR]', err);
  }
}

/**
 * Lookup user doc by username
 */
export async function getUserByUsername(username: string): Promise<(User & { passwordHash: string }) | null> {
  const normUser = username.trim().toLowerCase();
  const uSnap = await getDoc(doc(db, 'usernames', normUser));
  if (!uSnap.exists()) return null;

  const uid = uSnap.data().uid;
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    id: data.id || uid,
    username: data.username,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role,
    roleId: data.roleId,
    department: data.department,
    status: data.status,
    mustChangePassword: !!data.mustChangePassword,
    permissions: data.permissions || SUPERADMIN_PERMISSIONS,
    passwordHash: data.passwordHash,
  };
}

/**
 * Lookup user doc by UID
 */
export async function getUserByUid(uid: string): Promise<(User & { passwordHash: string }) | null> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    id: data.id || uid,
    username: data.username,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role,
    roleId: data.roleId,
    department: data.department,
    status: data.status,
    mustChangePassword: !!data.mustChangePassword,
    permissions: data.permissions || SUPERADMIN_PERMISSIONS,
    passwordHash: data.passwordHash,
  };
}

/**
 * List all users
 */
export async function getAllUsers(): Promise<User[]> {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: data.id || docSnap.id,
      username: data.username,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      role: data.role,
      roleId: data.roleId,
      department: data.department,
      status: data.status,
      mustChangePassword: !!data.mustChangePassword,
      permissions: data.permissions,
    };
  });
}

/**
 * Create a new user account (Superadmin or Admin)
 */
export async function createUserAccount(userData: {
  username: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  department: string;
}): Promise<User> {
  const normUser = userData.username.trim().toLowerCase();

  // Check username availability
  const uSnap = await getDoc(doc(db, 'usernames', normUser));
  if (uSnap.exists()) {
    throw new Error(`Username "${normUser}" is already registered.`);
  }

  // Get Role doc to copy permissions
  const roleSnap = await getDoc(doc(db, 'roles', userData.roleId));
  if (!roleSnap.exists()) {
    throw new Error(`Invalid roleId: ${userData.roleId}`);
  }
  const roleData = roleSnap.data() as RoleDoc;

  const uid = `usr_${normUser}_${Date.now().toString(36)}`;
  const passHash = await hashPassword(userData.password);

  // Map username -> uid
  await setDoc(doc(db, 'usernames', normUser), {
    username: normUser,
    uid,
    createdAt: new Date().toISOString(),
  });

  const newUserDoc: any = {
    id: uid,
    uid,
    username: normUser,
    name: userData.name,
    email: userData.email || `${normUser}@eliteproeventsksa.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normUser}`,
    role: roleData.name as any,
    roleId: userData.roleId,
    department: userData.department,
    status: 'Active',
    mustChangePassword: true, // Forces initial password change
    passwordHash: passHash,
    permissions: roleData.permissions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), newUserDoc);

  const { passwordHash: _, ...userWithoutHash } = newUserDoc;
  return userWithoutHash as User;
}

/**
 * Update user profile or role
 */
export async function updateUserAccount(
  uid: string,
  updates: Partial<User> & { password?: string }
): Promise<User> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('User not found.');
  }

  const current = snap.data();
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;
  if (updates.department) updateData.department = updates.department;
  if (updates.status) updateData.status = updates.status;
  if (typeof updates.mustChangePassword === 'boolean') {
    updateData.mustChangePassword = updates.mustChangePassword;
  }

  if (updates.roleId && updates.roleId !== current.roleId) {
    const roleSnap = await getDoc(doc(db, 'roles', updates.roleId));
    if (roleSnap.exists()) {
      const roleData = roleSnap.data() as RoleDoc;
      updateData.roleId = updates.roleId;
      updateData.role = roleData.name;
      updateData.permissions = roleData.permissions;
    }
  }

  if (updates.password) {
    updateData.passwordHash = await hashPassword(updates.password);
    updateData.mustChangePassword = true;
  }

  await updateDoc(userRef, updateData);

  const freshSnap = await getDoc(userRef);
  const data = freshSnap.data()!;
  return {
    id: data.id,
    username: data.username,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role,
    roleId: data.roleId,
    department: data.department,
    status: data.status,
    mustChangePassword: !!data.mustChangePassword,
    permissions: data.permissions,
  };
}

/**
 * Delete user account
 */
export async function deleteUserAccount(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.roleId === 'superadmin' && data.username === 'superadmin') {
    throw new Error('Cannot delete primary superadmin account.');
  }

  // Delete username doc mapping
  if (data.username) {
    await deleteDoc(doc(db, 'usernames', data.username.toLowerCase()));
  }

  // Delete user doc
  await deleteDoc(userRef);
}

/**
 * Change user password with current password verification
 */
export async function changeUserPassword(
  uid: string,
  currentPass: string,
  newPass: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('User record not found.');

  const userData = snap.data();
  const isValid = await verifyPassword(currentPass, userData.passwordHash);
  if (!isValid) {
    throw new Error('Current password verification failed. Please check your current password.');
  }

  if (!newPass || newPass.length < 8) {
    throw new Error('New password must be at least 8 characters long.');
  }

  const newHash = await hashPassword(newPass);
  await updateDoc(userRef, {
    passwordHash: newHash,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * List all roles
 */
export async function getAllRoles(): Promise<RoleDoc[]> {
  const colRef = collection(db, 'roles');
  const snap = await getDocs(colRef);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<RoleDoc, 'id'>),
  }));
}

/**
 * Create custom role
 */
export async function createCustomRole(role: Omit<RoleDoc, 'createdAt' | 'updatedAt'>): Promise<RoleDoc> {
  const roleRef = doc(db, 'roles', role.id);
  const snap = await getDoc(roleRef);
  if (snap.exists()) throw new Error(`Role ID "${role.id}" already exists.`);

  const newRole: RoleDoc = {
    ...role,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(roleRef, newRole);
  return newRole;
}

/**
 * Update custom role permissions
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: UserPermissions,
  name?: string,
  description?: string
): Promise<RoleDoc> {
  const roleRef = doc(db, 'roles', roleId);
  const snap = await getDoc(roleRef);
  if (!snap.exists()) throw new Error('Role not found.');

  const updates: any = {
    permissions,
    updatedAt: new Date().toISOString(),
  };
  if (name) updates.name = name;
  if (description) updates.description = description;

  await updateDoc(roleRef, updates);

  const updatedSnap = await getDoc(roleRef);
  return {
    id: updatedSnap.id,
    ...(updatedSnap.data() as Omit<RoleDoc, 'id'>),
  };
}

/**
 * Delete custom role
 */
export async function deleteCustomRole(roleId: string): Promise<void> {
  const roleRef = doc(db, 'roles', roleId);
  const snap = await getDoc(roleRef);
  if (!snap.exists()) return;

  const data = snap.data() as RoleDoc;
  if (data.isSystem || roleId === 'superadmin') {
    throw new Error('System roles cannot be deleted.');
  }

  await deleteDoc(roleRef);
}
