import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = { projectId: 'test-b1abc' };
if (fs.existsSync(cfgPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

const SALT_BYTE_SIZE = 16;
const HASH_KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function hashPasswordSync(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTE_SIZE).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, HASH_KEY_LEN, SCRYPT_PARAMS);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function resetAdmin() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  const usernames = ['superadmin', 'admin'];
  const newPassword = 'Eventos#Royal2026!ChangeMe';
  const passwordHash = hashPasswordSync(newPassword);

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

  for (const username of usernames) {
    const uRef = doc(db, 'usernames', username);
    const uSnap = await getDoc(uRef);

    let uid = `usr_${username}_master`;
    if (uSnap.exists()) {
      uid = uSnap.data().uid || uid;
    } else {
      await setDoc(uRef, {
        username: username,
        uid: uid,
        createdAt: new Date().toISOString()
      });
    }

    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      id: uid,
      uid: uid,
      username: username,
      name: username === 'superadmin' ? 'ElitePro Superadmin' : 'System Administrator',
      email: `${username}@eliteproeventsksa.com`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'Superadmin',
      roleId: 'superadmin',
      department: 'Executive Office',
      status: 'Active',
      mustChangePassword: false,
      passwordHash: passwordHash,
      permissions: allPermissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  console.log('----------------------------------------------------');
  console.log('ADMIN CREDENTIALS RESET SUCCESSFUL!');
  console.log(`Usernames: superadmin, admin`);
  console.log(`New Password: ${newPassword}`);
  console.log('mustChangePassword: false');
  console.log('----------------------------------------------------');
  process.exit(0);
}

resetAdmin().catch((err) => {
  console.error('Failed to reset admin credentials:', err);
  process.exit(1);
});
