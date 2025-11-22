import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { NotificationProvider } from './Common/NotificationProvider';
import ErrorBoundary from './Common/ErrorBoundary';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

// Lazy load admin components for better performance
const DashboardView = lazy(() => import('./Dashboard/DashboardView'));
const NotificationList = lazy(() => import('./Notifications/NotificationList'));
const NotificationEditor = lazy(() => import('./Notifications/NotificationEditor'));
const UserList = lazy(() => import('./Users/UserList'));
const UserDetail = lazy(() => import('./Users/UserDetail'));
const SupportList = lazy(() => import('./Support/SupportList'));
const SupportDetail = lazy(() => import('./Support/SupportDetail'));
const AnalyticsView = lazy(() => import('./Analytics/AnalyticsView'));
const SettingsView = lazy(() => import('./Settings/SettingsView'));
const SystemLogs = lazy(() => import('./Logs/SystemLogs'));

// Loading component
function AdminLoadingFallback() {
  return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default function AdminRoutes() {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <AdminLoadingFallback />;
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <NotificationProvider>
      <AdminLayout>
        <ErrorBoundary>
          <Suspense fallback={<AdminLoadingFallback />}>
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/notifications" element={<NotificationList />} />
              <Route path="/notifications/new" element={<NotificationEditor />} />
              <Route path="/notifications/:id" element={<NotificationEditor />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/support" element={<SupportList />} />
              <Route path="/support/:id" element={<SupportDetail />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AdminLayout>
    </NotificationProvider>
  );
}
