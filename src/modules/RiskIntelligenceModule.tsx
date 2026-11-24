import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  CalendarClock,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { exportReportToPdf, exportRowsToExcel } from '../utils/exporters';
import type { RiskCategoryType, RiskRecord } from '../types/assurance';

const RISK_CATEGORIES: RiskCategoryType[] = [
  'Operational',
  'EHS & Safety',
  'Legal & Regulatory',
  'Environmental & ESG',
  'Information Security',
  'Supply Chain',
  'Quality & Product',
  'Business Continuity',
];

const CONTROL_EFFECTIVENESS_OPTIONS: RiskRecord['controlEffectiveness'][] = [
  'Strong',
  'Adequate',
  'Partial',
  'Weak',
];

function getRiskBand(score: number): { label: string; colorClass: string; cellClass: string } {
  if (score >= 16) {
    return {
      label: 'Critical',
      colorClass: 'bg-red-100 text-red-800 dark:bg-red-500/25 dark:text-red-300',
      cellClass: 'bg-red-600/90 text-white hover:bg-red-500',
    };
  }
  if (score >= 10) {
    return {
      label: 'High',
      colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-500/25 dark:text-orange-300',
      cellClass: 'bg-orange-500/90 text-white hover:bg-orange-400',
    };
  }
  if (score >= 5) {
    return {
      label: 'Medium',
      colorClass: 'bg-amber-100 text-amber-900 dark:bg-amber-500/25 dark:text-amber-300',
      cellClass: 'bg-amber-400/90 text-slate-950 hover:bg-amber-300',
    };
  }
  return {
    label: 'Low',
    colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-300',
    cellClass: 'bg-emerald-500/85 text-white hover:bg-emerald-400',
  };
}

