import React, { useMemo, useState } from 'react';
import {
  Leaf,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Factory,
  Zap,
  Droplets,
  Users,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAssurance } from '../context/AssuranceContext';
import { exportReportToPdf, exportRowsToExcel } from '../utils/exporters';
import type { EsgMetricRecord } from '../types/assurance';

const CATEGORY_TO_PILLAR: Record<EsgMetricRecord['category'], EsgMetricRecord['pillar']> = {
  'GHG Scope 1': 'Environmental',
  'GHG Scope 2': 'Environmental',
  'GHG Scope 3': 'Environmental',
  Energy: 'Environmental',
  Water: 'Environmental',
  Waste: 'Environmental',
  'Social Responsibility': 'Social',
  Governance: 'Governance',
};

const DEFAULT_UNITS: Record<EsgMetricRecord['category'], string> = {
  'GHG Scope 1': 'tCO2e',
  'GHG Scope 2': 'tCO2e',
  'GHG Scope 3': 'tCO2e',
  Energy: 'MWh',
  Water: 'kL',
  Waste: 'MT',
  'Social Responsibility': 'Hours / %',
  Governance: 'Score %',
};

export function EsgSustainabilityModule() {
  const {
    canEditRecords,
    esgMetrics,
    createRecord,
    updateRecord,
    deleteRecord,
    showToast,
  } = useAssurance();

  const [pillarFilter, setPillarFilter] = useState<'ALL' | 'Environmental' | 'Social' | 'Governance'>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const [category, setCategory] = useState<EsgMetricRecord['category']>('GHG Scope 1');
  const [metricName, setMetricName] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState(`FY ${new Date().getFullYear()}-${String((new Date().getFullYear() + 1) % 100).padStart(2, '0')}`);
  const [siteLocation, setSiteLocation] = useState('Hyderabad Plant');
  const [value, setValue] = useState<string>('0');
  const [unit, setUnit] = useState('tCO2e');
  const [targetValue, setTargetValue] = useState<string>('');
  const [frameworkRef, setFrameworkRef] = useState('ISO 14064-1 / BRSR / GRI');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredMetrics = useMemo(() => {
    if (pillarFilter === 'ALL') return esgMetrics;
    return esgMetrics.filter((m) => m.pillar === pillarFilter);
  }, [esgMetrics, pillarFilter]);

  const ghgSummary = useMemo(() => {
    const scope1 = esgMetrics
      .filter((m) => m.category === 'GHG Scope 1')
      .reduce((sum, m) => sum + (Number(m.value) || 0), 0);
    const scope2 = esgMetrics
      .filter((m) => m.category === 'GHG Scope 2')
      .reduce((sum, m) => sum + (Number(m.value) || 0), 0);
    const scope3 = esgMetrics
      .filter((m) => m.category === 'GHG Scope 3')
      .reduce((sum, m) => sum + (Number(m.value) || 0), 0);
    const totalCarbon = scope1 + scope2 + scope3;
    const verifiedCount = esgMetrics.filter((m) => m.verificationStatus === 'Verified').length;
    const verificationRate = esgMetrics.length > 0 ? Math.round((verifiedCount / esgMetrics.length) * 100) : 0;

    return { scope1, scope2, scope3, totalCarbon, verifiedCount, verificationRate };
  }, [esgMetrics]);

  const chartData = useMemo(() => {
    const categories: EsgMetricRecord['category'][] = [
      'GHG Scope 1',
      'GHG Scope 2',
      'GHG Scope 3',
      'Energy',
      'Water',
      'Waste',
    ];
    return categories.map((cat) => ({
      name: cat.replace('GHG ', ''),
      actual: Number(
        esgMetrics
          .filter((m) => m.category === cat)
          .reduce((acc, m) => acc + (Number(m.value) || 0), 0)
          .toFixed(2)
      ),
      target: Number(
        esgMetrics
          .filter((m) => m.category === cat && typeof m.targetValue === 'number')
          .reduce((acc, m) => acc + (Number(m.targetValue) || 0), 0)
          .toFixed(2)
      ),
    }));
  }, [esgMetrics]);

  const handleCategoryChange = (nextCat: EsgMetricRecord['category']) => {
    setCategory(nextCat);
    setUnit(DEFAULT_UNITS[nextCat]);
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditRecords) return;
    if (!metricName.trim()) {
      showToast('Metric name is required.', 'warning');
      return;
    }
    const numVal = Number(value);
    if (Number.isNaN(numVal) || numVal < 0) {
      showToast('Value must be a valid non-negative number.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const ref = `ESG-${new Date().getFullYear()}-${String(esgMetrics.length + 1).padStart(3, '0')}`;
      const payload: Record<string, unknown> = {
        metricRef: ref,
        pillar: CATEGORY_TO_PILLAR[category],
        category,
        reportingPeriod: reportingPeriod.trim(),
        siteLocation: siteLocation.trim(),
        metricName: metricName.trim(),
        value: numVal,
        unit: unit.trim() || DEFAULT_UNITS[category],
        frameworkRef: frameworkRef.trim(),
        verificationStatus: 'Draft',
        notes: notes.trim(),
      };
      if (targetValue.trim() !== '' && !Number.isNaN(Number(targetValue)) && Number(targetValue) >= 0) {
        payload.targetValue = Number(targetValue);
      }
      await createRecord('esgMetrics', 'esg', payload, 'ESG & Sustainability', 'Logged ESG Metric', ref);
      showToast(`ESG metric ${ref} saved.`);
      setMetricName('');
      setValue('0');
      setTargetValue('');
      setNotes('');
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    exportRowsToExcel(
      'ESG_Sustainability',
      filteredMetrics.map((m) => ({
        Ref: m.metricRef,
        Pillar: m.pillar,
        Category: m.category,
        Period: m.reportingPeriod,
        Site: m.siteLocation || '-',
        Metric: m.metricName,
        Value: m.value,
        Unit: m.unit,
        Target: m.targetValue ?? '-',
        Framework: m.frameworkRef || '-',
        Verification: m.verificationStatus,
      })),
      `ARSHIEL_ESG_Register_${new Date().toISOString().slice(0, 10)}`
    );
    showToast('ESG & Carbon register exported to Excel.');
  };

  const handleExportPdf = () => {
    exportReportToPdf({
      title: 'ESG, Carbon Accounting (Scope 1/2/3) & Sustainability Report',
      subtitle: 'Division 04 · ISO 14064 / ISO 50001 / ISO 26000 / BRSR / GRI Tracking',
      referenceNo: `ESG-RPT-${new Date().toISOString().slice(0, 10)}`,
      status: `${ghgSummary.verificationRate}% DATA VERIFIED`,
      metadata: [
        ['Total GHG Carbon Footprint', `${ghgSummary.totalCarbon.toLocaleString()} tCO2e`],
        ['Scope 1 / Scope 2 / Scope 3', `${ghgSummary.scope1} / ${ghgSummary.scope2} / ${ghgSummary.scope3} tCO2e`],
        ['Total ESG Indicators Tracked', String(esgMetrics.length)],
        ['Verified Indicators', `${ghgSummary.verifiedCount} (${ghgSummary.verificationRate}%)`],
      ],
      tableHeaders: ['Ref', 'Pillar', 'Category', 'Metric', 'Actual', 'Target', 'Status'],
      tableRows: filteredMetrics.slice(0, 40).map((m) => [
        m.metricRef,
        m.pillar,
        m.category,
        m.metricName,
        `${m.value} ${m.unit}`,
        m.targetValue !== undefined ? `${m.targetValue} ${m.unit}` : '-',
        m.verificationStatus,
      ]),
      filename: `ARSHIEL_ESG_Report_${new Date().toISOString().slice(0, 10)}`,
    });
    showToast('ESG sustainability summary exported to PDF.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            Division 04 · Compliance, ESG &amp; Sustainability — ISO 14064 · ISO 50001 · ISO 26000 · BRSR · GRI
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ESG, GHG Carbon Footprint &amp; Sustainability Hub
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#071329] hover:bg-[#087BFF] text-white rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          {canEditRecords && (
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Log ESG / GHG Metric
            </button>
          )}
        </div>
      </div>

      {/* Carbon & ESG Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Total GHG Footprint</span>
            <Factory className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {ghgSummary.totalCarbon.toLocaleString()} <span className="text-xs font-normal text-slate-500">tCO2e</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Scope 1 + Scope 2 + Scope 3</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Scope 1 (Direct)</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {ghgSummary.scope1.toLocaleString()} <span className="text-xs font-normal text-slate-500">tCO2e</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Combustion, fleet, fugitives</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Scope 2 &amp; Scope 3</span>
            <Droplets className="w-4 h-4 text-[#087BFF]" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-[#087BFF] mt-1">
            {ghgSummary.scope2.toLocaleString()} / {ghgSummary.scope3.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Purchased energy / value chain</div>
        </div>
        <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Assurance Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono-num text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {ghgSummary.verificationRate}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {ghgSummary.verifiedCount} of {esgMetrics.length} metrics verified
          </div>
        </div>
      </div>

      {/* Create Form */}
      {formOpen && canEditRecords && (
        <form
          onSubmit={handleAddMetric}
          className="bg-white dark:bg-[#0B1F3A] border border-emerald-200 dark:border-emerald-500/40 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3.5"
        >
          <div className="md:col-span-4 font-display text-sm font-bold text-slate-900 dark:text-white">
            Record ESG, Carbon Emission, Energy, Water, Waste, Social or Governance Indicator
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as EsgMetricRecord['category'])}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            >
              {Object.keys(CATEGORY_TO_PILLAR).map((c) => (
                <option key={c} value={c}>{c} ({CATEGORY_TO_PILLAR[c as EsgMetricRecord['category']]})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Metric Description *</label>
            <input
              type="text"
              required
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="DG Set Diesel Combustion Emissions / Grid Electricity Consumption"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Reporting Period</label>
            <input
              type="text"
              required
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Measured Value *</label>
            <input
              type="number"
              step="any"
              min={0}
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Unit *</label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Target Threshold (Optional)</label>
            <input
              type="number"
              step="any"
              min={0}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-xs font-mono-num bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Site Location</label>
            <input
              type="text"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Framework Reference</label>
            <input
              type="text"
              value={frameworkRef}
              onChange={(e) => setFrameworkRef(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Verification Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Source utility bill / meter ID"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071329] dark:text-white border border-slate-300 dark:border-white/15 rounded-lg"
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Metric'}
            </button>
          </div>
        </form>
      )}

      {/* Visualization + Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Environmental &amp; Carbon Performance vs Targets
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Computed directly from saved Firestore ESG metrics
              </p>
            </div>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="actual" name="Actual" fill="#087BFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">ESG Pillar Coverage</h2>
            {(['Environmental', 'Social', 'Governance'] as const).map((pillar) => {
              const items = esgMetrics.filter((m) => m.pillar === pillar);
              const verified = items.filter((m) => m.verificationStatus === 'Verified').length;
              return (
                <div
                  key={pillar}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-[#071329] border border-slate-200/80 dark:border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {pillar === 'Environmental' ? (
                      <Leaf className="w-4 h-4 text-emerald-600" />
                    ) : pillar === 'Social' ? (
                      <Users className="w-4 h-4 text-[#087BFF]" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{pillar}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{verified} verified</div>
                    </div>
                  </div>
                  <div className="font-mono-num text-sm font-bold text-slate-900 dark:text-white">{items.length}</div>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/10 pt-3">
            Aligned with ISO 14064-1 GHG Inventory, ISO 50001 Energy Management, ISO 26000 Social Responsibility, and SEBI BRSR / GRI disclosures.
          </div>
        </div>
      </div>

      {/* Filter & Register Table */}
      <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex gap-1.5">
            {(['ALL', 'Environmental', 'Social', 'Governance'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPillarFilter(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  pillarFilter === p
                    ? 'bg-[#071329] dark:bg-[#087BFF] text-white'
                    : 'bg-slate-100 dark:bg-[#071329] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {p === 'ALL' ? 'All Pillars' : p}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
            {filteredMetrics.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#071329] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Ref &amp; Period</th>
                <th className="px-4 py-3 font-semibold">Pillar / Category</th>
                <th className="px-4 py-3 font-semibold">Metric &amp; Site</th>
                <th className="px-4 py-3 font-semibold text-right">Actual</th>
                <th className="px-4 py-3 font-semibold text-right">Target</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                    No ESG metrics logged yet. Click &quot;Log ESG / GHG Metric&quot; to start tracking Scope 1/2/3 carbon, energy, water, waste, social, and governance KPIs.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono-num font-semibold text-slate-900 dark:text-white">{m.metricRef}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.reportingPeriod}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{m.category}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.pillar}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{m.metricName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {m.siteLocation || 'Enterprise'} · {m.frameworkRef || 'General ESG'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono-num font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {m.value.toLocaleString()} {m.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono-num text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {m.targetValue !== undefined ? `${m.targetValue.toLocaleString()} ${m.unit}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          m.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}
                      >
                        {m.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canEditRecords ? (
                        <div className="inline-flex items-center gap-1">
                          {m.verificationStatus !== 'Verified' && (
                            <button
                              type="button"
                              title="Mark Verified"
                              onClick={() =>
                                updateRecord(
                                  'esgMetrics',
                                  m.id,
                                  { verificationStatus: 'Verified' },
                                  'ESG & Sustainability',
                                  'Verified ESG Metric',
                                  m.metricRef
                                )
                              }
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete Metric"
                            onClick={() =>
                              deleteRecord('esgMetrics', m.id, 'ESG & Sustainability', 'Deleted ESG Metric', m.metricRef)
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3" /> Read-Only
                        </span>
                      )}
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
