import React, { useMemo, useState } from 'react';
import { Plus, Download, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { CapaRecord, CapaStatus } from '../types/assurance';
import { exportReportToPdf, exportRowsToExcel } from '../utils/exporters';

const CAPA_STATUSES: CapaStatus[] = [
  'Open',
  'Assigned',
  'In Progress',
  'Pending Verification',
  'Closed',
  'Rejected',
  'Overdue',
];

export function CapaManagementEngine() {
  const { capas, createRecord, updateRecord, showToast, canEditRecords } = useAssurance();
  const [statusFilter, setStatusFilter] = useState<'ALL' | CapaStatus>('ALL');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    findingRef: '',
    auditRef: '',
    findingDescription: '',
    severity: 'Major' as CapaRecord['severity'],
    priority: 'High' as CapaRecord['priority'],
    responsiblePerson: '',
    department: '',
    targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    rootCause: '',
    fiveWhys: '',
    fishbone: '',
    correctiveAction: '',
    preventiveAction: '',
  });

  const filtered = useMemo(
    () => capas.filter((c) => statusFilter === 'ALL' || c.status === statusFilter),
    [capas, statusFilter]
  );

  const activeCapa = useMemo(() => {
    if (selectedId) return filtered.find((c) => c.id === selectedId) || filtered[0];
    return filtered[0];
  }, [filtered, selectedId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const capaRef = `CAPA-${new Date().getFullYear()}-${String(capas.length + 1).padStart(3, '0')}`;
    try {
      const id = await createRecord(
        'capas',
        'capa',
        {
          capaRef,
          ...form,
          status: 'Open',
          closureEvidence: '',
          verificationNotes: '',
          effectivenessReview: '',
          escalated: form.priority === 'Critical',
        },
        'CAPA Management',
        'Created CAPA Record',
        capaRef
      );
      setSelectedId(id);
      setShowCreate(false);
      setForm({
        findingRef: '',
        auditRef: '',
        findingDescription: '',
        severity: 'Major',
        priority: 'High',
        responsiblePerson: '',
        department: '',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        rootCause: '',
        fiveWhys: '',
        fishbone: '',
        correctiveAction: '',
        preventiveAction: '',
      });
      showToast(`Created ${capaRef}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create CAPA.', 'error');
    }
  };

  const handlePatch = async (patch: Partial<CapaRecord>) => {
    if (!activeCapa) return;
    try {
      await updateRecord(
        'capas',
        activeCapa.id,
        patch as Record<string, unknown>,
        'CAPA Management',
        'Updated CAPA Record',
        activeCapa.capaRef
      );
      showToast(`Saved changes to ${activeCapa.capaRef}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: 'Centralized CAPA Management & Closure Report',
      subtitle: `Total CAPAs: ${filtered.length} · Overdue: ${filtered.filter((c) => c.status === 'Overdue').length}`,
      referenceNo: `AA-CAPA-${new Date().toISOString().slice(0, 10)}`,
      status: 'CAPA TRACKING REPORT',
      metadata: [
        ['Filter Status', statusFilter],
        ['Open / In Progress', String(capas.filter((c) => c.status !== 'Closed').length)],
        ['Overdue & Escalated', String(capas.filter((c) => c.status === 'Overdue' || c.escalated).length)],
      ],
      tableHeaders: ['CAPA Ref', 'Audit / Finding', 'Severity', 'Status', 'Owner & Target', 'Corrective Action'],
      tableRows: filtered.map((c) => [
        c.capaRef,
        `${c.auditRef || '-'} / ${c.findingRef || '-'}`,
        c.severity,
        c.status,
        `${c.responsiblePerson || '-'} (${c.targetDate || '-'})`,
        c.correctiveAction || '-',
      ]),
      filename: `ARSHIEL_CAPA_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
    showToast('CAPA PDF Report exported.');
  };

  const handleExportExcel = () => {
    exportRowsToExcel(
      'CAPA_Tracker',
      filtered.map((c) => ({
        CAPA_Ref: c.capaRef,
        Audit_Ref: c.auditRef || '',
        Finding_Ref: c.findingRef || '',
        Severity: c.severity,
        Priority: c.priority,
        Status: c.status,
        Finding: c.findingDescription,
        RootCause: c.rootCause || '',
        FiveWhys: c.fiveWhys || '',
        Fishbone: c.fishbone || '',
        CorrectiveAction: c.correctiveAction || '',
        PreventiveAction: c.preventiveAction || '',
        Owner: c.responsiblePerson || '',
        Department: c.department || '',
        TargetDate: c.targetDate || '',
        Escalated: c.escalated ? 'Yes' : 'No',
      })),
      `ARSHIEL_CAPA_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('CAPA Excel workbook exported.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Root Cause Analysis (5-Why &amp; Fishbone) · Closure Verification · Effectiveness Review · Escalation
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            CAPA Management Engine
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <FileSpreadsheet className="w-3.5 h-3.5" /> XLSX
          </button>
          {canEditRecords && (
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" /> New CAPA
            </button>
          )}
        </div>
      </div>

      {showCreate && canEditRecords && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">Log New CAPA</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Audit Reference" value={form.auditRef} onChange={(e) => setForm({ ...form, auditRef: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Finding Reference" value={form.findingRef} onChange={(e) => setForm({ ...form, findingRef: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as CapaRecord['severity'] })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
              <option value="Observation">Observation</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as CapaRecord['priority'] })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <textarea rows={2} required placeholder="Finding Description *" value={form.findingDescription} onChange={(e) => setForm({ ...form, findingDescription: e.target.value })} className="md:col-span-4 px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Responsible Person" value={form.responsiblePerson} onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Immediate Root Cause Summary" value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <textarea rows={2} placeholder="Corrective Action" value={form.correctiveAction} onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })} className="md:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <textarea rows={2} placeholder="Preventive Action" value={form.preventiveAction} onChange={(e) => setForm({ ...form, preventiveAction: e.target.value })} className="md:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">Create CAPA</button>
          </div>
        </form>
      )}

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          All ({capas.length})
        </button>
        {CAPA_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-2">
          {filtered.map((c) => {
            const active = c.id === activeCapa?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                  active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono-num text-xs font-bold">{c.capaRef}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      active ? 'text-amber-400' : c.status === 'Overdue' ? 'text-red-700' : c.status === 'Closed' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className={`text-xs line-clamp-2 ${active ? 'text-slate-100' : 'text-slate-800'}`}>{c.findingDescription}</p>
                <p className={`text-[11px] mt-1 font-mono-num ${active ? 'text-slate-400' : 'text-slate-500'}`}>
                  {c.severity} · Due {c.targetDate || 'TBD'} {c.escalated ? '· Escalated' : ''}
                </p>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-8">
          {!activeCapa ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-500">
              Select a CAPA record to manage root cause analysis, closure evidence, and verification.
            </div>
          ) : (
            <div key={activeCapa.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-mono-num text-slate-500 mb-1">
                    {activeCapa.capaRef} · Audit: {activeCapa.auditRef || 'Standalone'} · Finding: {activeCapa.findingRef || '-'}
                  </div>
                  <h2 className="font-display text-base font-bold text-slate-900">{activeCapa.findingDescription}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Owner: {activeCapa.responsiblePerson || 'Unassigned'} ({activeCapa.department || '-'}) · Target: <span className="font-mono-num">{activeCapa.targetDate || 'TBD'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={activeCapa.status}
                    disabled={!canEditRecords}
                    onChange={(e) => canEditRecords && handlePatch({ status: e.target.value as CapaStatus })}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {CAPA_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!canEditRecords}
                    onClick={() => canEditRecords && handlePatch({ escalated: !activeCapa.escalated })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border disabled:opacity-60 disabled:cursor-not-allowed ${
                      activeCapa.escalated ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {activeCapa.escalated ? 'Escalated' : 'Escalate'}
                  </button>
                </div>
              </div>

              <fieldset disabled={!canEditRecords} className="grid grid-cols-1 md:grid-cols-2 gap-4 disabled:opacity-80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">5-Why Root Cause Analysis</label>
                  <textarea
                    rows={3}
                    defaultValue={activeCapa.fiveWhys || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.fiveWhys || '') && handlePatch({ fiveWhys: e.target.value })}
                    placeholder="1. Why... 2. Why... 3. Why... 4. Why... 5. Root Cause..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fishbone (Ishikawa) Analysis</label>
                  <textarea
                    rows={3}
                    defaultValue={activeCapa.fishbone || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.fishbone || '') && handlePatch({ fishbone: e.target.value })}
                    placeholder="People | Process | Equipment | Materials | Environment | Management"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Corrective Action (Eliminate Root Cause)</label>
                  <textarea
                    rows={2}
                    defaultValue={activeCapa.correctiveAction || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.correctiveAction || '') && handlePatch({ correctiveAction: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Preventive Action (Prevent Recurrence)</label>
                  <textarea
                    rows={2}
                    defaultValue={activeCapa.preventiveAction || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.preventiveAction || '') && handlePatch({ preventiveAction: e.target.value })}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Closure Objective Evidence</label>
                  <input
                    type="text"
                    defaultValue={activeCapa.closureEvidence || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.closureEvidence || '') && handlePatch({ closureEvidence: e.target.value })}
                    placeholder="PO number, photos, training sign-offs..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Auditor Verification Notes</label>
                  <input
                    type="text"
                    defaultValue={activeCapa.verificationNotes || ''}
                    onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.verificationNotes || '') && handlePatch({ verificationNotes: e.target.value })}
                    placeholder="Verification date & auditor outcome"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Effectiveness Review</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={activeCapa.effectivenessReview || ''}
                      onBlur={(e) => canEditRecords && e.target.value !== (activeCapa.effectivenessReview || '') && handlePatch({ effectivenessReview: e.target.value })}
                      placeholder="30/60/90-day effectiveness confirmation..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                    {canEditRecords && activeCapa.status !== 'Closed' && (
                      <button
                        type="button"
                        onClick={() => handlePatch({ status: 'Closed' })}
                        className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify &amp; Close
                      </button>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
