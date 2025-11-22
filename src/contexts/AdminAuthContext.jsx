import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../services/adminApi';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin key exists
    const hasKey = adminAuth.isAuthenticated();
    setIsAdminAuthenticated(hasKey);
    setIsLoading(false);
  }, []);

  const loginAdmin = (key) => {
    adminAuth.setAdminKey(key);
    setIsAdminAuthenticated(true);
  };

  const logoutAdmin = () => {
    adminAuth.clearAdminKey();
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        isLoading,
        loginAdmin,
        logoutAdmin,
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
