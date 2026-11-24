import React, { useMemo, useState } from 'react';
import {
  Activity,
  Radio,
  LogIn,
  History,
  FileSearch,
  GitCompare,
  CheckCircle2,
  ShieldAlert,
  FileBarChart2,
  Download,
  FileSpreadsheet,
  FileText,
  XCircle,
  Lock,
  Search,
  Eye,
  AlertTriangle,
  Check,
  Filter,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { ALL_USER_ROLES, type ActivitySubmenuId } from '../types/assurance';
import { exportReportToPdf, exportRowsToCsv, exportRowsToExcel } from '../utils/exporters';

const SUBMENUS: Array<{
  id: ActivitySubmenuId;
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'live-users', code: 'A', label: 'Live Active Users', icon: Radio },
  { id: 'login-history', code: 'B', label: 'Login History', icon: LogIn },
  { id: 'activity-timeline', code: 'C', label: 'User Activity Timeline', icon: History },
  { id: 'document-access', code: 'D', label: 'Document Access History', icon: FileSearch },
  { id: 'data-modification', code: 'E', label: 'Data Modification History', icon: GitCompare },
  { id: 'approval-history', code: 'F', label: 'Approval History', icon: CheckCircle2 },
  { id: 'security-alerts', code: 'G', label: 'Security Alert Centre', icon: ShieldAlert },
  { id: 'activity-reports', code: 'H', label: 'Activity Reports', icon: FileBarChart2 },
];

function formatDateTime(iso?: string, fallbackTs?: unknown): string {
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  if (fallbackTs && typeof fallbackTs === 'object' && 'toDate' in fallbackTs) {
    const fn = (fallbackTs as { toDate?: () => Date }).toDate;
    if (typeof fn === 'function') return fn().toLocaleString();
  }
  return 'Just now';
}

