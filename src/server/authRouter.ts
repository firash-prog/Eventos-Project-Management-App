import { Router, Request, Response, NextFunction } from 'express';
import { signSessionToken, verifySessionToken, verifyPassword } from './auth';
import {
  getUserByUsername,
  getUserByUid,
  getAllUsers,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  changeUserPassword,
  getAllRoles,
  createCustomRole,
  updateRolePermissions,
  deleteCustomRole,
  bootstrapSystem,
} from './authStore';

export const authRouter = Router();

// Middleware: Authenticate Session Cookie or Authorization Bearer token
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.eventos_session;
    let token = cookieToken;

    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No session token provided.' });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Session expired or invalid token.' });
    }

    // Re-verify user status from database to prevent stolen/stale token privilege escalation
    const freshUser = await getUserByUid(payload.uid);
    if (!freshUser || freshUser.status === 'Inactive') {
      return res.status(403).json({ error: 'User account is inactive or disabled.' });
    }

    (req as any).user = freshUser;
    (req as any).sessionPayload = payload;
    next();
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal security authentication failure.' });
  }
}

// Middleware: Require Superadmin or Specific Permission
export function requirePermission(permissionKey?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (user.roleId === 'superadmin') {
      return next(); // Superadmin bypasses specific permission checks
    }

    if (permissionKey && !user.permissions?.[permissionKey]) {
      return res.status(403).json({
        error: `Access Denied. Permission "${permissionKey}" is required for this operational action.`,
      });
    }

    next();
  };
}

// --------------------------------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------------------------------

// Login Endpoint (Username + Password)
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      // Prevent timing attacks by executing a dummy password hash verification
      await verifyPassword(password, 'salt:0000000000000000000000000000000000000000000000000000000000000000');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const { passwordHash, ...userClean } = user;

    // Sign session token
    const token = signSessionToken({
      uid: userClean.id,
      username: userClean.username,
      roleId: userClean.roleId,
      roleName: userClean.role,
      mustChangePassword: !!userClean.mustChangePassword,
      permissions: userClean.permissions,
    });

    // Set HTTP-only session cookie
    res.cookie('eventos_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      user: userClean,
      token,
      mustChangePassword: !!userClean.mustChangePassword,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('eventos_session');
  return res.json({ status: 'ok', message: 'Logged out successfully.' });
});

// Get Current User Profile
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  return res.json({ user: (req as any).user });
});

// Change Password Route
authRouter.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    await changeUserPassword(user.id, currentPassword, newPassword);

    // Refresh user profile
    const freshUser = await getUserByUid(user.id);
    const { passwordHash, ...cleanUser } = freshUser!;

    // Re-issue session token with updated mustChangePassword status
    const token = signSessionToken({
      uid: cleanUser.id,
      username: cleanUser.username,
      roleId: cleanUser.roleId,
      roleName: cleanUser.role,
      mustChangePassword: false,
      permissions: cleanUser.permissions,
    });

    res.cookie('eventos_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Password updated successfully.',
      user: cleanUser,
      token,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Password update failed.' });
  }
});

// System Seed/Bootstrap
authRouter.post('/seed', async (req: Request, res: Response) => {
  try {
    await bootstrapSystem();
    return res.json({ status: 'ok', message: 'System bootstrap completed.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Bootstrap failed.' });
  }
});

// --------------------------------------------------------------------------
// USER MANAGEMENT ENDPOINTS
// --------------------------------------------------------------------------

authRouter.get('/users', requireAuth, requirePermission('manageUsers'), async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve users.' });
  }
});

authRouter.post('/users', requireAuth, requirePermission('manageUsers'), async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, roleId, department } = req.body;
    if (!username || !name || !password || !roleId) {
      return res.status(400).json({ error: 'Username, name, password, and roleId are required.' });
    }

    const newUser = await createUserAccount({ username, name, email, password, roleId, department });
    return res.status(201).json({ user: newUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create user.' });
  }
});

authRouter.put('/users/:id', requireAuth, requirePermission('manageUsers'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await updateUserAccount(id, updates);
    return res.json({ user: updatedUser });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update user.' });
  }
});

authRouter.delete('/users/:id', requireAuth, requirePermission('manageUsers'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteUserAccount(id);
    return res.json({ message: 'User deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to delete user.' });
  }
});

// --------------------------------------------------------------------------
// ROLE MANAGEMENT ENDPOINTS
// --------------------------------------------------------------------------

authRouter.get('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const roles = await getAllRoles();
    return res.json({ roles });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve roles.' });
  }
});

authRouter.post('/roles', requireAuth, requirePermission('manageRoles'), async (req: Request, res: Response) => {
  try {
    const { id, name, description, permissions } = req.body;
    if (!id || !name || !permissions) {
      return res.status(400).json({ error: 'Role ID, name, and permissions object are required.' });
    }

    const newRole = await createCustomRole({ id, name, description, permissions });
    return res.status(201).json({ role: newRole });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create role.' });
  }
});

authRouter.put('/roles/:id', requireAuth, requirePermission('manageRoles'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permissions, name, description } = req.body;
    const updatedRole = await updateRolePermissions(id, permissions, name, description);
    return res.json({ role: updatedRole });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update role.' });
  }
});

authRouter.delete('/roles/:id', requireAuth, requirePermission('manageRoles'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCustomRole(id);
    return res.json({ message: 'Role deleted successfully.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to delete role.' });
  }
});
