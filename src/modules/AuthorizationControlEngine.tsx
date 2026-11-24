import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Ban,
  CheckCircle2,
  Plus,
  History,
  ExternalLink,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type {
  AuthorizationStatusType,
  ServiceAuthorizationRecord,
  ServiceCategoryType,
} from '../types/assurance';

const SERVICE_CATEGORIES: ServiceCategoryType[] = [
  'CATEGORY 1 – GENERAL CONSULTANCY',
  'CATEGORY 2 – INDEPENDENT ASSESSMENT',
  'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT',
];

const AUTH_STATUS_OPTIONS: AuthorizationStatusType[] = [
  'Not Required for This Defined Consultancy Scope',
  'Requirement Verification Pending',
  'Authorization Required',
  'Authorization Not Available',
  'Authorization Verified',
  'Authorization Expired',
  'Restricted Service',
];

export function AuthorizationControlEngine() {
  const {
    serviceAuthorizations,
    restrictionLogs,
    isSuperAdmin,
    canEditRecords,
    createRecord,
    updateRecord,
    logRestrictionAttempt,
    showToast,
  } = useAssurance();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ServiceCategoryType>('ALL');
  const [blockedModal, setBlockedModal] = useState<{
    service: ServiceAuthorizationRecord;
    action: string;
  } | null>(null);
  const [editingService, setEditingService] = useState<ServiceAuthorizationRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // New Service Form
  const [newSvc, setNewSvc] = useState({
    serviceName: '',
    category: 'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT' as ServiceCategoryType,
    applicableLaw: '',
    requiredQualification: '',
    requiredAuthorization: '',
    requiredAccreditation: '',
    requiredAppointment: '',
    competenceRequirements: '',
    externalReferralGuidance: '',
  });

  const filteredServices = serviceAuthorizations.filter(
    (s) => categoryFilter === 'ALL' || s.category === categoryFilter
  );

  // Automatic Restriction Gate Logic
  const handleAttemptServiceAction = async (
    service: ServiceAuthorizationRecord,
    action: 'Publish Service' | 'Generate Quotation' | 'Book Audit' | 'Issue Certificate'
  ) => {
    const isRestricted =
      service.approvalStatus === 'Blocked / Restricted' ||
      service.category === 'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT' &&
        service.authStatus !== 'Authorization Verified';

    if (isRestricted || action === 'Issue Certificate') {
      const reason =
        action === 'Issue Certificate'
          ? 'ARSHIEL ASSURANCE does not issue official ISO certificates, statutory inspection certificates, or regulatory licenses.'
          : `Service requires verified authorization/accreditation (${service.requiredAuthorization || service.requiredAccreditation || 'Statutory Authority'}). Current status: ${service.authStatus}.`;

      await logRestrictionAttempt(service.id, service.serviceName, action, reason);
      setBlockedModal({ service, action });
      showToast(`BLOCKED: ${action} denied by Legal Authorization Control Engine.`, 'error');
      return;
    }

    showToast(
      `Action "${action}" permitted within defined non-statutory consultancy/assessment scope for "${service.serviceName}".`,
      'success'
    );
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCat3 = newSvc.category === 'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT';
    try {
      await createRecord(
        'serviceAuthorizations',
        'svc',
        {
          ...newSvc,
          authorizationValidity: isCat3 ? 'Authorization Not Available' : 'Pending Scope Verification',
          verificationStatus: isCat3 ? 'Restricted — Mandatory Block Active' : 'Pending Admin Verification',
          approvalStatus: isCat3 ? 'Blocked / Restricted' : 'Pending Review',
          authStatus: isCat3 ? 'Authorization Required' : 'Requirement Verification Pending',
          evidenceDocs: 'Pending Super Admin evidence review',
        },
        'Legal Authorization Control',
        'Registered Service Eligibility Rule',
        newSvc.serviceName.slice(0, 80)
      );
      setShowAdd(false);
      setNewSvc({
        serviceName: '',
        category: 'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT',
        applicableLaw: '',
        requiredQualification: '',
        requiredAuthorization: '',
        requiredAccreditation: '',
        requiredAppointment: '',
        competenceRequirements: '',
        externalReferralGuidance: '',
      });
      showToast('Service registered under Legal Authorization Control.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to register service.', 'error');
    }
  };

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !isSuperAdmin) return;
    try {
      await updateRecord(
        'serviceAuthorizations',
        editingService.id,
        {
          authStatus: editingService.authStatus,
          approvalStatus: editingService.approvalStatus,
          authorizationValidity: editingService.authorizationValidity || '',
          verificationStatus: editingService.verificationStatus || '',
          evidenceDocs: editingService.evidenceDocs || '',
          externalReferralGuidance: editingService.externalReferralGuidance || '',
        },
        'Legal Authorization Control',
        `Admin Updated Eligibility (${editingService.approvalStatus})`,
        editingService.serviceName.slice(0, 80)
      );
      setEditingService(null);
      showToast('Super Administrator updated service authorization record.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Only Super Administrators can update authorization records.', 'error');
    }
  };

  const counts = {
    cat1: serviceAuthorizations.filter((s) => s.category.startsWith('CATEGORY 1')).length,
    cat2: serviceAuthorizations.filter((s) => s.category.startsWith('CATEGORY 2')).length,
    cat3Blocked: serviceAuthorizations.filter((s) => s.approvalStatus === 'Blocked / Restricted').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Mandatory Core Security Module · Prevents Unauthorized Regulated Service Delivery
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Legal Authorization Control Engine
          </h1>
        </div>
        {canEditRecords && (
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Register Service Control Rule
          </button>
        )}
      </div>

      {/* Distinction Framework Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-700 mb-1">Category 1 · General Consultancy</div>
          <div className="font-mono-num text-2xl font-bold text-slate-900">{counts.cat1}</div>
          <p className="text-xs text-slate-500 mt-1">
            ISO gap analysis, implementation support, documentation drafts, general risk &amp; advisory consultancy.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-sky-700 mb-1">Category 2 · Independent Assessment</div>
          <div className="font-mono-num text-2xl font-bold text-slate-900">{counts.cat2}</div>
          <p className="text-xs text-slate-500 mt-1">
            Non-statutory EHS assessments, contractor/vendor audits, NFPA-based fire reviews &amp; food hygiene assessments.
          </p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-red-700 mb-1">Category 3 · Restricted / Regulated</div>
          <div className="font-mono-num text-2xl font-bold text-red-700">{counts.cat3Blocked} Blocked</div>
          <p className="text-xs text-slate-500 mt-1">
            Accredited ISO certification, statutory safety audits, NABL labs, FSSAI inspections &amp; regulated certificates.
          </p>
        </div>
      </div>

      {showAdd && canEditRecords && (
        <form onSubmit={handleAddService} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-slate-900">Add Service Classification &amp; Authorization Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Service Name *"
              value={newSvc.serviceName}
              onChange={(e) => setNewSvc({ ...newSvc, serviceName: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={newSvc.category}
              onChange={(e) => setNewSvc({ ...newSvc, category: e.target.value as ServiceCategoryType })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Applicable Law / Standard"
              value={newSvc.applicableLaw}
              onChange={(e) => setNewSvc({ ...newSvc, applicableLaw: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Required Authorization / Accreditation"
              value={newSvc.requiredAuthorization}
              onChange={(e) => setNewSvc({ ...newSvc, requiredAuthorization: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Required Qualification / Appointment"
              value={newSvc.requiredQualification}
              onChange={(e) => setNewSvc({ ...newSvc, requiredQualification: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="External Authorized Provider Referral Guidance"
              value={newSvc.externalReferralGuidance}
              onChange={(e) => setNewSvc({ ...newSvc, externalReferralGuidance: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">
              Save Service Rule
            </button>
          </div>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          All Services ({serviceAuthorizations.length})
        </button>
        {SERVICE_CATEGORIES.map((cat, idx) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              categoryFilter === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Category {idx + 1}
          </button>
        ))}
      </div>

      {/* Service Control Cards */}
      <div className="space-y-3">
        {filteredServices.map((svc) => {
          const isBlocked = svc.approvalStatus === 'Blocked / Restricted';
          return (
            <div
              key={svc.id}
              className={`bg-white border rounded-xl p-5 space-y-3 ${
                isBlocked ? 'border-red-200' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{svc.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className={isBlocked ? 'font-bold text-red-700 inline-flex items-center gap-1' : 'font-semibold text-emerald-700 inline-flex items-center gap-1'}>
                      {isBlocked ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {svc.approvalStatus}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{svc.authStatus}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">{svc.serviceName}</h3>
                </div>

                {isSuperAdmin ? (
                  <button
                    type="button"
                    onClick={() => setEditingService(svc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg whitespace-nowrap shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Admin Review
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Super Admin Controlled
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="block text-[11px] text-slate-400">Applicable Law / Framework</span>
                  <span className="text-slate-800">{svc.applicableLaw || '-'}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Required Qualification &amp; Authorization</span>
                  <span className="text-slate-800">{svc.requiredAuthorization || svc.requiredQualification || '-'}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">External Referral / Validity</span>
                  <span className="text-slate-800">{svc.externalReferralGuidance || svc.authorizationValidity || '-'}</span>
                </div>
              </div>

              {/* Live Enforcement Gate Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Live Automatic Enforcement Gate (all restricted attempts are logged immutably):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(['Publish Service', 'Generate Quotation', 'Book Audit', 'Issue Certificate'] as const).map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleAttemptServiceAction(svc, act)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        isBlocked || act === 'Issue Certificate'
                          ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Immutable Restriction Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Immutable Service Restriction Log
            </h2>
          </div>
          <span className="font-mono-num text-xs text-slate-500">{restrictionLogs.length} Blocked Events</span>
        </div>
        {restrictionLogs.length === 0 ? (
          <div className="p-6 text-xs text-slate-500">
            No unauthorized service attempts logged yet. Click any action on a Category 3 service above to test the automatic restriction gate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Service Name</th>
                  <th className="px-4 py-2.5 font-medium">Blocked Action</th>
                  <th className="px-4 py-2.5 font-medium">Actor</th>
                  <th className="px-4 py-2.5 font-medium">Enforcement Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restrictionLogs.slice(0, 15).map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{log.serviceName}</td>
                    <td className="px-4 py-2.5 font-semibold text-red-700">{log.actionAttempted}</td>
                    <td className="px-4 py-2.5 text-slate-600">{log.actorName || '-'}</td>
                    <td className="px-4 py-2.5 text-slate-600">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blocked Service Warning Modal */}
      {blockedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-red-300 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-base font-bold text-red-800">
                  Service Action Blocked — Authorization Control Active
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Attempted Action: <strong>{blockedModal.action}</strong> on <strong>{blockedModal.service.serviceName}</strong>
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 space-y-1.5">
              <p><strong>Classification:</strong> {blockedModal.service.category}</p>
              <p><strong>Required Authorization:</strong> {blockedModal.service.requiredAuthorization || blockedModal.service.requiredAccreditation || 'Statutory / Accredited Body Authorization'}</p>
              <p><strong>Current Status:</strong> {blockedModal.service.authStatus}</p>
              <p><strong>Lawful External Referral:</strong> {blockedModal.service.externalReferralGuidance || 'Refer transparently to an appropriately accredited or government-authorized external body.'}</p>
            </div>
            <p className="text-[11px] text-slate-500">
              This restriction event has been immutably recorded in the Legal Authorization Restriction Log. Ordinary users and AI agents cannot override Category 3 restrictions.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockedModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Acknowledge Restriction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Review Modal */}
      {editingService && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form onSubmit={handleAdminSave} className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
              <h3 className="font-display text-base font-bold text-slate-900">
                Super Administrator Authorization Verification
              </h3>
            </div>
            <p className="text-xs text-slate-600">{editingService.serviceName}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Authorization Status</label>
                <select
                  value={editingService.authStatus}
                  onChange={(e) =>
                    setEditingService({ ...editingService, authStatus: e.target.value as AuthorizationStatusType })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {AUTH_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Approval Status</label>
                <select
                  value={editingService.approvalStatus}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      approvalStatus: e.target.value as ServiceAuthorizationRecord['approvalStatus'],
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Blocked / Restricted">Blocked / Restricted</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved for Delivery">Approved for Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Authorization Validity / Expiry</label>
                <input
                  type="text"
                  value={editingService.authorizationValidity || ''}
                  onChange={(e) => setEditingService({ ...editingService, authorizationValidity: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Verified Evidence Reference</label>
                <input
                  type="text"
                  value={editingService.evidenceDocs || ''}
                  onChange={(e) => setEditingService({ ...editingService, evidenceDocs: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 text-xs bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Save Verification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
