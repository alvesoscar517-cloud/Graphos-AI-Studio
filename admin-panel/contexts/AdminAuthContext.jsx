import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  setAuthData,
  clearAuthData,
  isAuthenticated,
  getAdminInfo,
  startTokenRefresh,
  stopTokenRefresh
} from '../services/authService';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    return () => stopTokenRefresh();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if setup is needed
      let setupResult;
      try {
        setupResult = await authApi.checkSetup();
      } catch (fetchError) {
        console.error('Cannot connect to server:', fetchError);
        setError('Unable to connect to server. Please make sure backend-admin is running on port 8081.');
        setIsLoading(false);
        return;
      }

      if (setupResult.success && setupResult.needsSetup) {
        setNeedsSetup(true);
        setIsLoading(false);
        return;
      }

      // Check if we have a valid token
      if (isAuthenticated()) {
        const adminInfo = getAdminInfo();
        setAdmin(adminInfo);
        setIsAdminAuthenticated(true);
        startTokenRefresh();
      } else {
        // Try to refresh token
        try {
          const refreshResult = await authApi.refresh();
          if (refreshResult.success && refreshResult.accessToken) {
            setAuthData(refreshResult.accessToken, getAdminInfo(), refreshResult.expiresIn);
            setIsAdminAuthenticated(true);
            startTokenRefresh();
          }
        } catch (refreshError) {
          // Refresh failed, user needs to login
          console.log('Token refresh failed, user needs to login');
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email/password
  const loginAdmin = useCallback(async (email, password) => {
    try {
      setError(null);
      const result = await authApi.login(email, password);
      
      if (result.success) {
        setAuthData(result.accessToken, result.admin, result.expiresIn);
        setAdmin(result.admin);
        setIsAdminAuthenticated(true);
        startTokenRefresh();
        return { success: true };
      } else {
        setError(result.error?.message || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Unable to connect to server');
      return { success: false, error: { message: 'Unable to connect to server' } };
    }
  }, []);

  // Initial setup
  const setupAdmin = useCallback(async (email, password, name) => {
    try {
      setError(null);
      const result = await authApi.setup(email, password, name);
      
      if (result.success) {
        setNeedsSetup(false);
        // Auto login after setup
        return await loginAdmin(email, password);
      } else {
        setError(result.error?.message || 'Setup failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Unable to connect to server');
      return { success: false, error: { message: 'Unable to connect to server' } };
    }
  }, [loginAdmin]);

  // Logout
  const logoutAdmin = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      stopTokenRefresh();
      clearAuthData();
      setAdmin(null);
      setIsAdminAuthenticated(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        // Password changed, need to re-login
        await logoutAdmin();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: { message: 'Unable to change password' } };
    }
  }, [logoutAdmin]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        admin,
        isLoading,
        needsSetup,
        error,
        loginAdmin,
        setupAdmin,
        logoutAdmin,
        changePassword,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
