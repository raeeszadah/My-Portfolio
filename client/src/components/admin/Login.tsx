import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, LogIn, AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';

// Admin email whitelist check
const AUTHORIZED_EMAILS = (
  import.meta.env.VITE_AUTHORIZED_EMAILS ||
  'admin@tecoritham.com,owner@tecoritham.com,mearaees@gmail.com'
)
  .split(',')
  .map((e: string) => e.trim().toLowerCase());

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) {
      setError(errParam);
    }

    // Auto check if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        const userEmail = data.session.user.email.toLowerCase();
        if (AUTHORIZED_EMAILS.includes(userEmail)) {
          navigate('/admin/dashboard');
        }
      }
    });
  }, [searchParams, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    // 1. Strict Client-side Admin Whitelist Check
    if (!AUTHORIZED_EMAILS.includes(cleanEmail)) {
      setError('Access Denied: Only the authorized portfolio administrator can log in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 2. Supabase Auth Sign In
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (supaError || !supaData?.session || !supaData?.user) {
        // Fallback check backend API login handler
        const apiRes = await apiFetch('auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        const apiData = await apiRes.json();
        if (apiRes.ok && apiData.success) {
          if (apiData.token) {
            localStorage.setItem('admin_token', apiData.token);
          }
          navigate('/admin/dashboard');
          return;
        }

        setError(apiData.error || supaError?.message || 'Invalid administrator login credentials.');
        return;
      }

      // 3. Double-check authenticated user's email
      const authedEmail = (supaData.user.email || '').toLowerCase();
      if (!AUTHORIZED_EMAILS.includes(authedEmail)) {
        await supabase.auth.signOut();
        setError('Access Denied: Account is not authorized for administrator access.');
        return;
      }

      // 4. Establish backend HTTP-Only session cookie & save token
      const apiRes = await apiFetch('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const apiData = await apiRes.json();
      if (apiData.token) {
        localStorage.setItem('admin_token', apiData.token);
      }

      navigate('/admin/dashboard');

    } catch (err: any) {
      setError('Unable to complete administrator authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-6 relative bg-black text-white select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-brand-crimson-glow blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-surface-card border border-border-subtle p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-10 relative">
        <div className="text-center mb-8 flex flex-col items-center">
          <a href="/" className="mb-6 inline-block hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="TECORITHAM" className="h-12 w-auto object-contain" />
          </a>
          <div className="size-10 rounded-full bg-brand-crimson-subtle/20 border border-brand-crimson/30 flex items-center justify-center text-brand-crimson mb-3 shadow-[0_0_15px_rgba(255,0,27,0.2)]">
            <Lock className="size-4" />
          </div>
          <h1 className="font-display font-black text-lg text-white uppercase tracking-wider">
            ADMIN PORTAL
          </h1>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <ShieldAlert className="size-3 text-brand-crimson inline" />
            Restricted Private CMS Access
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-start gap-2 mb-6">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              ADMIN EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="w-full bg-black border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded px-4 py-3 text-sm focus:outline-none transition-colors duration-200"
              placeholder="admin@tecoritham.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pass" className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              ADMIN PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full bg-black border border-border-subtle hover:border-border-active focus:border-brand-crimson text-white placeholder-text-muted rounded px-4 py-3 text-sm focus:outline-none transition-colors duration-200 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-crimson text-white hover:bg-brand-crimson-dim py-5 rounded-full uppercase font-semibold text-xs tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(255,0,27,0.25)] cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <LogIn className="size-4" />
            {loading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE ADMIN ACCESS'}
          </Button>
        </form>
      </div>
    </div>
  );
}
