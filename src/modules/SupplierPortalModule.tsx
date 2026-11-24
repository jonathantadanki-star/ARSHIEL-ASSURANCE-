import React, { useMemo, useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { exportReportToPdf, exportRowsToExcel } from '../utils/exporters';
import type { SupplierRecord } from '../types/assurance';

export function SupplierPortalModule() {
  const {
    canEditRecords,
    suppliers,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | SupplierRecord['riskTier']>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('Raw Material / Industrial Components');
  const [country, setCountry] = useState('India');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isoCertifications, setIsoCertifications] = useState('ISO 9001:2015, ISO 14001:2015');
  const [evaluationScore, setEvaluationScore] = useState(84);
  const [esgScore, setEsgScore] = useState(78);
  const [riskTier, setRiskTier] = useState<SupplierRecord['riskTier']>('Low');
  const [complianceDocsStatus, setComplianceDocsStatus] = useState<SupplierRecord['complianceDocsStatus']>('Pending Review');
  const [nextAuditDate, setNextAuditDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10));
  const [openCapaCount, setOpenCapaCount] = useState(0);
  const [status, setStatus] = useState<SupplierRecord['status']>('Approved');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (riskFilter !== 'ALL' && s.riskTier !== riskFilter) return false;
      if (!q) return true;
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.supplierCode.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.isoCertifications || '').toLowerCase().includes(q) ||
        (s.country || '').toLowerCase().includes(q)
      );
    });
  }, [suppliers, riskFilter, searchQuery]);

  const stats = useMemo(() => {
    const approved = suppliers.filter((s) => s.status === 'Approved').length;
    const highRisk = suppliers.filter((s) => s.riskTier === 'High' || s.riskTier === 'Critical').length;
    const avgEval =
      suppliers.length > 0
        ? Math.round(suppliers.reduce((sum, s) => sum + (s.evaluationScore || 0), 0) / suppliers.length)
        : 0;
    const totalOpenCapas = suppliers.reduce((sum, s) => sum + (s.openCapaCount || 0), 0);
    return { approved, highRisk, avgEval, totalOpenCapas };
  }, [suppliers]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!companyName.trim()) {
      showToast('Supplier company name is required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const code = `SUP-${new Date().getFullYear()}-${String(suppliers.length + 1).padStart(3, '0')}`;
      await createRecord(
        'suppliers',
        'sup',
        {
          supplierCode: code,
          companyName: companyName.trim(),
          category: category.trim(),
          country: country.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          isoCertifications: isoCertifications.trim(),
          evaluationScore: Math.max(0, Math.min(100, Number(evaluationScore) || 0)),
          esgScore: Math.max(0, Math.min(100, Number(esgScore) || 0)),
          riskTier,
          complianceDocsStatus,
          nextAuditDate,
          openCapaCount: Math.max(0, Number(openCapaCount) || 0),
          status,
          notes: notes.trim(),
        },
        'Supplier Portal',
        'Onboarded Supplier',
        code
      );
      showToast(`Supplier ${code} (${companyName.trim()}) registered.`);
      setCompanyName('');
      setContactName('');
      setContactEmail('');
      setNotes('');
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    exportRowsToExcel(
      'Supplier_Register',
      filteredSuppliers.map((s) => ({
        Code: s.supplierCode,
        Supplier: s.companyName,
        Category: s.category,
        Country: s.country || '-',
        Certifications: s.isoCertifications || '-',
        EvalScore: s.evaluationScore,
        EsgScore: s.esgScore ?? '-',
        RiskTier: s.riskTier,
        DocsStatus: s.complianceDocsStatus,
        OpenCAPAs: s.openCapaCount,
        NextAudit: s.nextAuditDate || '-',
        Status: s.status,
      })),
      `ARSHIEL_Supplier_Portal_${new Date().toISOString().slice(0, 10)}`
    );
    showToast('Supplier register exported to Excel.');
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: 'Supplier Portal, Compliance Verification & Risk Evaluation Report',
      subtitle: 'Division 07 · Approved Vendor Register, ISO & ESG Readiness',
      referenceNo: `SUP-RPT-${new Date().toISOString().slice(0, 10)}`,
      status: `${stats.approved} / ${suppliers.length} APPROVED`,
      metadata: [
        ['Total Registered Suppliers', String(suppliers.length)],
        ['Approved Vendors', String(stats.approved)],
        ['High / Critical Risk Vendors', String(stats.highRisk)],
        ['Average Evaluation Score', `${stats.avgEval}%`],
      ],
      tableHeaders: ['Code', 'Supplier', 'Category', 'Eval %', 'ESG %', 'Risk Tier', 'Status'],
      tableRows: filteredSuppliers.slice(0, 40).map((s) => [
        s.supplierCode,
        s.companyName,
        s.category,
        `${s.evaluationScore}%`,
        s.esgScore !== undefined ? `${s.esgScore}%` : '-',
        s.riskTier,
        s.status,
      ]),
      filename: `ARSHIEL_Supplier_Evaluation_${new Date().toISOString().slice(0, 10)}`,
    });
    showToast('Supplier evaluation report exported to PDF.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 07 · Global Administration — Vendor Onboarding, Compliance Docs, Audit &amp; ESG Scoring
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Supplier Portal &amp; Vendor Risk Evaluation
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
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
          {canEditRecords && (
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Onboard Supplier
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Approved Suppliers</span>
            <Truck className="w-4 h-4 text-[#087BFF]" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.approved} <span className="text-xs font-normal text-slate-400">/ {suppliers.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active qualified vendors</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Average Evaluation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.avgEval}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Quality &amp; compliance score</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>High / Critical Risk</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {stats.highRisk}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Priority supplier audits</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Open Supplier CAPAs</div>
          <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {stats.totalOpenCapas}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pending corrective closure</div>
        </div>
      </div>

      {/* Onboarding Form */}
      {formOpen && canEditRecords && (
        <form
          onSubmit={handleAddSupplier}
          className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3.5"
        >
          <div className="md:col-span-4 font-display text-sm font-bold text-slate-900 dark:text-white">
            Onboard &amp; Evaluate Supplier / Contractor
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Godavari Precision Alloys Pvt. Ltd."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Supply Category</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Country / Region</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Representative</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Quality Head"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="qa@supplier.com"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">ISO / Safety Certifications Held</label>
            <input
              type="text"
              value={isoCertifications}
              onChange={(e) => setIsoCertifications(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Evaluation Score (0–100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={evaluationScore}
              onChange={(e) => setEvaluationScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">ESG Score (0–100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={esgScore}
              onChange={(e) => setEsgScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Risk Tier</label>
            <select
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value as SupplierRecord['riskTier'])}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Compliance Docs</label>
            <select
              value={complianceDocsStatus}
              onChange={(e) => setComplianceDocsStatus(e.target.value as SupplierRecord['complianceDocsStatus'])}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Incomplete">Incomplete</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Next Supplier Audit</label>
            <input
              type="date"
              value={nextAuditDate}
              onChange={(e) => setNextAuditDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Open CAPAs</label>
            <input
              type="number"
              min={0}
              max={100}
              value={openCapaCount}
              onChange={(e) => setOpenCapaCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Approval Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SupplierRecord['status'])}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              <option value="Approved">Approved</option>
              <option value="Conditional">Conditional</option>
              <option value="Under Evaluation">Under Evaluation</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Audit Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Compliance remarks"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      )}

      {/* Filter + Table */}
      <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search supplier, category, ISO cert..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-200 dark:border-white/15 rounded-lg w-64"
            />
          </div>
          <div className="inline-flex gap-1.5">
            {(['ALL', 'Low', 'Medium', 'High', 'Critical'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setRiskFilter(tier)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  riskFilter === tier
                    ? 'bg-[#071329] dark:bg-[#087BFF] text-white'
                    : 'bg-slate-100 dark:bg-[#071329] text-slate-600 dark:text-slate-300'
                }`}
              >
                {tier === 'ALL' ? 'All Tiers' : tier}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Code &amp; Supplier</th>
                <th className="px-4 py-3 font-semibold">Category &amp; Certifications</th>
                <th className="px-4 py-3 font-semibold text-center">Eval / ESG</th>
                <th className="px-4 py-3 font-semibold">Risk Tier</th>
                <th className="px-4 py-3 font-semibold">Docs / Next Audit</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No suppliers onboarded yet. Super Admin can add vendors, ISO credentials, ESG scores, and compliance verification dates above.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">{s.supplierCode}</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{s.companyName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.country || 'Global'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{s.category}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.isoCertifications || 'Not declared'}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono-num">
                      <span className="font-bold text-slate-900 dark:text-white">{s.evaluationScore}%</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{s.esgScore ?? '—'}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          s.riskTier === 'Critical' || s.riskTier === 'High'
                            ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                            : s.riskTier === 'Medium'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        }`}
                      >
                        {s.riskTier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{s.complianceDocsStatus}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
                        Next: {s.nextAuditDate || 'TBD'} · {s.openCapaCount} CAPAs
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          s.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : s.status === 'Suspended'
                            ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canEditRecords ? (
                        <div className="inline-flex items-center gap-1">
                          {s.complianceDocsStatus !== 'Verified' && (
                            <button
                              type="button"
                              title="Verify Supplier Docs & Approve"
                              onClick={() =>
                                updateRecord(
                                  'suppliers',
                                  s.id,
                                  { complianceDocsStatus: 'Verified', status: 'Approved' },
                                  'Supplier Portal',
                                  'Verified Supplier',
                                  s.supplierCode
                                )
                              }
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete Supplier"
                            onClick={() =>
                              deleteRecord('suppliers', s.id, 'Supplier Portal', 'Removed Supplier', s.supplierCode)
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
  );
}