export function RiskIntelligenceModule() {
  const {
    canEditRecords,
    risks,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchWithAuth,
    showToast,
  } = useAssurance();

  const [matrixMode, setMatrixMode] = useState<'residual' | 'inherent'>('residual');
  const [selectedCell, setSelectedCell] = useState<{ l: number; c: number } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RiskCategoryType>('EHS & Safety');
  const [industry, setIndustry] = useState('Manufacturing & Industrial');
  const [siteLocation, setSiteLocation] = useState('Hyderabad Facility');
  const [department, setDepartment] = useState('Operations / EHS');
  const [standardRef, setStandardRef] = useState('ISO 45001:2018 / ISO 31000');
  const [hazardOrThreat, setHazardOrThreat] = useState('');
  const [existingControls, setExistingControls] = useState('');
  const [likelihood, setLikelihood] = useState(4);
  const [consequence, setConsequence] = useState(4);
  const [controlEffectiveness, setControlEffectiveness] = useState<RiskRecord['controlEffectiveness']>('Partial');
  const [residualLikelihood, setResidualLikelihood] = useState(2);
  const [residualConsequence, setResidualConsequence] = useState(3);
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [riskOwner, setRiskOwner] = useState('');
  const [reviewDate, setReviewDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  // AI Risk Suggestions panel
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<{
    title?: string;
    executiveSummary?: string;
    keyFindingsOrRisks?: string[];
    recommendedActions?: string[];
  } | null>(null);

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (selectedCell) {
        const l = matrixMode === 'residual' ? r.residualLikelihood : r.likelihood;
        const c = matrixMode === 'residual' ? r.residualConsequence : r.consequence;
        if (l !== selectedCell.l || c !== selectedCell.c) return false;
      }
      return true;
    });
  }, [risks, categoryFilter, selectedCell, matrixMode]);

  const summary = useMemo(() => {
    const critical = risks.filter((r) => r.residualScore >= 16 && r.status !== 'Closed').length;
    const high = risks.filter((r) => r.residualScore >= 10 && r.residualScore < 16 && r.status !== 'Closed').length;
    const avgReduction =
      risks.length > 0
        ? Math.round(
            (risks.reduce((acc, r) => acc + Math.max(0, r.inherentScore - r.residualScore), 0) /
              Math.max(1, risks.reduce((acc, r) => acc + r.inherentScore, 0))) *
              100
          )
        : 0;
    const today = new Date().toISOString().slice(0, 10);
    const dueReviews = risks.filter((r) => r.reviewDate && r.reviewDate <= today && r.status !== 'Closed').length;
    return { critical, high, avgReduction, dueReviews };
  }, [risks]);

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!title.trim() || !hazardOrThreat.trim()) {
      showToast('Risk title and hazard/threat description are required.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const ref = `RSK-${new Date().getFullYear()}-${String(risks.length + 1).padStart(3, '0')}`;
      const inherentScore = likelihood * consequence;
      const residualScore = residualLikelihood * residualConsequence;
      await createRecord(
        'risks',
        'rsk',
        {
          riskRef: ref,
          title: title.trim(),
          category,
          industry: industry.trim(),
          siteLocation: siteLocation.trim(),
          department: department.trim(),
          standardRef: standardRef.trim(),
          hazardOrThreat: hazardOrThreat.trim(),
          existingControls: existingControls.trim(),
          likelihood,
          consequence,
          inherentScore,
          controlEffectiveness,
          residualLikelihood,
          residualConsequence,
          residualScore,
          mitigationPlan: mitigationPlan.trim(),
          riskOwner: riskOwner.trim() || 'Operations Risk Owner',
          reviewDate,
          status: 'Open',
          aiRecommended: Boolean(aiDraft),
        },
        'Risk Intelligence',
        'Registered Enterprise Risk',
        ref
      );
      showToast(`Risk ${ref} added to the 5x5 Enterprise Risk Register.`);
      setTitle('');
      setHazardOrThreat('');
      setExistingControls('');
      setMitigationPlan('');
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleRunAiRiskIntel = async () => {
    if (!canEditRecords) return;
    setAiLoading(true);
    try {
      const res = await fetchWithAuth('/api/ai/enterprise-engine', {
        method: 'POST',
        body: JSON.stringify({
          engineMode: 'risk_intelligence',
          standardCode: standardRef,
          country: 'India',
          stateRegion: siteLocation,
          industry,
          organizationName: 'ARSHIEL Enterprise Workspace',
          siteLocation,
          contextInput: `Category focus: ${category}. Existing tracked risks: ${risks.length}. Identify top emerging operational, EHS, legal, ESG, and information security risks with control recommendations.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI risk intelligence request failed.');
      setAiDraft(json.data || null);
      showToast('AI Risk Intelligence draft generated (Review Required).');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to generate AI risk intelligence.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportExcel = () => {
    exportRowsToExcel(
      'Enterprise_Risks',
      filteredRisks.map((r) => ({
        Ref: r.riskRef,
        Title: r.title,
        Category: r.category,
        Site: r.siteLocation || '-',
        InherentLxC: `${r.likelihood}x${r.consequence}=${r.inherentScore}`,
        ControlEffectiveness: r.controlEffectiveness,
        ResidualLxC: `${r.residualLikelihood}x${r.residualConsequence}=${r.residualScore}`,
        ResidualBand: getRiskBand(r.residualScore).label,
        Owner: r.riskOwner || '-',
        ReviewDate: r.reviewDate || '-',
        Status: r.status,
      })),
      `ARSHIEL_Risk_Register_${new Date().toISOString().slice(0, 10)}`
    );
    showToast('Risk register exported to Excel.');
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: 'Enterprise Risk Intelligence & 5x5 Matrix Register',
      subtitle: 'Division 08 · Inherent vs Residual Risk Assessment (ISO 31000 / ISO 45001 / ISO 27001)',
      referenceNo: `RSK-REG-${new Date().toISOString().slice(0, 10)}`,
      status: `${summary.critical} CRITICAL · ${summary.high} HIGH RESIDUAL`,
      metadata: [
        ['Total Risks Monitored', String(risks.length)],
        ['Critical / High Residual Open', `${summary.critical} / ${summary.high}`],
        ['Average Control Risk Reduction', `${summary.avgReduction}%`],
        ['Overdue Risk Reviews', String(summary.dueReviews)],
      ],
      tableHeaders: ['Ref', 'Risk Title', 'Category', 'Inherent', 'Residual', 'Control', 'Status'],
      tableRows: filteredRisks.slice(0, 40).map((r) => [
        r.riskRef,
        r.title,
        r.category,
        String(r.inherentScore),
        `${r.residualScore} (${getRiskBand(r.residualScore).label})`,
        r.controlEffectiveness,
        r.status,
      ]),
      filename: `ARSHIEL_Risk_Intelligence_${new Date().toISOString().slice(0, 10)}`,
    });
    showToast('Risk intelligence report exported to PDF.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 08 · Intelligence &amp; Security — Interactive 5×5 Heat Map · Inherent vs Residual Risk Scoring
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Enterprise Risk Intelligence &amp; 5×5 Heat Map
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
            <>
              <button
                type="button"
                onClick={handleRunAiRiskIntel}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-[#071329] rounded-lg cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                AI Risk Scan
              </button>
              <button
                type="button"
                onClick={() => setFormOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Register Risk
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Risks Monitored</div>
          <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">{risks.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Across 8 enterprise domains</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Critical / High Residual</div>
          <div className="font-mono-num text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {summary.critical} / {summary.high}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Score &ge; 16 Critical · &ge; 10 High</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Control Risk Reduction</div>
          <div className="font-mono-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.avgReduction}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Inherent to residual delta</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Due Risk Reviews</span>
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {summary.dueReviews}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Scheduled review date passed</div>
        </div>
      </div>

      {/* AI Risk Intelligence Output Banner */}
      {aiDraft && (
        <div className="bg-amber-50/80 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-600/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200 font-display text-sm font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {aiDraft.title || 'AI Risk Intelligence Suggestions'} — DRAFT · HUMAN REVIEW REQUIRED
            </div>
            <button
              type="button"
              onClick={() => setAiDraft(null)}
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          {aiDraft.executiveSummary && (
            <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">{aiDraft.executiveSummary}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {aiDraft.keyFindingsOrRisks && aiDraft.keyFindingsOrRisks.length > 0 && (
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1.5">Suggested Emerging Risks</div>
                <ul className="space-y-1 text-amber-950 dark:text-amber-100 list-disc pl-4">
                  {aiDraft.keyFindingsOrRisks.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiDraft.recommendedActions && aiDraft.recommendedActions.length > 0 && (
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1.5">Recommended Mitigations</div>
                <ul className="space-y-1 text-amber-950 dark:text-amber-100 list-disc pl-4">
                  {aiDraft.recommendedActions.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Registration Form */}
      {formOpen && canEditRecords && (
        <form
          onSubmit={handleCreateRisk}
          className="bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#087BFF]/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3.5"
        >
          <div className="md:col-span-4 font-display text-sm font-bold text-slate-900 dark:text-white">
            Register Risk Assessment (Inherent vs Residual 5×5 Scoring)
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Risk Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="High-Voltage Switchgear Arc-Flash Exposure During Maintenance"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RiskCategoryType)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Standard Reference</label>
            <input
              type="text"
              value={standardRef}
              onChange={(e) => setStandardRef(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Hazard / Threat Description *</label>
            <input
              type="text"
              required
              value={hazardOrThreat}
              onChange={(e) => setHazardOrThreat(e.target.value)}
              placeholder="Unverified LOTO isolation during energized panel servicing"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Site / Location</label>
            <input
              type="text"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Risk Owner</label>
            <input
              type="text"
              value={riskOwner}
              onChange={(e) => setRiskOwner(e.target.value)}
              placeholder="Plant EHS Manager"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Inherent Likelihood (1–5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={likelihood}
              onChange={(e) => setLikelihood(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Inherent Consequence (1–5) · Score = {likelihood * consequence}
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={consequence}
              onChange={(e) => setConsequence(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Residual Likelihood (1–5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={residualLikelihood}
              onChange={(e) => setResidualLikelihood(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Residual Consequence (1–5) · Score = {residualLikelihood * residualConsequence}
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={residualConsequence}
              onChange={(e) => setResidualConsequence(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Control Effectiveness</label>
            <select
              value={controlEffectiveness}
              onChange={(e) => setControlEffectiveness(e.target.value as RiskRecord['controlEffectiveness'])}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              {CONTROL_EFFECTIVENESS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Next Review Date</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Existing Controls</label>
            <input
              type="text"
              value={existingControls}
              onChange={(e) => setExistingControls(e.target.value)}
              placeholder="LOTO SOP, Arc-Flash PPE, PTW"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Mitigation Action Plan</label>
            <input
              type="text"
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              placeholder="Install infrared inspection windows & quarterly LOTO drills"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-end gap-2">
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
              {saving ? 'Saving...' : 'Save to Risk Register'}
            </button>
          </div>
        </form>
      )}

      {/* Interactive 5x5 Heat Map + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Interactive 5×5 Enterprise Risk Heat Map
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any cell to filter the risk register below by Likelihood × Consequence
              </p>
            </div>
            <div className="inline-flex bg-slate-100 dark:bg-[#071329] p-1 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMatrixMode('residual');
                  setSelectedCell(null);
                }}
                className={`px-2.5 py-1 rounded-md cursor-pointer ${
                  matrixMode === 'residual' ? 'bg-white dark:bg-[#087BFF] text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Residual Risk
              </button>
              <button
                type="button"
                onClick={() => {
                  setMatrixMode('inherent');
                  setSelectedCell(null);
                }}
                className={`px-2.5 py-1 rounded-md cursor-pointer ${
                  matrixMode === 'inherent' ? 'bg-white dark:bg-[#087BFF] text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Inherent Risk
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-6 gap-1.5 text-center text-[11px]">
                <div className="flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase">
                  L \ C
                </div>
                {[1, 2, 3, 4, 5].map((c) => (
                  <div key={c} className="py-1 font-semibold text-slate-600 dark:text-slate-300">
                    C{c}
                  </div>
                ))}

                {[5, 4, 3, 2, 1].map((l) => (
                  <React.Fragment key={l}>
                    <div className="flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300">
                      L{l}
                    </div>
                    {[1, 2, 3, 4, 5].map((c) => {
                      const score = l * c;
                      const band = getRiskBand(score);
                      const count = risks.filter((r) => {
                        const rl = matrixMode === 'residual' ? r.residualLikelihood : r.likelihood;
                        const rc = matrixMode === 'residual' ? r.residualConsequence : r.consequence;
                        return rl === l && rc === c;
                      }).length;
                      const isSelected = selectedCell?.l === l && selectedCell?.c === c;
                      return (
                        <button
                          key={`${l}-${c}`}
                          type="button"
                          onClick={() =>
                            setSelectedCell((prev) => (prev?.l === l && prev?.c === c ? null : { l, c }))
                          }
                          className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                            band.cellClass
                          } ${isSelected ? 'ring-2 ring-slate-900 dark:ring-white scale-[1.03]' : ''}`}
                        >
                          <span className="font-mono-num text-sm font-bold leading-none">{count}</span>
                          <span className="text-[9.5px] opacity-85 font-mono-num mt-0.5">({score})</span>
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {selectedCell && (
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#071329] px-3 py-2 rounded-lg">
              <span className="text-slate-700 dark:text-slate-200">
                Filtered by <strong>{matrixMode === 'residual' ? 'Residual' : 'Inherent'} L{selectedCell.l} × C{selectedCell.c}</strong> (Score {selectedCell.l * selectedCell.c})
              </span>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="text-[#087BFF] font-semibold hover:underline cursor-pointer"
              >
                Clear cell filter
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#087BFF]" />
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Risk Distribution by Domain
            </h2>
          </div>
          <div className="space-y-2">
            {RISK_CATEGORIES.map((cat) => {
              const items = risks.filter((r) => r.category === cat);
              const highCrit = items.filter((r) => r.residualScore >= 10 && r.status !== 'Closed').length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter((curr) => (curr === cat ? 'ALL' : cat))}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-blue-50 dark:bg-[#087BFF]/20 border-[#087BFF] text-slate-900 dark:text-white font-semibold'
                      : 'bg-slate-50/60 dark:bg-[#071329] border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="font-mono-num flex items-center gap-2">
                    {highCrit > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/25 text-red-700 dark:text-red-300 text-[10px] font-bold">
                        {highCrit} high+
                      </span>
                    )}
                    <span className="font-bold">{items.length}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Enterprise Risk Register ({filteredRisks.length} shown)
          </div>
          {categoryFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setCategoryFilter('ALL')}
              className="text-xs text-[#087BFF] font-semibold hover:underline cursor-pointer"
            >
              Show All Domains
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Ref &amp; Domain</th>
                <th className="px-4 py-3 font-semibold">Risk &amp; Hazard</th>
                <th className="px-4 py-3 font-semibold text-center">Inherent</th>
                <th className="px-4 py-3 font-semibold text-center">Residual</th>
                <th className="px-4 py-3 font-semibold">Control / Owner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No risk records match the active filter. Super Admin can click &quot;Register Risk&quot; or run an &quot;AI Risk Scan&quot;.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((r) => {
                  const resBand = getRiskBand(r.residualScore);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono-num font-semibold text-slate-900 dark:text-white">{r.riskRef}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.category}</div>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white">{r.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{r.hazardOrThreat}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono-num font-semibold text-slate-700 dark:text-slate-300">
                        {r.inherentScore} <span className="text-[10px] text-slate-400">({r.likelihood}×{r.consequence})</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-md font-mono-num text-[11px] font-bold ${resBand.colorClass}`}>
                          {r.residualScore} · {resBand.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{r.controlEffectiveness}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {r.riskOwner || 'Unassigned'} · Rev {r.reviewDate || 'TBD'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {canEditRecords ? (
                          <div className="inline-flex items-center gap-1">
                            {r.status !== 'Controlled' && r.status !== 'Closed' && (
                              <button
                                type="button"
                                title="Mark Controlled"
                                onClick={() =>
                                  updateRecord('risks', r.id, { status: 'Controlled' }, 'Risk Intelligence', 'Marked Risk Controlled', r.riskRef)
                                }
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete Risk"
                              onClick={() =>
                                deleteRecord('risks', r.id, 'Risk Intelligence', 'Deleted Risk', r.riskRef)
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
