import React, { useMemo, useState } from 'react';
import {
  Plus,
  Layers,
  Power,
  Trash2,
  FileSpreadsheet,
  Search,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { MasterDataRecord, MasterDataType } from '../types/assurance';
import { exportRowsToExcel } from '../utils/exporters';

const DATA_TYPES: MasterDataType[] = [
  'Industry',
  'Standard',
  'AuditCategory',
  'ParentModule',
  'ChildModule',
  'SubChildModule',
  'ChecklistQuestion',
  'DocumentTemplate',
  'RiskCategory',
  'ComplianceParameter',
];

export function MasterDataModuleBuilder({ initialMode }: { initialMode?: 'industries' | 'master' }) {
  const { masterData, organizations, createRecord, updateRecord, deleteRecord, showToast, canEditRecords } = useAssurance();

  const [typeFilter, setTypeFilter] = useState<'ALL' | MasterDataType>(
    initialMode === 'industries' ? 'Industry' : 'ALL'
  );
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddOrg, setShowAddOrg] = useState(false);

  const [form, setForm] = useState({
    dataType: (initialMode === 'industries' ? 'Industry' : 'ParentModule') as MasterDataType,
    code: '',
    name: '',
    parentId: '',
    description: '',
    criteria: '',
    evidenceRequired: '',
    riskLevel: 'High',
  });

  const [orgForm, setOrgForm] = useState({
    name: '',
    industry: 'Semiconductor',
    state: 'Telangana',
    sites: '',
  });

  const filtered = useMemo(() => {
    return masterData.filter((m) => {
      if (typeFilter !== 'ALL' && m.dataType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!`${m.code} ${m.name} ${m.description || ''} ${m.parentId || ''}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [masterData, typeFilter, search]);

  // Build hierarchical visualization chain for Parent -> Child -> SubChild -> Questions
  const hierarchyChains = useMemo(() => {
    const byCode = new Map<string, MasterDataRecord>();
    masterData.forEach((m) => byCode.set(m.code, m));
    const questions = masterData.filter((m) => m.dataType === 'ChecklistQuestion');
    return questions.map((q) => {
      const chain: string[] = [q.name];
      let curr: MasterDataRecord | undefined = q.parentId ? byCode.get(q.parentId) : undefined;
      let guard = 0;
      while (curr && guard < 6) {
        chain.unshift(curr.name);
        curr = curr.parentId ? byCode.get(curr.parentId) : undefined;
        guard++;
      }
      return { id: q.id, code: q.code, chain, riskLevel: q.riskLevel || 'Medium' };
    });
  }, [masterData]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase() || `${form.dataType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    try {
      await createRecord(
        'masterData',
        'md',
        {
          ...form,
          code,
          active: true,
          version: 1,
        },
        'Master Data Builder',
        `Created ${form.dataType}`,
        code
      );
      setShowAdd(false);
      setForm({
        dataType: 'ParentModule',
        code: '',
        name: '',
        parentId: '',
        description: '',
        criteria: '',
        evidenceRequired: '',
        riskLevel: 'High',
      });
      showToast(`Added dynamic ${form.dataType} (${code}).`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Create failed.', 'error');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecord(
        'organizations',
        'org',
        {
          name: orgForm.name.trim(),
          industry: orgForm.industry,
          state: orgForm.state,
          sites: orgForm.sites.trim(),
          status: 'Active',
        },
        'Organization Management',
        'Registered Client Organization',
        orgForm.name.slice(0, 80)
      );
      setShowAddOrg(false);
      setOrgForm({ name: '', industry: 'Semiconductor', state: 'Telangana', sites: '' });
      showToast('Client organization registered.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add organization.', 'error');
    }
  };

  const handleToggleActive = async (item: MasterDataRecord) => {
    await updateRecord(
      'masterData',
      item.id,
      { active: !item.active, version: (item.version || 1) + 1 },
      'Master Data Builder',
      `${item.active ? 'Deactivated' : 'Activated'} ${item.code}`,
      item.code
    );
    showToast(`${item.code} ${item.active ? 'deactivated' : 'activated'} (v${(item.version || 1) + 1}).`);
  };

  const handleDelete = async (item: MasterDataRecord) => {
    await deleteRecord('masterData', item.id, 'Master Data Builder', `Deleted ${item.code}`, item.code);
    showToast(`Deleted ${item.code}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-500 mb-1">
            Unlimited Database-Driven Industries, Standards, Parent/Child/Sub-Child Modules &amp; Dynamic Checklists
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            {initialMode === 'industries' ? 'Industry & Organization Management Engine' : 'Master Data & Dynamic Module Builder'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              exportRowsToExcel(
                'Master_Data_Hierarchy',
                masterData.map((m) => ({
                  Type: m.dataType,
                  Code: m.code,
                  Name: m.name,
                  ParentCode: m.parentId || '',
                  Criteria: m.criteria || '',
                  Evidence: m.evidenceRequired || '',
                  RiskLevel: m.riskLevel || '',
                  Active: m.active ? 'Active' : 'Inactive',
                  Version: m.version,
                })),
                'ARSHIEL_Master_Data.xlsx'
              )
            }
            className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export XLSX
          </button>
          {canEditRecords && (
            <>
              <button
                type="button"
                onClick={() => setShowAddOrg((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50"
              >
                <Building2 className="w-3.5 h-3.5" /> Add Client Organization
              </button>
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Dynamic Node
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Client Organization Form */}
      {showAddOrg && canEditRecords && (
        <form onSubmit={handleCreateOrg} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">Register Client Organization &amp; Sites</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" required placeholder="Organization Name *" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" required placeholder="Industry *" value={orgForm.industry} onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <select value={orgForm.state} onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Pan-India">Pan-India</option>
            </select>
            <input type="text" placeholder="Sites / Locations (comma separated)" value={orgForm.sites} onChange={(e) => setOrgForm({ ...orgForm, sites: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddOrg(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">Save Organization</button>
          </div>
        </form>
      )}

      {/* Add Dynamic Master Data / Module Node Form */}
      {showAdd && canEditRecords && (
        <form onSubmit={handleCreateItem} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="font-display text-sm font-semibold text-slate-900">Create Dynamic Master Data / Module Hierarchy Node</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={form.dataType} onChange={(e) => setForm({ ...form, dataType: e.target.value as MasterDataType })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              {DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder="Unique Code (e.g. MOD-PHARMA-CLEAN)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="">No Parent (Root Node)</option>
              {masterData.map((m) => (
                <option key={m.id} value={m.code}>
                  [{m.dataType}] {m.code} — {m.name}
                </option>
              ))}
            </select>
            <input type="text" required placeholder="Node Name / Audit Question Text *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="md:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white">
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
            <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Assessment Criteria (for checklist questions)" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
            <input type="text" placeholder="Evidence Required" value={form.evidenceRequired} onChange={(e) => setForm({ ...form, evidenceRequired: e.target.value })} className="px-3 py-2 text-xs border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg">Save Dynamic Node</button>
          </div>
        </form>
      )}

      {/* Client Organizations Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Active Client Organizations ({organizations.length})
          </h2>
          <span className="text-xs text-slate-500">Organization-Level Data Isolation Enforced</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {organizations.map((org) => (
            <div key={org.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{org.name}</span>
                <span className="text-[11px] font-medium text-emerald-700">{org.status}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {org.industry} · {org.state} · Sites: {org.sites || 'Primary'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Hierarchy Visualization (Industry -> Parent -> Child -> Sub-Child -> Questions) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-700" />
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Live Dynamic Hierarchy Paths (Industry &rarr; Parent &rarr; Child &rarr; Sub-Child &rarr; Audit Questions)
          </h2>
        </div>
        <div className="space-y-2">
          {hierarchyChains.map((c) => (
            <div key={c.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center gap-1.5">
              <span className="font-mono-num text-[11px] font-bold text-amber-700 mr-1">{c.code}</span>
              {c.chain.map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className={i === c.chain.length - 1 ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                    {step}
                  </span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button type="button" onClick={() => setTypeFilter('ALL')} className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>
            All ({masterData.length})
          </button>
          {DATA_TYPES.slice(0, 7).map((t) => (
            <button key={t} type="button" onClick={() => setTypeFilter(t)} className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${typeFilter === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter code, module, question..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-56"
          />
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Code</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Name / Question</th>
                <th className="px-4 py-2.5 font-medium">Parent</th>
                <th className="px-4 py-2.5 font-medium">Ver</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono-num font-semibold text-slate-900">{m.code}</td>
                  <td className="px-4 py-2.5 text-slate-600">{m.dataType}</td>
                  <td className="px-4 py-2.5 text-slate-900 max-w-md">
                    <div className="font-medium">{m.name}</div>
                    {m.description && <div className="text-[11px] text-slate-500 truncate">{m.description}</div>}
                  </td>
                  <td className="px-4 py-2.5 font-mono-num text-slate-500">{m.parentId || '—'}</td>
                  <td className="px-4 py-2.5 font-mono-num text-slate-600">v{m.version}</td>
                  <td className="px-4 py-2.5">
                    <span className={m.active ? 'font-semibold text-emerald-700' : 'text-slate-400'}>
                      {m.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-2">
                    {canEditRecords ? (
                      <>
                        <button type="button" onClick={() => handleToggleActive(m)} title="Activate/Deactivate" className="p-1 text-slate-600 hover:text-slate-900">
                          <Power className="w-3.5 h-3.5 inline" />
                        </button>
                        <button type="button" onClick={() => handleDelete(m)} title="Delete" className="p-1 text-red-600 hover:text-red-800">
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">Read-Only</span>
                    )}
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
