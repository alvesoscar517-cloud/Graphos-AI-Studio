import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import AdminRoutes from './components/AdminRoutes';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui/toast';
import { PageErrorBoundary } from './components/ui/error-boundary';

// Import global styles with Tailwind
import './styles/globals.css';

export default function AdminApp() {
  return (
    <PageErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AdminAuthProvider>
            <RealtimeProvider>
              <AdminRoutes />
              <ToastProvider />
            </RealtimeProvider>
          </AdminAuthProvider>
        </Router>
      </QueryClientProvider>
    </PageErrorBoundary>
  );
}
