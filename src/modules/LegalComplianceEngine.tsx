import React, { useMemo, useState } from 'react';
import {
  Plus,
  Bot,
  Download,
  FileSpreadsheet,
  ExternalLink,
  AlertTriangle,
  Search,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { INDUSTRIES_LIST, JURISDICTIONS, LEGAL_CATEGORIES } from '../data/seedCatalog';
import type {
  LegalComplianceStatus,
  LegalRequirementRecord,
  LegalVerificationStatus,
} from '../types/assurance';
import { exportReportToPdf, exportRowsToExcel, exportRowsToCsv } from '../utils/exporters';

interface AiSuggestedLaw {
  actName: string;
  ruleName?: string;
  sectionRef?: string;
  jurisdiction: string;
  classification: 'Central' | 'State';
  authority?: string;
  category?: string;
  requirement?: string;
  frequency?: string;
  requiredDocs?: string;
  officialSource?: string;
  sourceUrl?: string;
  verificationStatus?: string;
  correctiveGuidance?: string;
}

export function LegalComplianceEngine() {
  const { legalRequirements, canEditRecords, createRecord, updateRecord, fetchWithAuth, showToast } = useAssurance();

  const [jurisdictionTab, setJurisdictionTab] = useState<'ALL' | 'India (Central)' | 'Andhra Pradesh' | 'Telangana'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // AI Legal Applicability State
  const [aiIndustry, setAiIndustry] = useState('Semiconductor');
  const [aiJurisdiction, setAiJurisdiction] = useState('Telangana');
  const [aiEstablishment, setAiEstablishment] = useState('Industrial factory with 180 employees, DG sets, chemical storage, and staff canteen');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    applicabilityOverview?: string;
    legalDisclaimer?: string;
    suggestedItems?: AiSuggestedLaw[];
  } | null>(null);

  // Add Legal Entry Form State
  const [form, setForm] = useState({
    actName: '',
    ruleName: '',
    sectionRef: '',
    jurisdiction: 'India (Central)',
    classification: 'Central' as 'Central' | 'State',
    authority: '',
    category: LEGAL_CATEGORIES[0],
    industryApplicability: 'All Industries',
    establishmentApplicability: '',
    requirement: '',
    frequency: 'Annual',
    responsibleDept: 'EHS & Legal',
    responsiblePerson: '',
    requiredDocs: '',
    dueDate: new Date().toISOString().slice(0, 10),
    effectiveDate: '',
    amendmentDate: '',
    legalStatus: 'Active',
    officialSource: 'India Code / Official Gazette',
    sourceUrl: 'https://www.indiacode.nic.in/',
    verificationStatus: 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED' as LegalVerificationStatus,
    complianceStatus: 'Under Review' as LegalComplianceStatus,
  });

  const filtered = useMemo(() => {
    return legalRequirements.filter((r) => {
      if (jurisdictionTab !== 'ALL' && r.jurisdiction !== jurisdictionTab) return false;
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.actName} ${r.ruleName || ''} ${r.authority || ''} ${r.category || ''} ${r.requirement || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [legalRequirements, jurisdictionTab, categoryFilter, search]);

  const unverifiedCount = legalRequirements.filter(
    (r) => r.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED'
  ).length;

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecord(
        'legalRequirements',
        'leg',
        {
          ...form,
          lastVerifiedDate: new Date().toISOString().slice(0, 10),
          evidenceNotes: '',
        },
        'Legal Compliance',
        'Added Legal Register Entry',
        form.actName.slice(0, 80)
      );
      setShowAddForm(false);
      setForm((prev) => ({ ...prev, actName: '', ruleName: '', sectionRef: '', requirement: '' }));
      showToast('Legal compliance entry added to register.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save legal requirement.', 'error');
    }
  };

  const handleRunAiLegalAnalyzer = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetchWithAuth('/api/ai/legal-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: aiIndustry,
          jurisdiction: `India (Central) + ${aiJurisdiction}`,
          establishmentDetails: aiEstablishment,
          categories: LEGAL_CATEGORIES.slice(0, 8),
          existingRegisterSummary: legalRequirements.map((l) => l.actName).slice(0, 15),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Legal AI request failed');
      setAiResult(json.data || {});
      showToast('AI Legal Applicability assessment generated. Verify all citations against official portals.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Legal AI analysis failed.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportAiSuggestion = async (item: AiSuggestedLaw) => {
    const verifStatus: LegalVerificationStatus =
      item.verificationStatus === 'Verified Against Official Source'
        ? 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED' // Always require human verification on AI-suggested laws!
        : 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED';

    try {
      await createRecord(
        'legalRequirements',
        'leg',
        {
          actName: (item.actName || 'Unnamed Act').slice(0, 230),
          ruleName: (item.ruleName || '').slice(0, 230),
          sectionRef: (item.sectionRef || 'Verify official section').slice(0, 115),
          jurisdiction: (item.jurisdiction || aiJurisdiction).slice(0, 95),
          classification: item.classification === 'State' ? 'State' : 'Central',
          authority: (item.authority || 'Relevant Regulatory Authority').slice(0, 195),
          category: (item.category || 'Occupational Safety & Health').slice(0, 115),
          industryApplicability: aiIndustry,
          establishmentApplicability: aiEstablishment.slice(0, 230),
          requirement: (item.requirement || '').slice(0, 2400),
          frequency: (item.frequency || 'Periodic').slice(0, 75),
          responsibleDept: 'EHS & Legal',
          responsiblePerson: 'Compliance Reviewer',
          requiredDocs: (item.requiredDocs || '').slice(0, 950),
          evidenceNotes: item.correctiveGuidance ? `AI Guidance: ${item.correctiveGuidance}`.slice(0, 1400) : '',
          dueDate: '',
          lastVerifiedDate: 'Pending Official Source Check',
          effectiveDate: 'Verify on India Code / State Gazette',
          amendmentDate: 'Verify Latest Amendment',
          legalStatus: 'Pending Official Verification',
          officialSource: (item.officialSource || 'Official Government Portal').slice(0, 230),
          sourceUrl: (item.sourceUrl || 'https://www.indiacode.nic.in/').slice(0, 490),
          verificationStatus: verifStatus,
          complianceStatus: 'Under Review',
        },
        'Legal Compliance',
        'Imported AI-Suggested Legal Entry (Flagged Unverified)',
        item.actName.slice(0, 80)
      );
      showToast('Added to Legal Register as UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed.', 'error');
    }
  };

  const handleStatusUpdate = async (
    req: LegalRequirementRecord,
    patch: Partial<LegalRequirementRecord>
  ) => {
    try {
      await updateRecord(
        'legalRequirements',
        req.id,
        patch as Record<string, unknown>,
        'Legal Compliance',
        'Updated Legal Compliance Status',
        req.actName.slice(0, 80)
      );
      showToast('Legal register updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: `Indian Legal Compliance Register (${jurisdictionTab})`,
      subtitle: 'Central, Andhra Pradesh & Telangana Statutory Framework Advisory Register',
      referenceNo: `AA-LEG-${new Date().toISOString().slice(0, 10)}`,
      status: 'LEGAL REGISTER ADVISORY (NOT FORMAL LEGAL ADVICE)',
      metadata: [
        ['Jurisdiction Scope', jurisdictionTab],
        ['Total Tracked Obligations', String(filtered.length)],
        ['Unverified Rules Flagged', String(filtered.filter((f) => f.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED').length)],
      ],
      tableHeaders: ['Act / Rule', 'Jurisdiction', 'Category', 'Compliance', 'Verification Status', 'Official Source'],
      tableRows: filtered.map((r) => [
        `${r.actName} (${r.sectionRef || '-'})`,
        `${r.jurisdiction} (${r.classification})`,
        r.category || '-',
        r.complianceStatus,
        r.verificationStatus,
        r.officialSource || '-',
      ]),
      filename: `ARSHIEL_Legal_Register_${jurisdictionTab.replace(/\s+/g, '_')}.pdf`,
    });
    showToast('Legal Compliance PDF exported.');
  };

  const handleExportExcel = () => {
    exportRowsToExcel(
      'Indian_Legal_Register',
      filtered.map((r) => ({
        ActName: r.actName,
        RuleName: r.ruleName || '',
        SectionRef: r.sectionRef || '',
        Jurisdiction: r.jurisdiction,
        Classification: r.classification,
        Authority: r.authority || '',
        Category: r.category || '',
        Requirement: r.requirement || '',
        Frequency: r.frequency || '',
        DueDate: r.dueDate || '',
        OfficialSource: r.officialSource || '',
        SourceURL: r.sourceUrl || '',
        VerificationStatus: r.verificationStatus,
        ComplianceStatus: r.complianceStatus,
      })),
      `ARSHIEL_Legal_Register_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Legal Register XLSX exported.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            India (Central) · Andhra Pradesh · Telangana · Extensible Multi-State Architecture
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            AI Legal Compliance Engine
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEditRecords && (
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Legal Obligation
            </button>
          )}
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
          </button>
          <button
            type="button"
            onClick={() =>
              exportRowsToCsv(
                filtered.map((r) => ({ Act: r.actName, Jurisdiction: r.jurisdiction, Compliance: r.complianceStatus, Verification: r.verificationStatus })),
                'ARSHIEL_Legal_Register.csv'
              )
            }
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Legal Accuracy & Unverified Warning Banner */}
      <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Legal Accuracy Safeguard:</strong> {unverifiedCount} register item(s) are currently marked{' '}
          <span className="font-mono-num font-semibold">UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED</span>. Always confirm current Gazette commencement dates and state rule amendments on official portals (India Code, MoLE, MoEFCC, APPCB, TSPCB, FSSAI). This platform does not replace qualified legal counsel.
        </span>
      </div>

      {/* AI Legal Applicability Advisor (Super Admin Only) */}
      {canEditRecords && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900">
                AI Legal Applicability &amp; Register Generator
              </h2>
              <p className="text-xs text-slate-500">
                Identify applicable Central, Andhra Pradesh, and Telangana statutory frameworks based on industry and establishment profile
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunAiLegalAnalyzer}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              Analyze Applicable Laws
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Industry Sector</label>
              <select
                value={aiIndustry}
                onChange={(e) => setAiIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {INDUSTRIES_LIST.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Primary State Jurisdiction</label>
              <select
                value={aiJurisdiction}
                onChange={(e) => setAiJurisdiction(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Andhra Pradesh & Telangana">Andhra Pradesh &amp; Telangana</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Establishment Details</label>
              <input
                type="text"
                value={aiEstablishment}
                onChange={(e) => setAiEstablishment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {aiResult && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              {aiResult.applicabilityOverview && (
                <p className="text-xs text-slate-700 leading-relaxed">{aiResult.applicabilityOverview}</p>
              )}
              {Array.isArray(aiResult.suggestedItems) && aiResult.suggestedItems.length > 0 && (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {aiResult.suggestedItems.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-slate-900">
                          {item.actName} {item.ruleName ? `— ${item.ruleName}` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.jurisdiction} · {item.classification} · {item.category} · Source: {item.officialSource}
                        </div>
                        <p className="text-xs text-slate-700">{item.requirement}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImportAiSuggestion(item)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Add to Register (Unverified)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Add Legal Requirement Form */}
      {showAddForm && canEditRecords && (
        <form onSubmit={handleAddRequirement} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-slate-900">Add Dynamic Legal Register Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Law / Act Name *"
              value={form.actName}
              onChange={(e) => setForm({ ...form, actName: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Rule / Regulation Name"
              value={form.ruleName}
              onChange={(e) => setForm({ ...form, ruleName: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Section / Rule Reference"
              value={form.sectionRef}
              onChange={(e) => setForm({ ...form, sectionRef: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={form.jurisdiction}
              onChange={(e) =>
                setForm({
                  ...form,
                  jurisdiction: e.target.value,
                  classification: e.target.value.includes('Central') ? 'Central' : 'State',
                })
              }
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {LEGAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Regulatory Authority (e.g. APPCB, TSPCB, CPCB)"
              value={form.authority}
              onChange={(e) => setForm({ ...form, authority: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Official Government Source"
              value={form.officialSource}
              onChange={(e) => setForm({ ...form, officialSource: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="url"
              placeholder="Official Source URL"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={form.verificationStatus}
              onChange={(e) => setForm({ ...form, verificationStatus: e.target.value as LegalVerificationStatus })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED">UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED</option>
              <option value="Verified Against Official Source">Verified Against Official Source</option>
              <option value="Amendment Review Pending">Amendment Review Pending</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Responsible Person"
              value={form.responsiblePerson}
              onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Required Documents"
              value={form.requiredDocs}
              onChange={(e) => setForm({ ...form, requiredDocs: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <textarea
              rows={2}
              placeholder="Compliance Requirement Summary"
              value={form.requirement}
              onChange={(e) => setForm({ ...form, requirement: e.target.value })}
              className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">
              Save Legal Entry
            </button>
          </div>
        </form>
      )}

      {/* Jurisdiction Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          {(['ALL', 'India (Central)', 'Andhra Pradesh', 'Telangana'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setJurisdictionTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                jurisdictionTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? `All Jurisdictions (${legalRequirements.length})` : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Act, rule, authority..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-56"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
          >
            <option value="ALL">All 20 Categories</option>
            {LEGAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Register List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
            No legal requirements match the selected jurisdiction or category filter.
          </div>
        ) : (
          filtered.map((req) => {
            const isUnverified = req.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED';
            return (
              <div
                key={req.id}
                className={`bg-white border rounded-xl p-5 space-y-3 ${
                  isUnverified ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{req.jurisdiction}</span>
                      <span>·</span>
                      <span>{req.classification}</span>
                      <span>·</span>
                      <span>{req.category}</span>
                      <span>·</span>
                      <span className={isUnverified ? 'font-bold text-amber-700' : 'font-medium text-emerald-700'}>
                        {req.verificationStatus}
                      </span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-slate-900">{req.actName}</h3>
                    {req.ruleName && <p className="text-xs text-slate-600">{req.ruleName} {req.sectionRef ? `(${req.sectionRef})` : ''}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={req.complianceStatus}
                      disabled={!canEditRecords}
                      onChange={(e) =>
                        handleStatusUpdate(req, { complianceStatus: e.target.value as LegalComplianceStatus })
                      }
                      className={`px-2.5 py-1.5 text-xs font-semibold border rounded-lg bg-white disabled:opacity-75 ${
                        req.complianceStatus === 'Compliant'
                          ? 'text-emerald-700 border-emerald-300'
                          : req.complianceStatus === 'Non-Compliant'
                          ? 'text-red-700 border-red-300'
                          : 'text-amber-700 border-amber-300'
                      }`}
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Partially Compliant">Partially Compliant</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                    {canEditRecords && isUnverified && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(req, {
                            verificationStatus: 'Verified Against Official Source',
                            lastVerifiedDate: new Date().toISOString().slice(0, 10),
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Source Verified
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{req.requirement}</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div>
                    <span className="block text-slate-400">Regulatory Authority</span>
                    <span className="font-medium text-slate-800">{req.authority || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Frequency &amp; Due Date</span>
                    <span className="font-mono-num font-medium text-slate-800">
                      {req.frequency || '-'} · Due: {req.dueDate || 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Required Docs &amp; Owner</span>
                    <span className="text-slate-800">{req.requiredDocs || '-'} ({req.responsiblePerson || 'Unassigned'})</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Official Source &amp; Verified Date</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-800 truncate">{req.officialSource || '-'}</span>
                      {req.sourceUrl && (
                        <a
                          href={req.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:underline inline-flex items-center gap-0.5 shrink-0"
                        >
                          Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className="font-mono-num text-[10px] text-slate-400">
                      Verified: {req.lastVerifiedDate || 'Pending'} · Effective: {req.effectiveDate || '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
