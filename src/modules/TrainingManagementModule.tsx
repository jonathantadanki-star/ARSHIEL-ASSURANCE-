import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  Users,
  Plus,
  CheckCircle2,
  Download,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { TrainingRecord } from '../types/assurance';
import { exportReportToPdf } from '../utils/exporters';

export function TrainingManagementModule() {
  const {
    trainingRecords,
    effectiveRole,
    can,
    createRecord,
    updateRecord,
    logDocumentAccess,
    showToast,
    userProfile,
  } = useAssurance();

  const canCreate = can('training-management', 'create');
  const canEdit = can('training-management', 'edit');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    courseTitle: '',
    standardRef: 'ISO 45001:2018',
    trainerName: userProfile?.displayName || 'Principal EHS Trainer',
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    mode: 'Live Online' as TrainingRecord['mode'],
    department: 'EHS & Operations',
    attendeesCount: 20,
    assessmentPassScore: 80,
    notes: '',
  });

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Your role does not have permission to create training sessions.', 'warning');
      return;
    }
    const courseCode = `TRN-${new Date().getFullYear()}-${String(trainingRecords.length + 1).padStart(3, '0')}`;
    try {
      await createRecord(
        'trainingRecords',
        'trn',
        {
          courseCode,
          courseTitle: form.courseTitle.trim(),
          standardRef: form.standardRef.trim(),
          trainerName: form.trainerName.trim(),
          scheduledDate: form.scheduledDate,
          mode: form.mode,
          department: form.department.trim(),
          attendeesCount: Number(form.attendeesCount) || 0,
          completionRate: 0,
          assessmentPassScore: Number(form.assessmentPassScore) || 80,
          status: 'Scheduled',
          certificateRef: `AA-TRN-${new Date().getFullYear()}-${String(trainingRecords.length + 1).padStart(3, '0')}`,
          notes: form.notes.trim(),
        },
        'Training Management',
        'Created Training Course',
        courseCode
      );
      setShowCreate(false);
      setForm((prev) => ({ ...prev, courseTitle: '', notes: '' }));
      showToast(`Training course ${courseCode} scheduled.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create course.', 'error');
    }
  };

  const handleMarkCompleted = async (rec: TrainingRecord) => {
    if (!canEdit) return;
    await updateRecord(
      'trainingRecords',
      rec.id,
      { status: 'Completed', completionRate: 100 },
      'Training Management',
      'Approved Training Completion',
      rec.courseCode,
      `Status: ${rec.status}`
    );
    showToast(`${rec.courseCode} marked Completed and completion records unlocked.`);
  };

  const handleDownloadCertificate = (rec: TrainingRecord) => {
    const certId = rec.certificateRef || `AA-TRN-${rec.courseCode}`;
    exportReportToPdf({
      title: 'ARSHIEL ASSURANCE — TRAINING COMPLETION RECORD',
      subtitle: 'Independent Awareness & Internal Competency Training Acknowledgement',
      referenceNo: certId,
      status: rec.status,
      metadata: [
        ['Participant / Organization', `${userProfile?.displayName || 'Participant'} (${userProfile?.orgName || 'ARSHIEL Workspace'})`],
        ['Course Code & Title', `${rec.courseCode} — ${rec.courseTitle}`],
        ['Reference Standard', rec.standardRef || 'ISO / EHS Best Practice'],
        ['Trainer & Mode', `${rec.trainerName || '-'} · ${rec.mode || 'Live Online'}`],
        ['Scheduled Date & Pass Threshold', `${rec.scheduledDate || '-'} · ${rec.assessmentPassScore || 80}%`],
      ],
      summaryText:
        'This document records completion of an independent awareness or competency workshop delivered via ARSHIEL ASSURANCE. Notice: ARSHIEL ASSURANCE is an independent consultancy and training provider and is NOT an accredited IOSH/IRCA/statutory certification body.',
      tableHeaders: [],
      tableRows: [],
      filename: `${certId}_Completion_Record.pdf`,
    });
    logDocumentAccess({
      documentId: rec.id,
      documentName: `${rec.courseTitle} — Training Certificate`,
      docNumber: certId,
      accessType: 'Download',
      exportFormat: 'PDF',
      authorized: true,
    });
    showToast(`Downloaded training completion record ${certId}.`);
  };

  const totalAttendees = trainingRecords.reduce((sum, r) => sum + (r.attendeesCount || 0), 0);
  const completedCount = trainingRecords.filter((r) => r.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#071329] text-white p-6 border border-[#087BFF]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#00D4FF] mb-1">
            <GraduationCap className="w-4 h-4" />
            {effectiveRole === 'Trainee' ? 'Trainee Learning Portal' : 'Training & Competency Academy'}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold">
            ISO, EHS &amp; Compliance Training Management
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage training calendars, ISO/EHS course delivery, participant attendance, competency pass scores, and verified completion acknowledgements.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowCreate((s) => !s)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Training Course
          </button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Courses</span>
            <BookOpen className="w-4 h-4 text-[#087BFF]" />
          </div>
          <div className="text-2xl font-bold text-[#071329] mt-1">{trainingRecords.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Enrolled Participants</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#071329] mt-1">{totalAttendees}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Sessions</span>
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#071329] mt-1">{completedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion Certificates</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[#071329] mt-1">{completedCount}</div>
        </div>
      </div>

      {showCreate && canCreate && (
        <form onSubmit={handleCreateTraining} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#071329]">Schedule New Training Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={form.courseTitle}
              onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
              placeholder="Course Title (e.g., ISO 14001 Environmental Aspect Evaluation)"
              className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="text"
              value={form.standardRef}
              onChange={(e) => setForm({ ...form, standardRef: e.target.value })}
              placeholder="Standard / Framework"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="text"
              value={form.trainerName}
              onChange={(e) => setForm({ ...form, trainerName: e.target.value })}
              placeholder="Trainer Name"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as TrainingRecord['mode'] })}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            >
              <option value="Live Online">Live Online</option>
              <option value="On-Site Workshop">On-Site Workshop</option>
              <option value="Self-Paced Module">Self-Paced Module</option>
            </select>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Target Department"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="number"
              min={1}
              max={500}
              value={form.attendeesCount}
              onChange={(e) => setForm({ ...form, attendeesCount: Number(e.target.value) })}
              placeholder="Expected Attendees"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="number"
              min={50}
              max={100}
              value={form.assessmentPassScore}
              onChange={(e) => setForm({ ...form, assessmentPassScore: Number(e.target.value) })}
              placeholder="Pass Score (%)"
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
          </div>
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
              Save Course Schedule
            </button>
          </div>
        </form>
      )}

      {/* Course Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#071329] inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#087BFF]" />
            Training Calendar, Competency &amp; Certificates
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Standard &amp; Dept</th>
                <th className="px-4 py-3">Schedule &amp; Trainer</th>
                <th className="px-4 py-3">Attendance / Pass</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainingRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-mono text-[10.5px] text-blue-700 font-semibold">{rec.courseCode}</div>
                    <div className="font-semibold text-slate-900">{rec.courseTitle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{rec.standardRef}</div>
                    <div className="text-[11px] text-slate-500">{rec.department || 'All Depts'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{rec.scheduledDate} · {rec.mode}</div>
                    <div className="text-[11px] text-slate-500">{rec.trainerName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{rec.attendeesCount} attendees · {rec.completionRate}% done</div>
                    <div className="text-[11px] text-slate-500">Pass threshold: {rec.assessmentPassScore}%</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rec.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {canEdit && rec.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(rec)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Record PDF
                    </button>
                  </td>
                </tr>
              ))}
              {trainingRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No training sessions scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
