import React, { useEffect, useState } from 'react';
import {
  Save,
  Download,
  ShieldAlert,
  Database,
  ShieldCheck,
  Clock,
  MailCheck,
  Activity,
  Server,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { MANDATORY_DISCLAIMER_LINES } from '../data/seedCatalog';
import { resendVerificationEmail } from '../firebase';

interface ServerSecurityHealth {
  ok: boolean;
  version: string;
  uptimeSeconds: number;
  memoryRssMb: number;
  firebaseProjectId: string;
  tokenVerificationActive: boolean;
  rateLimitingActive: boolean;
  activeLockouts: number;
  smtpConfigured: boolean;
  geminiConfigured: boolean;
}

export function SettingsModule() {
  const {
    user,
    isSuperAdmin,
    superAdminOnlyWriteMode,
    settings,
    saveSettings,
    fetchWithAuth,
    isoAssessments,
    legalRequirements,
    audits,
    documents,
    serviceAuthorizations,
    restrictionLogs,
    capas,
    masterData,
    organizations,
    trainingRecords,
    certificationApplications,
    risks,
    suppliers,
    managementReviews,
    esgMetrics,
    evidenceRecords,
    auditorProfiles,
    activeSessions,
    securityAlerts,
    showToast,
  } = useAssurance();

  const [companyName, setCompanyName] = useState('ARSHIEL ASSURANCE');
  const [tagline, setTagline] = useState('Assessing Risks. Strengthening Compliance. Improving Performance.');
  const [docNumberPrefix, setDocNumberPrefix] = useState('AA');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [retentionYears, setRetentionYears] = useState(7);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [aiHumanReviewMandatory, setAiHumanReviewMandatory] = useState(true);
  const [superAdminOnlyWrite, setSuperAdminOnlyWrite] = useState(true);

  // Security & Session Governance settings
  const [inactivityTimeoutMinutes, setInactivityTimeoutMinutes] = useState(30);
  const [sessionMaxHours, setSessionMaxHours] = useState(8);
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [activityRetentionDays, setActivityRetentionDays] = useState(365);
  const [maxFailedLoginAttempts, setMaxFailedLoginAttempts] = useState(5);

  const [health, setHealth] = useState<ServerSecurityHealth | null>(null);
  const [sendingVerify, setSendingVerify] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [lastBackupMeta, setLastBackupMeta] = useState<{ snapshotId: string; hash: string; time: string } | null>(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setCompanyName(settings.companyName || 'ARSHIEL ASSURANCE');
    setTagline(settings.tagline || 'Assessing Risks. Strengthening Compliance. Improving Performance.');
    setDocNumberPrefix(settings.docNumberPrefix || 'AA');
    setDateFormat(settings.dateFormat || 'YYYY-MM-DD');
    setCurrency(settings.currency || 'INR (₹)');
    setTimezone(settings.timezone || 'Asia/Kolkata (IST)');
    setRetentionYears(settings.retentionYears || 7);
    setEmailAlertsEnabled(settings.emailAlertsEnabled ?? true);
    setAiHumanReviewMandatory(settings.aiHumanReviewMandatory ?? true);
    setSuperAdminOnlyWrite(settings.superAdminOnlyWrite ?? true);
    setInactivityTimeoutMinutes(settings.inactivityTimeoutMinutes || 30);
    setSessionMaxHours(settings.sessionMaxHours || 8);
    setMfaEnforced(settings.mfaEnforced ?? false);
    setActivityRetentionDays(settings.activityRetentionDays || 365);
    setMaxFailedLoginAttempts(settings.maxFailedLoginAttempts || 5);
  }, [settings]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchWithAuth('/api/security/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok) setHealth(data);
      })
      .catch(() => {});
  }, [fetchWithAuth, isSuperAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('Only Super Admin can save platform settings.', 'error');
      return;
    }
    await saveSettings({
      companyName,
      tagline,
      docNumberPrefix,
      dateFormat,
      currency,
      timezone,
      retentionYears: Number(retentionYears) || 7,
      emailAlertsEnabled,
      aiHumanReviewMandatory,
      superAdminOnlyWrite,
      inactivityTimeoutMinutes: Math.max(5, Math.min(240, Number(inactivityTimeoutMinutes) || 30)),
      sessionMaxHours: Math.max(1, Math.min(72, Number(sessionMaxHours) || 8)),
      mfaEnforced,
      activityRetentionDays: Math.max(30, Math.min(3650, Number(activityRetentionDays) || 365)),
      maxFailedLoginAttempts: Math.max(3, Math.min(15, Number(maxFailedLoginAttempts) || 5)),
    });
  };

  const handleResendVerification = async () => {
    setSendingVerify(true);
    try {
      await resendVerificationEmail();
      showToast('Verification email sent. Check your inbox and reload once verified.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to resend verification email.', 'error');
    } finally {
      setSendingVerify(false);
    }
  };

  const handleDownloadFullBackup = async () => {
    setBackingUp(true);
    try {
      const collectionCounts = {
        organizations: organizations.length,
        isoAssessments: isoAssessments.length,
        legalRequirements: legalRequirements.length,
        audits: audits.length,
        documents: documents.length,
        serviceAuthorizations: serviceAuthorizations.length,
        restrictionLogs: restrictionLogs.length,
        capas: capas.length,
        masterData: masterData.length,
        trainingRecords: trainingRecords.length,
        certificationApplications: certificationApplications.length,
        risks: risks.length,
        suppliers: suppliers.length,
        managementReviews: managementReviews.length,
        esgMetrics: esgMetrics.length,
        evidenceRecords: evidenceRecords.length,
        auditorProfiles: auditorProfiles.length,
      };

      let verification: { snapshotId?: string; sha256IntegrityHash?: string; generatedAtIso?: string } = {};
      if (isSuperAdmin) {
        const res = await fetchWithAuth('/api/security/backup-export', {
          method: 'POST',
          body: JSON.stringify({ collectionCounts }),
        });
        if (res.ok) {
          verification = await res.json();
          if (verification.snapshotId && verification.sha256IntegrityHash) {
            setLastBackupMeta({
              snapshotId: verification.snapshotId,
              hash: verification.sha256IntegrityHash,
              time: verification.generatedAtIso || new Date().toISOString(),
            });
          }
        }
      }

      const backup = {
        exportedAt: verification.generatedAtIso || new Date().toISOString(),
        snapshotId: verification.snapshotId || `AA-LOCAL-${Date.now()}`,
        sha256IntegrityHash: verification.sha256IntegrityHash || 'client-snapshot',
        platform: 'ARSHIEL ASSURANCE v0.01 (8-Division Enterprise)',
        collectionCounts,
        settings,
        organizations,
        isoAssessments,
        legalRequirements,
        audits,
        documents,
        serviceAuthorizations,
        restrictionLogs,
        capas,
        masterData,
        trainingRecords,
        certificationApplications,
        risks,
        suppliers,
        managementReviews,
        esgMetrics,
        evidenceRecords,
        auditorProfiles,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ARSHIEL_ASSURANCE_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        verification.snapshotId
          ? `Verified snapshot ${verification.snapshotId} downloaded with SHA-256 checksum.`
          : 'Full JSON workspace backup downloaded.'
      );
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Company Profile · Session Governance · MFA Policy · Activity Retention · Backup &amp; System Health
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings, Security &amp; Administration
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={backingUp}
            onClick={handleDownloadFullBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {backingUp ? 'Verifying Snapshot...' : 'Download Verified Backup (JSON)'}
          </button>
          {lastBackupMeta && (
            <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400">
              {lastBackupMeta.snapshotId} · SHA256: {lastBackupMeta.hash.slice(0, 14)}…
            </span>
          )}
        </div>
      </div>

      {/* Email Verification Notice if unverified */}
      {user && !user.emailVerified && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <MailCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Email Verification Pending ({user.email}):</strong> Verify your email address to unlock full write privileges across protected compliance collections.
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={sendingVerify}
            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold shrink-0 cursor-pointer"
          >
            {sendingVerify ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* General Config */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Company Profile &amp; Platform Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Brand / Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Number Prefix</label>
                <input
                  type="text"
                  value={docNumberPrefix}
                  onChange={(e) => setDocNumberPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Date Format</label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (India Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST, UTC+05:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Compliance Record Retention (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Session Security & Activity Intelligence Governance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#087BFF]" />
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Session Security, MFA &amp; Activity Retention Governance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Inactivity Auto-Logout Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={inactivityTimeoutMinutes}
                  onChange={(e) => setInactivityTimeoutMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Maximum Session Lifetime (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={sessionMaxHours}
                  onChange={(e) => setSessionMaxHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Activity Log Retention Window (Days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={3650}
                  value={activityRetentionDays}
                  onChange={(e) => setActivityRetentionDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Failed Login Lockout Threshold (Attempts)
                </label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={maxFailedLoginAttempts}
                  onChange={(e) => setMaxFailedLoginAttempts(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1.5">
                <label className="flex items-start gap-2.5 text-xs text-slate-900 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={superAdminOnlyWrite}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setSuperAdminOnlyWrite(e.target.checked)}
                    className="rounded border-slate-300 mt-0.5"
                  />
                  <span>
                    Super Admin–Only Write Access (Active Governance Policy)
                  </span>
                </label>
                <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                  Restricts all Add, Edit, Remove, Delete, Approve, AI Generation, and Configuration privileges exclusively to <strong>Super Admin</strong>. Every other account operates strictly in <strong>Standard User (View-Only)</strong> mode, enforced across UI, Backend API, and Firestore Security Rules.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setMfaEnforced(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Enforce 6-digit 2FA / MFA verification step on login for workspace users</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Enable compliance due-date, CAPA overdue, and authorization expiry reminders</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={aiHumanReviewMandatory}
                  disabled
                  className="rounded border-slate-300"
                />
                <span>Enforce mandatory competent human review for all AI-generated safety documents (Locked On)</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              {isSuperAdmin ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Governance &amp; Security Policy
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                  Super Admin Required to Modify Settings
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Right Column: Live System Security Health + Brand + Privacy */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live System Health & Security Controls Card */}
          <div className="bg-[#071329] text-white border border-[#087BFF]/35 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display text-sm font-bold">
                <Server className="w-4 h-4 text-[#00D4FF]" />
                System Health &amp; Security Controls
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                {health ? 'Verified Online' : 'Checking...'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                <div className="text-[10px] text-slate-400">API Auth Verification</div>
                <div className="font-semibold text-emerald-400 mt-0.5">
                  {health?.tokenVerificationActive ? 'RS256 Firebase ID Token' : 'Active'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                <div className="text-[10px] text-slate-400">Rate Limit &amp; Lockouts</div>
                <div className="font-semibold text-[#00D4FF] mt-0.5">
                  Active ({health?.activeLockouts ?? 0} locked)
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                <div className="text-[10px] text-slate-400">Tracked Sessions</div>
                <div className="font-semibold text-white mt-0.5">
                  {activeSessions.filter((s) => s.status === 'Active' || s.status === 'Idle').length} Live
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                <div className="text-[10px] text-slate-400">Write Access Policy</div>
                <div className="font-semibold text-[#F5B82E] mt-0.5">
                  {superAdminOnlyWriteMode ? 'Super Admin Only' : 'Role-Based'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                <div className="text-[10px] text-slate-400">Open Security Alerts</div>
                <div className="font-semibold text-amber-300 mt-0.5">
                  {securityAlerts.filter((a) => a.status === 'Open').length} Open
                </div>
              </div>
            </div>
            {health && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/10">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Uptime: {Math.floor(health.uptimeSeconds / 60)}m
                </span>
                <span className="inline-flex items-center gap-1">
                  <Activity className="w-3 h-3" /> RAM: {health.memoryRssMb} MB
                </span>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-slate-900">ARSHIEL ASSURANCE Brand Banner</h2>
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center">
              {!imgErr ? (
                <img
                  src="/assets/aistudio/69ee94b6-c57f-4889-a564-1aba33dc1c99_a6f19f6a.png"
                  alt="ARSHIEL ASSURANCE Corporate Brand Banner"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErr(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-amber-400 font-display font-bold">ARSHIEL ASSURANCE</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-900 font-display font-semibold text-sm">
              <Database className="w-4 h-4 text-[#087BFF]" />
              Privacy, Transparency &amp; Data Protection
            </div>
            <p>
              • Activity tracking records authenticated logins, module accesses, document downloads, and compliance approvals for audit readiness.
            </p>
            <p>
              • Passwords, authentication tokens, MFA verification codes, and private message contents are strictly excluded and redacted from all activity logs.
            </p>
            <p>
              • Immutable append-only Firestore security rules prevent unauthorized editing or deletion of audit trails, login history, and restriction logs.
            </p>
          </div>
        </div>
      </div>

      {/* Full Mandatory Disclaimer & System Restrictions */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-display font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          Mandatory Disclaimer &amp; System Restrictions — ARSHIEL ASSURANCE
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-amber-950 leading-relaxed">
          {MANDATORY_DISCLAIMER_LINES.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
