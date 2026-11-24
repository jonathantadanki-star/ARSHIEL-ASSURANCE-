import React, { useMemo, useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';
import {
  getAuthIdToken,
  registerWithEmail,
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
} from '../firebase';
import { BrandMark, BRAND_HERO_ARTWORK_URL } from './BrandMark';
import { APP_EDITION_TAG, APP_VERSION_LABEL } from '../config/appVersion';
import { ALL_USER_ROLES, type UserRole } from '../types/assurance';
import { evaluatePasswordStrength, ROLE_PORTAL_DESCRIPTORS } from '../security/rbac';
import { useAssurance } from '../context/AssuranceContext';

interface AuthModalProps {
  open: boolean;
  mode: 'login' | 'register';
  targetLabel?: string | null;
  onModeChange: (mode: 'login' | 'register') => void;
  onClose: () => void;
  onAuthenticated: () => void;
}

type ModalView = 'login' | 'register' | 'reset' | 'mfa';

export function AuthModal({
  open,
  mode,
  targetLabel,
  onModeChange,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const { settings, logLoginEvent, logSecurityAlert, showToast } = useAssurance();

  const [view, setView] = useState<ModalView>(mode);
  const [selectedPortalRole, setSelectedPortalRole] = useState<UserRole>('Lead Auditor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FaStep, setEnable2FaStep] = useState(false);

  // MFA challenge state
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [mfaFallbackCode, setMfaFallbackCode] = useState<string | null>(null);
  const [mfaNotice, setMfaNotice] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setView(mode);
    setError(null);
    setInfoMessage(null);
  }, [mode, open]);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const portalDescriptor = ROLE_PORTAL_DESCRIPTORS[selectedPortalRole];
  const mfaRequired = Boolean(settings?.mfaEnforced) || enable2FaStep;

  if (!open) return null;

  const initiateMfaStep = async (): Promise<boolean> => {
    const token = await getAuthIdToken(true);
    if (!token) return false;
    const resp = await fetch('/api/security/mfa/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(data.error || 'Failed to initiate 2FA verification.');
    }
    setMfaFallbackCode(data.sessionVerificationCode || null);
    setMfaNotice(data.notice || 'Enter the 6-digit verification code.');
    setMfaCodeInput('');
    setView('mfa');
    return true;
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      if (mfaRequired) {
        await initiateMfaStep();
      } else {
        onAuthenticated();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed.';
      if (!msg.includes('popup-closed-by-user')) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid corporate or personal email address.');
      return;
    }

    if (view === 'reset') {
      setLoading(true);
      try {
        await requestPasswordReset(email);
        setInfoMessage('Password reset instructions have been sent to your email address.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Password reset request failed.';
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (view === 'register') {
      if (fullName.trim().length < 2) {
        setError('Please enter your full name.');
        return;
      }
      if (!strength.isValid) {
        setError(
          'Password must be at least 10 characters and include uppercase, lowercase, a number, and a special symbol.'
        );
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Server-side brute-force lockout check
      const checkResp = await fetch('/api/security/login-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), outcome: 'check' }),
      });
      if (checkResp.status === 429) {
        const lockData = await checkResp.json().catch(() => ({}));
        setError(lockData.error || 'Account temporarily locked due to repeated failed attempts.');
        setLoading(false);
        return;
      }

      if (view === 'register') {
        await registerWithEmail(email, password, fullName);
        await fetch('/api/security/login-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), outcome: 'success' }),
        });
        showToast('Account created. A verification email has been dispatched to your inbox.');
        if (mfaRequired) {
          await initiateMfaStep();
        } else {
          onAuthenticated();
        }
      } else {
        await signInWithEmail(email, password);
        await fetch('/api/security/login-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), outcome: 'success' }),
        });
        if (mfaRequired) {
          await initiateMfaStep();
        } else {
          onAuthenticated();
        }
      }
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : 'Authentication failed.';

      // Record failure against server rate limiter / lockout protection
      const failResp = await fetch('/api/security/login-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), outcome: 'failure' }),
      }).catch(() => null);

      const failJson = failResp ? await failResp.json().catch(() => ({})) : {};

      if (rawMsg.includes('auth/operation-not-allowed')) {
        setError(
          'Email/Password sign-in is not yet enabled in this Firebase project console. Use "Continue with Google" below for immediate access, or enable Email/Password under Firebase Console → Authentication → Sign-in method.'
        );
      } else if (failResp?.status === 429) {
        setError(failJson.error || 'Too many failed login attempts. Account temporarily locked.');
      } else if (rawMsg.includes('auth/invalid-credential') || rawMsg.includes('auth/wrong-password')) {
        const rem = typeof failJson.remainingAttempts === 'number' ? ` (${failJson.remainingAttempts} attempt(s) remaining before temporary lockout)` : '';
        setError(`Invalid email or password.${rem}`);
      } else {
        setError(rawMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await getAuthIdToken(true);
      const resp = await fetch('/api/security/mfa/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: mfaCodeInput.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.verified) {
        await logLoginEvent({
          eventType: 'MFA Failed',
          authMethod: 'MFA Code',
          result: 'Failed',
          reason: data.error || 'Invalid 2FA verification code entered',
        });
        await logSecurityAlert({
          category: 'Suspicious Login Activity',
          severity: 'Medium',
          title: 'Failed 2FA / MFA Verification Attempt',
          description: `User submitted an invalid 6-digit MFA code during login verification.`,
          module: 'Authentication',
        });
        setError(data.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      await logLoginEvent({
        eventType: 'MFA Verified',
        authMethod: 'MFA Code',
        result: 'Success',
        reason: '6-digit 2FA verification completed',
      });
      showToast('2FA verification succeeded. Entering secure workspace.');
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030917]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#07142B] border border-[#087BFF]/35 shadow-2xl overflow-hidden text-white my-auto">
        {/* Official ARSHIEL ASSURANCE Welcome Artwork Header */}
        <div className="relative h-32 sm:h-36 overflow-hidden border-b border-white/10">
          <img
            src={BRAND_HERO_ARTWORK_URL}
            alt="ARSHIEL ASSURANCE — Enterprise Security & Role-Based Login"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07142B] via-[#07142B]/55 to-[#07142B]/25" />
          <div className="absolute top-3 left-4 flex items-center gap-2.5">
            <BrandMark size={38} />
            <div>
              <div className="font-display text-sm font-bold tracking-tight text-white drop-shadow">
                ARSHIEL <span className="text-[#00D4FF]">ASSURANCE</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#F5B82E]">
                Enterprise RBAC Security · {APP_EDITION_TAG}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login modal"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#07142B]/80 text-slate-200 hover:text-white hover:bg-[#07142B] border border-white/15 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between gap-2 text-[11px] text-slate-200">
            <span className="truncate font-medium">
              {targetLabel ? `Sign in to open ${targetLabel}` : 'Unified Enterprise Authentication · 14 Role Portals'}
            </span>
            <span className="hidden sm:inline text-[#00D4FF] font-semibold whitespace-nowrap">
              Zero-Bypass RBAC
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        {view !== 'mfa' && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-3 bg-[#0B1E3D] p-1 rounded-xl border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  onModeChange('login');
                  setView('login');
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  view === 'login' ? 'bg-[#087BFF] text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  onModeChange('register');
                  setView('register');
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  view === 'register' ? 'bg-[#087BFF] text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('reset');
                  setError(null);
                  setInfoMessage(null);
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  view === 'reset' ? 'bg-[#087BFF] text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Reset Password
              </button>
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Unified Auth Controls */}
          <div className="md:col-span-7 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/75 border border-red-500/40 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{infoMessage}</span>
              </div>
            )}

            {view === 'mfa' ? (
              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#0B1F3A] border border-[#00D4FF]/35 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
                    <Fingerprint className="w-4 h-4" />
                    Step 2 — Multi-Factor Verification (2FA)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{mfaNotice}</p>
                  {mfaFallbackCode && (
                    <div className="p-2.5 rounded-lg bg-[#071329] border border-[#F5B82E]/40 flex items-center justify-between">
                      <span className="text-[11px] text-slate-300">Session Verification Code:</span>
                      <span className="font-mono text-base font-bold tracking-widest text-[#F5B82E]">
                        {mfaFallbackCode}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enter 6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaCodeInput}
                    onChange={(e) => setMfaCodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1E3D] border border-white/15 text-center font-mono text-lg tracking-[0.35em] text-white focus:border-[#00D4FF] outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || mfaCodeInput.length !== 6}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter Workspace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => initiateMfaStep()}
                    disabled={loading}
                    className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 cursor-pointer"
                  >
                    Resend
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                  {view === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Priya Nair, Lead Auditor"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B1E3D] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:border-[#00D4FF] outline-none"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@organization.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B1E3D] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:border-[#00D4FF] outline-none"
                        required
                      />
                    </div>
                  </div>

                  {view !== 'reset' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={view === 'register' ? 'Min 10 chars, upper, lower, number, symbol' : 'Enter your password'}
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#0B1E3D] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:border-[#00D4FF] outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {view === 'register' && password.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Password Policy Strength:</span>
                            <span
                              className={
                                strength.score >= 5
                                  ? 'text-emerald-400 font-semibold'
                                  : strength.score >= 3
                                  ? 'text-amber-300 font-semibold'
                                  : 'text-red-400 font-semibold'
                              }
                            >
                              {strength.label} ({strength.score}/5)
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5].map((bar) => (
                              <div
                                key={bar}
                                className={`h-1 rounded-full ${
                                  bar <= strength.score
                                    ? strength.score >= 5
                                      ? 'bg-emerald-400'
                                      : strength.score >= 3
                                      ? 'bg-amber-400'
                                      : 'bg-red-400'
                                    : 'bg-white/10'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {view !== 'reset' && (
                    <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none pt-0.5">
                      <input
                        type="checkbox"
                        checked={mfaRequired}
                        disabled={Boolean(settings?.mfaEnforced)}
                        onChange={(e) => setEnable2FaStep(e.target.checked)}
                        className="rounded border-white/25 bg-[#0B1E3D]"
                      />
                      <span>
                        Require 6-digit 2FA verification step on sign-in
                        {settings?.mfaEnforced ? ' (Org Policy Enforced)' : ''}
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : view === 'reset' ? (
                      <KeyRound className="w-4 h-4" />
                    ) : view === 'register' ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    {view === 'reset'
                      ? 'Send Password Reset Email'
                      : view === 'register'
                      ? 'Create Verified Account'
                      : 'Sign In with Email & Password'}
                  </button>
                </form>

                <div className="relative flex items-center py-1">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-2.5 text-[10px] uppercase tracking-wider text-slate-400">
                    Or Enterprise SSO
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-[#07142B] text-xs font-semibold hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                  )}
                  Continue with Google Workspace / Gmail
                </button>
              </>
            )}
          </div>

          {/* Right Column: 14-Role Portal Orientation & Security Safeguards */}
          <div className="md:col-span-5 rounded-xl bg-[#0B1E3D]/90 border border-white/10 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00D4FF]">
                  14 Enterprise Role Portals
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#07142B] text-[#F5B82E] border border-[#F5B82E]/30">
                  {portalDescriptor.scopeBadge}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Preview Role Portal Scope (Informational Only)
                </label>
                <select
                  value={selectedPortalRole}
                  onChange={(e) => setSelectedPortalRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#071329] border border-white/15 text-xs text-white outline-none focus:border-[#00D4FF]"
                >
                  {ALL_USER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed">
                <div className="font-semibold text-white mb-1">{portalDescriptor.portalTitle}</div>
                <p className="text-slate-400 text-[11px]">{portalDescriptor.summary}</p>
                <ul className="mt-2 space-y-1">
                  {portalDescriptor.dashboardHighlights.slice(0, 4).map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-[10.5px] text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/10 space-y-1.5">
              <div className="flex items-start gap-1.5 text-[10.5px] text-amber-200/90 bg-amber-950/35 border border-amber-500/25 rounded-lg p-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Super Admin–Only Write Policy:</strong> New accounts are created as <strong>Standard User (View-Only)</strong>. Add, Edit, Remove, and Full Platform Access are reserved exclusively for <strong>Super Admin</strong> and enforced in database security rules.
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#00D4FF]" />
                  Activity Intelligence Logged
                </span>
                <span>{APP_VERSION_LABEL}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
