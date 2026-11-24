import React, { useMemo, useState } from 'react';
import {
  Shield,
  History,
  Lock,
  UserCheck,
  Plus,
  Trash2,
  Check,
  Sliders,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import {
  ALL_PERMISSION_ACTIONS,
  ALL_USER_ROLES,
  type ModuleId,
  type PermissionAction,
  type UserProfile,
  type UserRole,
} from '../types/assurance';
import {
  ALL_MODULE_IDS,
  DEFAULT_ROLE_PERMISSIONS,
  MODULE_DISPLAY_META,
  ROLE_PORTAL_DESCRIPTORS,
  resolveModulePermissions,
} from '../security/rbac';

export function UsersRolesModule() {
  const {
    userProfile,
    effectiveRole,
    allUsers,
    customRoles,
    auditLogs,
    isSuperAdmin,
    superAdminOnlyWriteMode,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [department, setDepartment] = useState(userProfile?.department || '');
  const [siteAccess, setSiteAccess] = useState(userProfile?.siteAccess || '');

  // Permission matrix viewer state
  const [matrixRole, setMatrixRole] = useState<UserRole>(effectiveRole);

  // Custom role builder state
  const [showCustomRoleBuilder, setShowCustomRoleBuilder] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [customBaseRole, setCustomBaseRole] = useState<UserRole>('Lead Auditor');
  const [customRoleDesc, setCustomRoleDesc] = useState('');
  const [customPerms, setCustomPerms] = useState<Partial<Record<ModuleId, PermissionAction[]>>>(
    () => ({ ...DEFAULT_ROLE_PERMISSIONS['Lead Auditor'] })
  );

  const selectedMatrixPermissions = useMemo(() => {
    const map: Partial<Record<ModuleId, PermissionAction[]>> = {};
    for (const mod of ALL_MODULE_IDS) {
      map[mod] = resolveModulePermissions(matrixRole, mod, customRoles, undefined, superAdminOnlyWriteMode);
    }
    return map;
  }, [matrixRole, customRoles, superAdminOnlyWriteMode]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    try {
      await updateRecord(
        'users',
        userProfile.uid,
        {
          displayName: displayName.trim() || userProfile.displayName,
          department: department.trim(),
          siteAccess: siteAccess.trim(),
        },
        'User & Role Management',
        'Updated Profile Metadata',
        userProfile.uid,
        `Name: ${userProfile.displayName}, Dept: ${userProfile.department || ''}`
      );
      showToast('Profile details updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Profile update failed.', 'error');
    }
  };

  const handleAdminRoleChange = async (target: UserProfile, newRole: UserRole) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admins can modify RBAC role assignments.', 'error');
      return;
    }
    try {
      await updateRecord(
        'users',
        target.uid,
        { role: newRole },
        'User & Role Management',
        `Changed RBAC Role to ${newRole}`,
        target.uid,
        `Role: ${target.role}`
      );
      showToast(`Updated ${target.displayName} role to ${newRole}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Role update denied by security rules.', 'error');
    }
  };

  const handleAdminStatusChange = async (
    target: UserProfile,
    newStatus: UserProfile['status']
  ) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admins can change account status.', 'error');
      return;
    }
    try {
      await updateRecord(
        'users',
        target.uid,
        { status: newStatus },
        'User & Role Management',
        `Updated Account Status to ${newStatus}`,
        target.uid,
        `Status: ${target.status}`
      );
      showToast(`${target.displayName} status updated to ${newStatus}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Status update failed.', 'error');
    }
  };

  const handleAssignCustomRole = async (target: UserProfile, customRoleId: string) => {
    if (!isSuperAdmin) return;
    try {
      await updateRecord(
        'users',
        target.uid,
        { customRoleId },
        'User & Role Management',
        'Assigned Custom Role Policy',
        target.uid,
        `CustomRole: ${target.customRoleId || 'Default'}`
      );
      showToast('Custom role permission profile applied.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to assign custom role.', 'error');
    }
  };

  const toggleCustomPerm = (mod: ModuleId, action: PermissionAction) => {
    setCustomPerms((prev) => {
      const existing = prev[mod] || [];
      const next = existing.includes(action)
        ? existing.filter((a) => a !== action)
        : [...existing, action];
      return { ...prev, [mod]: next };
    });
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('Only Super Admins can create custom roles.', 'error');
      return;
    }
    if (!customRoleName.trim()) {
      showToast('Enter a unique custom role name.', 'warning');
      return;
    }
    try {
      await createRecord(
        'customRoles',
        'crole',
        {
          name: customRoleName.trim(),
          baseRole: customBaseRole,
          description: customRoleDesc.trim() || `Customized permission set derived from ${customBaseRole}`,
          permissions: customPerms,
          active: true,
          createdBy: userProfile?.displayName || 'Super Admin',
        },
        'Role & Permission Management',
        'Created Custom RBAC Role',
        customRoleName.trim()
      );
      setShowCustomRoleBuilder(false);
      setCustomRoleName('');
      setCustomRoleDesc('');
      showToast(`Custom role "${customRoleName.trim()}" saved to Firestore.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save custom role.', 'error');
    }
  };

  const handleDeleteCustomRole = async (id: string, name: string) => {
    if (!isSuperAdmin) return;
    try {
      await deleteRecord('customRoles', id, 'Role & Permission Management', 'Deleted Custom RBAC Role', name);
      showToast(`Deleted custom role "${name}".`, 'warning');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete custom role.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            14 Enterprise RBAC Roles · 12 Granular Action Permissions · Custom Role Builder · Multi-Org Isolation
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Users, Roles &amp; Granular Permission Governance
          </h1>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowCustomRoleBuilder((s) => !s)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showCustomRoleBuilder ? 'Close Custom Role Builder' : 'Create Custom Role'}
          </button>
        )}
      </div>

      {/* Super Admin-Only Write Governance Policy Banner */}
      <div className="rounded-xl bg-[#071329] text-white border border-[#087BFF]/35 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#F5B82E] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-display text-sm font-bold text-white">
              Access Governance: Super Admin Full Control · All Other Accounts = Standard User (View-Only)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Add, Edit, Remove, Delete, Approve, AI Generation, and Platform Configuration are strictly reserved for <strong>Super Admin</strong>. Every non-admin signup defaults automatically to <strong>Read-Only Viewer</strong> and is blocked from mutating records at the UI, Backend API, and Firestore Database Rule layers.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold whitespace-nowrap shrink-0">
          {superAdminOnlyWriteMode ? 'Super Admin–Only Write: ON' : 'Standard RBAC Mode'}
        </span>
      </div>

      {/* Active Session Profile & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSaveProfile} className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#087BFF]" />
              <h2 className="font-display text-sm font-semibold text-slate-900">Your Active Session Profile</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {effectiveRole}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Email: {userProfile?.email} · Org: {userProfile?.orgId}
          </div>
          <div className="space-y-2.5 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                disabled={!isSuperAdmin}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
              <input
                type="text"
                value={department}
                disabled={!isSuperAdmin}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Authorized Sites</label>
              <input
                type="text"
                value={siteAccess}
                disabled={!isSuperAdmin}
                onChange={(e) => setSiteAccess(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <Lock className="w-3 h-3" /> {isSuperAdmin ? 'Super Admin Edit Enabled' : 'Read-Only User (Super Admin Edit Only)'}
            </span>
            {isSuperAdmin && (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Profile
              </button>
            )}
          </div>
        </form>

        {/* Registered Users Directory */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#087BFF]" />
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Registered Workspace Accounts ({allUsers.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {isSuperAdmin ? 'Super Admin Directory Access' : 'Own Profile Only (PII Isolated)'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Assigned Role</th>
                  <th className="px-4 py-2.5 font-medium">Custom Policy</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{u.displayName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.orgName || u.orgId}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleAdminRoleChange(u, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          {ALL_USER_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-slate-900">{u.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isSuperAdmin && customRoles.length > 0 ? (
                        <select
                          value={u.customRoleId || ''}
                          onChange={(e) => handleAssignCustomRole(u, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="">Default Matrix</option>
                          {customRoles.map((cr) => (
                            <option key={cr.id} value={cr.id}>
                              {cr.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-500">Default</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {isSuperAdmin ? (
                        <select
                          value={u.status}
                          onChange={(e) =>
                            handleAdminStatusChange(u, e.target.value as UserProfile['status'])
                          }
                          className={`px-2 py-1 text-xs border rounded font-semibold ${
                            u.status === 'Active'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-red-200 bg-red-50 text-red-800'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Locked">Locked</option>
                          <option value="Invited">Invited</option>
                        </select>
                      ) : (
                        <span className="font-medium text-emerald-700">{u.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Role Builder (Admin Only) */}
      {showCustomRoleBuilder && isSuperAdmin && (
        <form onSubmit={handleCreateCustomRole} className="bg-white border-2 border-[#087BFF]/35 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-[#071329] inline-flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#087BFF]" />
                Custom Role &amp; Granular Permission Builder
              </h2>
              <p className="text-xs text-slate-500">
                Customize all 12 actions per module (create, view, edit, delete, approve, reject, assign, download, export, submit, close, configure).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={customRoleName}
              onChange={(e) => setCustomRoleName(e.target.value)}
              placeholder="Custom Role Name (e.g., Senior ESG Lead Reviewer)"
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
            <select
              value={customBaseRole}
              onChange={(e) => {
                const next = e.target.value as UserRole;
                setCustomBaseRole(next);
                setCustomPerms({ ...DEFAULT_ROLE_PERMISSIONS[next] });
              }}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {ALL_USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  Clone Base Role: {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customRoleDesc}
              onChange={(e) => setCustomRoleDesc(e.target.value)}
              placeholder="Short operational scope description"
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Module</th>
                  {ALL_PERMISSION_ACTIONS.map((act) => (
                    <th key={act} className="px-1.5 py-2 text-center">
                      {act}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_MODULE_IDS.map((mod) => {
                  const modPerms = customPerms[mod] || [];
                  return (
                    <tr key={mod} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 font-semibold text-slate-800 whitespace-nowrap">
                        {MODULE_DISPLAY_META[mod].shortLabel}
                      </td>
                      {ALL_PERMISSION_ACTIONS.map((act) => {
                        const checked = modPerms.includes(act);
                        return (
                          <td key={act} className="px-1.5 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCustomPerm(mod, act)}
                              className="rounded border-slate-300 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomRoleBuilder(false)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#087BFF] hover:bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              Save Custom Role to Firestore
            </button>
          </div>
        </form>
      )}

      {/* Active Custom Roles List */}
      {customRoles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Saved Custom Roles ({customRoles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customRoles.map((cr) => (
              <div key={cr.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">{cr.name}</div>
                  <div className="text-[11px] text-blue-700">Base: {cr.baseRole}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cr.description}</div>
                </div>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomRole(cr.id, cr.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    aria-label={`Delete ${cr.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 12-Action x Module Permission Matrix Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Granular 12-Action Permission Matrix (14 Canonical Roles)
            </h2>
            <p className="text-xs text-slate-500">
              Inspect exact module-level enforcement for every role across all 12 actions.
            </p>
          </div>
          <select
            value={matrixRole}
            onChange={(e) => setMatrixRole(e.target.value as UserRole)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            {ALL_USER_ROLES.map((r) => (
              <option key={r} value={r}>
                Inspect Role: {r}
              </option>
            ))}
          </select>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>{matrixRole}</strong> — {ROLE_PORTAL_DESCRIPTORS[matrixRole].summary}
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10.5px] font-semibold">
            {ROLE_PORTAL_DESCRIPTORS[matrixRole].scopeBadge}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Module</th>
                {ALL_PERMISSION_ACTIONS.map((act) => (
                  <th key={act} className="px-2 py-2.5 text-center">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_MODULE_IDS.map((mod) => {
                const perms = selectedMatrixPermissions[mod] || [];
                return (
                  <tr key={mod} className={perms.length === 0 ? 'opacity-45' : 'hover:bg-slate-50/70'}>
                    <td className="px-4 py-2 font-semibold text-slate-900 whitespace-nowrap">
                      {MODULE_DISPLAY_META[mod].shortLabel}
                    </td>
                    {ALL_PERMISSION_ACTIONS.map((act) => {
                      const allowed = perms.includes(act);
                      return (
                        <td key={act} className="px-2 py-2 text-center">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Immutable Security &amp; Governance Audit Trail
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-500">{auditLogs.length} Events Recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Module</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Reference</th>
                <th className="px-4 py-2.5 font-medium">Actor &amp; Role</th>
                <th className="px-4 py-2.5 font-medium">Result &amp; IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 25).map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{log.module}</td>
                  <td className="px-4 py-2.5 text-slate-800 whitespace-nowrap">{log.action}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">{log.entityRef || '-'}</td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                    {log.actorName || '-'} ({log.actorRole || '-'})
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                    {log.result || 'Success'} {log.ipAddress ? `· ${log.ipAddress}` : ''}
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
