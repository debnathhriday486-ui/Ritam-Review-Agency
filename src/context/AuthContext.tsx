import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Admin } from '../../shared/types.ts';
import { api, getStoredToken, getStoredRole, setStoredToken, clearStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  role: 'user' | 'admin' | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (user: User, token: string) => void;
  loginAdmin: (admin: Admin, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // Auth modal control
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isRegisterModalOpen: boolean;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(getStoredRole() as any);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setAdmin(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.role === 'admin' && data.admin) {
        setAdmin(data.admin);
        setRole('admin');
        setUser(null);
      } else if (data.role === 'user' && data.user) {
        setUser(data.user);
        setRole('user');
        setAdmin(null);
      }
    } catch {
      clearStoredToken();
      setUser(null);
      setAdmin(null);
      setRole(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginUser = (newUser: User, newToken: string) => {
    setStoredToken(newToken, 'user');
    setUser(newUser);
    setAdmin(null);
    setRole('user');
    setToken(newToken);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  const loginAdmin = (newAdmin: Admin, newToken: string) => {
    setStoredToken(newToken, 'admin');
    setAdmin(newAdmin);
    setUser(null);
    setRole('admin');
    setToken(newToken);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setAdmin(null);
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        role,
        token,
        isLoading,
        loginUser,
        loginAdmin,
        logout,
        refreshUser,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        isRegisterModalOpen,
        openRegisterModal: () => setIsRegisterModalOpen(true),
        closeRegisterModal: () => setIsRegisterModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
