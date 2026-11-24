import React, { useMemo, useState } from 'react';
import {
  Bot,
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  Save,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import { DOCUMENT_TYPES_BY_CATEGORY, INDUSTRIES_LIST } from '../data/seedCatalog';
import type { ControlledDocumentRecord, DocumentCategory } from '../types/assurance';
import { exportDocumentToDocx, exportReportToPdf, exportRowsToExcel } from '../utils/exporters';

const DOC_CATEGORIES: DocumentCategory[] = ['Risk Management', 'Safety', 'Audit', 'Food Safety'];

export function DocumentGeneratorEngine() {
  const { documents, canEditRecords, createRecord, updateRecord, fetchWithAuth, logDocumentAccess, logActivityEvent, showToast, userProfile, settings } = useAssurance();

  const [selectedId, setSelectedId] = useState<string>('');
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder form state
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Risk Management');
  const [docType, setDocType] = useState(DOCUMENT_TYPES_BY_CATEGORY['Risk Management'][0]);
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('Semiconductor');
  const [activity, setActivity] = useState('');
  const [department, setDepartment] = useState('Operations / EHS');
  const [equipment, setEquipment] = useState('');
  const [standardRef, setStandardRef] = useState('ISO 45001:2018 & Applicable Industry Best Practices');
  const [siteConditions, setSiteConditions] = useState('');
  const [hazards, setHazards] = useState('');
  const [generating, setGenerating] = useState(false);

  // Edit active content
  const [editContent, setEditContent] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [approverName, setApproverName] = useState('');

  const activeDoc: ControlledDocumentRecord | undefined = useMemo(() => {
    if (selectedId) return documents.find((d) => d.id === selectedId) || documents[0];
    return documents[0];
  }, [documents, selectedId]);

  const handleCategoryChange = (cat: DocumentCategory) => {
    setDocCategory(cat);
    setDocType(DOCUMENT_TYPES_BY_CATEGORY[cat][0]);
  };

  const handleGenerateAiDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const prefix = settings?.docNumberPrefix || 'AA';
    const docNumber = `${prefix}-${docCategory.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`;

    try {
      const res = await fetchWithAuth('/api/ai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docCategory,
          docType,
          title: title.trim() || `${industry} ${docType}`,
          industry,
          activity,
          department,
          equipment,
          standardRef,
          siteConditions,
          hazards,
          docNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Document AI generation failed');

      const id = await createRecord(
        'documents',
        'doc',
        {
          docNumber,
          revisionNumber: 'Rev 00 (Draft)',
          issueDate: new Date().toISOString().slice(0, 10),
          docCategory,
          docType,
          title: (title.trim() || `${industry} — ${docType}`).slice(0, 235),
          industry,
          activity: activity.slice(0, 235),
          department: department.slice(0, 115),
          equipment: equipment.slice(0, 235),
          standardRef: standardRef.slice(0, 235),
          siteConditions: siteConditions.slice(0, 1450),
          hazards: hazards.slice(0, 1450),
          content: (json.content || '').slice(0, 49000),
          // ALWAYS initialized strictly as DRAFT – REVIEW REQUIRED
          status: 'DRAFT – REVIEW REQUIRED',
          preparedBy: `ARSHIEL AI + ${userProfile?.displayName || 'Consultant'}`,
          reviewedBy: 'Pending Technical Verification',
          approvedBy: 'Pending Competent Approval',
          aiGenerated: true,
          revisionNotes: 'Initial AI-assisted draft. Competent human review mandatory prior to approval.',
        },
        'AI Document Generator',
        'Generated AI Draft Document',
        docNumber
      );

      setSelectedId(id);
      setEditContent(null);
      setShowBuilder(false);
      setTitle('');
      setActivity('');
      setHazards('');
      showToast(`Generated ${docNumber} as "DRAFT – REVIEW REQUIRED".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to generate document.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!activeDoc || editContent === null) return;
    if (activeDoc.status === 'Approved') {
      showToast('Approved documents are locked. Create a new revision to modify.', 'warning');
      return;
    }
    try {
      await updateRecord(
        'documents',
        activeDoc.id,
        { content: editContent.slice(0, 49000) },
        'AI Document Generator',
        'Edited Document Content',
        activeDoc.docNumber
      );
      setEditContent(null);
      showToast('Document draft saved.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed.', 'error');
    }
  };

  const handleWorkflowTransition = async (nextStatus: 'Technical Verification' | 'Approved') => {
    if (!activeDoc) return;
    if (nextStatus === 'Technical Verification') {
      if (!reviewerName.trim()) {
        showToast('Enter the Technical Reviewer name to complete Technical Verification.', 'warning');
        return;
      }
      await updateRecord(
        'documents',
        activeDoc.id,
        {
          status: 'Technical Verification',
          reviewedBy: reviewerName.trim(),
          revisionNumber: 'Rev 01 (Verified)',
        },
        'AI Document Generator',
        'Completed Technical Verification',
        activeDoc.docNumber
      );
      showToast(`${activeDoc.docNumber} moved to Technical Verification.`);
    } else {
      if (activeDoc.status !== 'Technical Verification') {
        showToast('Document must complete Technical Verification before final Competent Approval.', 'warning');
        return;
      }
      if (!approverName.trim()) {
        showToast('Enter the Authorized Approver name & designation to approve this safety document.', 'warning');
        return;
      }
      await updateRecord(
        'documents',
        activeDoc.id,
        {
          status: 'Approved',
          approvedBy: approverName.trim(),
          revisionNumber: 'Rev 01 (Issued)',
        },
        'AI Document Generator',
        'Approved Controlled Document',
        activeDoc.docNumber
      );
      await logDocumentAccess({
        documentId: activeDoc.id,
        documentName: activeDoc.title,
        docNumber: activeDoc.docNumber,
        accessType: 'Approve',
        authorized: true,
      });
      showToast(`${activeDoc.docNumber} formally approved and locked.`);
    }
  };

  const handleExportPdf = () => {
    if (!activeDoc) return;
    exportReportToPdf({
      title: activeDoc.title,
      subtitle: `${activeDoc.docCategory} · ${activeDoc.docType}`,
      referenceNo: `${activeDoc.docNumber} (${activeDoc.revisionNumber || 'Rev 00'})`,
      status: activeDoc.status,
      metadata: [
        ['Document Number & Rev', `${activeDoc.docNumber} / ${activeDoc.revisionNumber || 'Rev 00'}`],
        ['Issue Date & Status', `${activeDoc.issueDate || '-'} · ${activeDoc.status}`],
        ['Industry & Department', `${activeDoc.industry || '-'} / ${activeDoc.department || '-'}`],
        ['Activity & Reference', `${activeDoc.activity || '-'} (${activeDoc.standardRef || '-'})`],
        ['Prepared / Reviewed / Approved', `${activeDoc.preparedBy || '-'} | ${activeDoc.reviewedBy || '-'} | ${activeDoc.approvedBy || '-'}`],
      ],
      summaryText: activeDoc.content || '',
      tableHeaders: [],
      tableRows: [],
      filename: `${activeDoc.docNumber}_${activeDoc.status.includes('DRAFT') ? 'DRAFT' : 'APPROVED'}.pdf`,
    });
    logDocumentAccess({
      documentId: activeDoc.id,
      documentName: activeDoc.title,
      docNumber: activeDoc.docNumber,
      accessType: 'Download',
      exportFormat: 'PDF',
      authorized: true,
    });
    logActivityEvent({
      eventType: 'Document Downloaded',
      module: 'Controlled Documents',
      recordId: activeDoc.id,
      entityRef: activeDoc.docNumber,
      summary: `Downloaded controlled document ${activeDoc.docNumber} as PDF.`,
    });
    showToast('Controlled document exported as PDF.');
  };

  const handleExportDocx = async () => {
    if (!activeDoc) return;
    await exportDocumentToDocx({
      title: activeDoc.title,
      docNumber: activeDoc.docNumber,
      revision: activeDoc.revisionNumber || 'Rev 00',
      status: activeDoc.status,
      metadata: [
        ['Category / Type', `${activeDoc.docCategory} — ${activeDoc.docType}`],
        ['Industry / Dept', `${activeDoc.industry || '-'} / ${activeDoc.department || '-'}`],
        ['Prepared By', activeDoc.preparedBy || '-'],
        ['Reviewed By', activeDoc.reviewedBy || '-'],
        ['Approved By', activeDoc.approvedBy || '-'],
      ],
      bodyText: activeDoc.content || '',
      filename: `${activeDoc.docNumber}.docx`,
    });
    logDocumentAccess({
      documentId: activeDoc.id,
      documentName: activeDoc.title,
      docNumber: activeDoc.docNumber,
      accessType: 'Download',
      exportFormat: 'DOCX',
      authorized: true,
    });
    logActivityEvent({
      eventType: 'Document Downloaded',
      module: 'Controlled Documents',
      recordId: activeDoc.id,
      entityRef: activeDoc.docNumber,
      summary: `Downloaded controlled document ${activeDoc.docNumber} as DOCX.`,
    });
    showToast('Controlled document exported as DOCX.');
  };

  const handleExportIndexXlsx = () => {
    exportRowsToExcel(
      'Document_Control_Register',
      documents.map((d) => ({
        DocNumber: d.docNumber,
        Revision: d.revisionNumber || '',
        Category: d.docCategory,
        DocType: d.docType,
        Title: d.title,
        Industry: d.industry || '',
        Status: d.status,
        PreparedBy: d.preparedBy || '',
        ReviewedBy: d.reviewedBy || '',
        ApprovedBy: d.approvedBy || '',
        IssueDate: d.issueDate || '',
      })),
      `ARSHIEL_Document_Register_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Document control register exported as XLSX.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Risk Management · Safety SOPs · Audit Reports · Food Safety HACCP Drafts
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            AI Document Generator &amp; Control Register
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportIndexXlsx}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Register XLSX
          </button>
          {canEditRecords && (
            <button
              type="button"
              onClick={() => setShowBuilder((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Generate New AI Document
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span>
          <strong>Mandatory Safety-Critical Control:</strong> Every AI-generated document is automatically locked in{' '}
          <strong className="font-mono-num">DRAFT – REVIEW REQUIRED</strong> status. Safety-critical documents are never auto-approved and must pass Technical Verification and Competent Person Approval.
        </span>
      </div>

      {/* AI Generation Workflow Form */}
      {showBuilder && canEditRecords && (
        <form onSubmit={handleGenerateAiDocument} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            AI Document Generation Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Category</label>
              <select
                value={docCategory}
                onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {DOCUMENT_TYPES_BY_CATEGORY[docCategory].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {INDUSTRIES_LIST.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              required
              placeholder="Document Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              required
              placeholder="Activity / Operational Process *"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Equipment / Machinery Involved"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Applicable Standard / Reference"
              value={standardRef}
              onChange={(e) => setStandardRef(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <textarea
              rows={2}
              placeholder="Site Conditions (e.g. Cleanroom Class 1000, Cold Room 4°C, High Voltage Substation)"
              value={siteConditions}
              onChange={(e) => setSiteConditions(e.target.value)}
              className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <textarea
              rows={2}
              placeholder="Known Hazards / Key Control Focus (e.g. Corrosive splashes, Fall from height, Ammonia leak, Allergen cross-contact)"
              value={hazards}
              onChange={(e) => setHazards(e.target.value)}
              className="md:col-span-3 px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowBuilder(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-60"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              {generating ? 'Drafting Controlled Document...' : 'Generate AI Draft (DRAFT – REVIEW REQUIRED)'}
            </button>
          </div>
        </form>
      )}

      {/* Document Library Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-semibold text-slate-700 px-1">Controlled Documents ({documents.length})</p>
          {documents.map((d) => {
            const active = d.id === activeDoc?.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedId(d.id);
                  setEditContent(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                  active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono-num text-[11px] font-semibold">{d.docNumber}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      active
                        ? 'text-amber-400'
                        : d.status === 'Approved'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <p className={`text-xs font-semibold line-clamp-2 ${active ? 'text-white' : 'text-slate-900'}`}>{d.title}</p>
                <p className={`text-[11px] mt-1 truncate ${active ? 'text-slate-400' : 'text-slate-500'}`}>
                  {d.docCategory} · {d.industry} · {d.revisionNumber}
                </p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8">
          {!activeDoc ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              Generate or select a controlled document to review, verify, approve, or export.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-mono-num text-slate-500 mb-1">
                    {activeDoc.docNumber} · {activeDoc.revisionNumber} · Issued {activeDoc.issueDate}
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900">{activeDoc.title}</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Status:{' '}
                    <strong className={activeDoc.status === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>
                      {activeDoc.status}
                    </strong>{' '}
                    · Prepared: {activeDoc.preparedBy} · Reviewed: {activeDoc.reviewedBy} · Approved: {activeDoc.approvedBy}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button type="button" onClick={handleExportDocx} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50">
                    <FileText className="w-3.5 h-3.5" /> DOCX
                  </button>
                </div>
              </div>

              {/* Editable Document Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Document Content</span>
                  {canEditRecords && activeDoc.status !== 'Approved' && editContent !== null && (
                    <button
                      type="button"
                      onClick={handleSaveContent}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-md"
                    >
                      <Save className="w-3 h-3" /> Save Draft Edits
                    </button>
                  )}
                </div>
                <textarea
                  rows={16}
                  readOnly={!canEditRecords || activeDoc.status === 'Approved'}
                  value={editContent !== null ? editContent : activeDoc.content || ''}
                  onChange={(e) => canEditRecords && setEditContent(e.target.value)}
                  className="w-full p-4 text-xs font-mono leading-relaxed bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Human Technical Verification & Approval Gate */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="font-display text-xs font-semibold text-slate-900">
                  Competent Person Review &amp; Approval Workflow
                </h3>
                {activeDoc.status === 'Approved' ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Document formally verified by <strong>{activeDoc.reviewedBy}</strong> and approved by{' '}
                      <strong>{activeDoc.approvedBy}</strong>. Locked under Document Control retention policy.
                    </span>
                  </div>
                ) : !canEditRecords ? (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    Read-Only View: Technical verification and competent person approval actions are restricted exclusively to Super Admin.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="block text-xs font-semibold text-slate-800">Step 1: Technical Verification</span>
                      <input
                        type="text"
                        placeholder="Reviewer Name & Qualification"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleWorkflowTransition('Technical Verification')}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                      >
                        Mark Technically Verified
                      </button>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="block text-xs font-semibold text-slate-800">Step 2: Competent Person Approval</span>
                      <input
                        type="text"
                        placeholder="Approver Name & Designation"
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        disabled={activeDoc.status !== 'Technical Verification'}
                        onClick={() => handleWorkflowTransition('Approved')}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:opacity-40"
                      >
                        Approve &amp; Issue Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
