import crypto from 'crypto';
import { UserPermissions } from '../types';

/**
 * EVENTOS V8.0 AUTH UTILITIES
 * Pure server-side cryptographic and password management routines.
 */

const SALT_BYTE_SIZE = 16;
const HASH_KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

/**
 * Hashes a plaintext password using Node.js crypto.scrypt
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTE_SIZE).toString('hex');
    crypto.scrypt(password, salt, HASH_KEY_LEN, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Synchronously verifies a plaintext password against a stored salt:hash string using timingSafeEqual
 */
export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!storedHash || !storedHash.includes(':')) return resolve(false);
    const [salt, keyHex] = storedHash.split(':');
    const key = Buffer.from(keyHex, 'hex');

    crypto.scrypt(password, salt, HASH_KEY_LEN, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) return resolve(false);
      if (key.length !== derivedKey.length) return resolve(false);
      resolve(crypto.timingSafeEqual(key, derivedKey));
    });
  });
}

export interface SessionPayload {
  uid: string;
  username: string;
  roleId: string;
  roleName: string;
  mustChangePassword: boolean;
  permissions: UserPermissions;
  iat: number;
  exp: number;
}

const DEFAULT_SECRET = process.env.SESSION_SECRET || 'eventos-super-secret-session-key-2026';

/**
 * Creates an HMAC-SHA256 signed session token string
 */
export function signSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>, expiresInSeconds = 86400 * 7): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const fullPayload: SessionPayload = { ...payload, iat, exp };
  
  const jsonPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', DEFAULT_SECRET);
  hmac.update(jsonPayload);
  const signature = hmac.digest('base64url');

  return `${jsonPayload}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 signed session token string
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [jsonPayload, signature] = token.split('.');

    const hmac = crypto.createHmac('sha256', DEFAULT_SECRET);
    hmac.update(jsonPayload);
    const expectedSignature = hmac.digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(jsonPayload, 'base64url').toString('utf-8'));
    
    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
