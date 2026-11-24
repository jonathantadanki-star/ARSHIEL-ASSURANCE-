import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import {
  exportDocumentToDocx,
  exportReportToPdf,
  exportRowsToCsv,
  exportRowsToExcel,
} from '../utils/exporters';

export function AuditReportsHub() {
  const { isoAssessments, audits, legalRequirements, capas, documents, showToast } = useAssurance();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const combinedReports = [
    ...isoAssessments.map((i) => ({
      id: i.id,
      ref: i.referenceNo,
      category: 'ISO Gap Analysis',
      title: `${i.standardCode} (${i.edition || ''}) — ${i.organizationName || 'Client'}`,
      industry: i.industry || '-',
      date: i.auditDate || '-',
      status: i.status,
      metric: `${i.complianceScore}% Readiness`,
      onPdf: () =>
        exportReportToPdf({
          title: `ISO Gap Analysis Report — ${i.standardCode}`,
          subtitle: `${i.organizationName || ''} · ${i.siteLocation || ''}`,
          referenceNo: i.referenceNo,
          status: `${i.status} — Independent Gap Assessment`,
          metadata: [
            ['Standard', `${i.standardCode} — ${i.standardName}`],
            ['Industry & Site', `${i.industry || '-'} / ${i.siteLocation || '-'}`],
            ['Score', `${i.complianceScore}%`],
          ],
          summaryText: i.executiveSummary,
          tableHeaders: ['Clause', 'Status', 'Risk', 'Gap', 'Action'],
          tableRows: (i.clauses || []).map((c) => [
            `${c.clauseNumber} ${c.clauseTitle}`,
            c.complianceStatus,
            c.riskClassification,
            c.gapDescription || '-',
            c.recommendedAction || '-',
          ]),
          filename: `${i.referenceNo}_ISO_Gap_Report.pdf`,
        }),
      onDocx: () =>
        exportDocumentToDocx({
          title: `ISO Gap Report: ${i.standardCode} — ${i.organizationName || ''}`,
          docNumber: i.referenceNo,
          revision: 'Rev 01',
          status: `${i.status} (DRAFT – REVIEW REQUIRED)`,
          metadata: [
            ['Standard', `${i.standardCode} (${i.edition || ''})`],
            ['Readiness Score', `${i.complianceScore}%`],
          ],
          bodyText: i.executiveSummary || 'Clause assessment summary.',
          filename: `${i.referenceNo}.docx`,
        }),
      onXlsx: () =>
        exportRowsToExcel(
          'ISO_Clauses',
          (i.clauses || []).map((c) => ({
            Clause: `${c.clauseNumber} ${c.clauseTitle}`,
            Status: c.complianceStatus,
            Risk: c.riskClassification,
            Gap: c.gapDescription,
            Action: c.recommendedAction,
          })),
          `${i.referenceNo}.xlsx`
        ),
    })),
    ...audits.map((a) => ({
      id: a.id,
      ref: a.auditRef,
      category: `${a.engineType} Audit`,
      title: a.title,
      industry: a.industry || '-',
      date: a.auditDate || '-',
      status: a.status,
      metric: `${a.score}% · ${a.findings?.length || 0} Findings`,
      onPdf: () =>
        exportReportToPdf({
          title: `${a.engineType} Audit Report — ${a.title}`,
          subtitle: `${a.clientName || ''} · ${a.siteLocation || ''}`,
          referenceNo: a.auditRef,
          status: a.status === 'Completed' ? 'Approved' : 'DRAFT – REVIEW REQUIRED',
          metadata: [
            ['Client & Industry', `${a.clientName || '-'} (${a.industry || '-'})`],
            ['Lead Auditor', a.leadAuditor || '-'],
            ['Score', `${a.score}%`],
          ],
          summaryText: a.executiveSummary,
          tableHeaders: ['Finding', 'Severity', 'Condition', 'Action'],
          tableRows: (a.findings || []).map((f) => [
            f.findingId,
            f.classification,
            f.actualCondition,
            f.recommendedAction,
          ]),
          filename: `${a.auditRef}_Audit_Report.pdf`,
        }),
      onDocx: () =>
        exportDocumentToDocx({
          title: `${a.engineType} Audit Report: ${a.title}`,
          docNumber: a.auditRef,
          revision: 'Rev 01',
          status: a.status === 'Completed' ? 'Approved' : 'DRAFT – REVIEW REQUIRED',
          metadata: [
            ['Client', a.clientName || '-'],
            ['Score', `${a.score}%`],
          ],
          bodyText: a.executiveSummary || 'Audit findings report.',
          filename: `${a.auditRef}.docx`,
        }),
      onXlsx: () =>
        exportRowsToExcel(
          'Audit_Findings',
          (a.findings || []).map((f) => ({
            FindingID: f.findingId,
            Severity: f.classification,
            Condition: f.actualCondition,
            Evidence: f.objectiveEvidence,
            Action: f.recommendedAction,
            Owner: f.responsiblePerson,
            TargetDate: f.targetDate,
          })),
          `${a.auditRef}_Findings.xlsx`
        ),
    })),
  ].filter((r) => {
    if (typeFilter !== 'ALL' && r.category !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${r.ref} ${r.title} ${r.industry} ${r.category}`.toLowerCase().includes(q);
    }
    return true;
  });

  const exportMasterLegalAndCapa = (format: 'pdf' | 'xlsx' | 'csv') => {
    if (format === 'pdf') {
      exportReportToPdf({
        title: 'Consolidated Compliance, CAPA & Documentation Management Report',
        subtitle: 'ARSHIEL ASSURANCE Executive Governance Pack',
        referenceNo: `AA-GOV-${new Date().toISOString().slice(0, 10)}`,
        status: 'MANAGEMENT REVIEW PACK (DRAFT – REVIEW REQUIRED)',
        metadata: [
          ['ISO Gap Assessments', String(isoAssessments.length)],
          ['Operational Audits', String(audits.length)],
          ['Tracked Indian Legal Obligations', String(legalRequirements.length)],
          ['Active CAPAs', String(capas.length)],
          ['Controlled Documents', String(documents.length)],
        ],
        tableHeaders: ['CAPA Ref', 'Audit Ref', 'Severity', 'Status', 'Target Date'],
        tableRows: capas.map((c) => [c.capaRef, c.auditRef || '-', c.severity, c.status, c.targetDate || '-']),
        filename: `ARSHIEL_Management_Review_Pack_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
    } else if (format === 'xlsx') {
      exportRowsToExcel(
        'All_Reports_Summary',
        combinedReports.map((r) => ({
          Reference: r.ref,
          Category: r.category,
          Title: r.title,
          Industry: r.industry,
          Date: r.date,
          Status: r.status,
          ScoreOrMetric: r.metric,
        })),
        `ARSHIEL_Reports_Index_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } else {
      exportRowsToCsv(
        combinedReports.map((r) => ({
          Reference: r.ref,
          Category: r.category,
          Title: r.title,
          Industry: r.industry,
          Status: r.status,
          Metric: r.metric,
        })),
        `ARSHIEL_Reports_Index_${new Date().toISOString().slice(0, 10)}.csv`
      );
    }
    showToast(`Exported consolidated ${format.toUpperCase()} report.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            PDF · DOCX · XLSX · CSV Automated Reporting with Mandatory Independence Disclaimers
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Audit Report Management &amp; Export Engine
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => exportMasterLegalAndCapa('pdf')} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800">
            <Download className="w-3.5 h-3.5" /> Management Review PDF
          </button>
          <button type="button" onClick={() => exportMasterLegalAndCapa('xlsx')} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Index XLSX
          </button>
          <button type="button" onClick={() => exportMasterLegalAndCapa('csv')} className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {['ALL', 'ISO Gap Analysis', 'EHS Audit', 'Food Safety Audit', 'Fire & Life Safety Audit', 'Environmental Audit', 'Contractor & Vendor Audit'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setTypeFilter(cat)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                typeFilter === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {cat === 'ALL' ? `All Reports (${combinedReports.length})` : cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, title, industry..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-56"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Reference</th>
                <th className="px-4 py-2.5 font-medium">Report Type</th>
                <th className="px-4 py-2.5 font-medium">Assessment / Audit Title</th>
                <th className="px-4 py-2.5 font-medium">Industry</th>
                <th className="px-4 py-2.5 font-medium">Result</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono-num font-semibold text-slate-900 whitespace-nowrap">{r.ref}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.category}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.industry}</td>
                  <td className="px-4 py-3 font-mono-num font-semibold text-slate-900 whitespace-nowrap">{r.metric}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={r.status === 'Completed' ? 'font-semibold text-emerald-700' : 'text-amber-700 font-medium'}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        r.onPdf();
                        showToast(`Exported ${r.ref} PDF.`);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await r.onDocx();
                        showToast(`Exported ${r.ref} DOCX.`);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <FileText className="w-3 h-3" /> DOCX
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        r.onXlsx();
                        showToast(`Exported ${r.ref} XLSX.`);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <FileSpreadsheet className="w-3 h-3" /> XLSX
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
