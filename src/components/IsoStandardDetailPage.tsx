import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LogIn,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import type { IsoStandardDetailSpec } from '../data/enterpriseCatalog';
import type { ModuleId } from '../types/assurance';
import { BrandMark } from './BrandMark';

interface IsoStandardDetailPageProps {
  standard: IsoStandardDetailSpec;
  allStandards: IsoStandardDetailSpec[];
  isAuthenticated: boolean;
  onBackToPortal: () => void;
  onSelectStandard: (std: IsoStandardDetailSpec) => void;
  onOpenModule: (moduleId: ModuleId, label?: string) => void;
  onRequestConsultation: (topic: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export function IsoStandardDetailPage({
  standard,
  allStandards,
  isAuthenticated,
  onBackToPortal,
  onSelectStandard,
  onOpenModule,
  onRequestConsultation,
  onOpenAuth,
  onLogout,
}: IsoStandardDetailPageProps) {
  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-[#071329]/95 backdrop-blur-md border-b border-[#087BFF]/25">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D4FF] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="h-4 w-px bg-white/15 hidden sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={onBackToPortal}
              className="hidden sm:flex items-center gap-2.5 cursor-pointer"
            >
              <BrandMark size={36} />
              <span className="font-display text-sm font-bold text-white whitespace-nowrap">
                ARSHIEL <span className="text-[#00D4FF]">ASSURANCE</span>
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenModule('iso-gap', 'AI ISO Gap Analysis Engine')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Open ISO Gap Engine
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 text-xs font-medium text-slate-200 hover:bg-white/10 whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#071329] via-[#0B1F3A] to-[#071329] border-b border-[#087BFF]/25">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Global ISO Standards
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00D4FF] font-medium">{standard.code}</span>
          </nav>

          <div className="text-xs font-semibold text-[#F5B82E] mb-2">
            {standard.category} · {standard.edition}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {standard.code} — {standard.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            {standard.summary}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenModule('iso-gap', `AI ISO Gap Analysis (${standard.code})`)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Run {standard.code} AI Gap Analysis
            </button>
            <button
              type="button"
              onClick={() => onRequestConsultation(`${standard.code} – ${standard.title} Support`)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              Request {standard.code} Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-slate-50 text-slate-900">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#087BFF]" />
                <h2 className="font-display text-lg font-bold text-slate-950">
                  High-Level Clause Focus (Original Guidance Summary)
                </h2>
              </div>
              <div className="space-y-3">
                {standard.keyClausesOverview.map((c) => (
                  <div
                    key={c.clause}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="font-mono-num text-xs font-bold text-[#087BFF]">{c.clause}</div>
                    <div className="text-sm text-slate-800 mt-1">{c.focus}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-display text-lg font-bold text-slate-950 mb-3">
                  Auditing &amp; Readiness Services
                </h2>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {standard.auditingServices.map((svc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-display text-base font-bold text-slate-950 mb-2">
                  Primary Industry Relevance
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {standard.industryRelevance.join('  ·  ')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong>Edition Verification &amp; Independence Notice:</strong> {standard.verificationNote}{' '}
              ARSHIEL ASSURANCE provides independent gap assessments, internal audits, and implementation consulting. Official accredited certification is issued solely by independent accredited certification bodies.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-3">
              Browse All Global ISO Standards ({allStandards.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {allStandards.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectStandard(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    s.id === standard.id
                      ? 'bg-[#071329] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF] hover:text-[#087BFF]'
                  }`}
                >
                  {s.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
