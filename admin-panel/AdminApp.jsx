import { HashRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import AdminRoutes from './components/AdminRoutes';

export default function AdminApp() {
  return (
    <Router>
      <AdminAuthProvider>
        <RealtimeProvider>
          <AdminRoutes />
        </RealtimeProvider>
      </AdminAuthProvider>
    </Router>
  );
}
