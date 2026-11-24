import React, { useMemo, useState } from 'react';
import {
  Plus,
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
  Save,
  Loader2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import {
  ISO_STANDARDS_CATALOG,
  INDUSTRIES_LIST,
  createClausesFromStandard,
  calculateIsoScore,
} from '../data/seedCatalog';
import type { ClauseComplianceStatus, IsoAssessmentRecord, IsoClauseItem } from '../types/assurance';
import { exportReportToPdf, exportRowsToExcel, exportDocumentToDocx } from '../utils/exporters';

const COMPLIANCE_STATUSES: ClauseComplianceStatus[] = [
  'Compliant',
  'Partially Compliant',
  'Non-Compliant',
  'Not Applicable',
  'Not Verified',
  'Pending Evidence',
];

export function IsoGapEngine() {
  const { isoAssessments, canEditRecords, createRecord, updateRecord, fetchWithAuth, showToast } = useAssurance();
  const [selectedId, setSelectedId] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [standardCode, setStandardCode] = useState('ISO 45001');
  const [edition, setEdition] = useState('2018');
  const [industry, setIndustry] = useState('Semiconductor');
  const [organizationName, setOrganizationName] = useState('');
  const [siteLocation, setSiteLocation] = useState('Hyderabad, Telangana');
  const [assessmentType, setAssessmentType] = useState('Independent Pre-Certification Gap Analysis');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10));
  const [scope, setScope] = useState('');

  // Active clause AI states
  const [analyzingClauseId, setAnalyzingClauseId] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeAssessment: IsoAssessmentRecord | undefined = useMemo(() => {
    if (selectedId) return isoAssessments.find((a) => a.id === selectedId) || isoAssessments[0];
    return isoAssessments[0];
  }, [isoAssessments, selectedId]);

  const handleStandardChange = (code: string) => {
    setStandardCode(code);
    const spec = ISO_STANDARDS_CATALOG.find((s) => s.code === code);
    if (spec) setEdition(spec.edition);
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const spec = ISO_STANDARDS_CATALOG.find((s) => s.code === standardCode) || ISO_STANDARDS_CATALOG[0];
    const clauses = createClausesFromStandard(spec.code);
    const refNo = `AA-ISO-${new Date().getFullYear()}-${String(isoAssessments.length + 1).padStart(3, '0')}`;

    try {
      const id = await createRecord(
        'isoAssessments',
        'iso',
        {
          referenceNo: refNo,
          standardCode: spec.code,
          standardName: spec.name,
          edition: edition || spec.edition,
          industry,
          organizationName: organizationName.trim() || 'Client Organization',
          siteLocation: siteLocation.trim() || 'Primary Site',
          assessmentType,
          auditDate,
          scope: scope.trim() || `${industry} facility management system gap evaluation`,
          status: 'In Progress',
          complianceScore: 0,
          clauses,
          executiveSummary: '',
        },
        'ISO Gap Analysis',
        'Created ISO Gap Assessment',
        refNo
      );
      setSelectedId(id);
      setShowCreate(false);
      setOrganizationName('');
      setScope('');
      showToast(`Created ${refNo} (${spec.code}) in Firestore.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create assessment.', 'error');
    }
  };

  const handleClauseFieldChange = async (
    clauseId: string,
    patch: Partial<IsoClauseItem>
  ) => {
    if (!activeAssessment) return;
    if (activeAssessment.status === 'Completed') {
      showToast('Completed assessments are locked for retention integrity.', 'warning');
      return;
    }
    const nextClauses = (activeAssessment.clauses || []).map((c) =>
      c.id === clauseId ? { ...c, ...patch } : c
    );
    const nextScore = calculateIsoScore(nextClauses);
    setSaving(true);
    try {
      await updateRecord(
        'isoAssessments',
        activeAssessment.id,
        {
          clauses: nextClauses,
          complianceScore: nextScore,
        },
        'ISO Gap Analysis',
        'Updated Clause Assessment',
        `${activeAssessment.referenceNo} Cl.${nextClauses.find((x) => x.id === clauseId)?.clauseNumber || ''}`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update clause.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRunAiClause = async (clause: IsoClauseItem) => {
    if (!activeAssessment) return;
    setAnalyzingClauseId(clause.id);
    try {
      const res = await fetchWithAuth('/api/ai/iso-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_clause',
          standardCode: activeAssessment.standardCode,
          standardName: activeAssessment.standardName,
          edition: activeAssessment.edition,
          industry: activeAssessment.industry,
          scope: activeAssessment.scope,
          clauseNumber: clause.clauseNumber,
          clauseTitle: clause.clauseTitle,
          requirementSummary: clause.requirementDescription,
          currentEvidence: clause.evidenceNote || clause.evidenceFileName || 'No evidence attached yet',
          status: clause.complianceStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI clause analysis failed');
      const d = json.data || {};
      const aiSummaryNote = [
        d.clauseInterpretation ? `AI Assistance (Non-Authoritative): ${d.clauseInterpretation}` : '',
        Array.isArray(d.assessmentQuestions) && d.assessmentQuestions.length
          ? `Suggested Questions: ${d.assessmentQuestions.join(' | ')}`
          : '',
        Array.isArray(d.missingDocumentation) && d.missingDocumentation.length
          ? `Potential Missing Docs: ${d.missingDocumentation.join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const suggestedRisk = (['Critical', 'High', 'Medium', 'Low'].includes(d.suggestedRisk)
        ? d.suggestedRisk
        : clause.riskClassification) as IsoClauseItem['riskClassification'];

      await handleClauseFieldChange(clause.id, {
        aiAssistedNote: aiSummaryNote,
        gapDescription: clause.gapDescription || d.identifiedGap || '',
        recommendedAction: clause.recommendedAction || d.recommendedAction || '',
        riskClassification: suggestedRisk,
      });
      showToast(`AI guidance added to Clause ${clause.clauseNumber}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'AI clause analysis failed.', 'error');
    } finally {
      setAnalyzingClauseId(null);
    }
  };

  const handleGenerateExecutiveSummary = async () => {
    if (!activeAssessment) return;
    setGeneratingSummary(true);
    try {
      const res = await fetchWithAuth('/api/ai/iso-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executive_summary',
          standardCode: activeAssessment.standardCode,
          standardName: activeAssessment.standardName,
          edition: activeAssessment.edition,
          industry: activeAssessment.industry,
          organizationName: activeAssessment.organizationName,
          siteLocation: activeAssessment.siteLocation,
          complianceScore: activeAssessment.complianceScore,
          clausesSummary: (activeAssessment.clauses || []).map((c) => ({
            clause: `${c.clauseNumber} ${c.clauseTitle}`,
            status: c.complianceStatus,
            risk: c.riskClassification,
            gap: c.gapDescription,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Summary generation failed');
      await updateRecord(
        'isoAssessments',
        activeAssessment.id,
        { executiveSummary: (json.summary || '').slice(0, 5900) },
        'ISO Gap Analysis',
        'Generated AI Executive Summary',
        activeAssessment.referenceNo
      );
      showToast('Executive Gap Summary generated (DRAFT – REVIEW REQUIRED).');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate summary.', 'error');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleStatusChange = async (newStatus: IsoAssessmentRecord['status']) => {
    if (!activeAssessment) return;
    try {
      await updateRecord(
        'isoAssessments',
        activeAssessment.id,
        { status: newStatus },
        'ISO Gap Analysis',
        `Status changed to ${newStatus}`,
        activeAssessment.referenceNo
      );
      showToast(`Assessment marked as ${newStatus}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Status update failed.', 'error');
    }
  };

  const handleExportPdf = () => {
    if (!activeAssessment) return;
    exportReportToPdf({
      title: `ISO Gap Analysis Report — ${activeAssessment.standardCode} (${activeAssessment.edition || ''})`,
      subtitle: `${activeAssessment.organizationName || ''} · ${activeAssessment.siteLocation || ''}`,
      referenceNo: activeAssessment.referenceNo,
      status: `${activeAssessment.status} — Independent Gap Assessment (Not Accredited Certification)`,
      metadata: [
        ['Standard', `${activeAssessment.standardCode} — ${activeAssessment.standardName} (${activeAssessment.edition || 'Current'})`],
        ['Organization & Site', `${activeAssessment.organizationName || '-'} / ${activeAssessment.siteLocation || '-'}`],
        ['Industry & Type', `${activeAssessment.industry || '-'} · ${activeAssessment.assessmentType || '-'}`],
        ['Scope', activeAssessment.scope || '-'],
        ['Calculated Readiness Score', `${activeAssessment.complianceScore}%`],
      ],
      summaryText: activeAssessment.executiveSummary,
      tableHeaders: ['Clause', 'Status', 'Risk', 'Gap Observation', 'Recommended Action', 'Owner / Due'],
      tableRows: (activeAssessment.clauses || []).map((c) => [
        `${c.clauseNumber} ${c.clauseTitle}`,
        c.complianceStatus,
        c.riskClassification,
        c.gapDescription || 'No gap noted',
        c.recommendedAction || '-',
        `${c.responsiblePerson || '-'} (${c.targetDate || '-'})`,
      ]),
      filename: `${activeAssessment.referenceNo}_Gap_Report.pdf`,
    });
    showToast('ISO Gap Analysis PDF exported.');
  };

  const handleExportXlsx = () => {
    if (!activeAssessment) return;
    exportRowsToExcel(
      'ISO_Gap_Clauses',
      (activeAssessment.clauses || []).map((c) => ({
        ClauseNumber: c.clauseNumber,
        ClauseTitle: c.clauseTitle,
        Applicability: c.applicability,
        ImplementationStatus: c.implementationStatus,
        ComplianceStatus: c.complianceStatus,
        RiskClassification: c.riskClassification,
        EvidenceNote: c.evidenceNote,
        GapDescription: c.gapDescription,
        RecommendedAction: c.recommendedAction,
        ResponsiblePerson: c.responsiblePerson,
        TargetDate: c.targetDate,
        ClosureStatus: c.closureStatus,
      })),
      `${activeAssessment.referenceNo}_Clauses.xlsx`
    );
    showToast('ISO Gap Excel exported.');
  };

  const handleExportDocx = async () => {
    if (!activeAssessment) return;
    const bodyLines = [
      '# Executive Summary',
      activeAssessment.executiveSummary || 'Pending executive summary generation.',
      '# Clause-Wise Gap Assessment Matrix',
      ...(activeAssessment.clauses || []).map(
        (c) =>
          `## Clause ${c.clauseNumber} — ${c.clauseTitle}\nStatus: ${c.complianceStatus} | Risk: ${c.riskClassification} | Implementation: ${c.implementationStatus}\nRequirement: ${c.requirementDescription}\nEvidence: ${c.evidenceNote || 'Not recorded'}\nGap: ${c.gapDescription || 'None'}\nRecommended Action: ${c.recommendedAction || 'None'}\nOwner: ${c.responsiblePerson || 'Unassigned'} | Target Date: ${c.targetDate || 'TBD'}`
      ),
    ].join('\n\n');

    await exportDocumentToDocx({
      title: `ISO Gap Analysis Report: ${activeAssessment.standardCode} — ${activeAssessment.standardName}`,
      docNumber: activeAssessment.referenceNo,
      revision: 'Rev 01',
      status: `${activeAssessment.status} (DRAFT – REVIEW REQUIRED)`,
      metadata: [
        ['Organization', activeAssessment.organizationName || '-'],
        ['Site Location', activeAssessment.siteLocation || '-'],
        ['Industry', activeAssessment.industry || '-'],
        ['Readiness Score', `${activeAssessment.complianceScore}%`],
      ],
      bodyText: bodyLines,
      filename: `${activeAssessment.referenceNo}_Gap_Report.docx`,
    });
    showToast('ISO Gap DOCX report exported.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            12 Supported ISO Management Standards · Non-Accredited Independent Gap Assessment
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            AI ISO Gap Analysis Engine
          </h1>
        </div>
        {canEditRecords && (
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New ISO Gap Assessment
          </button>
        )}
      </div>

      {/* Non-Certification Disclaimer Notice */}
      <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Independent Assessment Scope:</strong> Clause overviews and AI interpretations are original advisory assistance — not authoritative ISO standard reproductions or accredited certification audits. ARSHIEL ASSURANCE does not issue official ISO certificates.
        </span>
      </div>

      {/* Create New ISO Assessment Panel */}
      {showCreate && canEditRecords && (
        <form onSubmit={handleCreateAssessment} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Configure New Clause-Wise ISO Gap Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">ISO Standard</label>
              <select
                value={standardCode}
                onChange={(e) => handleStandardChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                {ISO_STANDARDS_CATALOG.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Standard Edition / Version</label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                {INDUSTRIES_LIST.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Telangana Semiconductor Systems Ltd."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Site / Location</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Audit Date</label>
              <input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Type</label>
              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option>Independent Pre-Certification Gap Analysis</option>
                <option>Internal Management System Readiness Review</option>
                <option>Surveillance Preparation Assessment</option>
                <option>Integrated Management System (IMS) Gap Review</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Scope</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Departments, processes, and physical boundaries included in assessment"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Create Assessment &amp; Load Clauses
            </button>
          </div>
        </form>
      )}

      {/* Assessment Selector Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <p className="text-xs font-semibold text-slate-700 px-1">Active Assessments ({isoAssessments.length})</p>
          <div className="space-y-2">
            {isoAssessments.map((asmt) => {
              const active = asmt.id === activeAssessment?.id;
              return (
                <button
                  key={asmt.id}
                  type="button"
                  onClick={() => setSelectedId(asmt.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-num text-xs font-semibold">{asmt.standardCode}</span>
                    <span className={`font-mono-num text-xs font-bold ${active ? 'text-amber-400' : 'text-slate-900'}`}>
                      {asmt.complianceScore}%
                    </span>
                  </div>
                  <p className={`text-xs font-medium truncate ${active ? 'text-slate-100' : 'text-slate-800'}`}>
                    {asmt.organizationName}
                  </p>
                  <p className={`text-[11px] mt-1 truncate ${active ? 'text-slate-400' : 'text-slate-500'}`}>
                    {asmt.referenceNo} · {asmt.status}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Assessment Workspace */}
        <div className="lg:col-span-9 space-y-5">
          {!activeAssessment ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-sm text-slate-600 mb-3">No ISO Gap Assessments available.</p>
              {canEditRecords && (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                >
                  Create First ISO Assessment
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Assessment Header & Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 font-mono-num mb-1">
                      {activeAssessment.referenceNo} · {activeAssessment.standardCode}:{activeAssessment.edition} · {activeAssessment.industry}
                    </div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      {activeAssessment.organizationName} — {activeAssessment.standardName}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Site: {activeAssessment.siteLocation} · Scope: {activeAssessment.scope}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right">
                      <span className="block text-[10px] text-slate-500">Readiness Score</span>
                      <span className="font-mono-num text-base font-bold text-slate-900">
                        {activeAssessment.complianceScore}%
                      </span>
                    </div>
                    <select
                      value={activeAssessment.status}
                      disabled={!canEditRecords}
                      onChange={(e) => handleStatusChange(e.target.value as IsoAssessmentRecord['status'])}
                      className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {canEditRecords && (
                      <button
                        type="button"
                        onClick={handleGenerateExecutiveSummary}
                        disabled={generatingSummary}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-60"
                      >
                        {generatingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                        Generate AI Executive Gap Report
                      </button>
                    )}
                    {saving && (
                      <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" /> Saving...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <FileText className="w-3.5 h-3.5" /> DOCX
                    </button>
                    <button
                      type="button"
                      onClick={handleExportXlsx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
                    </button>
                  </div>
                </div>

                {activeAssessment.executiveSummary && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    <div className="font-semibold text-slate-900 mb-1.5">
                      Executive Management Summary (AI Draft — Competent Review Required)
                    </div>
                    {activeAssessment.executiveSummary}
                  </div>
                )}
              </div>

              {/* Clause-Wise Assessment Table / Cards */}
              <div className="space-y-3">
                {(activeAssessment.clauses || []).map((clause) => (
                  <div key={clause.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono-num font-bold text-slate-900">Clause {clause.clauseNumber}</span>
                          <span>·</span>
                          <span>{clause.applicability}</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              clause.complianceStatus === 'Compliant'
                                ? 'text-emerald-700'
                                : clause.complianceStatus === 'Non-Compliant'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {clause.complianceStatus}
                          </span>
                        </div>
                        <h3 className="font-display text-sm font-bold text-slate-900">{clause.clauseTitle}</h3>
                        <p className="text-xs text-slate-600">{clause.requirementDescription}</p>
                        <p className="text-xs text-slate-700 pt-1">
                          <strong>Assessment Question:</strong> {clause.assessmentQuestion}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <strong>Expected Evidence:</strong> {clause.expectedEvidence}
                        </p>
                      </div>

                      {canEditRecords && (
                        <button
                          type="button"
                          onClick={() => handleRunAiClause(clause)}
                          disabled={analyzingClauseId === clause.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                        >
                          {analyzingClauseId === clause.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-amber-700" />
                          )}
                          AI Interpret &amp; Assess
                        </button>
                      )}
                    </div>

                    {clause.aiAssistedNote && (
                      <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-800 whitespace-pre-wrap">
                        {clause.aiAssistedNote}
                      </div>
                    )}

                    <fieldset disabled={!canEditRecords} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 disabled:opacity-80">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Compliance Status</label>
                        <select
                          value={clause.complianceStatus}
                          onChange={(e) =>
                            handleClauseFieldChange(clause.id, {
                              complianceStatus: e.target.value as ClauseComplianceStatus,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          {COMPLIANCE_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Implementation</label>
                        <select
                          value={clause.implementationStatus}
                          onChange={(e) =>
                            handleClauseFieldChange(clause.id, {
                              implementationStatus: e.target.value as IsoClauseItem['implementationStatus'],
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Implemented">Implemented</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Not Started">Not Started</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Risk Classification</label>
                        <select
                          value={clause.riskClassification}
                          onChange={(e) =>
                            handleClauseFieldChange(clause.id, {
                              riskClassification: e.target.value as IsoClauseItem['riskClassification'],
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Evidence Attachment</label>
                        <label className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer truncate">
                          <Upload className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span className="truncate">{clause.evidenceFileName || 'Attach Reference'}</span>
                          <input
                            type="file"
                            className="hidden"
                            disabled={!canEditRecords}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleClauseFieldChange(clause.id, {
                                  evidenceFileName: `${file.name} (${Math.round(file.size / 1024)} KB)`,
                                });
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Evidence Notes &amp; Gap Description</label>
                        <input
                          type="text"
                          defaultValue={clause.gapDescription}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== clause.gapDescription) {
                              handleClauseFieldChange(clause.id, { gapDescription: e.target.value });
                            }
                          }}
                          placeholder="Record objective evidence summary or identified gap..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Recommended Corrective Action</label>
                        <input
                          type="text"
                          defaultValue={clause.recommendedAction}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== clause.recommendedAction) {
                              handleClauseFieldChange(clause.id, { recommendedAction: e.target.value });
                            }
                          }}
                          placeholder="Enter corrective action plan..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Responsible Person</label>
                        <input
                          type="text"
                          defaultValue={clause.responsiblePerson}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== clause.responsiblePerson) {
                              handleClauseFieldChange(clause.id, { responsiblePerson: e.target.value });
                            }
                          }}
                          placeholder="Action Owner"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Target Date</label>
                        <input
                          type="date"
                          defaultValue={clause.targetDate}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== clause.targetDate) {
                              handleClauseFieldChange(clause.id, { targetDate: e.target.value });
                            }
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Closure Status</label>
                        <select
                          value={clause.closureStatus}
                          onChange={(e) =>
                            handleClauseFieldChange(clause.id, {
                              closureStatus: e.target.value as IsoClauseItem['closureStatus'],
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Auditor Comments</label>
                        <input
                          type="text"
                          defaultValue={clause.auditorComments}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== clause.auditorComments) {
                              handleClauseFieldChange(clause.id, { auditorComments: e.target.value });
                            }
                          }}
                          placeholder="Verification note"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                    </fieldset>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
