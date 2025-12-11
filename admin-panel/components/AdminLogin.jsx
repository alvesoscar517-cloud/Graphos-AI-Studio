import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useLoginForm } from '@/hooks/forms/useLoginForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

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

  // Vanta FOG background effect (same as main app - lighter than clouds)
  useEffect(() => {
    if (!vantaRef.current) return;

    const loadVanta = async () => {
      try {
        // Load Three.js dynamically if not loaded
        if (!window.THREE) {
          const threeScript = document.createElement('script');
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
          threeScript.async = true;
          document.head.appendChild(threeScript);
          await new Promise(resolve => { threeScript.onload = resolve; });
        }

        // Load Vanta FOG dynamically
        if (!window.VANTA) {
          const vantaScript = document.createElement('script');
          vantaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.fog.min.js';
          vantaScript.async = true;
          document.head.appendChild(vantaScript);
          await new Promise(resolve => { vantaScript.onload = resolve; });
        }

        // Initialize Vanta FOG effect with Apple System Blue colors (same as main app)
        if (window.VANTA && vantaRef.current && !vantaEffect.current) {
          vantaEffect.current = window.VANTA.FOG({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            highlightColor: 0x5AC8FA,  // Apple System Teal
            midtoneColor: 0x007AFF,    // Apple System Blue
            lowlightColor: 0x5856D6,   // Apple System Indigo
            baseColor: 0x0051D5,       // Apple Blue Hover (darker)
            blurFactor: 0.6,
            speed: 1.2,
            zoom: 1.0
          });
        }
      } catch (error) {
        console.error('Vanta.js load error:', error);
      }
    };

    loadVanta();

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
      "w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] md:w-[72px] md:h-[72px] mx-auto mb-4 sm:mb-5 md:mb-7 rounded-[14px] sm:rounded-[18px] md:rounded-[22px] flex items-center justify-center shadow-lg",
      isSetup ? "bg-secondary" : "bg-primary"
    )}>
      <img src={icon} alt="" className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 icon-white" />
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }) => message ? (
    <div className="flex items-center gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-xl bg-destructive/10 text-destructive text-[12px] sm:text-[14px]">
      <img src="/icon/alert-circle.svg" alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      {message}
    </div>
  ) : null;

  // Setup mode
  if (mode === 'setup' || needsSetup) {
    return (
      <div 
        ref={vantaRef} 
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden overflow-y-auto"
        style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)' }}
      >
        
        <Card className="w-full max-w-[400px] sm:max-w-[420px] md:max-w-[440px] p-5 sm:p-6 md:p-10 my-auto relative z-10 shadow-2xl backdrop-blur-xl bg-surface/95 border-border/30">
          <div className="text-center mb-5 sm:mb-6 md:mb-10">
            <LoginIcon icon="/icon/settings.svg" isSetup />
            <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold text-primary tracking-[-0.022em] mb-1.5 sm:mb-2">Initial Setup</h1>
            <p className="text-muted text-[12px] sm:text-[14px] md:text-[15px]">Create your admin account to get started</p>
          </div>

          <form onSubmit={handleSetup} className="flex flex-col gap-4 sm:gap-5 md:gap-6">
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

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1 sm:mt-2 text-[13px] sm:text-[14px]">
              {loading ? 'Creating Account...' : (
                <>
                  <img src="/icon/check.svg" alt="" className="w-4 h-4 sm:w-4.5 sm:h-4.5 icon-white" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>

          {!needsSetup && (
            <div className="mt-6 sm:mt-8 text-center">
              <button 
                className="text-muted text-[12px] sm:text-[14px] hover:text-primary transition-all duration-200"
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
    <div 
      ref={vantaRef} 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)' }}
    >
      
      <Card className="w-full max-w-[400px] sm:max-w-[420px] md:max-w-[440px] p-5 sm:p-6 md:p-10 my-auto relative z-10 shadow-2xl backdrop-blur-xl bg-surface/95 border-border/30">
        <div className="text-center mb-5 sm:mb-6 md:mb-10">
          <LoginIcon icon="/icon/shield-check.svg" />
          <h1 className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold text-primary tracking-[-0.022em] mb-1.5 sm:mb-2">Admin Panel</h1>
          <p className="text-muted text-[12px] sm:text-[14px] md:text-[15px]">Login to manage the system</p>
        </div>

        <form onSubmit={loginForm.handleSubmit} className="flex flex-col gap-4 sm:gap-5">
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

          <Button type="submit" size="lg" loading={loginForm.isLoading} className="w-full mt-1 sm:mt-2 text-[13px] sm:text-[14px]">
            {loginForm.isLoading ? 'Logging in...' : (
              <>
                <img src="/icon/log-in.svg" alt="" className="w-4 h-4 sm:w-4.5 sm:h-4.5 icon-white" />
                Login
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1.5 sm:gap-2 text-muted text-[11px] sm:text-[13px]">
          <img src="/icon/info.svg" alt="" className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-50" />
          <p>Contact administrator if you need help</p>
        </div>
      </Card>
    </div>
  );
}
