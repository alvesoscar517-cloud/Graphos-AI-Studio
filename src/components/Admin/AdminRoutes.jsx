import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

// Lazy load admin components for better performance
const DashboardView = lazy(() => import('./Dashboard/DashboardView'));
const NotificationList = lazy(() => import('./Notifications/NotificationList'));
const NotificationEditor = lazy(() => import('./Notifications/NotificationEditor'));
const UserList = lazy(() => import('./Users/UserList'));
const UserDetail = lazy(() => import('./Users/UserDetail'));
const AnalyticsView = lazy(() => import('./Analytics/AnalyticsView'));

// Loading component
function AdminLoadingFallback() {
  return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>Đang tải...</p>
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
    <AdminLayout>
      <Suspense fallback={<AdminLoadingFallback />}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/notifications/new" element={<NotificationEditor />} />
          <Route path="/notifications/:id" element={<NotificationEditor />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/settings" element={<div className="admin-empty-state">Settings (Coming soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
}
