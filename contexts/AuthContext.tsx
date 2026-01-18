"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

/**
 * User type from the backend API
 */
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: string | null;
};

/**
 * Auth context type
 */
type AuthContextType = {
  /**
   * Current authenticated user (null if not authenticated)
   */
  user: User | null;

  /**
   * Whether auth state is being initialized or validated
   */
  loading: boolean;

  /**
   * Login with email and password
   */
  login: (email: string, password: string) => Promise<void>;

  /**
   * Sign up a new user
   */
  signup: (email: string, name: string, password: string) => Promise<{ message: string }>;

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: (googleIdToken: string) => Promise<void>;

  /**
   * Logout the current user
   */
  logout: () => void;

  /**
   * Refresh user data from backend
   */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider for authentication context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Validate existing token and fetch user data on mount
   */
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token by fetching user data
        const { user: userData } = await ApiClient.getMe();
        setUser(userData);
      } catch (error) {
        // Token is invalid or expired, clear it
        localStorage.removeItem('auth-token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: userData } = await ApiClient.login(email, password);
      setUser(userData);

      // Redirect to app after successful login
      router.push('/app');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Sign up a new user
   */
  const signup = useCallback(async (email: string, name: string, password: string) => {
    try {
      setLoading(true);
      const result = await ApiClient.signup(email, name, password);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async (googleIdToken: string) => {
    try {
      setLoading(true);
      const { user: userData } = await ApiClient.googleLogin(googleIdToken);
      setUser(userData);

      // Redirect to app after successful login
      router.push('/app');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Logout the current user
   */
  const logout = useCallback(() => {
    ApiClient.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  /**
   * Refresh user data from backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const { user: userData } = await ApiClient.getMe();
      setUser(userData);
    } catch (error) {
      // If refresh fails, clear auth state
      ApiClient.logout();
      setUser(null);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
