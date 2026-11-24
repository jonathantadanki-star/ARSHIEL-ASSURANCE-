import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  Users,
  FolderCheck,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  ShieldCheck,
  Search,
  Lock,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { validateClientFileUpload } from '../security/rbac';
import { exportReportToPdf, exportRowsToExcel } from '../utils/exporters';
import type { AuditorProfileRecord, EvidenceRecord } from '../types/assurance';

type ActiveTab = 'calendar' | 'auditors' | 'evidence';

const STANDARD_OPTIONS = [
  'ISO 9001:2015',
  'ISO 14001:2015',
  'ISO 45001:2018',
  'ISO 27001:2022',
  'ISO 22000:2018',
  'ISO 50001:2018',
  'ISO 22301:2019',
  'ISO 13485:2016',
  'ISO 37001:2016',
  'ISO 37301:2021',
  'ISO 14064-1',
  'ISO 26000',
];

export function AuditPlanningEvidenceModule() {
  const {
    userProfile,
    canEditRecords,
    audits,
    auditorProfiles,
    evidenceRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [tab, setTab] = useState<ActiveTab>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');

  // Schedule new audit form
  const [auditFormOpen, setAuditFormOpen] = useState(false);
  const [newAuditTitle, setNewAuditTitle] = useState('');
  const [newAuditEngine, setNewAuditEngine] = useState<'EHS' | 'Food Safety' | 'Fire & Life Safety' | 'Environmental' | 'Contractor & Vendor'>('EHS');
  const [newAuditScope, setNewAuditScope] = useState<'Internal Audit' | 'External / Third-Party Assessment' | 'Supplier Audit' | 'Surveillance Readiness'>('Internal Audit');
  const [newAuditOrg, setNewAuditOrg] = useState('');
  const [newAuditSite, setNewAuditSite] = useState('Hyderabad, Telangana');
  const [newAuditDate, setNewAuditDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [newAuditLead, setNewAuditLead] = useState('');
  const [newAuditStd, setNewAuditStd] = useState('ISO 45001:2018');

  // New Auditor form
  const [auditorFormOpen, setAuditorFormOpen] = useState(false);
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [auditorType, setAuditorType] = useState<AuditorProfileRecord['auditorType']>('Lead Auditor');
  const [auditorQuals, setAuditorQuals] = useState('IRCA Certified Lead Auditor, NEBOSH IGC');
  const [auditorStandards, setAuditorStandards] = useState('ISO 9001:2015, ISO 14001:2015, ISO 45001:2018');
  const [auditorAvailability, setAuditorAvailability] = useState<AuditorProfileRecord['availability']>('Available');
  const [auditorMaxWorkload, setAuditorMaxWorkload] = useState(5);
  const [auditorCoiDeclared, setAuditorCoiDeclared] = useState(true);
  const [auditorCoiNotes, setAuditorCoiNotes] = useState('No financial, employment, or consulting conflict declared.');

  // New Evidence form
  const [evidenceFormOpen, setEvidenceFormOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evAuditRef, setEvAuditRef] = useState('');
  const [evStdRef, setEvStdRef] = useState('ISO 45001:2018');
  const [evType, setEvType] = useState<EvidenceRecord['evidenceType']>('PDF Document');
  const [evFileName, setEvFileName] = useState('');
  const [evTags, setEvTags] = useState('Clause 8.1, Objective Evidence');
  const [evSite, setEvSite] = useState('Primary Facility');
  const [evFileError, setEvFileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    audits.forEach((a) => {
      if (a.auditDate && a.auditDate.length >= 7) set.add(a.auditDate.slice(0, 7));
    });
    return Array.from(set).sort();
  }, [audits]);

  const filteredAudits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return audits
      .filter((a) => {
        if (monthFilter !== 'ALL' && !(a.auditDate || '').startsWith(monthFilter)) return false;
        if (!q) return true;
        return (
          (a.title || '').toLowerCase().includes(q) ||
          (a.auditRef || '').toLowerCase().includes(q) ||
          (a.clientName || '').toLowerCase().includes(q) ||
          (a.leadAuditor || '').toLowerCase().includes(q) ||
          (a.siteLocation || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.auditDate || '').localeCompare(b.auditDate || ''));
  }, [audits, monthFilter, searchQuery]);

  const filteredAuditors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return auditorProfiles;
    return auditorProfiles.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.certifiedStandards.toLowerCase().includes(q) ||
        a.auditorType.toLowerCase().includes(q)
    );
  }, [auditorProfiles, searchQuery]);

  const filteredEvidence = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return evidenceRecords;
    return evidenceRecords.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.auditRef || '').toLowerCase().includes(q) ||
        (e.standardRef || '').toLowerCase().includes(q) ||
        (e.tags || '').toLowerCase().includes(q) ||
        (e.fileName || '').toLowerCase().includes(q)
    );
  }, [evidenceRecords, searchQuery]);

  const metrics = useMemo(() => {
    const planned = audits.filter((a) => a.status === 'Planned' || a.status === 'In Progress').length;
    const completed = audits.filter((a) => a.status === 'Completed').length;
    const availableAuditors = auditorProfiles.filter((a) => a.availability === 'Available').length;
    const pendingEvidence = evidenceRecords.filter((e) => e.approvalStatus === 'Pending Review').length;
    const approvedEvidence = evidenceRecords.filter((e) => e.approvalStatus === 'Approved').length;
    return { planned, completed, availableAuditors, pendingEvidence, approvedEvidence };
  }, [audits, auditorProfiles, evidenceRecords]);

  const handleScheduleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!newAuditTitle.trim() || !newAuditOrg.trim()) {
      showToast('Audit title and organization are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const ref = `AUD-${new Date().getFullYear()}-${String(audits.length + 1).padStart(3, '0')}`;
      await createRecord(
        'audits',
        'aud',
        {
          auditRef: ref,
          engineType: newAuditEngine,
          title: `${newAuditTitle.trim()} (${newAuditScope})`,
          clientName: newAuditOrg.trim(),
          industry: newAuditEngine === 'Food Safety' ? 'Food & Beverage Manufacturing' : 'Manufacturing & Industrial',
          siteLocation: newAuditSite.trim() || 'Primary Site',
          scope: `${newAuditScope} — ${newAuditStd}`,
          auditDate: newAuditDate,
          leadAuditor: newAuditLead.trim() || userProfile?.displayName || 'Assigned Lead Auditor',
          status: 'Planned',
          score: 0,
          checklistItems: [],
          findings: [],
          auditorVerified: false,
        },
        'Audit Planning',
        'Scheduled Audit',
        ref
      );
      showToast(`Audit ${ref} added to the schedule.`);
      setNewAuditTitle('');
      setNewAuditOrg('');
      setAuditFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!auditorName.trim() || !auditorEmail.trim()) {
      showToast('Auditor name and email are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const code = `AUDR-${String(auditorProfiles.length + 1).padStart(3, '0')}`;
      await createRecord(
        'auditorProfiles',
        'audr',
        {
          auditorCode: code,
          fullName: auditorName.trim(),
          email: auditorEmail.trim().toLowerCase(),
          auditorType,
          qualifications: auditorQuals.trim(),
          certifiedStandards: auditorStandards.trim(),
          availability: auditorAvailability,
          activeAssignments: 0,
          maxWorkload: Math.max(1, Math.min(20, Number(auditorMaxWorkload) || 5)),
          conflictOfInterestDeclared: auditorCoiDeclared,
          coiNotes: auditorCoiNotes.trim(),
        },
        'Audit Planning',
        'Registered Auditor Profile',
        code
      );
      showToast(`Auditor ${auditorName.trim()} registered.`);
      setAuditorName('');
      setAuditorEmail('');
      setAuditorFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEvidenceFilePick = (file: File | null) => {
    setEvFileError(null);
    if (!file) {
      setEvFileName('');
      return;
    }
    const validation = validateClientFileUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      setEvFileError(validation.error || 'Unsupported file.');
      setEvFileName('');
      return;
    }
    setEvFileName(file.name);
    if (file.type === 'application/pdf') setEvType('PDF Document');
    else if (file.type.startsWith('image/')) setEvType('Photo');
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!evTitle.trim()) {
      showToast('Evidence title is required.', 'warning');
      return;
    }
    if (evFileError) {
      showToast(evFileError, 'error');
      return;
    }
    setSaving(true);
    try {
      const ref = `EVD-${new Date().getFullYear()}-${String(evidenceRecords.length + 1).padStart(3, '0')}`;
      await createRecord(
        'evidenceRecords',
        'evd',
        {
          evidenceRef: ref,
          auditRef: evAuditRef.trim() || undefined,
          standardRef: evStdRef,
          title: evTitle.trim(),
          evidenceType: evType,
          fileName: evFileName.trim() || 'evidence-record-metadata.pdf',
          tags: evTags.trim(),
          uploadedBy: userProfile?.displayName || 'Super Admin',
          siteLocation: evSite.trim(),
          approvalStatus: 'Pending Review',
        },
        'Evidence Vault',
        'Logged Audit Evidence',
        ref
      );
      showToast(`Evidence ${ref} logged for verification.`);
      setEvTitle('');
      setEvFileName('');
      setEvidenceFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportScheduleExcel = () => {
    exportRowsToExcel(
      'Audit_Schedule',
      filteredAudits.map((a) => ({
        Ref: a.auditRef,
        Date: a.auditDate || '-',
        Engine: a.engineType,
        Title: a.title,
        Organization: a.clientName || '-',
        Site: a.siteLocation || '-',
        LeadAuditor: a.leadAuditor || '-',
        Scope: a.scope || '-',
        Status: a.status,
        ScorePct: a.score ?? 0,
      })),
      `ARSHIEL_Audit_Schedule_${new Date().toISOString().slice(0, 10)}`
    );
    showToast('Audit schedule exported to Excel.');
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: 'Audit Planning, Auditor Registry & Evidence Vault Summary',
      subtitle: 'Division 02 · Enterprise Audit Management',
      referenceNo: `AUD-PLAN-${new Date().toISOString().slice(0, 10)}`,
      status: 'LIVE WORKSPACE REGISTER',
      metadata: [
        ['Scheduled / Active Audits', String(metrics.planned)],
        ['Completed Audits', String(metrics.completed)],
        ['Registered Auditors', String(auditorProfiles.length)],
        ['Evidence Items Approved / Total', `${metrics.approvedEvidence} / ${evidenceRecords.length}`],
      ],
      tableHeaders: ['Audit Ref', 'Date', 'Engine', 'Organization', 'Lead Auditor', 'Status'],
      tableRows: filteredAudits.slice(0, 40).map((a) => [
        a.auditRef,
        a.auditDate || '-',
        a.engineType,
        a.clientName || '-',
        a.leadAuditor || '-',
        a.status,
      ]),
      filename: `ARSHIEL_Audit_Plan_${new Date().toISOString().slice(0, 10)}`,
    });
    showToast('Audit planning report exported to PDF.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 02 · Audit Management — Annual Planning, Competency &amp; Objective Evidence Vault
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Audit Scheduling, Auditor Assignment &amp; Evidence Vault
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportScheduleExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Planned &amp; Active Audits</div>
          <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.planned}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{metrics.completed} completed</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Registered Auditors</div>
          <div className="font-mono-num text-2xl font-bold text-[#087BFF] mt-1">{auditorProfiles.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{metrics.availableAuditors} available now</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Evidence Vault Records</div>
          <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">{evidenceRecords.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{metrics.approvedEvidence} approved</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Evidence Reviews</div>
          <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.pendingEvidence}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Awaiting verification</div>
        </div>
      </div>

      {/* Sub-Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex bg-slate-100 dark:bg-[#071329] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {[
            { id: 'calendar' as ActiveTab, label: 'Audit Schedule & Calendar', icon: CalendarDays },
            { id: 'auditors' as ActiveTab, label: 'Auditor Competency & COI', icon: Users },
            { id: 'evidence' as ActiveTab, label: 'Audit Evidence Vault', icon: FolderCheck },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'bg-white dark:bg-[#087BFF] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter schedule, auditors, evidence..."
              className="pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#0B1F3A] dark:text-white border border-slate-200 dark:border-white/15 rounded-lg w-60"
            />
          </div>
          {canEditRecords && tab === 'calendar' && (
            <button
              type="button"
              onClick={() => setAuditFormOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule Audit
            </button>
          )}
          {canEditRecords && tab === 'auditors' && (
            <button
              type="button"
              onClick={() => setAuditorFormOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Register Auditor
            </button>
          )}
          {canEditRecords && tab === 'evidence' && (
            <button
              type="button"
              onClick={() => setEvidenceFormOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" /> Log Evidence
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: AUDIT SCHEDULE */}
      {tab === 'calendar' && (
        <div className="space-y-4">
          {auditFormOpen && canEditRecords && (
            <form
              onSubmit={handleScheduleAudit}
              className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5"
            >
              <div className="md:col-span-3 font-display text-sm font-bold text-slate-900 dark:text-white">
                Schedule New Internal / Third-Party / Surveillance Readiness Audit
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Audit Title *</label>
                <input
                  type="text"
                  required
                  value={newAuditTitle}
                  onChange={(e) => setNewAuditTitle(e.target.value)}
                  placeholder="Q3 ISO 45001 Plant Safety Audit"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Organization / Client *</label>
                <input
                  type="text"
                  required
                  value={newAuditOrg}
                  onChange={(e) => setNewAuditOrg(e.target.value)}
                  placeholder="Deccan Precision Manufacturing"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Site Location</label>
                <input
                  type="text"
                  value={newAuditSite}
                  onChange={(e) => setNewAuditSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Audit Engine</label>
                <select
                  value={newAuditEngine}
                  onChange={(e) => setNewAuditEngine(e.target.value as typeof newAuditEngine)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="EHS">EHS / Occupational Safety</option>
                  <option value="Food Safety">Food Safety / HACCP</option>
                  <option value="Fire & Life Safety">Fire &amp; Life Safety</option>
                  <option value="Environmental">Environmental &amp; ESG</option>
                  <option value="Contractor & Vendor">Contractor &amp; Vendor</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Assessment Scope</label>
                <select
                  value={newAuditScope}
                  onChange={(e) => setNewAuditScope(e.target.value as typeof newAuditScope)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="Internal Audit">Internal Audit</option>
                  <option value="External / Third-Party Assessment">External / Third-Party Assessment</option>
                  <option value="Supplier Audit">Supplier Audit</option>
                  <option value="Surveillance Readiness">Surveillance Readiness</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Applicable Standard</label>
                <select
                  value={newAuditStd}
                  onChange={(e) => setNewAuditStd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  {STANDARD_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={newAuditDate}
                  onChange={(e) => setNewAuditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Assigned Lead Auditor</label>
                <input
                  type="text"
                  list="registered-auditors-list"
                  value={newAuditLead}
                  onChange={(e) => setNewAuditLead(e.target.value)}
                  placeholder="Select or type auditor name"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
                <datalist id="registered-auditors-list">
                  {auditorProfiles.map((a) => (
                    <option key={a.id} value={a.fullName} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAuditFormOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Live Audit Schedule ({filteredAudits.length} engagements)
              </div>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-200 dark:border-white/15 rounded-lg"
              >
                <option value="ALL">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date &amp; Ref</th>
                    <th className="px-4 py-3 font-semibold">Audit Title &amp; Standard</th>
                    <th className="px-4 py-3 font-semibold">Organization / Site</th>
                    <th className="px-4 py-3 font-semibold">Lead Auditor</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                        No scheduled audits match the active filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono-num font-semibold text-slate-900 dark:text-white">{a.auditDate || 'TBD'}</div>
                          <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">{a.auditRef}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{a.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {a.engineType} · {a.scope || 'General Assurance'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{a.clientName || 'Enterprise Site'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{a.siteLocation || 'Not specified'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{a.leadAuditor || 'Unassigned'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              a.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : a.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono-num font-bold text-slate-900 dark:text-white">
                          {a.score ?? 0}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITOR REGISTRY & COI */}
      {tab === 'auditors' && (
        <div className="space-y-4">
          {auditorFormOpen && canEditRecords && (
            <form
              onSubmit={handleCreateAuditor}
              className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5"
            >
              <div className="md:col-span-3 font-display text-sm font-bold text-slate-900 dark:text-white">
                Register Auditor Competency &amp; Impartiality Profile
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  placeholder="R. Venkataramana"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={auditorEmail}
                  onChange={(e) => setAuditorEmail(e.target.value)}
                  placeholder="auditor@organization.com"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Auditor Classification</label>
                <select
                  value={auditorType}
                  onChange={(e) => setAuditorType(e.target.value as AuditorProfileRecord['auditorType'])}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="Lead Auditor">Lead Auditor</option>
                  <option value="Internal Auditor">Internal Auditor</option>
                  <option value="External Auditor">External Auditor</option>
                  <option value="Technical Specialist">Technical Specialist</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Qualifications &amp; Credentials</label>
                <input
                  type="text"
                  required
                  value={auditorQuals}
                  onChange={(e) => setAuditorQuals(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Competent ISO Standards</label>
                <input
                  type="text"
                  required
                  value={auditorStandards}
                  onChange={(e) => setAuditorStandards(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Availability</label>
                  <select
                    value={auditorAvailability}
                    onChange={(e) => setAuditorAvailability(e.target.value as AuditorProfileRecord['availability'])}
                    className="w-full px-2.5 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Max Audits</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={auditorMaxWorkload}
                    onChange={(e) => setAuditorMaxWorkload(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Conflict of Interest (COI) Declaration Notes</label>
                <input
                  type="text"
                  value={auditorCoiNotes}
                  onChange={(e) => setAuditorCoiNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div className="flex items-end justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditorCoiDeclared}
                    onChange={(e) => setAuditorCoiDeclared(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  COI Verified
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
                >
                  Save Auditor
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAuditors.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-slate-400">
                No auditor competency profiles registered yet. Super Admin can add Lead, Internal, External Auditors, and Technical Specialists above.
              </div>
            ) : (
              filteredAuditors.map((auditor) => {
                const liveAssignedCount = audits.filter(
                  (a) =>
                    (a.leadAuditor || '').toLowerCase().includes(auditor.fullName.toLowerCase()) &&
                    a.status !== 'Completed'
                ).length;
                const workloadPct = Math.min(100, Math.round((liveAssignedCount / Math.max(1, auditor.maxWorkload)) * 100));
                return (
                  <div
                    key={auditor.id}
                    className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono-num text-[10.5px] text-slate-500 dark:text-slate-400">
                            {auditor.auditorCode} · {auditor.auditorType}
                          </div>
                          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{auditor.fullName}</h3>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{auditor.email}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                            auditor.availability === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : auditor.availability === 'Assigned'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                          }`}
                        >
                          {auditor.availability}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Standards:</span> {auditor.certifiedStandards}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Qualifications:</span> {auditor.qualifications}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Active Audit Workload</span>
                          <span className="font-mono-num font-semibold text-slate-800 dark:text-slate-200">
                            {liveAssignedCount} / {auditor.maxWorkload}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${workloadPct >= 85 ? 'bg-red-500' : workloadPct >= 60 ? 'bg-amber-500' : 'bg-[#087BFF]'}`}
                            style={{ width: `${workloadPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          auditor.conflictOfInterestDeclared
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {auditor.conflictOfInterestDeclared ? 'COI Cleared' : 'COI Pending'}
                      </span>
                      {canEditRecords && (
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label="Update auditor availability"
                            value={auditor.availability}
                            onChange={(e) =>
                              updateRecord(
                                'auditorProfiles',
                                auditor.id,
                                { availability: e.target.value },
                                'Audit Planning',
                                'Updated Auditor Availability',
                                auditor.auditorCode
                              )
                            }
                            className="px-2 py-1 text-[11px] bg-slate-50 dark:bg-[#071329] dark:text-white border border-slate-200 dark:border-white/15 rounded-md"
                          >
                            <option value="Available">Available</option>
                            <option value="Assigned">Assigned</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Unavailable">Unavailable</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              deleteRecord('auditorProfiles', auditor.id, 'Audit Planning', 'Removed Auditor', auditor.auditorCode)
                            }
                            aria-label="Remove auditor"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE VAULT */}
      {tab === 'evidence' && (
        <div className="space-y-4">
          {evidenceFormOpen && canEditRecords && (
            <form
              onSubmit={handleCreateEvidence}
              className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5"
            >
              <div className="md:col-span-3 flex items-center justify-between">
                <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Log Objective Audit Evidence (Validated File Screening)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allowed attachments: JPG, PNG, WEBP, PDF (&le; 5 MB)
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Evidence Title *</label>
                <input
                  type="text"
                  required
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Calibration Certificate — Pressure Gauge PG-14"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Linked Audit Ref</label>
                <select
                  value={evAuditRef}
                  onChange={(e) => setEvAuditRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="">General Compliance Evidence</option>
                  {audits.map((a) => (
                    <option key={a.id} value={a.auditRef}>
                      {a.auditRef} — {a.clientName || a.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Standard / Clause</label>
                <select
                  value={evStdRef}
                  onChange={(e) => setEvStdRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  {STANDARD_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Evidence Type</label>
                <select
                  value={evType}
                  onChange={(e) => setEvType(e.target.value as EvidenceRecord['evidenceType'])}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                >
                  <option value="Photo">Photo</option>
                  <option value="PDF Document">PDF Document</option>
                  <option value="Spreadsheet">Spreadsheet</option>
                  <option value="Video Reference">Video Reference</option>
                  <option value="Certificate / Record">Certificate / Record</option>
                  <option value="Interview Note">Interview Note</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Attach &amp; Screen File (Optional)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => handleEvidenceFilePick(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-[#071329] file:text-slate-700 dark:file:text-slate-200"
                />
                {evFileError && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {evFileError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tags &amp; Site</label>
                <input
                  type="text"
                  value={evTags}
                  onChange={(e) => setEvTags(e.target.value)}
                  placeholder="Clause 7.1.5, Calibration"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Site Location</label>
                <input
                  type="text"
                  value={evSite}
                  onChange={(e) => setEvSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>
              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEvidenceFormOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || Boolean(evFileError)}
                  className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer disabled:opacity-50"
                >
                  Log Evidence
                </button>
              </div>
            </form>
          )}

          <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ref &amp; Type</th>
                    <th className="px-4 py-3 font-semibold">Evidence Title &amp; File</th>
                    <th className="px-4 py-3 font-semibold">Audit / Standard</th>
                    <th className="px-4 py-3 font-semibold">Tags</th>
                    <th className="px-4 py-3 font-semibold">Approval</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {filteredEvidence.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                        No audit evidence records logged yet.
                      </td>
                    </tr>
                  ) : (
                    filteredEvidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono-num font-semibold text-slate-900 dark:text-white">{ev.evidenceRef}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{ev.evidenceType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{ev.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {ev.fileName || 'metadata-only'} · {ev.siteLocation || 'Site N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono-num text-slate-800 dark:text-slate-200">{ev.auditRef || 'Standalone'}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{ev.standardRef || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300">{ev.tags || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              ev.approvalStatus === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : ev.approvalStatus === 'Rejected'
                                ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            {ev.approvalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {canEditRecords ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                title="Approve Evidence"
                                onClick={() =>
                                  updateRecord(
                                    'evidenceRecords',
                                    ev.id,
                                    { approvalStatus: 'Approved', reviewerNotes: 'Verified by Super Admin' },
                                    'Evidence Vault',
                                    'Approved Evidence',
                                    ev.evidenceRef
                                  )
                                }
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Reject Evidence"
                                onClick={() =>
                                  updateRecord(
                                    'evidenceRecords',
                                    ev.id,
                                    { approvalStatus: 'Rejected', reviewerNotes: 'Insufficient objective evidence' },
                                    'Evidence Vault',
                                    'Rejected Evidence',
                                    ev.evidenceRef
                                  )
                                }
                                className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/15 rounded-md cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Delete Evidence"
                                onClick={() =>
                                  deleteRecord('evidenceRecords', ev.id, 'Evidence Vault', 'Deleted Evidence', ev.evidenceRef)
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <Lock className="w-3 h-3" /> Read-Only
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
