import { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ButtonSpinner from './Common/ButtonSpinner';
import './AdminLogin.css';

export default function AdminLogin() {
  const { 
    needsSetup, 
    loginAdmin, 
    loginWithKey, 
    setupAdmin, 
    error, 
    clearError 
  } = useAdminAuth();

  const [mode, setMode] = useState(needsSetup ? 'setup' : 'login'); // 'login', 'key', 'setup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    adminKey: ''
  });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setLocalError('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(formData.email, formData.password);
    setLoading(false);

    if (!result.success) {
      setLocalError(result.error?.message || 'Login failed');
    }
  };

  const handleKeyLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.adminKey.trim()) {
      setLocalError('Please enter admin key');
      return;
    }

    setLoading(true);
    const result = await loginWithKey(formData.adminKey);
    setLoading(false);

    if (!result.success) {
      setLocalError(result.error?.message || 'Invalid admin key');
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setLocalError('Please enter email and password');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await setupAdmin(formData.email, formData.password, formData.name || 'Admin');
    setLoading(false);

    if (!result.success) {
      setLocalError(result.error?.message || 'Setup failed');
    }
  };

  const displayError = localError || error;

  // Setup mode
  if (mode === 'setup' || needsSetup) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <div className="login-icon setup">
              <img src="/icon/settings.svg" alt="Setup" />
            </div>
            <h1>Initial Setup</h1>
            <p>Create your admin account to get started</p>
          </div>

          <form onSubmit={handleSetup} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="name">
                <img src="/icon/user.svg" alt="Name" className="label-icon" />
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                autoFocus
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="email">
                <img src="/icon/mail.svg" alt="Email" className="label-icon" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">
                <img src="/icon/lock.svg" alt="Password" className="label-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="confirmPassword">
                <img src="/icon/lock.svg" alt="Confirm" className="label-icon" />
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            {displayError && (
              <div className="admin-error-message">
                <img src="/icon/alert-circle.svg" alt="Error" />
                {displayError}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <ButtonSpinner />
                  Creating Account...
                </>
              ) : (
                <>
                  <img src="/icon/check.svg" alt="Create" />
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          {!needsSetup && (
            <div className="admin-login-footer">
              <button className="link-btn" onClick={() => setMode('login')}>
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Key login mode
  if (mode === 'key') {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <div className="login-icon">
              <img src="/icon/key.svg" alt="Key" />
            </div>
            <h1>Admin Key Login</h1>
            <p>Enter your admin key to access</p>
          </div>

          <form onSubmit={handleKeyLogin} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="adminKey">
                <img src="/icon/key.svg" alt="Key" className="label-icon" />
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                name="adminKey"
                value={formData.adminKey}
                onChange={handleChange}
                placeholder="Enter admin key"
                autoFocus
              />
            </div>

            {displayError && (
              <div className="admin-error-message">
                <img src="/icon/alert-circle.svg" alt="Error" />
                {displayError}
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
            <button className="link-btn" onClick={() => setMode('login')}>
              ← Login with Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Email login mode
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

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="email">
              <img src="/icon/mail.svg" alt="Email" className="label-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              <img src="/icon/lock.svg" alt="Password" className="label-icon" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {displayError && (
            <div className="admin-error-message">
              <img src="/icon/alert-circle.svg" alt="Error" />
              {displayError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <ButtonSpinner />
                Logging in...
              </>
            ) : (
              <>
                <img src="/icon/log-in.svg" alt="Login" />
                Login
              </>
            )}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>or</span>
        </div>

        <button 
          className="btn-secondary" 
          onClick={() => setMode('key')}
          type="button"
        >
          <img src="/icon/key.svg" alt="Key" />
          Login with Admin Key
        </button>

        <div className="admin-login-footer">
          <img src="/icon/info.svg" alt="Info" />
          <p>Contact administrator if you need help</p>
        </div>
      </div>
    </div>
  );
}
