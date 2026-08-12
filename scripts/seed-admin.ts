/**
 * EVENTOS V8.0 - SUPERADMIN SEED SCRIPT (TypeScript / ESM)
 * Reads SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD from .env
 * Provisions system roles and superadmin account via Firestore SDK.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Parse .env if present
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const USERNAME = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase();
const PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Eventos#Royal2026!ChangeMe';

console.log('----------------------------------------------------');
console.log('EVENTOS V8.0 - SUPERADMIN PROVISIONING');
console.log(`Target Username: ${USERNAME}`);
console.log('----------------------------------------------------');

const SALT_BYTE_SIZE = 16;
const HASH_KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function hashPasswordSync(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, HASH_KEY_LEN, SCRYPT_PARAMS);
  return `${salt}:${derivedKey.toString('hex')}`;
}

const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {
  projectId: 'test-b1abc'
};
if (fs.existsSync(cfgPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

async function runSeed() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  const allPermissions = {
    viewEvents: true,
    editEvents: true,
    viewFinancials: true,
    approveBudget: true,
    manageUsers: true,
    manageRoles: true,
    resolveConflicts: true,
    manageInventory: true,
    manageVendors: true
  };

  // 1. Ensure System Roles exist
  const superadminRoleRef = doc(db, 'roles', 'superadmin');
  const superadminRoleSnap = await getDoc(superadminRoleRef);

  if (!superadminRoleSnap.exists()) {
    console.log('Creating system role: superadmin...');
    await setDoc(superadminRoleRef, {
      id: 'superadmin',
      name: 'Superadmin',
      description: 'Unrestricted enterprise control over users, roles, system security, and data.',
      isSystem: true,
      permissions: allPermissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    console.log('System role superadmin already exists.');
  }

  const defaultRoles = [
    { id: 'admin', name: 'Admin', desc: 'Full event and operational management privileges.' },
    { id: 'event_producer', name: 'Event Producer', desc: 'Directs event schedules, tasks, and team coordination.' },
    { id: 'operations_manager', name: 'Operations Manager', desc: 'Manages staff shifts, hardware inventory, and conflicts.' },
    { id: 'logistics_coordinator', name: 'Logistics Coordinator', desc: 'Tracks inventory check-outs and supplier logistics.' },
    { id: 'finance_specialist', name: 'Finance Specialist', desc: 'Controls event budgets, invoices, and ZATCA compliance.' }
  ];

  for (const r of defaultRoles) {
    const rRef = doc(db, 'roles', r.id);
    const rSnap = await getDoc(rRef);
    if (!rSnap.exists()) {
      await setDoc(rRef, {
        id: r.id,
        name: r.name,
        description: r.desc,
        isSystem: true,
        permissions: {
          viewEvents: true,
          editEvents: r.id !== 'finance_specialist',
          viewFinancials: r.id === 'admin' || r.id === 'finance_specialist',
          approveBudget: r.id === 'admin' || r.id === 'finance_specialist',
          manageUsers: false,
          manageRoles: false,
          resolveConflicts: r.id === 'admin' || r.id === 'operations_manager',
          manageInventory: r.id === 'admin' || r.id === 'operations_manager' || r.id === 'logistics_coordinator',
          manageVendors: r.id === 'admin' || r.id === 'finance_specialist'
        },
        createdAt: new Date().toISOString()
      });
    }
  }

  // 2. Username mapping check
  const usernameRef = doc(db, 'usernames', USERNAME);
  const usernameSnap = await getDoc(usernameRef);

  if (usernameSnap.exists()) {
    console.log(`Username "${USERNAME}" already exists. Superadmin account is already seeded.`);
    process.exit(0);
  }

  console.log(`Seeding superadmin account "${USERNAME}"...`);
  const uid = `usr_${USERNAME}_${Date.now().toString(36)}`;
  const passwordHash = hashPasswordSync(PASSWORD);

  await setDoc(usernameRef, {
    username: USERNAME,
    uid: uid,
    createdAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'users', uid), {
    id: uid,
    uid: uid,
    username: USERNAME,
    name: 'ElitePro Superadmin',
    email: 'superadmin@eliteproeventsksa.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'Superadmin',
    roleId: 'superadmin',
    department: 'Executive Office',
    status: 'Active',
    mustChangePassword: true, // MANDATORY: First-login forced password change
    passwordHash: passwordHash,
    permissions: allPermissions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('SUCCESS: Superadmin account successfully seeded!');
  console.log(`Username: ${USERNAME}`);
  console.log(`Status: Active (mustChangePassword: true)`);
  process.exit(0);
}

runSeed().catch(err => {
  console.error('ERROR during superadmin seeding:', err);
  process.exit(1);
});

