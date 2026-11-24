import React, { useMemo, useState } from 'react';
import {
  Building2,
  ClipboardList,
  Plus,
  Sparkles,
  Download,
  CheckCircle2,
  Trash2,
  Award,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { exportReportToPdf } from '../utils/exporters';
import type { ManagementReviewRecord } from '../types/assurance';

type PortalTab = 'client-portal' | 'management-review';

export function ClientManagementReviewModule() {
  const {
    userProfile,
    canEditRecords,
    organizations,
    audits,
    isoAssessments,
    capas,
    risks,
    certificationApplications,
    managementReviews,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [tab, setTab] = useState<PortalTab>('client-portal');
  const [selectedOrgName, setSelectedOrgName] = useState<string>('ALL');

  // Client Audit Request form
  const [reqFormOpen, setReqFormOpen] = useState(false);
  const [reqClient, setReqClient] = useState(organizations[0]?.name || '');
  const [reqTitle, setReqTitle] = useState('');
  const [reqEngine, setReqEngine] = useState<'EHS' | 'Food Safety' | 'Fire & Life Safety' | 'Environmental' | 'Contractor & Vendor'>('EHS');
  const [reqSite, setReqSite] = useState('Primary Facility');
  const [reqDate, setReqDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));

  // Clause 9.3 Management Review form
  const [mrFormOpen, setMrFormOpen] = useState(false);
  const [mrTitle, setMrTitle] = useState('');
  const [mrScope, setMrScope] = useState('ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018 (Integrated IMS)');
  const [mrDate, setMrDate] = useState(new Date().toISOString().slice(0, 10));
  const [mrChair, setMrChair] = useState(userProfile?.displayName || 'Managing Director / Super Admin');
  const [mrAttendees, setMrAttendees] = useState('Top Management, Assurance Manager, EHS Head, Quality Lead');
  const [mrAuditPerf, setMrAuditPerf] = useState('');
  const [mrCustomerFeedback, setMrCustomerFeedback] = useState('');
  const [mrRiskOpp, setMrRiskOpp] = useState('');
  const [mrCapaStatus, setMrCapaStatus] = useState('');
  const [mrDecisions, setMrDecisions] = useState('');
  const [mrMinutes, setMrMinutes] = useState('');
  const [mrNextDate, setMrNextDate] = useState(new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const clientScopedAudits = useMemo(() => {
    if (selectedOrgName === 'ALL') return audits;
    return audits.filter((a) => (a.clientName || '').toLowerCase() === selectedOrgName.toLowerCase());
  }, [audits, selectedOrgName]);

  const clientScopedCerts = useMemo(() => {
    if (selectedOrgName === 'ALL') return certificationApplications;
    return certificationApplications.filter((c) => c.clientName.toLowerCase() === selectedOrgName.toLowerCase());
  }, [certificationApplications, selectedOrgName]);

  const liveKpiSummary = useMemo(() => {
    const completedAudits = audits.filter((a) => a.status === 'Completed').length;
    const avgAuditScore =
      audits.length > 0 ? Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length) : 0;
    const avgIso =
      isoAssessments.length > 0
        ? Math.round(isoAssessments.reduce((sum, i) => sum + (i.complianceScore || 0), 0) / isoAssessments.length)
        : 0;
    const openCapas = capas.filter((c) => c.status !== 'Closed').length;
    const closedCapas = capas.filter((c) => c.status === 'Closed').length;
    const highRisks = risks.filter((r) => r.residualScore >= 10 && r.status !== 'Closed').length;
    return { completedAudits, avgAuditScore, avgIso, openCapas, closedCapas, highRisks };
  }, [audits, isoAssessments, capas, risks]);

  const handleAutoFillClause93 = () => {
    setMrAuditPerf(
      `Total Audits Tracked: ${audits.length} (${liveKpiSummary.completedAudits} completed). Average Audit Conformity Score: ${liveKpiSummary.avgAuditScore}%. Average ISO Gap Readiness Score across ${isoAssessments.length} assessments: ${liveKpiSummary.avgIso}%.`
    );
    setMrCapaStatus(
      `Total CAPAs: ${capas.length} — ${liveKpiSummary.closedCapas} Closed, ${liveKpiSummary.openCapas} Open/In-Progress (${capas.filter((c) => c.status === 'Overdue').length} Overdue).`
    );
    setMrRiskOpp(
      `Enterprise Risk Register tracks ${risks.length} risks (${liveKpiSummary.highRisks} High/Critical residual risks requiring active mitigation oversight).`
    );
    setMrCustomerFeedback(
      `Active Certification Support Dossiers: ${certificationApplications.length}. Client organizations monitored: ${organizations.length}.`
    );
    showToast('Live KPI data auto-populated from Audits, ISO Gap, CAPA, and Risk registers.');
  };

  const handleSubmitClientAuditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!reqTitle.trim() || !reqClient.trim()) {
      showToast('Client organization and audit scope title are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const ref = `CLREQ-${new Date().getFullYear()}-${String(audits.length + 1).padStart(3, '0')}`;
      await createRecord(
        'audits',
        'aud',
        {
          auditRef: ref,
          engineType: reqEngine,
          title: reqTitle.trim(),
          clientName: reqClient.trim(),
          industry: 'Enterprise Client Operations',
          siteLocation: reqSite.trim(),
          scope: `Client Portal Assessment Request — ${reqEngine}`,
          leadAuditor: 'Pending Assignment',
          auditDate: reqDate,
          status: 'Planned',
          score: 0,
          checklistItems: [],
          findings: [],
          auditorVerified: false,
        },
        'Client Portal',
        'Created Client Audit Request',
        ref
      );
      showToast(`Client audit request ${ref} scheduled.`);
      setReqTitle('');
      setReqFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateManagementReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!mrTitle.trim() || !mrChair.trim()) {
      showToast('Meeting title and chairperson are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const ref = `MRM-${new Date().getFullYear()}-${String(managementReviews.length + 1).padStart(3, '0')}`;
      await createRecord(
        'managementReviews',
        'mrm',
        {
          reviewRef: ref,
          title: mrTitle.trim(),
          standardScope: mrScope.trim(),
          meetingDate: mrDate,
          chairperson: mrChair.trim(),
          attendees: mrAttendees.trim(),
          agendaItems:
            '1) Previous MRM actions 2) External/Internal issues 3) Audit & ISO performance 4) CAPA & Nonconformities 5) Risk & Opportunity updates 6) Resource needs & continual improvement',
          auditPerformanceSummary: mrAuditPerf.trim(),
          customerFeedbackSummary: mrCustomerFeedback.trim(),
          riskOpportunitySummary: mrRiskOpp.trim(),
          capaStatusSummary: mrCapaStatus.trim(),
          decisionsAndActions: mrDecisions.trim(),
          minutesSummary: mrMinutes.trim(),
          nextReviewDate: mrNextDate,
          status: 'Scheduled',
        },
        'Management Review',
        'Created ISO Clause 9.3 Review',
        ref
      );
      showToast(`Management Review ${ref} saved.`);
      setMrTitle('');
      setMrDecisions('');
      setMrMinutes('');
      setMrFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportMinutesPdf = (rev: ManagementReviewRecord) => {
    exportReportToPdf({
      title: `ISO Clause 9.3 Management Review Minutes — ${rev.title}`,
      subtitle: rev.standardScope,
      referenceNo: rev.reviewRef,
      status: rev.status.toUpperCase(),
      metadata: [
        ['Meeting Date', rev.meetingDate],
        ['Chairperson', rev.chairperson],
        ['Attendees', rev.attendees || 'Management Review Committee'],
        ['Next Scheduled Review', rev.nextReviewDate || 'TBD'],
      ],
      summaryText: [
        rev.auditPerformanceSummary ? `AUDIT & ISO PERFORMANCE: ${rev.auditPerformanceSummary}` : '',
        rev.capaStatusSummary ? `CAPA STATUS: ${rev.capaStatusSummary}` : '',
        rev.riskOpportunitySummary ? `RISKS & OPPORTUNITIES: ${rev.riskOpportunitySummary}` : '',
        rev.decisionsAndActions ? `DECISIONS & RESOURCE ACTIONS: ${rev.decisionsAndActions}` : '',
        rev.minutesSummary ? `MEETING MINUTES: ${rev.minutesSummary}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      tableHeaders: [],
      tableRows: [],
      filename: `${rev.reviewRef}_Management_Review_Minutes`,
    });
    showToast(`Exported ${rev.reviewRef} minutes to PDF.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 07 · Global Administration — Client Workspace Portal &amp; ISO Clause 9.3 Management Review Engine
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Client Portal &amp; Management Review Engine
          </h1>
        </div>
        <div className="inline-flex bg-slate-100 dark:bg-[#071329] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setTab('client-portal')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              tab === 'client-portal'
                ? 'bg-white dark:bg-[#087BFF] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Client Portal
          </button>
          <button
            type="button"
            onClick={() => setTab('management-review')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              tab === 'management-review'
                ? 'bg-white dark:bg-[#087BFF] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> ISO Clause 9.3 Management Review
          </button>
        </div>
      </div>

      {/* TAB 1: CLIENT PORTAL */}
      {tab === 'client-portal' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Client Workspace Filter:</label>
              <select
                value={selectedOrgName}
                onChange={(e) => setSelectedOrgName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-[#0B1F3A] dark:text-white border border-slate-200 dark:border-white/15 rounded-lg"
              >
                <option value="ALL">All Client Organizations ({organizations.length})</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>
            {canEditRecords && (
              <button
                type="button"
                onClick={() => setReqFormOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Client Audit Request
              </button>
            )}
          </div>

          {reqFormOpen && canEditRecords && (
            <form
              onSubmit={handleSubmitClientAuditRequest}
              className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5"
            >
              <div className="md:col-span-3 font-display text-sm font-bold text-slate-900 dark:text-white">
                Log New Client Audit / Pre-Certification Readiness Request
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Client Organization *</label>
                <input
                  type="text"
                  required
                  value={reqClient}
                  onChange={(e) => setReqClient(e.target.value)}
                  placeholder="Client company name"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Assessment Scope Title *</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="Pre-Certification ISO 45001 Mock Audit"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Audit Engine</label>
                <select
                  value={reqEngine}
                  onChange={(e) => setReqEngine(e.target.value as typeof reqEngine)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="EHS">EHS</option>
                  <option value="Food Safety">Food Safety</option>
                  <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Contractor & Vendor">Contractor &amp; Vendor</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Site Location</label>
                <input
                  type="text"
                  value={reqSite}
                  onChange={(e) => setReqSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Requested Target Date</label>
                <input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReqFormOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}

          {/* Client Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Client Organizations</div>
              <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">{organizations.length}</div>
            </div>
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Tracked Audits</div>
              <div className="font-mono-num text-2xl font-bold text-[#087BFF] mt-1">{clientScopedAudits.length}</div>
            </div>
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Open CAPA Actions</div>
              <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{liveKpiSummary.openCapas}</div>
            </div>
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Certification Dossiers</div>
              <div className="font-mono-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{clientScopedCerts.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#087BFF]" />
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Client Audit Progress &amp; Conformity
                </h2>
              </div>
              <div className="space-y-2.5">
                {clientScopedAudits.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No audits recorded for selection.</p>
                ) : (
                  clientScopedAudits.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {a.auditRef} · {a.clientName || 'Workspace'} · {a.auditDate || 'TBD'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono-num text-xs font-bold text-slate-900 dark:text-white">{a.score ?? 0}%</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{a.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F5B82E]" />
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Client Certification Readiness &amp; Renewal Tracker
                </h2>
              </div>
              <div className="space-y-2.5">
                {clientScopedCerts.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No certification dossiers recorded.</p>
                ) : (
                  clientScopedCerts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {c.standardCode} — {c.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {c.applicationRef} · CB: {c.accreditedBodyName}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-[#087BFF]/20 text-blue-700 dark:text-blue-200 text-[10.5px] font-semibold shrink-0">
                        {c.stage}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISO CLAUSE 9.3 MANAGEMENT REVIEW */}
      {tab === 'management-review' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Structured ISO 9001 / 14001 / 45001 / 27001 Clause 9.3 Management Review meetings with live KPI auto-pull and PDF minutes export.
            </p>
            {canEditRecords && (
              <button
                type="button"
                onClick={() => setMrFormOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Management Review
              </button>
            )}
          </div>

          {mrFormOpen && canEditRecords && (
            <form
              onSubmit={handleCreateManagementReview}
              className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Schedule &amp; Record ISO Clause 9.3 Management Review
                </h2>
                <button
                  type="button"
                  onClick={handleAutoFillClause93}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-[#071329] rounded-lg cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Live KPIs
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Review Title *</label>
                  <input
                    type="text"
                    required
                    value={mrTitle}
                    onChange={(e) => setMrTitle(e.target.value)}
                    placeholder="H2 2026 Integrated Management Review"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Standard Scope</label>
                  <input
                    type="text"
                    required
                    value={mrScope}
                    onChange={(e) => setMrScope(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Chairperson *</label>
                  <input
                    type="text"
                    required
                    value={mrChair}
                    onChange={(e) => setMrChair(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={mrDate}
                    onChange={(e) => setMrDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Next Review Date</label>
                  <input
                    type="date"
                    value={mrNextDate}
                    onChange={(e) => setMrNextDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Attendees</label>
                  <input
                    type="text"
                    value={mrAttendees}
                    onChange={(e) => setMrAttendees(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Audit &amp; ISO Conformity Input (Clause 9.3.2)
                  </label>
                  <textarea
                    rows={2}
                    value={mrAuditPerf}
                    onChange={(e) => setMrAuditPerf(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    CAPA &amp; Nonconformity Status Input
                  </label>
                  <textarea
                    rows={2}
                    value={mrCapaStatus}
                    onChange={(e) => setMrCapaStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Risks &amp; Opportunities Effectiveness
                  </label>
                  <textarea
                    rows={2}
                    value={mrRiskOpp}
                    onChange={(e) => setMrRiskOpp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Decisions, Resource Needs &amp; Action Outputs (Clause 9.3.3)
                  </label>
                  <textarea
                    rows={2}
                    value={mrDecisions}
                    onChange={(e) => setMrDecisions(e.target.value)}
                    placeholder="Approved budget for internal auditor training, closure deadlines..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Meeting Minutes &amp; Executive Summary
                  </label>
                  <textarea
                    rows={2}
                    value={mrMinutes}
                    onChange={(e) => setMrMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMrFormOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Management Review'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {managementReviews.length === 0 ? (
              <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                No ISO Clause 9.3 Management Reviews logged yet. Super Admin can create a review and click &quot;Auto-Fill Live KPIs&quot;.
              </div>
            ) : (
              managementReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
                        <span>{rev.reviewRef}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {rev.meetingDate}
                        </span>
                        <span>·</span>
                        <span>Chair: {rev.chairperson}</span>
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {rev.title}
                      </h3>
                      <div className="text-xs text-[#087BFF] font-medium">{rev.standardScope}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          rev.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}
                      >
                        {rev.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleExportMinutesPdf(rev)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Minutes PDF
                      </button>
                      {canEditRecords ? (
                        <>
                          {rev.status !== 'Approved' && (
                            <button
                              type="button"
                              title="Approve Management Review Minutes"
                              onClick={() =>
                                updateRecord(
                                  'managementReviews',
                                  rev.id,
                                  { status: 'Approved' },
                                  'Management Review',
                                  'Approved MRM Minutes',
                                  rev.reviewRef
                                )
                              }
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete Review"
                            onClick={() =>
                              deleteRecord('managementReviews', rev.id, 'Management Review', 'Deleted MRM', rev.reviewRef)
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3" /> Read-Only
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {rev.auditPerformanceSummary && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Audit &amp; ISO Performance</div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.auditPerformanceSummary}</p>
                      </div>
                    )}
                    {rev.capaStatusSummary && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">CAPA &amp; Nonconformity Status</div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.capaStatusSummary}</p>
                      </div>
                    )}
                    {rev.riskOpportunitySummary && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Risks &amp; Opportunities</div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.riskOpportunitySummary}</p>
                      </div>
                    )}
                    {rev.decisionsAndActions && (
                      <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-[#087BFF]/10 border border-blue-200/60 dark:border-[#087BFF]/30">
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">Decisions &amp; Action Plan</div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{rev.decisionsAndActions}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
