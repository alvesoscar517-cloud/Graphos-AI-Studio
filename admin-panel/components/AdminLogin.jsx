import { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ButtonSpinner from './Common/ButtonSpinner';
import './AdminLogin.css';

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!adminKey.trim()) {
      setError('Please enter Admin Key');
      return;
    }

    try {
      setLoading(true);
      
      // Try to verify the key by making a test API call
      const response = await fetch('https://ai-authenticator-472729326429.us-central1.run.app/api/admin/analytics/overview', {
        headers: {
          'X-Admin-Key': adminKey
        }
      });

      if (response.ok) {
        loginAdmin(adminKey);
      } else {
        setError('Invalid Admin Key');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="login-icon">
            <img src="/icon/shield-check.svg" alt="Shield" />
          </div>
          <h1>Admin Panel</h1>
          <p>Login to manage the system</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="adminKey">
              <img src="/icon/key.svg" alt="Key" className="label-icon" />
              Admin Key
            </label>
            <input
              type="password"
              id="adminKey"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              autoFocus
            />
          </div>

          {error && (
            <div className="admin-error-message">
              <img src="/icon/alert-circle.svg" alt="Error" />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <ButtonSpinner />
                Authenticating...
              </>
            ) : (
              <>
                <img src="/icon/log-in.svg" alt="Login" />
                Login
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <img src="/icon/info.svg" alt="Info" />
          <p>Contact administrator if you need help</p>
        </div>
      </div>
    </div>
  );
}