export function ActivityIntelligenceModule({
  initialSubmenu = 'live-users',
}: {
  initialSubmenu?: ActivitySubmenuId;
}) {
  const {
    activeSessions,
    loginHistory,
    activityEvents,
    documentAccessLogs,
    securityAlerts,
    auditLogs,
    organizations,
    settings,
    isSuperAdmin,
    currentSessionId,
    can,
    terminateSession,
    resolveSecurityAlert,
    logActivityEvent,
    showToast,
  } = useAssurance();

  const [activeTab, setActiveTab] = useState<ActivitySubmenuId>(initialSubmenu);
  const [searchQuery, setSearchQuery] = useState('');

  // Activity Reports Filters (Section H)
  const [filterUser, setFilterUser] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterOrg, setFilterOrg] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterEventType, setFilterEventType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Security alert resolution notes
  const [alertNotes, setAlertNotes] = useState<Record<string, string>>({});

  const canExport = can('activity-intelligence', 'export');

  const sortedSessions = useMemo(
    () =>
      [...activeSessions].sort((a, b) =>
        (b.lastActivityAt || '').localeCompare(a.lastActivityAt || '')
      ),
    [activeSessions]
  );

  const sortedLogins = useMemo(
    () =>
      [...loginHistory].sort((a, b) =>
        (b.timestampIso || '').localeCompare(a.timestampIso || '')
      ),
    [loginHistory]
  );

  const sortedActivities = useMemo(
    () =>
      [...activityEvents].sort((a, b) =>
        (b.timestampIso || '').localeCompare(a.timestampIso || '')
      ),
    [activityEvents]
  );

  const sortedDocAccess = useMemo(
    () =>
      [...documentAccessLogs].sort((a, b) =>
        (b.timestampIso || '').localeCompare(a.timestampIso || '')
      ),
    [documentAccessLogs]
  );

  const sortedAlerts = useMemo(
    () =>
      [...securityAlerts].sort((a, b) =>
        (b.timestampIso || '').localeCompare(a.timestampIso || '')
      ),
    [securityAlerts]
  );

  const modificationHistory = useMemo(
    () =>
      sortedActivities.filter((e) =>
        ['Record Created', 'Record Updated', 'Record Deleted', 'Role Updated', 'Settings Configured'].includes(
          e.eventType
        )
      ),
    [sortedActivities]
  );

  const approvalHistory = useMemo(
    () =>
      sortedActivities.filter((e) =>
        ['Approval Submitted', 'Record Approved', 'Record Rejected'].includes(e.eventType)
      ),
    [sortedActivities]
  );

  const distinctModules = useMemo(
    () => Array.from(new Set(sortedActivities.map((a) => a.module).filter(Boolean))).sort(),
    [sortedActivities]
  );

  const distinctEventTypes = useMemo(
    () => Array.from(new Set(sortedActivities.map((a) => a.eventType).filter(Boolean))).sort(),
    [sortedActivities]
  );

  const filteredReportRows = useMemo(() => {
    return sortedActivities.filter((ev) => {
      if (filterUser.trim() && !(ev.userName || '').toLowerCase().includes(filterUser.toLowerCase())) {
        return false;
      }
      if (filterRole !== 'ALL' && ev.userRole !== filterRole) return false;
      if (filterOrg !== 'ALL' && ev.orgName !== filterOrg && ev.orgId !== filterOrg) return false;
      if (
        filterDepartment.trim() &&
        !(ev.department || '').toLowerCase().includes(filterDepartment.toLowerCase())
      ) {
        return false;
      }
      if (filterModule !== 'ALL' && ev.module !== filterModule) return false;
      if (filterEventType !== 'ALL' && ev.eventType !== filterEventType) return false;
      if (startDate && ev.timestampIso && ev.timestampIso.slice(0, 10) < startDate) return false;
      if (endDate && ev.timestampIso && ev.timestampIso.slice(0, 10) > endDate) return false;
      return true;
    });
  }, [
    sortedActivities,
    filterUser,
    filterRole,
    filterOrg,
    filterDepartment,
    filterModule,
    filterEventType,
    startDate,
    endDate,
  ]);

  const handleExportActivity = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (!canExport) {
      showToast('Your role does not have export permission for Activity Intelligence reports.', 'warning');
      return;
    }

    const rows = filteredReportRows.map((ev) => ({
      Timestamp: formatDateTime(ev.timestampIso, ev.createdAt),
      User: ev.userName || ev.userId,
      Role: ev.userRole,
      Organization: ev.orgName || ev.orgId,
      Department: ev.department || '-',
      Module: ev.module,
      EventType: ev.eventType,
      Reference: ev.entityRef || ev.recordId || '-',
      Summary: ev.summary,
      Result: ev.result,
      IPAddress: ev.ipAddress || '-',
    }));

    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'CSV') {
      exportRowsToCsv(rows, `ARSHIEL_Activity_Intelligence_${stamp}.csv`);
    } else if (format === 'EXCEL') {
      exportRowsToExcel('Activity_Intelligence', rows, `ARSHIEL_Activity_Intelligence_${stamp}.xlsx`);
    } else {
      exportReportToPdf({
        title: 'ARSHIEL ACTIVITY INTELLIGENCE — AUDIT & USER ACTIVITY REPORT',
        subtitle: 'Tamper-Resistant Enterprise Security & Compliance Activity Log',
        referenceNo: `AA-ACT-${stamp}`,
        status: 'Authorized Export',
        metadata: [
          ['Generated On', new Date().toLocaleString()],
          ['Total Filtered Events', String(rows.length)],
          ['Role Filter', filterRole],
          ['Module Filter', filterModule],
          ['Retention Policy', `${settings?.activityRetentionDays || 365} Days`],
        ],
        summaryText:
          'This report contains authorized user activity, login security, document access, modification, and approval records captured by ARSHIEL ACTIVITY INTELLIGENCE. Passwords, auth tokens, and private messages are never logged.',
        tableHeaders: ['Timestamp', 'User', 'Role', 'Module', 'Event', 'Result'],
        tableRows: rows.slice(0, 80).map((r) => [
          r.Timestamp,
          r.User,
          r.Role,
          r.Module,
          r.EventType,
          r.Result,
        ]),
        filename: `ARSHIEL_Activity_Intelligence_${stamp}.pdf`,
      });
    }

    logActivityEvent({
      eventType: 'Data Exported',
      module: 'Activity Intelligence',
      summary: `Exported ${rows.length} Activity Intelligence records as ${format}.`,
      result: 'Success',
    });
    showToast(`Exported ${rows.length} activity records to ${format}.`);
  };

  const liveActiveCount = sortedSessions.filter((s) => s.status === 'Active' || s.status === 'Idle').length;
  const openAlertsCount = sortedAlerts.filter((a) => a.status === 'Open' || a.status === 'Investigating').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#071329] text-white p-6 border border-[#087BFF]/35 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#00D4FF] mb-1">
              <Activity className="w-4 h-4" />
              ARSHIEL ACTIVITY INTELLIGENCE
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              User Activity, Session Governance &amp; Security Monitoring
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Real-time visibility across live authenticated sessions, login history, tamper-resistant activity timelines, controlled document access, field-level modifications, approvals, and automated security alerts.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Live Sessions</div>
              <div className="text-lg font-bold text-emerald-400">{liveActiveCount}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Login Events</div>
              <div className="text-lg font-bold text-[#00D4FF]">{sortedLogins.length}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Timeline Logs</div>
              <div className="text-lg font-bold text-white">{sortedActivities.length}</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Open Alerts</div>
              <div className={`text-lg font-bold ${openAlertsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {openAlertsCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Submenus Navigation Bar (A - H) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        {SUBMENUS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-[#071329] text-white border-[#087BFF] shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#087BFF]/50 hover:bg-slate-50'
              }`}
            >
              <div className="w-full flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    active ? 'bg-[#087BFF] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.code}
                </span>
                <Icon className={`w-4 h-4 ${active ? 'text-[#00D4FF]' : 'text-slate-400'}`} />
              </div>
              <span className="text-[11px] font-semibold leading-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Search for Submenus A-G */}
      {activeTab !== 'activity-reports' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, role, module, IP address, or reference..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#087BFF] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Append-Only Tamper-Resistant Logs · Retention: {settings?.activityRetentionDays || 365} Days</span>
          </div>
        </div>
      )}

      {/* SUBMENU A: LIVE ACTIVE USERS */}
      {activeTab === 'live-users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#071329]">A. Live Active Authenticated Sessions</h2>
              <p className="text-xs text-slate-500">
                Real-time sessions with heartbeat telemetry, IP/device fingerprinting, and instant administrator revocation.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              {liveActiveCount} Active / Idle
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">User &amp; Role</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Device / IP</th>
                  <th className="px-4 py-3">Login Time</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Session Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSessions
                  .filter((s) =>
                    !searchQuery.trim()
                      ? true
                      : `${s.userName} ${s.userRole} ${s.orgName} ${s.ipAddress}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                  )
                  .map((sess) => {
                    const isCurrent = sess.id === currentSessionId;
                    return (
                      <tr key={sess.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {sess.userName}{' '}
                            {isCurrent && (
                              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{sess.userRole}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{sess.orgName || sess.orgId}</td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800">{sess.browserInfo} · {sess.deviceInfo}</div>
                          <div className="text-[11px] font-mono text-slate-500">{sess.ipAddress}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(sess.loginTime)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(sess.lastActivityAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              sess.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sess.status === 'Idle'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {sess.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isSuperAdmin && (sess.status === 'Active' || sess.status === 'Idle') ? (
                            <button
                              type="button"
                              onClick={() => terminateSession(sess.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Terminate
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {sess.revokedBy ? `By ${sess.revokedBy}` : 'Closed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {sortedSessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No active sessions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU B: LOGIN HISTORY */}
      {activeTab === 'login-history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#071329]">B. Immutable Login, Logout &amp; MFA History</h2>
            <p className="text-xs text-slate-500">
              Tracks successful logins, failed attempts, logouts, password resets, MFA events, and session timeouts with device and IP metadata.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">User / Email</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Device / Browser / IP</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLogins
                  .filter((l) =>
                    !searchQuery.trim()
                      ? true
                      : `${l.userName} ${l.userEmail} ${l.eventType} ${l.ipAddress}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                  )
                  .map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatDateTime(entry.timestampIso, entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{entry.userName || 'User'}</div>
                        <div className="text-[11px] text-slate-500">
                          {entry.userEmail} · {entry.userRole}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {entry.eventType}
                        {entry.reason && (
                          <div className="text-[10.5px] text-slate-500 truncate max-w-xs">{entry.reason}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{entry.authMethod}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{entry.browserInfo} ({entry.deviceInfo})</div>
                        <div className="text-[10.5px] font-mono text-slate-500">{entry.ipAddress}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            entry.result === 'Success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.result === 'Blocked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {entry.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                {sortedLogins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No login events captured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU C: USER ACTIVITY TIMELINE */}
      {activeTab === 'activity-timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#071329]">C. User Activity Timeline</h2>
            <p className="text-xs text-slate-500">
              Chronological stream of app opens, module navigations, views, downloads, creates, updates, approvals, rejections, and exports.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedActivities
              .filter((e) =>
                !searchQuery.trim()
                  ? true
                  : `${e.userName} ${e.userRole} ${e.module} ${e.eventType} ${e.summary}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
              )
              .slice(0, 100)
              .map((ev) => (
                <div key={ev.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {ev.eventType}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{ev.module}</span>
                      {ev.entityRef && (
                        <span className="text-[11px] font-mono text-slate-500">[{ev.entityRef}]</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700">{ev.summary}</p>
                    <div className="text-[11px] text-slate-500">
                      {ev.userName} ({ev.userRole}) · {ev.orgName || ev.orgId} · IP: {ev.ipAddress || '-'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ev.result === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ev.result}
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(ev.timestampIso, ev.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            {sortedActivities.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Activity events will appear automatically as users navigate and manage compliance records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMENU D: DOCUMENT ACCESS HISTORY */}
      {activeTab === 'document-access' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#071329]">D. Controlled Document Access History</h2>
            <p className="text-xs text-slate-500">
              Full access trail for controlled documents, audit reports, PDF/DOCX downloads, exports, and formal approvals.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Document Name &amp; ID</th>
                  <th className="px-4 py-3">User &amp; Role</th>
                  <th className="px-4 py-3">Access Type</th>
                  <th className="px-4 py-3">Authorization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDocAccess
                  .filter((d) =>
                    !searchQuery.trim()
                      ? true
                      : `${d.documentName} ${d.docNumber || ''} ${d.userName} ${d.accessType}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                  )
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDateTime(log.timestampIso, log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{log.documentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {log.docNumber || log.documentId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{log.userName}</div>
                        <div className="text-[11px] text-slate-500">
                          {log.userRole} · {log.orgName || log.orgId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10.5px]">
                          <Eye className="w-3 h-3 text-[#087BFF]" />
                          {log.accessType}
                          {log.exportFormat ? ` (${log.exportFormat})` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            log.authorized ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.authorized ? 'Authorized' : 'Unauthorized Attempt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                {sortedDocAccess.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No document views or exports logged yet. Export a controlled document to test live logging.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU E: DATA MODIFICATION HISTORY */}
      {activeTab === 'data-modification' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#071329]">E. Data Modification History (Create / Update / Delete)</h2>
            <p className="text-xs text-slate-500">
              Audit-grade record mutations capturing previous state, updated values, responsible user, and timestamp.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User &amp; Role</th>
                  <th className="px-4 py-3">Module &amp; Change</th>
                  <th className="px-4 py-3">Previous Value</th>
                  <th className="px-4 py-3">Updated Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modificationHistory.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(m.timestampIso, m.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{m.userName}</div>
                      <div className="text-[11px] text-slate-500">{m.userRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{m.module}</div>
                      <div className="text-[11px] text-blue-700">{m.eventType} · {m.entityRef || m.recordId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10.5px] text-slate-500 max-w-xs break-words">
                      {m.previousValue || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10.5px] text-slate-800 max-w-xs break-words">
                      {m.newValue || m.summary}
                    </td>
                  </tr>
                ))}
                {modificationHistory.length === 0 && auditLogs.length > 0 && (
                  auditLogs.slice(0, 20).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(undefined, log.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{log.actorName || 'User'}</div>
                        <div className="text-[11px] text-slate-500">{log.actorRole}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{log.module} — {log.action}</td>
                      <td className="px-4 py-3 text-slate-500">{log.previousValue || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{log.newValue || log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU F: APPROVAL HISTORY */}
      {activeTab === 'approval-history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-[#071329]">F. Formal Approval &amp; Rejection History</h2>
            <p className="text-xs text-slate-500">
              Tracks audit sign-offs, controlled document approvals, assessment verifications, CAPA closures, and rejection reasons.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Module &amp; Record</th>
                  <th className="px-4 py-3">Approver / Reviewer</th>
                  <th className="px-4 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvalHistory.map((ap) => (
                  <tr key={ap.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(ap.timestampIso, ap.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ap.eventType === 'Record Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ap.eventType === 'Record Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ap.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{ap.module}</div>
                      <div className="text-[11px] font-mono text-slate-500">{ap.entityRef || ap.recordId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{ap.userName}</div>
                      <div className="text-[11px] text-slate-500">{ap.userRole}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{ap.remarks || ap.summary}</td>
                  </tr>
                ))}
                {approvalHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No approval or rejection events logged yet. Approve a controlled document, audit, or CAPA to record an immutable sign-off.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMENU G: SECURITY ALERT CENTRE */}
      {activeTab === 'security-alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#071329]">G. Security Alert Centre</h2>
              <p className="text-xs text-slate-500">
                Real-time monitoring of failed login bursts, unauthorized access attempts, account lockouts, policy violations, and role escalation attempts.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              {openAlertsCount} Open Incident(s)
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedAlerts.map((alert) => (
              <div key={alert.id} className="p-5 space-y-3 hover:bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          alert.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : alert.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {alert.severity}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{alert.category}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatDateTime(alert.timestampIso, alert.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <p className="text-xs text-slate-600">{alert.description}</p>
                    <div className="text-[11px] text-slate-500">
                      Actor: {alert.actorName || alert.actorEmail || 'Unknown'} ({alert.actorRole || 'N/A'}) · IP:{' '}
                      {alert.ipAddress || '-'} · Module: {alert.module || 'Security'}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${
                      alert.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : alert.status === 'Investigating'
                        ? 'bg-blue-100 text-blue-800'
                        : alert.status === 'Dismissed'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                {isSuperAdmin && (alert.status === 'Open' || alert.status === 'Investigating') && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={alertNotes[alert.id] || ''}
                      onChange={(e) => setAlertNotes((prev) => ({ ...prev, [alert.id]: e.target.value }))}
                      placeholder="Enter investigation findings or remediation notes..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none focus:border-[#087BFF]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          resolveSecurityAlert(
                            alert.id,
                            'Investigating',
                            alertNotes[alert.id] || 'Assigned for security review'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer"
                      >
                        Investigate
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          resolveSecurityAlert(
                            alert.id,
                            'Resolved',
                            alertNotes[alert.id] || 'Verified and remediated by administrator'
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    </div>
                  </div>
                )}

                {alert.resolutionNotes && (
                  <div className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700">
                    <strong>Resolution ({alert.resolvedBy || 'Admin'}):</strong> {alert.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
            {sortedAlerts.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No security alerts recorded. Brute-force lockouts, restricted service violations, and unauthorized access attempts are tracked here automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMENU H: ACTIVITY REPORTS & AUTHORIZED EXPORTS */}
      {activeTab === 'activity-reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#071329] inline-flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#087BFF]" />
                  H. Activity Reports &amp; Authorized Exports
                </h2>
                <p className="text-xs text-slate-500">
                  Filter across all 8 dimensions (User, Role, Organization, Department, Module, Activity Type, Date Range) and export to CSV, Excel, or PDF.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleExportActivity('CSV')}
                  disabled={!canExport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportActivity('EXCEL')}
                  disabled={!canExport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => handleExportActivity('PDF')}
                  disabled={!canExport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">1. User</label>
                <input
                  type="text"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  placeholder="Filter by user name"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">2. Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="ALL">All 14 Roles</option>
                  {ALL_USER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">3. Organization</label>
                <select
                  value={filterOrg}
                  onChange={(e) => setFilterOrg(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="ALL">All Organizations</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">4. Department</label>
                <input
                  type="text"
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  placeholder="e.g., Assurance, EHS"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">5. Module</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="ALL">All Modules</option>
                  {distinctModules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">6. Activity Type</label>
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="ALL">All Activity Types</option>
                  {distinctEventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">7. Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-500 mb-1">8. End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span>
                Showing <strong>{filteredReportRows.length}</strong> matching event(s) out of {sortedActivities.length} total.
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterUser('');
                  setFilterRole('ALL');
                  setFilterOrg('ALL');
                  setFilterDepartment('');
                  setFilterModule('ALL');
                  setFilterEventType('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[#087BFF] hover:underline font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User / Role</th>
                    <th className="px-4 py-3">Org / Dept</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Activity</th>
                    <th className="px-4 py-3">Summary</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportRows.slice(0, 100).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatDateTime(ev.timestampIso, ev.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{ev.userName}</div>
                        <div className="text-[11px] text-slate-500">{ev.userRole}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{ev.orgName || ev.orgId}</div>
                        <div className="text-[11px] text-slate-500">{ev.department || '-'}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{ev.module}</td>
                      <td className="px-4 py-3 text-blue-700 font-medium">{ev.eventType}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{ev.summary}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ev.result === 'Success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ev.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredReportRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No activity events match the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Privacy & Transparency Governance Footer */}
      <div className="rounded-xl bg-slate-900 text-slate-300 p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Privacy &amp; Activity Tracking Transparency Notice: </span>
            Authorized workspace sessions, module accesses, document downloads, and compliance approvals are recorded for ISO/SOC audit traceability. ARSHIEL ASSURANCE never logs passwords, authentication tokens, MFA codes, or private message contents.
          </div>
        </div>
        <span className="text-[11px] text-[#F5B82E] font-semibold whitespace-nowrap">
          Retention: {settings?.activityRetentionDays || 365} Days
        </span>
      </div>
    </div>
  );
}
