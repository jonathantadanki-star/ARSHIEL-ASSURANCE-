import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  FileText,
  Scale,
  CheckCircle2,
  ClipboardCheck,
  SearchCheck,
  Loader2,
  Save,
  Download,
  Lock,
  Trash2,
  FileDown,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { exportDocumentToDocx, exportReportToPdf } from '../utils/exporters';
import { INDUSTRIES_LIST } from '../data/seedCatalog';

type EngineModeId =
  | 'risk_intelligence'
  | 'capa_recommendations'
  | 'compliance_assistant'
  | 'evidence_analysis'
  | 'report_generator';

interface AiDraftResult {
  title: string;
  draftStatus: string;
  executiveSummary: string;
  keyFindingsOrRisks: string[];
  auditQuestions: string[];
  recommendedActions: string[];
  fullDraftMarkdown: string;
  governanceDisclaimer: string;
}

const AI_ENGINE_MODES: Array<{
  id: EngineModeId;
  label: string;
  docCategory: 'Risk Management' | 'Safety' | 'Audit' | 'Food Safety';
  docType: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}> = [
  {
    id: 'risk_intelligence',
    label: 'AI Risk Intelligence',
    docCategory: 'Risk Management',
    docType: 'AI Risk Intelligence Assessment',
    description: 'Identify inherent/residual hazards, compliance risks, control gaps & mitigation plans.',
    icon: ShieldAlert,
    placeholder: 'Describe facility operations, hazardous processes, IT systems, or supply chain risks...',
  },
  {
    id: 'evidence_analysis',
    label: 'AI Evidence Analysis',
    docCategory: 'Audit',
    docType: 'AI Audit Evidence Review',
    description: 'Screen audit evidence excerpts for missing ISO requirements & targeted follow-up questions.',
    icon: SearchCheck,
    placeholder: 'Paste procedure excerpts, calibration records, training logs, or site evidence notes for gap screening...',
  },
  {
    id: 'capa_recommendations',
    label: 'AI CAPA Recommendations',
    docCategory: 'Audit',
    docType: 'AI CAPA & Root Cause Draft',
    description: 'Draft 5-Why / Ishikawa 6M root cause analysis, containment, corrective & preventive actions.',
    icon: ClipboardCheck,
    placeholder: 'Describe the audit non-conformity, incident observation, or recurring process deviation...',
  },
  {
    id: 'compliance_assistant',
    label: 'AI Compliance Assistant',
    docCategory: 'Safety',
    docType: 'AI Legal & ESG Compliance Brief',
    description: 'Map country/state statutory registers, ESG Scope 1-3 expectations & official verification steps.',
    icon: Scale,
    placeholder: 'Specify state/country, factory manpower, chemical storage, wastewater, or ESG reporting scope...',
  },
  {
    id: 'report_generator',
    label: 'AI Report Generator',
    docCategory: 'Audit',
    docType: 'AI Executive Assurance Report',
    description: 'Compile draft executive audit summaries, 30-60-90 day roadmaps & management review briefs.',
    icon: FileText,
    placeholder: 'Enter audit scope, compliance score, major/minor finding counts, and priority closure themes...',
  },
];

const ISO_STANDARDS = [
  'ISO 9001:2015 (Quality)',
  'ISO 14001:2015 (Environment)',
  'ISO 45001:2018 (OH&S)',
  'ISO 27001:2022 (Information Security)',
  'ISO 50001:2018 (Energy)',
  'ISO 22000:2018 (Food Safety)',
  'ISO 22301:2019 (Business Continuity)',
  'ISO 13485:2016 (Medical Devices)',
  'ISO 37001:2016 (Anti-Bribery)',
  'ISO 37301:2021 (Compliance)',
  'ISO 14064-1 (GHG Carbon)',
  'ISO 26000 (Social Responsibility)',
];

