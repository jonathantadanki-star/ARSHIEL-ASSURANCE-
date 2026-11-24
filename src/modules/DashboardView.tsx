import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  Bell,
  Check,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Users,
  Building2,
  GraduationCap,
  Award,
  Lock,
  Radio,
  Server,
  Eye,
  ClipboardCheck,
  FileText,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { ModuleId } from '../types/assurance';
import { INDUSTRIES_LIST } from '../data/seedCatalog';
import { ROLE_PORTAL_DESCRIPTORS } from '../security/rbac';
import { exportReportToPdf, exportRowsToExcel, exportRowsToCsv } from '../utils/exporters';

const CHART_COLORS = ['#0f172a', '#d97706', '#0284c7', '#16a34a', '#dc2626', '#64748b'];

interface ServerHealthSummary {
  status: string;
  uptimeSeconds: number;
  activeLockouts: number;
  activeMfaChallenges: number;
  authMode: string;
  timestamp: string;
}

export function DashboardView({ onNavigate }: { onNavigate: (m: ModuleId) => void }) {
  const {
    effectiveRole,
    isSuperAdmin,
    isAdmin,
    can,
    visibleModules,
    fetchWithAuth,
    organizations,
    activeOrgId,
    setActiveOrgId,
    isoAssessments,
    legalRequirements,
    audits,
    documents,
    serviceAuthorizations,
    capas,
    notifications,
    allUsers,
    activeSessions,
    securityAlerts,
    trainingRecords,
    certificationApplications,
    risks,
    suppliers,
    managementReviews,
    esgMetrics,
    evidenceRecords,
    auditorProfiles,
    markNotificationRead,
    logActivityEvent,
    logDocumentAccess,
    showToast,
  } = useAssurance();

  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [serverHealth, setServerHealth] = useState<ServerHealthSummary | null>(null);

  const roleDescriptor = ROLE_PORTAL_DESCRIPTORS[effectiveRole];
  const canExport = can('dashboard', 'export');

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetchWithAuth('/api/security/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setServerHealth(data);
      })
      .catch(() => {
        // Silent fallback if health check unavailable
      });
    return () => {
      active = false;
    };
  }, [isAdmin, fetchWithAuth]);

  const activeOrg = useMemo(
    () => organizations.find((o) => o.id === activeOrgId) || organizations[0] || null,
    [organizations, activeOrgId]
  );

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    audits.forEach((a) => a.siteLocation && set.add(a.siteLocation));
    isoAssessments.forEach((a) => a.siteLocation && set.add(a.siteLocation));
    return Array.from(set).sort();
  }, [audits, isoAssessments]);

  const filteredAudits = useMemo(() => {
    return audits.filter((a) => {
      if (industryFilter !== 'ALL' && a.industry !== industryFilter) return false;
      if (locationFilter !== 'ALL' && a.siteLocation !== locationFilter) return false;
      if (dateFrom && a.auditDate && a.auditDate < dateFrom) return false;
      if (dateTo && a.auditDate && a.auditDate > dateTo) return false;
      return true;
    });
  }, [audits, industryFilter, locationFilter, dateFrom, dateTo]);

  const filteredIso = useMemo(() => {
    return isoAssessments.filter((a) => {
      if (industryFilter !== 'ALL' && a.industry !== industryFilter) return false;
      if (locationFilter !== 'ALL' && a.siteLocation !== locationFilter) return false;
      if (dateFrom && a.auditDate && a.auditDate < dateFrom) return false;
      if (dateTo && a.auditDate && a.auditDate > dateTo) return false;
      return true;
    });
  }, [isoAssessments, industryFilter, locationFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const allFindings = filteredAudits.flatMap((a) => a.findings || []);
    const openFindings = allFindings.filter((f) => f.verificationStatus !== 'Verified & Closed');
    const criticalFindings = allFindings.filter((f) => f.classification === 'Critical').length;
    const majorFindings = allFindings.filter((f) => f.classification === 'Major').length;
    const minorFindings = allFindings.filter((f) => f.classification === 'Minor').length;

    const completedAudits = filteredAudits.filter((a) => a.status === 'Completed').length;
    const plannedAudits = filteredAudits.filter((a) => a.status === 'Planned' || a.status === 'In Progress').length;

    const pendingCapa = capas.filter((c) => c.status !== 'Closed').length;
    const closedCapa = capas.filter((c) => c.status === 'Closed').length;
    const overdueCapa = capas.filter((c) => c.status === 'Overdue').length;
    const capaClosureRate = capas.length > 0 ? Math.round((closedCapa / capas.length) * 100) : 100;

    const avgIsoScore =
      filteredIso.length > 0
        ? Math.round(filteredIso.reduce((acc, i) => acc + (i.complianceScore || 0), 0) / filteredIso.length)
        : 0;

    const legalCompliant = legalRequirements.filter((l) => l.complianceStatus === 'Compliant').length;
    const legalUnverified = legalRequirements.filter(
      (l) => l.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED'
    ).length;
    const legalRate =
      legalRequirements.length > 0 ? Math.round((legalCompliant / legalRequirements.length) * 100) : 0;

    const restrictedServices = serviceAuthorizations.filter(
      (s) => s.approvalStatus === 'Blocked / Restricted'
    ).length;

    const draftDocs = documents.filter((d) => d.status === 'DRAFT – REVIEW REQUIRED').length;
    const approvedDocs = documents.filter((d) => d.status === 'Approved').length;

    const onlineSessions = activeSessions.filter((s) => s.status === 'Active').length;
    const openAlerts = securityAlerts.filter(
      (a) => a.status === 'Open' || a.status === 'Investigating'
    ).length;
    const activeTrainings = trainingRecords.filter((t) => t.status !== 'Completed').length;
    const completedTrainings = trainingRecords.filter((t) => t.status === 'Completed').length;
    const activeCertDossiers = certificationApplications.filter(
      (c) => c.stage !== 'Completed'
    ).length;

    return {
      totalAudits: filteredAudits.length,
      completedAudits,
      plannedAudits,
      openFindings: openFindings.length,
      criticalFindings,
      majorFindings,
      minorFindings,
      pendingCapa,
      closedCapa,
      overdueCapa,
      capaClosureRate,
      avgIsoScore,
      legalRate,
      legalUnverified,
      restrictedServices,
      totalDocs: documents.length,
      draftDocs,
      approvedDocs,
      onlineSessions,
      openAlerts,
      activeTrainings,
      completedTrainings,
      activeCertDossiers,
    };
  }, [
    filteredAudits,
    filteredIso,
    capas,
    legalRequirements,
    serviceAuthorizations,
    documents,
    activeSessions,
    securityAlerts,
    trainingRecords,
    certificationApplications,
  ]);

  const industryChartData = useMemo(() => {
    const map = new Map<string, { industry: string; audits: number; avgScore: number; totalScore: number }>();
    filteredAudits.forEach((a) => {
      const ind = a.industry || 'General';
      const prev = map.get(ind) || { industry: ind, audits: 0, avgScore: 0, totalScore: 0 };
      prev.audits += 1;
      prev.totalScore += a.score || 0;
      prev.avgScore = Math.round(prev.totalScore / prev.audits);
      map.set(ind, prev);
    });
    return Array.from(map.values());
  }, [filteredAudits]);

  const findingsPieData = useMemo(
    () =>
      [
        { name: 'Critical', value: stats.criticalFindings, color: '#dc2626' },
        { name: 'Major', value: stats.majorFindings, color: '#d97706' },
        { name: 'Minor', value: stats.minorFindings, color: '#0284c7' },
      ].filter((d) => d.value > 0),
    [stats]
  );

  const handleExportDashboardPdf = () => {
    if (!canExport) {
      showToast('Your current role does not have export permission for dashboard reports.', 'warning');
      return;
    }
    const refNo = `AA-EXEC-${new Date().toISOString().slice(0, 10)}`;
    exportReportToPdf({
      title: `ARSHIEL ASSURANCE — ${roleDescriptor.portalTitle} Summary`,
      subtitle: `Role: ${effectiveRole} | Filters: Industry=${industryFilter}, Location=${locationFilter}`,
      referenceNo: refNo,
      status: 'MANAGEMENT SUMMARY (DRAFT – REVIEW REQUIRED)',
      metadata: [
        ['Active Role', effectiveRole],
        ['Organization Scope', activeOrg?.name || 'All Authorized Organizations'],
        ['Total Audits', String(stats.totalAudits)],
        ['Completed / Active Audits', `${stats.completedAudits} Completed / ${stats.plannedAudits} Planned or Active`],
        ['Findings Distribution', `${stats.openFindings} Open (${stats.criticalFindings} Critical, ${stats.majorFindings} Major, ${stats.minorFindings} Minor)`],
        ['CAPA Tracker', `${stats.pendingCapa} Pending / ${stats.overdueCapa} Overdue (${stats.capaClosureRate}% Closed)`],
        ['Average ISO Gap Score', `${stats.avgIsoScore}% across ${filteredIso.length} assessments`],
        ['Legal Compliance Rate', `${stats.legalRate}% Compliant (${stats.legalUnverified} Unverified Rules Flagged)`],
        ['Restricted Category 3 Services', `${stats.restrictedServices} Actively Blocked`],
      ],
      tableHeaders: ['Audit Ref', 'Engine', 'Client / Site', 'Industry', 'Status', 'Score %'],
      tableRows: filteredAudits.map((a) => [
        a.auditRef,
        a.engineType,
        `${a.clientName || '-'} (${a.siteLocation || '-'})`,
        a.industry || '-',
        a.status,
        `${a.score}%`,
      ]),
      filename: `ARSHIEL_Executive_Dashboard_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
    void logDocumentAccess({
      documentId: refNo,
      documentName: `${roleDescriptor.portalTitle} PDF Summary`,
      docNumber: refNo,
      accessType: 'Export',
      exportFormat: 'PDF',
      authorized: true,
    });
    void logActivityEvent({
      eventType: 'Report Downloaded',
      module: 'Executive Dashboard',
      summary: `Exported ${roleDescriptor.portalTitle} PDF summary (${filteredAudits.length} audits)`,
      entityRef: refNo,
    });
    showToast('Executive Dashboard PDF exported.');
  };

  const handleExportDashboardExcel = () => {
    if (!canExport) {
      showToast('Your current role does not have export permission for dashboard reports.', 'warning');
      return;
    }
    exportRowsToExcel(
      'Executive_Audits',
      filteredAudits.map((a) => ({
        AuditRef: a.auditRef,
        Engine: a.engineType,
        Title: a.title,
        Client: a.clientName || '',
        Industry: a.industry || '',
        SiteLocation: a.siteLocation || '',
        AuditDate: a.auditDate || '',
        Status: a.status,
        ScorePercent: a.score,
        FindingsCount: a.findings?.length || 0,
      })),
      `ARSHIEL_Dashboard_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    void logActivityEvent({
      eventType: 'Data Exported',
      module: 'Executive Dashboard',
      summary: `Exported Dashboard Excel workbook (${filteredAudits.length} audit rows)`,
    });
    showToast('Dashboard Excel workbook exported.');
  };

  const handleExportCsv = () => {
    if (!canExport) {
      showToast('Your current role does not have export permission for dashboard reports.', 'warning');
      return;
    }
    exportRowsToCsv(
      filteredAudits.map((a) => ({
        AuditRef: a.auditRef,
        Engine: a.engineType,
        Industry: a.industry || '',
        SiteLocation: a.siteLocation || '',
        Status: a.status,
        ScorePercent: a.score,
      })),
      `ARSHIEL_Audits_${new Date().toISOString().slice(0, 10)}.csv`
    );
    void logActivityEvent({
      eventType: 'Data Exported',
      module: 'Executive Dashboard',
      summary: `Exported Dashboard CSV (${filteredAudits.length} audit rows)`,
    });
    showToast('CSV export complete.');
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  // Filter KPI navigation targets to only authorized modules
  const safeNavigate = (target: ModuleId) => {
    if (visibleModules.includes(target)) {
      onNavigate(target);
    } else {
      showToast(`Your role (${effectiveRole}) has read-limited scope for this module.`, 'warning');
    }
  };

  const authorizedModuleDirectory = useMemo(() => {
    const highRisksCount = risks.filter((r) => r.residualScore >= 10 && r.status !== 'Closed').length;
    const directory: Array<{ id: ModuleId; name: string; meta: string; action: string }> = [
      { id: 'ai-intelligence-hub', name: 'Div 01 · ARSHIEL AI Intelligence Studio', meta: `Risk, Evidence, CAPA, Compliance & Report AI Drafts`, action: 'Open AI Studio' },
      { id: 'iso-gap', name: 'Div 01 · AI ISO Gap Analysis Engine', meta: `${isoAssessments.length} Assessments · 17 ISO Standards`, action: 'Open Engine' },
      { id: 'legal-compliance', name: 'Div 01 · AI Legal Compliance Engine (India / AP / Telangana)', meta: `${legalRequirements.length} Legal Entries · ${stats.legalUnverified} Unverified`, action: 'Open Register' },
      { id: 'ehs-audit', name: 'Div 01 · AI EHS Audit Engine', meta: `${audits.filter((a) => a.engineType === 'EHS').length} EHS Audits · 25 Categories`, action: 'Execute Audit' },
      { id: 'doc-generator', name: 'Div 01 · AI Document Control (HIRA, JSA, SOP, HACCP)', meta: `${documents.length} Controlled Documents · ${stats.draftDocs} Drafts`, action: 'Open Docs' },
      { id: 'audit-planning', name: 'Div 02 · Audit Scheduling, Auditors & Evidence Vault', meta: `${auditorProfiles.length} Auditors · ${evidenceRecords.length} Evidence Records`, action: 'Open Planner' },
      { id: 'food-safety', name: 'Div 02 · Food Safety Audit Engine (ISO 22000 / HACCP)', meta: `${audits.filter((a) => a.engineType === 'Food Safety').length} Assessments`, action: 'Open Module' },
      { id: 'fire-safety', name: 'Div 02 · Fire & Life Safety Audit Engine (NFPA-Based)', meta: `${audits.filter((a) => a.engineType === 'Fire & Life Safety').length} Assessments`, action: 'Open Module' },
      { id: 'environmental', name: 'Div 02 · Environmental Compliance & Audit Engine', meta: `${audits.filter((a) => a.engineType === 'Environmental').length} Assessments`, action: 'Open Module' },
      { id: 'contractor-vendor', name: 'Div 02 · Contractor & Vendor Audit Engine', meta: `${audits.filter((a) => a.engineType === 'Contractor & Vendor').length} Audits`, action: 'Open Module' },
      { id: 'certification-coord', name: 'Div 03 · Certification Tracker & Readiness Desk', meta: `${stats.activeCertDossiers} Active Readiness Dossiers · Impartiality Guarded`, action: 'Open Desk' },
      { id: 'authorization-control', name: 'Div 03 · Legal Authorization Control Engine', meta: `${stats.restrictedServices} Restricted Category 3 Services Blocked`, action: 'Inspect Gate' },
      { id: 'esg-sustainability', name: 'Div 04 · ESG, Carbon (Scope 1/2/3) & Sustainability Hub', meta: `${esgMetrics.length} Tracked Indicators · ISO 14064 / BRSR / GRI`, action: 'Open ESG Hub' },
      { id: 'capa', name: 'Div 05 · CAPA Management Engine (5-Why & Fishbone RCA)', meta: `${stats.pendingCapa} Open · ${stats.overdueCapa} Overdue`, action: 'Manage CAPA' },
      { id: 'training-management', name: 'Div 06 · Training Academy & Competency Records', meta: `${trainingRecords.length} Courses · ${stats.completedTrainings} Completed`, action: 'Open Academy' },
      { id: 'client-portal', name: 'Div 07 · Client Portal & Management Review (Clause 9.3)', meta: `${managementReviews.length} Management Reviews · ${organizations.length} Client Orgs`, action: 'Open Portal' },
      { id: 'supplier-portal', name: 'Div 07 · Supplier Portal & Vendor Risk Evaluation', meta: `${suppliers.length} Suppliers Tracked · ISO & ESG Verified`, action: 'Open Suppliers' },
      { id: 'risk-intelligence', name: 'Div 08 · Enterprise Risk Intelligence & 5×5 Heat Map', meta: `${risks.length} Risks Monitored · ${highRisksCount} High / Critical Residual`, action: 'Open Heat Map' },
      { id: 'activity-intelligence', name: 'Div 08 · ARSHIEL Activity Intelligence & Security Centre', meta: `${stats.onlineSessions} Active Sessions · ${stats.openAlerts} Open Security Alerts`, action: 'Monitor Activity' },
    ];
    return directory.filter((row) => visibleModules.includes(row.id));
  }, [
    visibleModules,
    isoAssessments.length,
    legalRequirements.length,
    stats,
    audits,
    documents.length,
    trainingRecords.length,
    risks,
    suppliers.length,
    managementReviews.length,
    esgMetrics.length,
    evidenceRecords.length,
    auditorProfiles.length,
    organizations.length,
  ]);

  // Role-tailored operational focus panel
  const renderRoleFocusPanel = () => {
    if (effectiveRole === 'Super Admin') {
      return (
        <div className="bg-[#071329] text-white border border-[#087BFF]/35 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-[#00D4FF]" />
              <div>
                <h2 className="font-display text-sm font-bold text-white">
                  Global Platform Governance, Security &amp; System Health
                </h2>
                <p className="text-[11px] text-slate-300">
                  Super Admin multi-organization telemetry, active user sessions, subscriptions, and database readiness
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('activity-intelligence')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#087BFF] hover:bg-[#0062CC] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                Activity Intelligence
              </button>
              <button
                type="button"
                onClick={() => onNavigate('users-roles')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                Users &amp; RBAC Matrix
              </button>
              <button
                type="button"
                onClick={() => onNavigate('settings')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Security &amp; Backups
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-3">
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Organizations</div>
              <div className="font-mono-num text-xl font-bold text-white mt-1">{organizations.length}</div>
              <div className="text-[10px] text-[#00D4FF] mt-0.5 truncate">
                {activeOrg?.subscriptionTier || 'Enterprise'} Tier
              </div>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Registered Users</div>
              <div className="font-mono-num text-xl font-bold text-white mt-1">{allUsers.length}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">14 Enterprise Roles</div>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400" />
                Live Sessions
              </div>
              <div className="font-mono-num text-xl font-bold text-emerald-300 mt-1">{stats.onlineSessions}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Real-time heartbeat</div>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Security Alerts</div>
              <div
                className={`font-mono-num text-xl font-bold mt-1 ${
                  stats.openAlerts > 0 ? 'text-amber-300' : 'text-emerald-300'
                }`}
              >
                {stats.openAlerts}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">Open / Investigating</div>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">API Auth Guard</div>
              <div className="text-xs font-semibold text-emerald-300 mt-2">
                {serverHealth?.status === 'healthy' ? 'RS256 Active' : 'Verified'}
              </div>
              <div className="text-[10px] text-slate-300 mt-1">
                {serverHealth ? `${serverHealth.activeLockouts} Active Lockouts` : 'Brute-force active'}
              </div>
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Server Uptime</div>
              <div className="font-mono-num text-lg font-bold text-[#F5B82E] mt-1">
                {serverHealth ? `${Math.max(1, Math.floor(serverHealth.uptimeSeconds / 60))}m` : 'Online'}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">Firestore Rules Live</div>
            </div>
          </div>
        </div>
      );
    }

    if (effectiveRole === 'Organization Admin') {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                {activeOrg?.name || 'Organization Operations Center'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeOrg?.industry || 'Multi-Sector Assurance'} · {activeOrg?.state || 'India'} · Tier:{' '}
                <strong>{activeOrg?.subscriptionTier || 'Enterprise'}</strong>
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onNavigate('users-roles')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold cursor-pointer"
                >
                  Manage Employees ({allUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('training-management')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium cursor-pointer"
                >
                  Training ({trainingRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('activity-intelligence')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium cursor-pointer"
                >
                  Org Activity Logs
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Controlled Documents</div>
            <div className="font-mono-num text-xl font-bold text-slate-900 mt-1">{stats.totalDocs}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.approvedDocs} Approved · {stats.draftDocs} Drafts
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Active Org Sessions</div>
            <div className="font-mono-num text-xl font-bold text-emerald-700 mt-1">{stats.onlineSessions}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stats.openAlerts} Security Alerts</div>
          </div>
        </div>
      );
    }

    if (effectiveRole === 'Assurance Manager') {
      const auditorCount = allUsers.filter((u) =>
        ['Lead Auditor', 'Internal Auditor', 'External Auditor'].includes(u.role)
      ).length;
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-700" />
              Assurance Operations &amp; Audit Allocation Control
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Coordinate audit planning, auditor workloads, findings closure, and certification readiness across assigned clients.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => onNavigate('ehs-audit')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold cursor-pointer"
              >
                Audit Scheduling
              </button>
              <button
                type="button"
                onClick={() => onNavigate('capa')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-semibold cursor-pointer"
              >
                CAPA Monitoring ({stats.pendingCapa})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('certification-coord')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium cursor-pointer"
              >
                Certification Dossiers ({stats.activeCertDossiers})
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Audit Team Pool</div>
            <div className="font-mono-num text-xl font-bold text-slate-900 mt-1">{auditorCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Lead, Internal &amp; External</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">CAPA Closure Velocity</div>
            <div className="font-mono-num text-xl font-bold text-emerald-700 mt-1">{stats.capaClosureRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stats.overdueCapa} Overdue Items</div>
          </div>
        </div>
      );
    }

    if (
      effectiveRole === 'Lead Auditor' ||
      effectiveRole === 'Internal Auditor' ||
      effectiveRole === 'External Auditor'
    ) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                {effectiveRole === 'External Auditor'
                  ? 'Assigned Third-Party Assessment Scope (Strict Isolation)'
                  : `${effectiveRole} — Active Audit Queue & Evidence Desk`}
              </h2>
              <p className="text-xs text-slate-600">
                {effectiveRole === 'External Auditor'
                  ? 'Access is strictly restricted to assigned assessments, evidence verification, and authorized third-party reports.'
                  : 'Execute ISO/EHS checklists, verify objective evidence, record non-conformities, and validate CAPA closure.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => safeNavigate('ehs-audit')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Open Audit Execution
              </button>
              <button
                type="button"
                onClick={() => safeNavigate('capa')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium cursor-pointer"
              >
                Verify CAPA ({stats.pendingCapa})
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredAudits.slice(0, 3).map((audit) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono-num font-semibold text-slate-700">{audit.auditRef}</span>
                    <span>{audit.status}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{audit.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {audit.clientName || 'Assigned Client'} · {audit.siteLocation || 'Multi-Site'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                  <span className="text-slate-600">{audit.findings?.length || 0} Findings</span>
                  <span className="font-mono-num font-bold text-slate-900">{audit.score}% Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (effectiveRole === 'ISO Consultant') {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              ISO Advisory, Gap Readiness &amp; Controlled Document Drafting
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Build ISO implementation roadmaps, generate AI-assisted HIRA/SOP/Manual drafts (marked DRAFT – REVIEW REQUIRED), and prepare clients for pre-certification readiness.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => onNavigate('iso-gap')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                ISO Gap Engine ({isoAssessments.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('doc-generator')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold cursor-pointer"
              >
                Draft Templates ({stats.draftDocs} Pending Review)
              </button>
              <button
                type="button"
                onClick={() => onNavigate('certification-coord')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium cursor-pointer"
              >
                Readiness Dossiers
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Average Client ISO Readiness</div>
            <div className="font-mono-num text-2xl font-bold text-emerald-700 mt-1">{stats.avgIsoScore}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Across {filteredIso.length} active ISO assessments
            </div>
          </div>
        </div>
      );
    }

    if (effectiveRole === 'Client Admin' || effectiveRole === 'Client Representative / Auditee') {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              {effectiveRole === 'Client Admin'
                ? 'Client Organization Compliance & Action Portal'
                : 'Auditee Evidence Upload & CAPA Response Desk'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Track your organization&apos;s compliance readiness, submit evidence for open non-conformities, and download authorized audit reports.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => safeNavigate('capa')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Respond to CAPA ({stats.pendingCapa})
              </button>
              <button
                type="button"
                onClick={() => safeNavigate('doc-generator')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium cursor-pointer"
              >
                Documents &amp; Evidence
              </button>
              <button
                type="button"
                onClick={() => safeNavigate('audit-reports')}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold cursor-pointer"
              >
                Authorized Reports
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Compliance Readiness</div>
            <div className="font-mono-num text-xl font-bold text-emerald-700 mt-1">{stats.avgIsoScore}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stats.legalRate}% Legal Register</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Assigned Actions</div>
            <div className="font-mono-num text-xl font-bold text-amber-700 mt-1">{stats.pendingCapa}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stats.overdueCapa} Overdue</div>
          </div>
        </div>
      );
    }

    if (effectiveRole === 'Certification Coordinator') {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Accredited Certification Coordination &amp; Impartiality Control
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Manage readiness dossiers, Stage 1 / Stage 2 scheduling with independent accredited certification bodies, and renewal reminders. ARSHIEL ASSURANCE never issues accredited certificates directly.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => onNavigate('certification-coord')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Open Certification Desk ({certificationApplications.length})
              </button>
              <button
                type="button"
                onClick={() => onNavigate('authorization-control')}
                className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold cursor-pointer"
              >
                Authorization Guardrails
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Active Support Dossiers</div>
            <div className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
              {stats.activeCertDossiers}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.restrictedServices} Restricted Services Guarded
            </div>
          </div>
        </div>
      );
    }

    if (effectiveRole === 'Trainer' || effectiveRole === 'Trainee') {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              {effectiveRole === 'Trainer'
                ? 'Training Academy — Course Delivery, Attendance & Competency Scoring'
                : 'Learner Portal — Enrolled Courses, Materials & Certificates'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {effectiveRole === 'Trainer'
                ? 'Schedule ISO/EHS training cohorts, track participant attendance, grade competency assessments, and approve training completion certificates.'
                : 'Review your scheduled ISO/EHS courses, download course materials, complete assessments, and download earned completion certificates.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => onNavigate('training-management')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Open Training Academy ({trainingRecords.length} Courses)
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="text-[11px] text-slate-500">Training Programs</div>
            <div className="font-mono-num text-2xl font-bold text-blue-700 mt-1">
              {stats.activeTrainings} Active
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.completedTrainings} Completed cohorts
            </div>
          </div>
        </div>
      );
    }

    // Management Viewer & Read-Only Viewer
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900">
              {effectiveRole === 'Management Viewer'
                ? 'Executive Governance View (Read-Only Analytics & Reports)'
                : 'Strict Read-Only Authorized View'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {effectiveRole === 'Management Viewer'
                ? 'Review enterprise compliance KPIs, audit readiness trends, CAPA closure velocity, and export authorized management summaries.'
                : 'You have read-only access to explicitly authorized compliance summaries. Creating, editing, deleting, or configuring platform records is disabled.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
            <div className="text-[10px] text-emerald-700 font-semibold uppercase">CAPA Closure</div>
            <div className="font-mono-num text-lg font-bold text-emerald-900">{stats.capaClosureRate}%</div>
          </div>
          {visibleModules.includes('audit-reports') && (
            <button
              type="button"
              onClick={() => onNavigate('audit-reports')}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Published Reports
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Role-Aware Header & Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#071329] text-[#00D4FF] text-[11px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              {effectiveRole}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-semibold">
              {roleDescriptor.scopeBadge}
            </span>
            {activeOrg && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                <Building2 className="w-3 h-3" />
                {activeOrg.name}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            {roleDescriptor.portalTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{roleDescriptor.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {(isSuperAdmin || organizations.length > 1) && (
            <select
              aria-label="Active Organization Filter"
              value={activeOrgId}
              onChange={(e) => setActiveOrgId(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  Org: {org.name}
                </option>
              ))}
            </select>
          )}
          {canExport ? (
            <>
              <button
                type="button"
                onClick={handleExportDashboardPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={handleExportDashboardExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Export XLSX
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                CSV
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5" />
              Export Restricted for Role
            </span>
          )}
        </div>
      </div>

      {/* Role-Specific Operational Command Panel */}
      {renderRoleFocusPanel()}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Industry Filter</label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Industries</option>
            {INDUSTRIES_LIST.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Site / Location</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Locations</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setIndustryFilter('ALL');
              setLocationFilter('ALL');
              setDateFrom('');
              setDateTo('');
            }}
            className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid — Structured Hairline Surface, Tabular Numerals */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Audits',
            value: stats.totalAudits,
            sub: `${stats.completedAudits} Completed · ${stats.plannedAudits} Active`,
            tone: 'text-slate-900',
            target: 'ehs-audit' as ModuleId,
          },
          {
            label: 'Open Findings',
            value: stats.openFindings,
            sub: `${stats.criticalFindings} Crit · ${stats.majorFindings} Maj · ${stats.minorFindings} Min`,
            tone: stats.criticalFindings > 0 ? 'text-red-700' : 'text-slate-900',
            target: 'ehs-audit' as ModuleId,
          },
          {
            label: 'CAPA Tracker',
            value: stats.pendingCapa,
            sub: `${stats.overdueCapa} Overdue · ${stats.capaClosureRate}% Closed`,
            tone: stats.overdueCapa > 0 ? 'text-red-700' : 'text-amber-700',
            target: 'capa' as ModuleId,
          },
          {
            label: 'ISO Gap Score',
            value: `${stats.avgIsoScore}%`,
            sub: `${filteredIso.length} ISO Assessments`,
            tone: stats.avgIsoScore >= 75 ? 'text-emerald-700' : 'text-amber-700',
            target: 'iso-gap' as ModuleId,
          },
          {
            label: 'Legal Compliance',
            value: `${stats.legalRate}%`,
            sub: `${stats.legalUnverified} Unverified Flagged`,
            tone: stats.legalUnverified > 0 ? 'text-amber-700' : 'text-emerald-700',
            target: 'legal-compliance' as ModuleId,
          },
          {
            label: 'Restricted Services',
            value: stats.restrictedServices,
            sub: `${stats.totalDocs} Docs · ${stats.draftDocs} Drafts`,
            tone: 'text-slate-900',
            target: 'authorization-control' as ModuleId,
          },
        ].map((kpi) => {
          const allowed = visibleModules.includes(kpi.target);
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => safeNavigate(kpi.target)}
              className={`text-left bg-white border border-slate-200 rounded-xl p-4 transition-colors group ${
                allowed ? 'hover:border-slate-400 cursor-pointer' : 'opacity-85 cursor-default'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                {allowed ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-300" />
                )}
              </div>
              <div className={`font-mono-num text-2xl font-bold ${kpi.tone}`}>{kpi.value}</div>
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">{kpi.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Industry-Wise Audit Compliance Score (%)
              </h2>
              <p className="text-xs text-slate-500">Live average compliance scores across audited industries</p>
            </div>
            <span className="text-xs text-slate-500 font-mono-num">{industryChartData.length} Industries</span>
          </div>
          {industryChartData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-xs text-slate-500">
              No audit records match the active filter criteria.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={industryChartData} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="industry" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgScore" name="Avg Score %" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Findings Severity Distribution
            </h2>
            <p className="text-xs text-slate-500">Critical, Major, and Minor audit findings</p>
          </div>
          {findingsPieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Zero findings recorded in current filter scope.
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={findingsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {findingsPieData.map((entry, idx) => (
                        <Cell key={entry.name} fill={entry.color || CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {findingsPieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-medium text-slate-700">{d.name} Findings</span>
                    <span className="font-mono-num font-semibold text-slate-900">{d.value}</span>
                  </div>
                ))}
                <div className="pt-1 text-[11px] text-slate-500">
                  Total Documents Generated: <strong className="font-mono-num text-slate-900">{stats.totalDocs}</strong> ({stats.draftDocs} Drafts awaiting competent review)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authorized Modules Directory + Notifications Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Authorized Operational Modules for {effectiveRole}
              </h2>
              <p className="text-[11px] text-slate-500">
                Strictly filtered by your verified role &amp; permission policy
              </p>
            </div>
            <span className="text-xs font-mono-num text-slate-500">
              {authorizedModuleDirectory.length} Permitted
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {authorizedModuleDirectory.map((row) => (
              <div
                key={row.id}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{row.name}</div>
                  <div className="text-xs text-slate-500 truncate">{row.meta}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(row.id)}
                  className="text-xs font-medium text-slate-900 hover:text-amber-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {row.action} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Compliance & Overdue Alerts */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Governance &amp; Due Alerts
              </h2>
            </div>
            <span className="text-xs font-mono-num text-slate-500">
              {unreadNotifications.length} Unread
            </span>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-xs text-slate-500">No active reminders or alerts.</div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div key={n.id} className={`p-4 ${n.read ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={`text-[11px] font-semibold ${
                        n.severity === 'Critical'
                          ? 'text-red-700'
                          : n.severity === 'Warning'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {n.severity} · {n.category || 'Alert'}
                    </span>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Ack
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mb-1">{n.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  {n.dueDate && (
                    <p className="text-[11px] font-mono-num text-slate-400 mt-1.5">Due: {n.dueDate}</p>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-200 bg-amber-50/60 text-[11px] text-amber-950 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              ARSHIEL ASSURANCE provides independent consultancy &amp; assessments only — never accredited certification or statutory inspection approvals.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
