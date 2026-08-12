import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserPermissions } from '../types';

export const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('eventos_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

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

export const parseJsonResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || `Server error (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  if (!data) {
    throw new Error('Received non-JSON response from server.');
  }

  return data;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/auth/me');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
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
      credentials: 'include',
    });

    const data = await parseJsonResponse(res);

    if (data.token) {
      localStorage.setItem('eventos_token', data.token);
    }

    setUser(data.user);
    setMustChangePassword(!!data.mustChangePassword);
  };

  const logout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('eventos_token');
      setUser(null);
      setMustChangePassword(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await authFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await parseJsonResponse(res);

    if (data.token) {
      localStorage.setItem('eventos_token', data.token);
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
