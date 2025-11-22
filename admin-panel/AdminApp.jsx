import { BrowserRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from '../src/contexts/AdminAuthContext';
import AdminRoutes from '../src/components/Admin/AdminRoutes';

export default function AdminApp() {
  return (
    <Router basename="/admin">
      <AdminAuthProvider>
        <AdminRoutes />
      </AdminAuthProvider>
    </Router>
  );
}
