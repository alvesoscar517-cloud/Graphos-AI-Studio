import { BrowserRouter as Router } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminRoutes from './components/AdminRoutes';

export default function AdminApp() {
  return (
    <Router basename="/admin">
      <AdminAuthProvider>
        <AdminRoutes />
      </AdminAuthProvider>
    </Router>
  );
}