export function AiIntelligenceHubModule() {
  const {
    userProfile,
    canEditRecords,
    documents,
    organizations,
    fetchWithAuth,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [engineMode, setEngineMode] = useState<EngineModeId>('risk_intelligence');
  const [standardCode, setStandardCode] = useState(ISO_STANDARDS[2]);
  const [country, setCountry] = useState('India');
  const [stateRegion, setStateRegion] = useState('Telangana / Andhra Pradesh');
  const [industry, setIndustry] = useState(INDUSTRIES_LIST[0] || 'Manufacturing & Industrial');
  const [organizationName, setOrganizationName] = useState(organizations[0]?.name || 'ARSHIEL Client Facility');
  const [siteLocation, setSiteLocation] = useState('Hyderabad Industrial Estate');
  const [contextInput, setContextInput] = useState('');

  const [generating, setGenerating] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [result, setResult] = useState<AiDraftResult | null>(null);
  const [editableMarkdown, setEditableMarkdown] = useState('');

  const activeConfig = useMemo(
    () => AI_ENGINE_MODES.find((m) => m.id === engineMode) || AI_ENGINE_MODES[0],
    [engineMode]
  );

  const aiHistoryDocs = useMemo(
    () => documents.filter((d) => d.aiGenerated || d.docNumber.startsWith('AA-AI-')),
    [documents]
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) {
      showToast('AI Intelligence Studio generation is restricted to Super Admin.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetchWithAuth('/api/ai/enterprise-engine', {
        method: 'POST',
        body: JSON.stringify({
          engineMode,
          standardCode,
          country,
          stateRegion,
          industry,
          organizationName,
          siteLocation,
          contextInput:
            contextInput.trim() ||
            `Run ${activeConfig.label} for ${industry} under ${standardCode} at ${siteLocation}, ${stateRegion}, ${country}.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI generation failed.');
      const data: AiDraftResult = {
        title: json.data?.title || `${activeConfig.label} — ${standardCode}`,
        draftStatus: 'DRAFT – REVIEW REQUIRED',
        executiveSummary: json.data?.executiveSummary || '',
        keyFindingsOrRisks: Array.isArray(json.data?.keyFindingsOrRisks) ? json.data.keyFindingsOrRisks : [],
        auditQuestions: Array.isArray(json.data?.auditQuestions) ? json.data.auditQuestions : [],
        recommendedActions: Array.isArray(json.data?.recommendedActions) ? json.data.recommendedActions : [],
        fullDraftMarkdown: json.data?.fullDraftMarkdown || '',
        governanceDisclaimer:
          json.data?.governanceDisclaimer ||
          'DRAFT – REVIEW REQUIRED. AI-generated advisory output requires competent human verification before operational use.',
      };
      setResult(data);
      setEditableMarkdown(data.fullDraftMarkdown || data.executiveSummary);
      showToast(`${activeConfig.label} draft generated (Marked DRAFT – REVIEW REQUIRED).`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to execute AI engine.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToDocumentRegister = async () => {
    if (!canEditRecords || !result) return;
    setSavingDraft(true);
    try {
      const docNumber = `AA-AI-${new Date().getFullYear()}-${String(aiHistoryDocs.length + 1).padStart(3, '0')}`;
      const compiledBody = [
        `# ${result.title}`,
        `**Governance Status:** DRAFT – REVIEW REQUIRED`,
        `**Scope:** ${standardCode} | ${industry} | ${siteLocation}, ${stateRegion}, ${country}`,
        '',
        '## Executive Summary',
        result.executiveSummary,
        '',
        result.keyFindingsOrRisks.length > 0
          ? `## Key Findings / Risks\n${result.keyFindingsOrRisks.map((x) => `- ${x}`).join('\n')}`
          : '',
        result.auditQuestions.length > 0
          ? `## Targeted Audit Questions\n${result.auditQuestions.map((x) => `- ${x}`).join('\n')}`
          : '',
        result.recommendedActions.length > 0
          ? `## Recommended Actions\n${result.recommendedActions.map((x) => `- ${x}`).join('\n')}`
          : '',
        '',
        '## Detailed Draft Output',
        editableMarkdown,
        '',
        `> ${result.governanceDisclaimer}`,
      ]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 48000);

      await createRecord(
        'documents',
        'aidoc',
        {
          docNumber,
          revisionNumber: 'Rev 0.1 (AI Draft)',
          issueDate: new Date().toISOString().slice(0, 10),
          docCategory: activeConfig.docCategory,
          docType: activeConfig.docType,
          title: result.title.slice(0, 230),
          industry: industry.slice(0, 115),
          department: 'Assurance & Compliance',
          standardRef: standardCode.slice(0, 230),
          siteConditions: `${organizationName} — ${siteLocation}, ${stateRegion}, ${country}`.slice(0, 1400),
          content: compiledBody,
          status: 'DRAFT – REVIEW REQUIRED',
          preparedBy: `${userProfile?.displayName || 'Super Admin'} (AI-Assisted)`,
          aiGenerated: true,
          revisionNotes: `Generated via Division 01 ${activeConfig.label}. Pending competent human review.`,
        },
        'AI Intelligence Studio',
        'Saved AI Draft Document',
        docNumber
      );
      showToast(`AI Draft saved to Document Control as ${docNumber}.`);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDownloadPdf = (titleText: string, docRef: string, statusText: string, bodyText: string) => {
    exportReportToPdf({
      title: titleText,
      subtitle: `Division 01 · AI Intelligence Studio (${standardCode})`,
      referenceNo: docRef,
      status: statusText,
      metadata: [
        ['Standard / Framework', standardCode],
        ['Jurisdiction', `${country} / ${stateRegion}`],
        ['Industry & Site', `${industry} · ${siteLocation}`],
        ['Governance Control', statusText],
      ],
      summaryText: bodyText,
      tableHeaders: [],
      tableRows: [],
      filename: `${docRef}_ARSHIEL_AI_Output`,
    });
    showToast('AI output exported to PDF.');
  };

  const handleDownloadDocx = async (titleText: string, docRef: string, statusText: string, bodyText: string) => {
    await exportDocumentToDocx({
      title: titleText,
      docNumber: docRef,
      revision: 'Rev 0.1',
      status: statusText,
      metadata: [
        ['Standard / Framework', standardCode],
        ['Jurisdiction', `${country} / ${stateRegion}`],
        ['Industry', industry],
        ['Organization & Site', `${organizationName} — ${siteLocation}`],
      ],
      bodyText,
      filename: `${docRef}_ARSHIEL_AI_Output`,
    });
    showToast('AI output exported to DOCX.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 01 · AI Intelligence Engines — Risk Intelligence · Evidence Analysis · CAPA · Compliance · Reports
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ARSHIEL AI Intelligence Studio
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-600/40 text-xs font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          AI Governance Active: All Outputs Marked DRAFT – REVIEW REQUIRED
        </div>
      </div>

      {/* Mode Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {AI_ENGINE_MODES.map((m) => {
          const Icon = m.icon;
          const active = engineMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setEngineMode(m.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? 'bg-[#071329] text-white border-[#087BFF] shadow-md'
                  : 'bg-white dark:bg-[#0B1F3A] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-[#087BFF]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#00D4FF]' : 'text-[#087BFF]'}`} />
                <span className="font-display text-xs font-bold">{m.label}</span>
              </div>
              <p className={`text-[11px] leading-snug ${active ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {m.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Input & Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              {activeConfig.label} Parameters
            </h2>
            {!canEditRecords && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                <Lock className="w-3 h-3" /> Super Admin Only
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Applicable ISO Standard / Framework
            </label>
            <select
              value={standardCode}
              onChange={(e) => setStandardCode(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              {ISO_STANDARDS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">State / Region</label>
              <input
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Industry Sector</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              {INDUSTRIES_LIST.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Organization</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Facility / Site</label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Evidence / Audit Context / Non-Conformity Details
            </label>
            <textarea
              rows={5}
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder={activeConfig.placeholder}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>

          {canEditRecords ? (
            <button
              type="submit"
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#F5B82E]" />}
              {generating ? `Running ${activeConfig.label}...` : `Generate ${activeConfig.label} Draft`}
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-600/30 text-[11px] text-amber-900 dark:text-amber-200">
              AI generation is locked to Super Admin. You can review and download approved AI drafts in the history register below.
            </div>
          )}
        </form>

        {/* Live Editable Draft Output */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-14 px-4 space-y-3">
              <Sparkles className="w-9 h-9 text-[#087BFF]" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Ready to Run {activeConfig.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Select an ISO standard, country/state jurisdiction, industry, and context on the left. Every output is automatically flagged <strong>DRAFT – REVIEW REQUIRED</strong> for competent human review, editing, approval, and PDF/DOCX export.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
                <div>
                  <span className="inline-flex px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-[10.5px] font-bold">
                    {result.draftStatus}
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-1">
                    {result.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {canEditRecords && (
                    <button
                      type="button"
                      onClick={handleSaveToDocumentRegister}
                      disabled={savingDraft}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {savingDraft ? 'Saving...' : 'Save Draft'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(result.title, 'AA-AI-DRAFT', result.draftStatus, editableMarkdown)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocx(result.title, 'AA-AI-DRAFT', result.draftStatus, editableMarkdown)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#071329] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" /> DOCX
                  </button>
                </div>
              </div>

              {result.executiveSummary && (
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-[#071329] p-3 rounded-lg border border-slate-200/70 dark:border-white/10">
                  {result.executiveSummary}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {result.keyFindingsOrRisks.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1.5">Key Findings / Risks</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {result.keyFindingsOrRisks.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.recommendedActions.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/70 dark:border-white/10">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1.5">Recommended Actions</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                      {result.recommendedActions.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {result.auditQuestions.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-[#087BFF]/10 border border-blue-200/70 dark:border-[#087BFF]/30 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1.5">Targeted Audit Verification Questions</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-200">
                    {result.auditQuestions.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Editable Draft Content (Review &amp; Refine Before Saving)
                </label>
                <textarea
                  rows={7}
                  value={editableMarkdown}
                  onChange={(e) => setEditableMarkdown(e.target.value)}
                  readOnly={!canEditRecords}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071329] dark:text-slate-100 border border-slate-300 dark:border-white/15 rounded-lg"
                />
              </div>

              <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2">
                {result.governanceDisclaimer}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved AI-Generated Document History */}
      <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              AI-Generated Document History &amp; Approval Workflow
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All AI drafts remain flagged DRAFT – REVIEW REQUIRED until verified and approved by Super Admin
            </p>
          </div>
          <span className="font-mono-num text-xs font-semibold text-slate-500 dark:text-slate-400">
            {aiHistoryDocs.length} drafts
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Doc No &amp; Type</th>
                <th className="px-4 py-3 font-semibold">Title &amp; Standard</th>
                <th className="px-4 py-3 font-semibold">Issue Date</th>
                <th className="px-4 py-3 font-semibold">Governance Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {aiHistoryDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No AI drafts saved yet. Run any Division 01 AI Intelligence engine above and save to build your controlled AI history.
                  </td>
                </tr>
              ) : (
                aiHistoryDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono-num font-semibold text-slate-900 dark:text-white">{doc.docNumber}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{doc.docType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{doc.standardRef || doc.industry}</div>
                    </td>
                    <td className="px-4 py-3 font-mono-num text-slate-600 dark:text-slate-300">{doc.issueDate || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Download PDF"
                          onClick={() => handleDownloadPdf(doc.title, doc.docNumber, doc.status, doc.content || '')}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-[#087BFF] rounded-md cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canEditRecords && doc.status !== 'Approved' && (
                          <button
                            type="button"
                            title="Approve Reviewed AI Draft"
                            onClick={() =>
                              updateRecord(
                                'documents',
                                doc.id,
                                {
                                  status: 'Approved',
                                  approvedBy: userProfile?.displayName || 'Super Admin',
                                  reviewedBy: userProfile?.displayName || 'Super Admin',
                                },
                                'AI Intelligence Studio',
                                'Approved AI Draft Document',
                                doc.docNumber
                              )
                            }
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {canEditRecords && (
                          <button
                            type="button"
                            title="Delete Draft"
                            onClick={() =>
                              deleteRecord('documents', doc.id, 'AI Intelligence Studio', 'Deleted AI Draft', doc.docNumber)
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
