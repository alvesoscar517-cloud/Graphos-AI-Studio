import { HashRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminRoutes from './components/AdminRoutes';

export default function AdminApp() {
  return (
    <Router>
      <AdminAuthProvider>
        <AdminRoutes />
      </AdminAuthProvider>
    </Router>
  );
}
