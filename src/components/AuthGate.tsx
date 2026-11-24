import React, { useState } from 'react';
import { ShieldCheck, Scale, FileCheck2, Lock, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { MANDATORY_DISCLAIMER_LINES } from '../data/seedCatalog';
import { ARSHIEL_LOGO_SRC, BrandMark } from './BrandMark';

export function AuthGate() {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleLogin = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete sign-in. Please allow popups and try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040D21] text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 clean zones */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8 border-b border-blue-500/20">
        <div className="flex items-center gap-3 shrink-0">
          <BrandMark size={40} />
          <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
            ARSHIEL <span className="text-sky-400">ASSURANCE</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#engines" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Core Engines</a>
          <a href="#governance" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Authorization Control</a>
          <a href="#disclaimer" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Governance Notice</a>
        </nav>
        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg hover:from-blue-500 hover:to-sky-400 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
        >
          {signingIn ? 'Signing In...' : 'Sign In with Google'}
        </button>
      </header>

      {/* Hero Split */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-wider uppercase text-sky-300 mb-3">
              Independent Consultancy &amp; Third-Party Assessment Platform
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
              Assessing Risks. Strengthening Compliance. Improving Performance.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
              An integrated enterprise platform for AI-assisted ISO Gap Analysis, Indian Central, Andhra Pradesh &amp; Telangana Legal Compliance, Dynamic EHS Auditing, Food Safety, Fire &amp; Environmental Assessments, CAPA Management, and Legal Authorization Control.
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-lg border border-red-800 bg-red-950/60 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleLogin}
                disabled={signingIn}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl hover:from-blue-500 hover:to-sky-400 transition-colors disabled:opacity-60 cursor-pointer"
              >
                <span>{signingIn ? 'Authenticating...' : 'Access Enterprise Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400">
                Secured via Firebase Auth · Role-Based Access Control
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-[440px] aspect-square rounded-2xl overflow-hidden border border-amber-400/35 bg-[#030A1A] shadow-2xl shadow-blue-950/80 flex items-center justify-center relative">
              {!imgError ? (
                <img
                  src={ARSHIEL_LOGO_SRC}
                  alt="ARSHIEL ASSURANCE — Assessing Risks. Strengthening Compliance. Improving Performance."
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain block"
                />
              ) : (
                <div className="p-10 text-center bg-gradient-to-br from-[#07142B] via-[#0B1E3D] to-[#040D21] w-full h-full flex flex-col items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-amber-400 mb-3" />
                  <p className="font-display text-2xl font-bold text-white">ARSHIEL ASSURANCE</p>
                  <p className="text-xs text-slate-400 mt-1">Independent EHS Consultancy &amp; Assessment Platform</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Core Capabilities Row */}
        <section id="engines" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 border-t border-slate-800/80">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-amber-400 mb-3" />
            <h2 className="font-display text-sm font-semibold text-white mb-1.5">AI ISO Gap Analysis</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clause-wise gap assessments across 12 ISO standards with AI guidance, evidence tracking, and automated readiness scoring.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Scale className="w-5 h-5 text-amber-400 mb-3" />
            <h2 className="font-display text-sm font-semibold text-white mb-1.5">Indian Legal Register</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Central, Andhra Pradesh, and Telangana frameworks with official source citations and strict unverified-rule flagging.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <FileCheck2 className="w-5 h-5 text-amber-400 mb-3" />
            <h2 className="font-display text-sm font-semibold text-white mb-1.5">EHS, Food, Fire &amp; Env Audits</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlimited dynamic module builder, multimodal evidence review, CAPA root-cause tracking, and PDF/DOCX/XLSX exports.
            </p>
          </div>
          <div id="governance" className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
            <Lock className="w-5 h-5 text-amber-400 mb-3" />
            <h2 className="font-display text-sm font-semibold text-white mb-1.5">Legal Authorization Control</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mandatory governance gate blocking unauthorized delivery, quotation, or certification of Category 3 regulated services.
            </p>
          </div>
        </section>

        {/* Mandatory Disclaimer */}
        <section id="disclaimer" className="p-6 rounded-xl bg-slate-900/60 border border-amber-500/30">
          <h3 className="font-display text-xs font-semibold text-amber-400 mb-3">
            Mandatory Governance &amp; Independence Disclaimer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-400 leading-relaxed">
            {MANDATORY_DISCLAIMER_LINES.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
