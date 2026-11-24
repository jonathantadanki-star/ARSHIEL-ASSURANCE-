import React, { useMemo, useState } from 'react';
import {
  Plus,
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowRightCircle,
  Camera,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import {
  EHS_AUDIT_CATEGORIES,
  INDUSTRIES_LIST,
  calculateAuditScore,
} from '../data/seedCatalog';
import type {
  AuditChecklistItem,
  AuditEngineType,
  AuditFindingItem,
  AuditRecord,
  FindingSeverity,
} from '../types/assurance';
import { exportReportToPdf, exportRowsToExcel, exportDocumentToDocx } from '../utils/exporters';
import { validateClientFileUpload } from '../security/rbac';

const ENGINE_META: Record<
  AuditEngineType,
  { title: string; subtitle: string; refPrefix: string; restrictionNote: string; categories: string[] }
> = {
  EHS: {
    title: 'AI EHS Audit Engine',
    subtitle: 'Dynamic Multi-Industry EHS Auditing · 25 Core Safety Categories · Independent Assessment',
    refPrefix: 'AA-EHS',
    restrictionNote:
      'Independent non-statutory EHS assessment. Statutory safety audits mandated under State Factories Rules require Government-authorized Safety Auditors.',
    categories: EHS_AUDIT_CATEGORIES,
  },
  'Food Safety': {
    title: 'Food Safety Audit Engine',
    subtitle: 'ISO 22000 · HACCP · Cold Chain · Allergen Control · Commercial Kitchen & Processing Hygiene',
    refPrefix: 'AA-FS',
    restrictionNote:
      'Independent food safety & hygiene assessment. Official food sampling, statutory inspections, and FSSAI licensing remain exclusively under FSSAI / NABL-notified authorities.',
    categories: [
      'Food Hygiene & Sanitation',
      'HACCP & CCP Monitoring',
      'Cold Chain & Temperature Control',
      'Allergen Management',
      'Cross Contamination Control',
      'Pest Control & Premises',
      'Personal Hygiene & Medical Fitness',
      'Food Storage & Traceability',
      'Commercial Kitchen & Catering Safety',
    ],
  },
  'Fire & Life Safety': {
    title: 'Fire & Life Safety Audit Engine',
    subtitle: 'NFPA-Based Assessments · Fire Pump Room · Egress & Exits · Extinguishers · Hot Work & Electrical Fire Risk',
    refPrefix: 'AA-FLS',
    restrictionNote:
      'Independent NFPA-based fire safety assessment. Statutory Fire NOC issuance, regulated fire system certification, and government fire inspections are restricted to authorized authorities.',
    categories: [
      'Fire Risk Assessment',
      'Fire Alarm & Detection Systems',
      'Fire Protection & Sprinkler Review',
      'Fire Extinguisher Checklist',
      'Emergency Exit & Egress Assessment',
      'Fire Drill Evaluation',
      'Fire Pump Room Review',
      'Hot Work Safety',
      'Electrical Fire Risk',
    ],
  },
  Environmental: {
    title: 'Environmental Compliance & ESG Engine',
    subtitle: 'ISO 14001 · ISO 50001 · Waste & Water Management · Air Emissions · GHG Data Readiness & ESG Gap Review',
    refPrefix: 'AA-ENV',
    restrictionNote:
      'Independent environmental & GHG readiness review. Regulated environmental laboratory sampling and accredited GHG verification require NABL / accredited verification bodies.',
    categories: [
      'ISO 14001 Environmental Controls',
      'ISO 50001 Energy Management',
      'Waste Management Assessment',
      'Water & Effluent Management',
      'Air Emission Compliance Review',
      'GHG Data Readiness (ISO 14064)',
      'ESG & Sustainability Gap Review',
    ],
  },
  'Contractor & Vendor': {
    title: 'Contractor & Vendor Audit Engine',
    subtitle: 'Third-Party Contractor Safety · Pre-Qualification · Lifting & Rigging · PTW & Supplier Compliance',
    refPrefix: 'AA-CV',
    restrictionNote:
      'Independent contractor & vendor management system assessment conducted under client audit mandate.',
    categories: [
      'Contractor Safety Onboarding',
      'Permit to Work Compliance',
      'Lifting & Rigging Safety',
      'Construction & MEP Safety',
      'Vendor Quality & Hygiene Controls',
      'Statutory Labour Documentation Check',
    ],
  },
};

export function AuditExecutionEngine({ engineType }: { engineType: AuditEngineType }) {
  const { audits, masterData, canEditRecords, createRecord, updateRecord, fetchWithAuth, showToast, userProfile } = useAssurance();
  const meta = ENGINE_META[engineType];

  const engineAudits = useMemo(
    () => audits.filter((a) => a.engineType === engineType),
    [audits, engineType]
  );

  const [selectedId, setSelectedId] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('Semiconductor');
  const [siteLocation, setSiteLocation] = useState('Hyderabad, Telangana');
  const [scope, setScope] = useState('');
  const [leadAuditor, setLeadAuditor] = useState(userProfile?.displayName || 'Lead EHS Auditor');
  const [assignedAuditorEmailsInput, setAssignedAuditorEmailsInput] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10));
  const [gpsLocation, setGpsLocation] = useState('');

  // AI states
  const [aiCategory, setAiCategory] = useState(meta.categories[0]);
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Multimodal Evidence Analyzer
  const [evidenceNoteInput, setEvidenceNoteInput] = useState('');
  const [evidenceImageBase64, setEvidenceImageBase64] = useState<string | null>(null);
  const [evidenceMimeType, setEvidenceMimeType] = useState<string | null>(null);
  const [evidenceImageName, setEvidenceImageName] = useState<string>('');
  const [analyzingEvidence, setAnalyzingEvidence] = useState(false);

  // New Finding form
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingForm, setFindingForm] = useState({
    requirementRef: '',
    classification: 'Major' as FindingSeverity,
    actualCondition: '',
    objectiveEvidence: '',
    potentialConsequence: '',
    riskRating: 'High' as AuditFindingItem['riskRating'],
    recommendedAction: '',
    responsiblePerson: '',
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  const activeAudit: AuditRecord | undefined = useMemo(() => {
    if (selectedId) return engineAudits.find((a) => a.id === selectedId) || engineAudits[0];
    return engineAudits[0];
  }, [engineAudits, selectedId]);

  const dynamicIndustries = useMemo(() => {
    const custom = masterData.filter((m) => m.dataType === 'Industry' && m.active).map((m) => m.name);
    return Array.from(new Set([...INDUSTRIES_LIST, ...custom]));
  }, [masterData]);

  const dynamicChecklistPool = useMemo(
    () => masterData.filter((m) => m.dataType === 'ChecklistQuestion' && m.active),
    [masterData]
  );

  const captureGps = () => {
    if (!navigator.geolocation) {
      showToast('Browser geolocation unavailable.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Consented)`);
        showToast('Consented GPS coordinates attached.');
      },
      () => {
        showToast('Location permission declined or unavailable.', 'warning');
      }
    );
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auditRef = `${meta.refPrefix}-${new Date().getFullYear()}-${String(audits.length + 101)}`;
    // Seed with active masterData checklist items if any exist, otherwise a baseline item
    const starterChecklist: AuditChecklistItem[] =
      dynamicChecklistPool.length > 0
        ? dynamicChecklistPool.slice(0, 3).map((q, idx) => ({
            id: `chk-${Date.now()}-${idx}`,
            category: meta.categories[0],
            question: q.name,
            criteria: q.criteria || 'Verify documented & operational conformance',
            expectedEvidence: q.evidenceRequired || 'Inspection records & objective site evidence',
            response: 'Pending',
            riskLevel: (['Critical', 'High', 'Medium', 'Low'].includes(q.riskLevel || '')
              ? q.riskLevel
              : 'Medium') as AuditChecklistItem['riskLevel'],
            auditorComments: '',
          }))
        : [
            {
              id: `chk-${Date.now()}-0`,
              category: meta.categories[0],
              question: `Are documented procedures and operational controls implemented for ${meta.categories[0]}?`,
              criteria: 'Current approved procedures, trained personnel, and active inspection logs.',
              expectedEvidence: 'Field observation, logs, and competency records.',
              response: 'Pending',
              riskLevel: 'High',
              auditorComments: '',
            },
          ];

    try {
      const id = await createRecord(
        'audits',
        'aud',
        {
          auditRef,
          engineType,
          title: title.trim() || `${industry} ${engineType} Independent Audit`,
          clientName: clientName.trim() || 'Client Organization',
          industry,
          siteLocation: siteLocation.trim() || 'Primary Site',
          scope: scope.trim() || `${engineType} site assessment`,
          leadAuditor: leadAuditor.trim() || 'Lead Auditor',
          assignedAuditorEmails: assignedAuditorEmailsInput
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e.includes('@'))
            .slice(0, 10),
          auditDate,
          gpsLocation: gpsLocation || 'Not Enabled',
          status: 'In Progress',
          score: 0,
          checklistItems: starterChecklist,
          findings: [],
          executiveSummary: '',
          auditorVerified: false,
          approvedBy: '',
        },
        `${engineType} Audit`,
        'Created Audit',
        auditRef
      );
      setSelectedId(id);
      setShowCreate(false);
      setTitle('');
      setScope('');
      setAssignedAuditorEmailsInput('');
      showToast(`Created ${auditRef} in database.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create audit.', 'error');
    }
  };

  const handleUpdateChecklistItem = async (itemId: string, patch: Partial<AuditChecklistItem>) => {
    if (!activeAudit) return;
    if (activeAudit.status === 'Completed') {
      showToast('Completed audits are locked for audit-trail integrity.', 'warning');
      return;
    }
    const nextItems = (activeAudit.checklistItems || []).map((i) =>
      i.id === itemId ? { ...i, ...patch } : i
    );
    const nextScore = calculateAuditScore(nextItems);
    try {
      await updateRecord(
        'audits',
        activeAudit.id,
        { checklistItems: nextItems, score: nextScore },
        `${engineType} Audit`,
        'Updated Checklist Response',
        activeAudit.auditRef
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save checklist response.', 'error');
    }
  };

  const handleGenerateAiChecklist = async () => {
    if (!activeAudit) return;
    setGeneratingChecklist(true);
    try {
      const res = await fetchWithAuth('/api/ai/audit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_checklist',
          engineType,
          industry: activeAudit.industry,
          category: aiCategory,
          scope: activeAudit.scope,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI checklist generation failed');
      const generated: AuditChecklistItem[] = (json.data?.questions || []).map(
        (q: { category?: string; question?: string; criteria?: string; expectedEvidence?: string; riskLevel?: string }, idx: number) => ({
          id: `ai-chk-${Date.now()}-${idx}`,
          category: q.category || aiCategory,
          question: q.question || 'Audit verification item',
          criteria: q.criteria || 'Verify operational compliance',
          expectedEvidence: q.expectedEvidence || 'Objective field & documented evidence',
          response: 'Pending' as const,
          riskLevel: (['Critical', 'High', 'Medium', 'Low'].includes(q.riskLevel || '')
            ? q.riskLevel
            : 'Medium') as AuditChecklistItem['riskLevel'],
          auditorComments: '',
        })
      );
      if (generated.length === 0) throw new Error('No checklist questions returned.');
      const combined = [...(activeAudit.checklistItems || []), ...generated].slice(0, 140);
      await updateRecord(
        'audits',
        activeAudit.id,
        { checklistItems: combined, score: calculateAuditScore(combined) },
        `${engineType} Audit`,
        `Added ${generated.length} AI Checklist Items`,
        activeAudit.auditRef
      );
      showToast(`Added ${generated.length} AI-generated ${aiCategory} checklist questions.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Checklist generation failed.', 'error');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const handleEvidenceFileUpload = (file: File) => {
    const check = validateClientFileUpload(file.name, file.type, file.size);
    if (!check.valid) {
      setEvidenceImageName('');
      setEvidenceImageBase64(null);
      setEvidenceMimeType(null);
      showToast(check.error || 'Invalid evidence file.', 'error');
      return;
    }
    setEvidenceImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setEvidenceImageBase64(base64);
      setEvidenceMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeEvidence = async () => {
    if (!activeAudit) return;
    if (!evidenceNoteInput.trim() && !evidenceImageBase64) {
      showToast('Enter a field observation note or attach a photo first.', 'warning');
      return;
    }
    setAnalyzingEvidence(true);
    try {
      const res = await fetchWithAuth('/api/ai/audit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_evidence',
          engineType,
          industry: activeAudit.industry,
          siteLocation: activeAudit.siteLocation,
          evidenceText: evidenceNoteInput,
          evidenceImageBase64,
          evidenceMimeType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Evidence analysis failed');
      const d = json.data || {};
      setFindingForm((prev) => ({
        ...prev,
        requirementRef: `${engineType} Assessment / ${aiCategory}`,
        classification: ([
          'Critical',
          'Major',
          'Minor',
          'Observation',
          'Opportunity for Improvement',
          'Good Practice',
        ].includes(d.suggestedClassification)
          ? d.suggestedClassification
          : 'Major') as FindingSeverity,
        actualCondition: d.draftObservation || evidenceNoteInput,
        objectiveEvidence: evidenceImageName
          ? `Uploaded Evidence: ${evidenceImageName}${evidenceNoteInput ? ` — ${evidenceNoteInput}` : ''}`
          : evidenceNoteInput,
        potentialConsequence: d.potentialConsequence || '',
        recommendedAction: d.recommendedAction || '',
      }));
      setShowFindingForm(true);
      showToast('AI drafted finding observation — verify before saving!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Evidence analysis failed.', 'error');
    } finally {
      setAnalyzingEvidence(false);
    }
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAudit) return;
    const newFinding: AuditFindingItem = {
      id: `fnd-${Date.now()}`,
      findingId: `FND-${meta.refPrefix.replace('AA-', '')}-${String((activeAudit.findings?.length || 0) + 1).padStart(3, '0')}`,
      ...findingForm,
      verificationStatus: 'Open',
    };
    const nextFindings = [...(activeAudit.findings || []), newFinding];
    try {
      await updateRecord(
        'audits',
        activeAudit.id,
        { findings: nextFindings },
        `${engineType} Audit`,
        'Logged Audit Finding',
        newFinding.findingId
      );
      setShowFindingForm(false);
      setEvidenceNoteInput('');
      setEvidenceImageBase64(null);
      setEvidenceImageName('');
      setFindingForm({
        requirementRef: '',
        classification: 'Major',
        actualCondition: '',
        objectiveEvidence: '',
        potentialConsequence: '',
        riskRating: 'High',
        recommendedAction: '',
        responsiblePerson: '',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      });
      showToast(`Finding ${newFinding.findingId} saved to audit record.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to log finding.', 'error');
    }
  };

  const handleEscalateToCapa = async (finding: AuditFindingItem) => {
    if (!activeAudit) return;
    const capaRef = `CAPA-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 899))}`;
    const severity = (['Critical', 'Major', 'Minor', 'Observation'].includes(finding.classification)
      ? finding.classification
      : 'Observation') as 'Critical' | 'Major' | 'Minor' | 'Observation';
    try {
      await createRecord(
        'capas',
        'capa',
        {
          capaRef,
          findingRef: finding.findingId,
          auditRef: activeAudit.auditRef,
          findingDescription: finding.actualCondition,
          severity,
          rootCause: 'Pending structured 5-Why / Fishbone RCA',
          fiveWhys: '',
          fishbone: '',
          correctiveAction: finding.recommendedAction || 'Define immediate containment & corrective action',
          preventiveAction: '',
          responsiblePerson: finding.responsiblePerson || 'Department Owner',
          department: activeAudit.industry || 'Operations',
          targetDate: finding.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          priority: finding.riskRating === 'Critical' ? 'Critical' : finding.riskRating === 'High' ? 'High' : 'Medium',
          status: 'Open',
          closureEvidence: '',
          verificationNotes: '',
          effectivenessReview: '',
          escalated: finding.riskRating === 'Critical',
        },
        'CAPA Management',
        'Escalated Audit Finding to CAPA',
        capaRef
      );
      showToast(`Created linked ${capaRef} from finding ${finding.findingId}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create CAPA.', 'error');
    }
  };

  const handleGenerateAuditSummary = async () => {
    if (!activeAudit) return;
    setGeneratingSummary(true);
    try {
      const res = await fetchWithAuth('/api/ai/audit-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executive_summary',
          engineType,
          auditData: {
            auditRef: activeAudit.auditRef,
            title: activeAudit.title,
            clientName: activeAudit.clientName,
            industry: activeAudit.industry,
            siteLocation: activeAudit.siteLocation,
            score: activeAudit.score,
            findings: activeAudit.findings,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Executive summary failed');
      await updateRecord(
        'audits',
        activeAudit.id,
        { executiveSummary: (json.summary || '').slice(0, 5900) },
        `${engineType} Audit`,
        'Generated AI Audit Summary',
        activeAudit.auditRef
      );
      showToast('AI Executive Audit Summary drafted. Lead Auditor verification required before approval.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Summary failed.', 'error');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleApproveAudit = async () => {
    if (!activeAudit) return;
    if (!activeAudit.auditorVerified) {
      showToast('Mandatory Auditor Verification checkbox must be confirmed before final approval.', 'warning');
      return;
    }
    try {
      await updateRecord(
        'audits',
        activeAudit.id,
        {
          status: 'Completed',
          approvedBy: userProfile?.displayName || 'Authorized Audit Approver',
        },
        `${engineType} Audit`,
        'Approved Final Audit Report',
        activeAudit.auditRef
      );
      showToast(`Audit ${activeAudit.auditRef} verified and approved.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Approval failed.', 'error');
    }
  };

  const handleExportPdf = () => {
    if (!activeAudit) return;
    exportReportToPdf({
      title: `${engineType} Independent Audit Report — ${activeAudit.title}`,
      subtitle: `${activeAudit.clientName || ''} · ${activeAudit.siteLocation || ''}`,
      referenceNo: activeAudit.auditRef,
      status: activeAudit.status === 'Completed' ? `Approved (${activeAudit.approvedBy || 'Verified'})` : 'DRAFT – AUDITOR VERIFICATION REQUIRED',
      metadata: [
        ['Audit Engine', `${engineType} Independent Assessment`],
        ['Client & Industry', `${activeAudit.clientName || '-'} (${activeAudit.industry || '-'})`],
        ['Site & GPS', `${activeAudit.siteLocation || '-'} · ${activeAudit.gpsLocation || 'N/A'}`],
        ['Lead Auditor & Date', `${activeAudit.leadAuditor || '-'} · ${activeAudit.auditDate || '-'}`],
        ['Compliance Score', `${activeAudit.score}% (${activeAudit.findings?.length || 0} Findings)`],
      ],
      summaryText: activeAudit.executiveSummary,
      tableHeaders: ['Finding ID', 'Severity', 'Condition & Evidence', 'Recommended Action', 'Owner / Due'],
      tableRows: (activeAudit.findings || []).map((f) => [
        f.findingId,
        f.classification,
        `${f.actualCondition} [Evidence: ${f.objectiveEvidence}]`,
        f.recommendedAction,
        `${f.responsiblePerson || '-'} (${f.targetDate || '-'})`,
      ]),
      filename: `${activeAudit.auditRef}_Report.pdf`,
    });
    showToast('Audit Report PDF exported.');
  };

  const handleExportXlsx = () => {
    if (!activeAudit) return;
    exportRowsToExcel(
      'Audit_Checklist',
      (activeAudit.checklistItems || []).map((i) => ({
        Category: i.category,
        Question: i.question,
        Criteria: i.criteria,
        Response: i.response,
        RiskLevel: i.riskLevel,
        AuditorComments: i.auditorComments,
        Evidence: i.evidenceFileName || i.evidenceRef || '',
      })),
      `${activeAudit.auditRef}_Checklist.xlsx`
    );
    showToast('Audit checklist XLSX exported.');
  };

  const handleExportDocx = async () => {
    if (!activeAudit) return;
    const text = [
      '# Executive Summary',
      activeAudit.executiveSummary || 'Pending executive summary.',
      '# Audit Findings',
      ...(activeAudit.findings || []).map(
        (f) =>
          `## ${f.findingId} (${f.classification} — ${f.riskRating} Risk)\nRequirement: ${f.requirementRef}\nCondition: ${f.actualCondition}\nEvidence: ${f.objectiveEvidence}\nConsequence: ${f.potentialConsequence}\nRecommended Action: ${f.recommendedAction}\nOwner: ${f.responsiblePerson} | Target Date: ${f.targetDate}`
      ),
    ].join('\n\n');

    await exportDocumentToDocx({
      title: `${engineType} Audit Report: ${activeAudit.title}`,
      docNumber: activeAudit.auditRef,
      revision: 'Rev 01',
      status: activeAudit.status === 'Completed' ? 'Approved' : 'DRAFT – REVIEW REQUIRED',
      metadata: [
        ['Client', activeAudit.clientName || '-'],
        ['Industry', activeAudit.industry || '-'],
        ['Site', activeAudit.siteLocation || '-'],
        ['Score', `${activeAudit.score}%`],
      ],
      bodyText: text,
      filename: `${activeAudit.auditRef}_Report.docx`,
    });
    showToast('Audit Report DOCX exported.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">{meta.subtitle}</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">{meta.title}</h1>
        </div>
        {canEditRecords && (
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            New {engineType} Audit
          </button>
        )}
      </div>

      {/* Engine Governance Notice */}
      <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>{meta.restrictionNote}</span>
      </div>

      {/* Create New Audit Form */}
      {showCreate && canEditRecords && (
        <form onSubmit={handleCreateAudit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-slate-900">Create New {engineType} Audit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Audit Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              required
              placeholder="Client / Organization Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {dynamicIndustries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Site Location (e.g. Hyderabad, Telangana)"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Lead Auditor Name"
              value={leadAuditor}
              onChange={(e) => setLeadAuditor(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="date"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Audit Scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="GPS (Optional Consented)"
                value={gpsLocation}
                onChange={(e) => setGpsLocation(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={captureGps}
                className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1 whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5" /> GPS
              </button>
            </div>
            <input
              type="text"
              placeholder="Assigned Auditor Emails (comma-separated for strict isolation)"
              value={assignedAuditorEmailsInput}
              onChange={(e) => setAssignedAuditorEmailsInput(e.target.value)}
              className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">
              Initialize Audit
            </button>
          </div>
        </form>
      )}

      {/* Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <p className="text-xs font-semibold text-slate-700 px-1">{engineType} Audits ({engineAudits.length})</p>
          {engineAudits.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-500">
              No {engineType} audits yet. Click "New {engineType} Audit" to start.
            </div>
          ) : (
            engineAudits.map((a) => {
              const active = a.id === activeAudit?.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                    active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-num text-[11px] font-semibold">{a.auditRef}</span>
                    <span className={`font-mono-num text-xs font-bold ${active ? 'text-amber-400' : 'text-slate-900'}`}>
                      {a.score}%
                    </span>
                  </div>
                  <p className={`text-xs font-medium line-clamp-2 ${active ? 'text-slate-100' : 'text-slate-800'}`}>{a.title}</p>
                  <p className={`text-[11px] mt-1 truncate ${active ? 'text-slate-400' : 'text-slate-500'}`}>
                    {a.status} · {a.findings?.length || 0} Findings
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-9 space-y-5">
          {!activeAudit ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              Select or create an audit to run checklists, analyze evidence, log findings, and export reports.
            </div>
          ) : (
            <>
              {/* Audit Control Header */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-xs font-mono-num text-slate-500 mb-1">
                      {activeAudit.auditRef} · {activeAudit.industry} · {activeAudit.auditDate} · {activeAudit.status}
                    </div>
                    <h2 className="font-display text-lg font-bold text-slate-900">{activeAudit.title}</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Client: {activeAudit.clientName} · Site: {activeAudit.siteLocation} · Lead Auditor: {activeAudit.leadAuditor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right">
                      <span className="block text-[10px] text-slate-500">Audit Score</span>
                      <span className="font-mono-num text-lg font-bold text-slate-900">{activeAudit.score}%</span>
                    </div>
                  </div>
                </div>

                {/* AI Checklist & Report Export Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {canEditRecords && (
                      <>
                        <select
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value)}
                          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        >
                          {meta.categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleGenerateAiChecklist}
                          disabled={generatingChecklist || activeAudit.status === 'Completed'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-50"
                        >
                          {generatingChecklist ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                          AI Generate Checklist
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateAuditSummary}
                          disabled={generatingSummary}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                        >
                          {generatingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                          AI Executive Summary
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button type="button" onClick={handleExportDocx} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50">
                      <FileText className="w-3.5 h-3.5" /> DOCX
                    </button>
                    <button type="button" onClick={handleExportXlsx} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
                    </button>
                  </div>
                </div>

                {activeAudit.executiveSummary && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                    <strong className="block text-slate-900 mb-1">Executive Summary</strong>
                    {activeAudit.executiveSummary}
                  </div>
                )}

                {/* Mandatory Auditor Verification & Final Approval Workflow */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(activeAudit.auditorVerified)}
                      disabled={!canEditRecords || activeAudit.status === 'Completed'}
                      onChange={(e) =>
                        updateRecord(
                          'audits',
                          activeAudit.id,
                          { auditorVerified: e.target.checked, status: e.target.checked ? 'Pending Approval' : 'In Progress' },
                          `${engineType} Audit`,
                          'Toggled Auditor Verification',
                          activeAudit.auditRef
                        )
                      }
                      className="rounded border-slate-300"
                    />
                    <span>I confirm all observations and objective evidence were verified by a competent human auditor (mandatory before approval).</span>
                  </label>
                  {activeAudit.status === 'Completed' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4" /> Approved ({activeAudit.approvedBy || 'Verified'})
                    </span>
                  ) : canEditRecords ? (
                    <button
                      type="button"
                      onClick={handleApproveAudit}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 whitespace-nowrap shrink-0"
                    >
                      Approve &amp; Lock Report
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Multimodal AI Evidence Analyzer & Draft Finding Tool (Super Admin Only) */}
              {canEditRecords && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-900">
                      AI Evidence Review &amp; Finding Drafter
                    </h3>
                    <p className="text-xs text-slate-500">
                      Attach site photo evidence or enter raw field notes — AI drafts structured observations &amp; risk ratings without fabricating conditions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFindingForm((v) => !v)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    + Manual Finding
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <input
                    type="text"
                    value={evidenceNoteInput}
                    onChange={(e) => setEvidenceNoteInput(e.target.value)}
                    placeholder="Enter observed field condition (e.g. Unlabeled acid drum without secondary bund in Bay 3)..."
                    className="md:col-span-6 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <label className="md:col-span-3 flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer truncate">
                    <Camera className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">{evidenceImageName || 'Upload Photo/Doc'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEvidenceFileUpload(f);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAnalyzeEvidence}
                    disabled={analyzingEvidence || activeAudit.status === 'Completed'}
                    className="md:col-span-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    {analyzingEvidence ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
                    Analyze &amp; Draft Finding
                  </button>
                </div>

                {showFindingForm && (
                  <form onSubmit={handleAddFinding} className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Requirement Reference *"
                      value={findingForm.requirementRef}
                      onChange={(e) => setFindingForm({ ...findingForm, requirementRef: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <select
                      value={findingForm.classification}
                      onChange={(e) => setFindingForm({ ...findingForm, classification: e.target.value as FindingSeverity })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                      <option value="Observation">Observation</option>
                      <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                      <option value="Good Practice">Good Practice</option>
                    </select>
                    <select
                      value={findingForm.riskRating}
                      onChange={(e) =>
                        setFindingForm({ ...findingForm, riskRating: e.target.value as AuditFindingItem['riskRating'] })
                      }
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Critical">Critical Risk</option>
                      <option value="High">High Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="Low">Low Risk</option>
                    </select>
                    <textarea
                      rows={2}
                      required
                      placeholder="Actual Condition Observed *"
                      value={findingForm.actualCondition}
                      onChange={(e) => setFindingForm({ ...findingForm, actualCondition: e.target.value })}
                      className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Objective Evidence *"
                      value={findingForm.objectiveEvidence}
                      onChange={(e) => setFindingForm({ ...findingForm, objectiveEvidence: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Potential Consequence"
                      value={findingForm.potentialConsequence}
                      onChange={(e) => setFindingForm({ ...findingForm, potentialConsequence: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Recommended Action"
                      value={findingForm.recommendedAction}
                      onChange={(e) => setFindingForm({ ...findingForm, recommendedAction: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Responsible Person"
                      value={findingForm.responsiblePerson}
                      onChange={(e) => setFindingForm({ ...findingForm, responsiblePerson: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <input
                      type="date"
                      value={findingForm.targetDate}
                      onChange={(e) => setFindingForm({ ...findingForm, targetDate: e.target.value })}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowFindingForm(false)} className="px-3 py-2 text-xs bg-slate-100 rounded-lg">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">
                        Save Finding
                      </button>
                    </div>
                  </form>
                )}
              </div>
              )}

              {/* Checklist Execution Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Dynamic Audit Checklist ({activeAudit.checklistItems?.length || 0} Questions)
                  </h3>
                  <span className="text-xs text-slate-500">Auto-calculated scoring</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {(activeAudit.checklistItems || []).map((item) => (
                    <div key={item.id} className="p-4 space-y-2.5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-slate-500">
                            {item.category} · Risk: <strong className="text-slate-800">{item.riskLevel}</strong>
                          </div>
                          <p className="text-xs font-semibold text-slate-900">{item.question}</p>
                          <p className="text-[11px] text-slate-500">Criteria: {item.criteria} · Expected: {item.expectedEvidence}</p>
                        </div>
                        <select
                          value={item.response}
                          disabled={!canEditRecords || activeAudit.status === 'Completed'}
                          onChange={(e) =>
                            handleUpdateChecklistItem(item.id, {
                              response: e.target.value as AuditChecklistItem['response'],
                            })
                          }
                          className={`px-2.5 py-1.5 text-xs font-semibold border rounded-lg bg-white shrink-0 ${
                            item.response === 'Compliant'
                              ? 'text-emerald-700 border-emerald-300'
                              : item.response === 'Non-Compliant'
                              ? 'text-red-700 border-red-300'
                              : 'text-amber-700 border-amber-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Compliant">Compliant</option>
                          <option value="Partial">Partial</option>
                          <option value="Non-Compliant">Non-Compliant</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <input
                          type="text"
                          defaultValue={item.auditorComments}
                          disabled={!canEditRecords || activeAudit.status === 'Completed'}
                          onBlur={(e) => {
                            if (canEditRecords && e.target.value !== item.auditorComments) {
                              handleUpdateChecklistItem(item.id, { auditorComments: e.target.value });
                            }
                          }}
                          placeholder="Auditor objective comments..."
                          className="md:col-span-9 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                        />
                        <label className="md:col-span-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer truncate">
                          <Upload className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{item.evidenceFileName || item.evidenceRef || 'Attach Evidence'}</span>
                          <input
                            type="file"
                            className="hidden"
                            disabled={!canEditRecords || activeAudit.status === 'Completed'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUpdateChecklistItem(item.id, { evidenceFileName: file.name });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logged Findings & One-Click CAPA Escalation */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Audit Findings ({activeAudit.findings?.length || 0})
                  </h3>
                </div>
                {(activeAudit.findings || []).length === 0 ? (
                  <div className="p-6 text-xs text-slate-500">No findings recorded for this audit yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {(activeAudit.findings || []).map((f) => (
                      <div key={f.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono-num font-bold text-slate-900">{f.findingId}</span>
                            <span className="text-slate-400">·</span>
                            <span
                              className={`font-semibold ${
                                f.classification === 'Critical'
                                  ? 'text-red-700'
                                  : f.classification === 'Major'
                                  ? 'text-amber-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {f.classification}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{f.requirementRef}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-900">{f.actualCondition}</p>
                          <p className="text-[11px] text-slate-600">
                            <strong>Evidence:</strong> {f.objectiveEvidence} · <strong>Action:</strong> {f.recommendedAction}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono-num">
                            Owner: {f.responsiblePerson || 'Unassigned'} · Target: {f.targetDate || 'TBD'} · Status: {f.verificationStatus}
                          </p>
                        </div>
                        {canEditRecords && (
                          <button
                            type="button"
                            onClick={() => handleEscalateToCapa(f)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                            Assign to CAPA
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
