import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  Lock,
  Sparkles,
  LogIn,
  LogOut,
  UserCircle2,
  LayoutDashboard,
  ShieldCheck,
  Scale,
  CheckCircle2,
  FileText,
  Leaf,
  GraduationCap,
  ClipboardCheck,
  Search,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import type { IndustryBlueprint } from '../data/industriesCatalog';
import { OFFICIAL_CONTACT } from '../data/portalCatalog';
import type { ModuleId } from '../types/assurance';
import { exportRowsToExcel } from '../utils/exporters';
import { BrandMark } from './BrandMark';

interface IndustrySolutionPageProps {
  industry: IndustryBlueprint;
  allIndustries: IndustryBlueprint[];
  isAuthenticated: boolean;
  userName?: string | null;
  onBackToPortal: () => void;
  onSelectIndustry: (industry: IndustryBlueprint) => void;
  onSelectIsoCode: (isoCode: string) => void;
  onOpenModule: (moduleId: ModuleId, label?: string) => void;
  onRequestAssessment: (industryName: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export function IndustrySolutionPage({
  industry,
  allIndustries,
  isAuthenticated,
  userName,
  onBackToPortal,
  onSelectIndustry,
  onSelectIsoCode,
  onOpenModule,
  onRequestAssessment,
  onOpenAuth,
  onLogout,
}: IndustrySolutionPageProps) {
  const [heroImgError, setHeroImgError] = useState(false);

  const handleDownloadStarterChecklist = () => {
    const rows = industry.sampleChecklistFocus.map((item, idx) => ({
      ItemNo: `CHK-${String(idx + 1).padStart(2, '0')}`,
      Industry: industry.name,
      SectorFocus: industry.sectorTag,
      InspectionCheckpoint: item,
      ReferenceStandards: industry.applicableIsoStandards.join(', '),
      Status: 'Pending Verification',
      AuditorRemarks: '',
    }));
    exportRowsToExcel(
      `${industry.name.slice(0, 20)} Check`,
      rows,
      `ARSHIEL_${industry.id}_Audit_Checklist.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#071329]/95 backdrop-blur-md border-b border-[#087BFF]/25">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="h-4 w-px bg-white/15 hidden sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={onBackToPortal}
              className="hidden sm:flex items-center gap-2.5 min-w-0 cursor-pointer"
            >
              <BrandMark size={36} />
              <span className="font-display text-sm font-bold tracking-tight text-white whitespace-nowrap">
                ARSHIEL <span className="text-[#00D4FF]">ASSURANCE</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenModule('dashboard', 'Executive Dashboard')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Open Platform
                </button>
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-300 px-2 whitespace-nowrap">
                  <UserCircle2 className="w-4 h-4 text-[#00D4FF]" />
                  {userName || 'Auditor'}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#087BFF]/45 text-xs font-semibold text-white hover:bg-[#087BFF]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#00D4FF]" />
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Realistic Industrial Photograph & Contrast Scrim */}
      <section className="relative overflow-hidden border-b border-[#087BFF]/25">
        {!heroImgError && (
          <img
            src={industry.image}
            alt={industry.name}
            referrerPolicy="no-referrer"
            onError={() => setHeroImgError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071329] via-[#071329]/92 to-[#0B1F3A]/80" />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Industries We Serve
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00D4FF] font-medium">{industry.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="text-xs font-semibold text-[#F5B82E] tracking-wide mb-2">
                {industry.group} · {industry.sectorTag}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {industry.name}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
                {industry.overview}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onOpenModule(
                      industry.recommendedModules[0]?.moduleId || 'ehs-audit',
                      industry.recommendedModules[0]?.label || 'AI EHS Audit Engine'
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/60 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Launch {industry.recommendedModules[0]?.label || 'Audit Engine'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadStarterChecklist}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#00D4FF]" />
                  Download Industry Checklist (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => onRequestAssessment(industry.name)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Request Sector Consultation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl bg-[#0B1F3A]/90 border border-[#087BFF]/30 p-5 backdrop-blur-sm space-y-3">
              <div className="text-xs font-semibold text-[#F5B82E]">
                Quick-Launch Workspace Engines
              </div>
              <div className="space-y-2">
                {industry.recommendedModules.map((mod) => (
                  <button
                    key={mod.moduleId}
                    type="button"
                    onClick={() => onOpenModule(mod.moduleId, mod.label)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#071329] hover:bg-[#087BFF]/20 border border-white/10 hover:border-[#00D4FF]/40 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <span>{mod.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete A–O Industry-Specific Coverage */}
      <main className="flex-1 bg-slate-50 text-slate-900">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* A. Overview & B. Sub-Sectors + C. Applicable ISO Standards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <Building2 className="w-5 h-5 text-[#087BFF]" />
                <h2 className="font-display text-lg font-bold text-slate-950">
                  A &amp; B. Industry Overview &amp; Covered Sub-Sectors
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">{industry.overview}</p>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Specialized Sub-Sectors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {industry.subSectors.map((sub, i) => (
                  <div
                    key={sub}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <span className="font-mono-num text-[11px] font-bold text-[#087BFF]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#087BFF]" />
                  <h2 className="font-display text-lg font-bold text-slate-950">
                    C. Applicable ISO Standards
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Click any ISO standard below to inspect its clauses, editions, and auditing services.
                </p>
                <div className="space-y-2">
                  {industry.applicableIsoStandards.map((std) => (
                    <button
                      key={std}
                      type="button"
                      onClick={() => onSelectIsoCode(std)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-[#071329] border border-slate-200 hover:border-[#087BFF] text-xs font-semibold text-slate-900 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span>{std} — Gap Analysis &amp; Management System Support</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00D4FF]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                ARSHIEL ASSURANCE provides independent gap analysis and readiness consulting; formal accredited ISO certification is issued strictly by independent accredited certification bodies.
              </div>
            </div>
          </div>

          {/* Core Industry Services Banner */}
          <div className="bg-[#071329] text-white rounded-2xl p-6 border border-[#087BFF]/25">
            <div className="text-xs font-semibold text-[#00D4FF] uppercase tracking-wider mb-3">
              Key {industry.name} Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {industry.industryServices.map((svc) => (
                <div
                  key={svc}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/10 text-xs font-medium text-slate-100 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B82E] shrink-0" />
                  <span>{svc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* D, E, F: Auditing & Certification Support */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-xs font-bold text-[#087BFF] mb-1">D. Third-Party Audit Services</div>
              <h3 className="font-display text-base font-bold text-slate-950 mb-3">
                Independent Third-Party Audits
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.thirdPartyAudits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-xs font-bold text-[#087BFF] mb-1">E. Internal Audit Services</div>
              <h3 className="font-display text-base font-bold text-slate-950 mb-3">
                Risk-Based Internal Audits
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.internalAuditServices.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="text-xs font-bold text-[#087BFF] mb-1">F. Certification Support</div>
              <h3 className="font-display text-base font-bold text-slate-950 mb-3">
                Readiness &amp; Pre-Assessment Support
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.certificationSupport.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* G, H, I: Legal, EHS & Risk Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-[#087BFF]" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  G. Legal &amp; Statutory Compliance
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.legalCompliance.map((law, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-[#087BFF] mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{law}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  H. EHS / HSE / SHE Auditing
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.ehsAuditing.map((ehs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-emerald-600 mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{ehs}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  I. Risk Assessment (HIRA / HAZID / JSA)
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                {industry.riskAssessment.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-red-600 mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* J, K, L: AI Docs, Inspections, Training */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#087BFF]" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  J. AI-Powered Document Generation
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {industry.aiDocumentGeneration.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#087BFF] shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-sky-600" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  K. Inspection &amp; Assessment Services
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {industry.inspectionServices.map((insp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{insp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  L. Training &amp; Competency Development
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {industry.trainingCompetency.map((tr, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* M, N, O: ESG, Audit Reports/CAPA, Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  M. ESG &amp; Sustainability
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {industry.esgSustainability.map((esg, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{esg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="w-4 h-4 text-[#087BFF]" />
                <h3 className="font-display text-base font-bold text-slate-950">
                  N. Audit Reports &amp; CAPA Management
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {industry.auditReportsCapa.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#087BFF] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-4 h-4 text-[#087BFF]" />
                  <h3 className="font-display text-base font-bold text-slate-950">
                    O. Industry-Specific Resources
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed mb-4">
                  {industry.industryResources.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleDownloadStarterChecklist}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Starter Checklist (.xlsx)
              </button>
            </div>
          </div>

          {/* Mandatory Governance Notice */}
          <div className="rounded-2xl bg-[#071329] text-slate-200 p-6 border border-[#087BFF]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <Lock className="w-5 h-5 text-[#F5B82E] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-white mb-1">
                  Legal Authorization Control &amp; Independent Assessment Scope
                </div>
                ARSHIEL ASSURANCE provides independent auditing, ISO readiness support, and AI-assisted documentation for the {industry.name}. Accredited certification, government statutory inspections, Fire NOCs, and official regulatory licences remain strictly under authorized bodies.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRequestAssessment(industry.name)}
              className="px-4 py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              Consult {OFFICIAL_CONTACT.organization}
            </button>
          </div>

          {/* Switch Between All 28+ Industries */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-3">
              Switch Industry Blueprint ({allIndustries.length} Sectors)
            </div>
            <div className="flex flex-wrap gap-2">
              {allIndustries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectIndustry(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    item.id === industry.id
                      ? 'bg-[#071329] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF] hover:text-[#087BFF]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
