import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useLoginForm } from '@/hooks/forms/useLoginForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import * as THREE from 'three';

export default function AdminLogin() {
  const { 
    needsSetup, 
    loginAdmin, 
    setupAdmin, 
    error, 
    clearError 
  } = useAdminAuth();

  const [mode, setMode] = useState(needsSetup ? 'setup' : 'login');
  
  // Vanta background refs
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Vanta CLOUDS background effect
  useEffect(() => {
    if (!vantaRef.current) return;

    if (!vantaEffect.current) {
      vantaEffect.current = CLOUDS({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0x68b8d7,
        cloudColor: 0xadc1de,
        cloudShadowColor: 0x183550,
        sunColor: 0xff9919,
        sunGlareColor: 0xff6633,
        sunlightColor: 0xff9933,
        speed: 1.00
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);
  
  // Use react-hook-form for email login
  const loginForm = useLoginForm(async (data) => {
    const result = await loginAdmin(data.email, data.password);
    if (!result.success) {
      throw new Error(result.error?.message || 'Login failed');
    }
  });

  // State for setup mode
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    clearError();
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

  // Login icon component
  const LoginIcon = ({ icon, isSetup = false }) => (
    <div className={cn(
      "w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center",
      isSetup ? "bg-secondary" : "bg-primary"
    )}>
      <img src={icon} alt="" className="w-8 h-8 icon-white" />
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }) => message ? (
    <div className="flex items-center gap-2 p-3 rounded-md bg-primary text-primary-foreground text-sm">
      <img src="/icon/alert-circle.svg" alt="" className="w-4 h-4 icon-white" />
      {message}
    </div>
  ) : null;

  // Setup mode
  if (mode === 'setup' || needsSetup) {
    return (
      <div ref={vantaRef} className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
        
        <Card className="w-full max-w-[420px] p-12 relative z-10 shadow-xl">
          <div className="text-center mb-10">
            <LoginIcon icon="/icon/settings.svg" isSetup />
            <h1 className="text-3xl font-semibold text-primary tracking-tight mb-2">Initial Setup</h1>
            <p className="text-muted text-sm">Create your admin account to get started</p>
          </div>

          <form onSubmit={handleSetup} className="flex flex-col gap-6">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            <ErrorMessage message={displayError} />

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? 'Creating Account...' : (
                <>
                  <img src="/icon/check.svg" alt="" className="w-4.5 h-4.5 icon-white" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>

          {!needsSetup && (
            <div className="mt-8 text-center">
              <button 
                className="text-muted text-sm hover:text-primary transition-colors"
                onClick={() => setMode('login')}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Default: Email login mode
  const loginError = loginForm.rootError || error;
  
  return (
    <div ref={vantaRef} className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      
      <Card className="w-full max-w-[420px] p-12 relative z-10 shadow-xl">
        <div className="text-center mb-10">
          <LoginIcon icon="/icon/shield-check.svg" />
          <h1 className="text-3xl font-semibold text-primary tracking-tight mb-2">Admin Panel</h1>
          <p className="text-muted text-sm">Login to manage the system</p>
        </div>

        <form onSubmit={loginForm.handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            autoFocus
            error={loginForm.errors.email?.message}
            {...loginForm.register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={loginForm.errors.password?.message}
            {...loginForm.register('password')}
          />

          <ErrorMessage message={loginError} />

          <Button type="submit" size="lg" loading={loginForm.isLoading} className="w-full">
            {loginForm.isLoading ? 'Logging in...' : (
              <>
                <img src="/icon/log-in.svg" alt="" className="w-4.5 h-4.5 icon-white" />
                Login
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-muted text-xs">
          <img src="/icon/info.svg" alt="" className="w-3.5 h-3.5 opacity-50" />
          <p>Contact administrator if you need help</p>
        </div>
      </Card>
    </div>
  );
}
