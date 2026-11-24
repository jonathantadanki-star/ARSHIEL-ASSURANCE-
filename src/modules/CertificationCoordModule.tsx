import React, { useState } from 'react';
import {
  Award,
  Plus,
  CalendarClock,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  Clock,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { CertificationApplicationRecord } from '../types/assurance';

const STAGES: CertificationApplicationRecord['stage'][] = [
  'Readiness Assessment',
  'Application Submitted',
  'Stage 1 Audit Scheduled',
  'Stage 2 Audit Scheduled',
  'Surveillance Due',
  'Renewal Alert',
  'Completed',
];

export function CertificationCoordModule() {
  const {
    certificationApplications,
    can,
    createRecord,
    updateRecord,
    userProfile,
    showToast,
  } = useAssurance();

  const canCreate = can('certification-coord', 'create');
  const canEdit = can('certification-coord', 'edit');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    clientName: '',
    standardCode: 'ISO 9001:2015',
    accreditedBodyName: 'Independent NABCB/IAF Accredited CB (Client Selected)',
    stage: 'Readiness Assessment' as CertificationApplicationRecord['stage'],
    targetAssessmentDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    renewalDueDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    notes: '',
  });

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Your role does not have permission to create certification coordination files.', 'warning');
      return;
    }
    const appRef = `CERT-SUP-${new Date().getFullYear()}-${String(certificationApplications.length + 1).padStart(2, '0')}`;
    try {
      await createRecord(
        'certificationApplications',
        'cert',
        {
          applicationRef: appRef,
          clientName: form.clientName.trim(),
          standardCode: form.standardCode.trim(),
          accreditedBodyName: form.accreditedBodyName.trim(),
          stage: form.stage,
          coordinatorName: userProfile?.displayName || 'Certification Coordinator',
          targetAssessmentDate: form.targetAssessmentDate,
          renewalDueDate: form.renewalDueDate,
          documentsReady: false,
          authorizationVerified: true,
          notes: form.notes.trim(),
        },
        'Certification Coordination',
        'Created Certification Support Dossier',
        appRef
      );
      setShowCreate(false);
      setForm((prev) => ({ ...prev, clientName: '', notes: '' }));
      showToast(`Certification support dossier ${appRef} created.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create dossier.', 'error');
    }
  };

  const handleStageUpdate = async (
    app: CertificationApplicationRecord,
    nextStage: CertificationApplicationRecord['stage']
  ) => {
    if (!canEdit) return;
    await updateRecord(
      'certificationApplications',
      app.id,
      { stage: nextStage, documentsReady: nextStage !== 'Readiness Assessment' ? true : app.documentsReady },
      'Certification Coordination',
      'Updated Certification Coordination Stage',
      app.applicationRef,
      `Stage: ${app.stage}`
    );
    showToast(`${app.applicationRef} moved to ${nextStage}.`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#071329] text-white p-6 border border-[#087BFF]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#F5B82E] mb-1">
            <Award className="w-4 h-4" />
            Certification Coordination &amp; Readiness Support
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">
            Accredited-Body Liaison, Readiness Dossiers &amp; Renewal Alerts
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Coordinate client readiness documentation, Stage 1 / Stage 2 assessment schedules, surveillance tracking, and renewal reminders with independent accredited certification bodies.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate((s) => !s)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Support Dossier
          </button>
        )}
      </div>

      {/* Mandatory Independence Guardrail */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-950">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Impartiality &amp; Legal Authorization Notice: </strong>
          ARSHIEL ASSURANCE provides independent certification readiness consultancy, mock audits, and application coordination only. Accredited ISO certificates are issued exclusively by independent IAF/NABCB accredited certification bodies selected by the client.
        </div>
      </div>

      {showCreate && canCreate && (
        <form onSubmit={handleCreateApp} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#071329]">Create Certification Support Dossier</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="Client Organization Name"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="text"
              required
              value={form.standardCode}
              onChange={(e) => setForm({ ...form, standardCode: e.target.value })}
              placeholder="Target ISO Standard (e.g., ISO 45001:2018)"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="text"
              value={form.accreditedBodyName}
              onChange={(e) => setForm({ ...form, accreditedBodyName: e.target.value })}
              placeholder="Independent Accredited Certification Body"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <select
              value={form.stage}
              onChange={(e) =>
                setForm({ ...form, stage: e.target.value as CertificationApplicationRecord['stage'] })
              }
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            >
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Target Assessment Date</label>
              <input
                type="date"
                value={form.targetAssessmentDate}
                onChange={(e) => setForm({ ...form, targetAssessmentDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Renewal / Surveillance Alert Date</label>
              <input
                type="date"
                value={form.renewalDueDate}
                onChange={(e) => setForm({ ...form, renewalDueDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Readiness notes, documentation gaps, or accredited CB scheduling remarks..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#071329] hover:bg-[#087BFF] text-xs font-semibold text-white cursor-pointer"
            >
              Create Dossier
            </button>
          </div>
        </form>
      )}

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {certificationApplications.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-[11px] font-bold text-[#087BFF]">{app.applicationRef}</div>
                <h3 className="text-sm font-bold text-[#071329]">{app.clientName}</h3>
                <div className="text-xs text-slate-600 mt-0.5">
                  Standard: <strong>{app.standardCode}</strong> · CB: {app.accreditedBodyName}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                {app.stage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700">
                <CalendarClock className="w-3.5 h-3.5 text-[#087BFF]" />
                <span>Assessment: {app.targetAssessmentDate || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Renewal Alert: {app.renewalDueDate || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <FileCheck2 className={`w-3.5 h-3.5 ${app.documentsReady ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span>Dossier: {app.documentsReady ? 'Verified Ready' : 'In Preparation'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Independence Guard: Active</span>
              </div>
            </div>

            {app.notes && <p className="text-xs text-slate-600">{app.notes}</p>}

            {canEdit && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">Coordinator: {app.coordinatorName}</span>
                <select
                  value={app.stage}
                  onChange={(e) =>
                    handleStageUpdate(app, e.target.value as CertificationApplicationRecord['stage'])
                  }
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
                >
                  {STAGES.map((st) => (
                    <option key={st} value={st}>
                      Stage: {st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
        {certificationApplications.length === 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No certification support dossiers tracked yet.
          </div>
        )}
      </div>
    </div>
  );
}
