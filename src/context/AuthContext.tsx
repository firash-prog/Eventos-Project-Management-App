import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserPermissions } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_GUEST_PERMISSIONS: UserPermissions = {
  viewEvents: false,
  editEvents: false,
  viewFinancials: false,
  approveBudget: false,
  manageUsers: false,
  manageRoles: false,
  resolveConflicts: false,
  manageInventory: false,
  manageVendors: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setMustChangePassword(!!data.user.mustChangePassword);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    setUser(data.user);
    setMustChangePassword(!!data.mustChangePassword);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setMustChangePassword(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password update failed');
    }

    setUser(data.user);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        mustChangePassword,
        login,
        logout,
        changePassword,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
