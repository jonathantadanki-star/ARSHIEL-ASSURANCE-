import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sparkles,
  LogIn,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import type { ProfessionalServiceSpec } from '../data/enterpriseCatalog';
import { OFFICIAL_CONTACT } from '../data/portalCatalog';
import type { ModuleId } from '../types/assurance';
import { BrandMark } from './BrandMark';

interface ServiceDetailPageProps {
  service: ProfessionalServiceSpec;
  allServices: ProfessionalServiceSpec[];
  isAuthenticated: boolean;
  onBackToPortal: () => void;
  onSelectService: (svc: ProfessionalServiceSpec) => void;
  onOpenModule: (moduleId: ModuleId, label?: string) => void;
  onRequestConsultation: (serviceTitle: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export function ServiceDetailPage({
  service,
  allServices,
  isAuthenticated,
  onBackToPortal,
  onSelectService,
  onOpenModule,
  onRequestConsultation,
  onOpenAuth,
  onLogout,
}: ServiceDetailPageProps) {
  const [imgError, setImgError] = useState(false);

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
                  onClick={() => onOpenModule(service.targetModuleId, service.targetModuleLabel)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Open Platform
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

      {/* Hero with Photo */}
      <section className="relative overflow-hidden border-b border-[#087BFF]/25">
        {!imgError && (
          <img
            src={service.image}
            alt={service.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071329] via-[#071329]/92 to-[#0B1F3A]/85" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
              Our Professional Services
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00D4FF] font-medium">{service.title}</span>
          </nav>

          <div className="text-xs font-semibold text-[#F5B82E] mb-2">
            Service {service.number} · {service.domain}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-4xl">
            {service.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            {service.scopeOverview}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenModule(service.targetModuleId, service.targetModuleLabel)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Open {service.targetModuleLabel}
            </button>
            <button
              type="button"
              onClick={() => onRequestConsultation(service.title)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              Request Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-slate-50 text-slate-900">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-slate-950 mb-4">
                Key Deliverables &amp; Outputs
              </h2>
              <ul className="space-y-3 text-sm text-slate-700">
                {service.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Primary Applicable Sectors
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  {service.applicableIndustries.join('  ·  ')}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-slate-950 mb-4">
                ARSHIEL Structured Execution Methodology
              </h2>
              <ol className="space-y-3 text-sm text-slate-700">
                {service.methodology.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono-num text-xs font-bold text-[#087BFF] mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-2xl bg-[#071329] text-slate-200 p-6 border border-[#087BFF]/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <Lock className="w-5 h-5 text-[#F5B82E] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="font-semibold text-white mb-1">
                  Independent Consultancy &amp; Certification-Body Distinction
                </div>
                {service.authorizationNotice}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRequestConsultation(service.title)}
              className="px-4 py-2.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact {OFFICIAL_CONTACT.organization}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-3">
              Explore All 22 Professional Services
            </div>
            <div className="flex flex-wrap gap-2">
              {allServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectService(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    s.id === service.id
                      ? 'bg-[#071329] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF] hover:text-[#087BFF]'
                  }`}
                >
                  {s.number}. {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
