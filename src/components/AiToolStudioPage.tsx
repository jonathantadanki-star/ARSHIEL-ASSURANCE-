import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Bot,
  Sparkles,
  Loader2,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { AiToolSpec } from '../data/enterpriseCatalog';
import { ALL_INDUSTRY_BLUEPRINTS } from '../data/industriesCatalog';
import type { ModuleId } from '../types/assurance';
import { exportDocumentToDocx, exportReportToPdf } from '../utils/exporters';
import { BrandMark } from './BrandMark';

interface AiToolStudioPageProps {
  tool: AiToolSpec;
  allTools: AiToolSpec[];
  onBackToPortal: () => void;
  onSelectTool: (tool: AiToolSpec) => void;
  onOpenModule: (moduleId: ModuleId, label?: string) => void;
}

export function AiToolStudioPage({
  tool,
  allTools,
  onBackToPortal,
  onSelectTool,
  onOpenModule,
}: AiToolStudioPageProps) {
  const [selectedIndustry, setSelectedIndustry] = useState(ALL_INDUSTRY_BLUEPRINTS[0].name);
  const [topic, setTopic] = useState(tool.defaultTopic);
  const [contextNotes, setContextNotes] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [humanReviewed, setHumanReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const handleSelectNewTool = (nextTool: AiToolSpec) => {
    onSelectTool(nextTool);
    setTopic(nextTool.defaultTopic);
    setContextNotes('');
    setOutputText('');
    setError(null);
    setHumanReviewed(false);
    setGeneratedAt(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setHumanReviewed(false);
    try {
      const prompt = `Tool Requested: ${tool.title}
Target Industry: ${selectedIndustry}
Scope / Topic: ${topic}
Additional Facility / Audit Context: ${contextNotes || 'General industrial facility context'}

Task Instructions:
${tool.promptInstruction}

Mandatory Governance: Mark output clearly as "DRAFT – REVIEW REQUIRED". Do not fabricate statutory citations or claim on-site inspection occurred.`;

      const resp = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          contextSummary: `Active Tool: ${tool.title} | Industry: ${selectedIndustry}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'AI generation failed. Please try again.');
      }
      setOutputText(data.reply || '');
      setGeneratedAt(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach ARSHIEL AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored safely
    }
  };

  const handleExportDocx = async () => {
    if (!outputText) return;
    const safeFile = `ARSHIEL_${tool.id}_${Date.now().toString().slice(-5)}.docx`;
    await exportDocumentToDocx({
      title: `${tool.title} — ${topic}`,
      docNumber: `AA-AI-${tool.number}`,
      revision: 'Rev 00 (AI Draft)',
      status: humanReviewed ? 'REVIEWED DRAFT — PENDING FINAL APPROVAL' : 'DRAFT – REVIEW REQUIRED',
      metadata: [
        ['AI Tool', tool.title],
        ['Industry', selectedIndustry],
        ['Generated At', generatedAt || new Date().toLocaleString()],
        ['Human Verification', humanReviewed ? 'Initial Reviewer Checked' : 'Pending Competent Review'],
      ],
      bodyText: outputText,
      filename: safeFile,
    });
  };

  const handleExportPdf = () => {
    if (!outputText) return;
    const safeFile = `ARSHIEL_${tool.id}_${Date.now().toString().slice(-5)}.pdf`;
    exportReportToPdf({
      title: `${tool.title}`,
      subtitle: `${selectedIndustry} — ${topic}`,
      referenceNo: `AA-AI-${tool.number}`,
      status: humanReviewed ? 'REVIEWED DRAFT' : 'DRAFT – REVIEW REQUIRED',
      metadata: [
        ['AI Tool', tool.title],
        ['Industry Sector', selectedIndustry],
        ['Generated At', generatedAt || new Date().toLocaleString()],
        ['Governance Gate', 'Human Technical Verification Mandatory'],
      ],
      summaryText: outputText,
      tableHeaders: [],
      tableRows: [],
      filename: safeFile,
    });
  };

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
                ARSHIEL <span className="text-[#00D4FF]">AI STUDIO</span>
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenModule(tool.targetModuleId, tool.targetModuleLabel)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Open Full {tool.targetModuleLabel}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
          <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button type="button" onClick={onBackToPortal} className="hover:text-white cursor-pointer">
            AI Solutions
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#00D4FF] font-medium">{tool.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tool Input Controls */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/30 p-6 space-y-5">
            <div>
              <div className="text-xs font-mono-num font-bold text-[#F5B82E]">
                AI Tool {tool.number} · {tool.category}
              </div>
              <h1 className="font-display text-2xl font-bold text-white mt-1">{tool.title}</h1>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{tool.shortDescription}</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Target Industry Sector
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white"
                >
                  {ALL_INDUSTRY_BLUEPRINTS.map((ind) => (
                    <option key={ind.id} value={ind.name}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Assessment / Document Scope *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter ISO clause, safety task, audit finding, or procedure title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Site Context, Findings, or Parameters (Optional)
                </label>
                <textarea
                  rows={4}
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder={tool.placeholderContext}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#087BFF] to-[#00D4FF] hover:opacity-95 text-[#071329] font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Traceable Draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with {tool.title}
                  </>
                )}
              </button>
            </form>

            <div className="rounded-xl bg-[#071329] border border-[#F5B82E]/35 p-3.5 flex items-start gap-2.5 text-[11px] text-amber-100 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-[#F5B82E] shrink-0 mt-0.5" />
              <span>
                All AI outputs are editable drafts (<strong>DRAFT – REVIEW REQUIRED</strong>) requiring competent human technical verification before operational release.
              </span>
            </div>
          </div>

          {/* Right: Editable & Exportable Output Workspace */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/30 p-6 flex flex-col min-h-[540px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#00D4FF]" />
                <span className="text-sm font-semibold text-white">
                  Editable AI Output Workspace
                </span>
                {generatedAt && (
                  <span className="text-[11px] font-mono-num text-slate-400">
                    · {generatedAt}
                  </span>
                )}
              </div>

              {outputText && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export DOCX
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOutputText('');
                      setHumanReviewed(false);
                      setGeneratedAt(null);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                    title="Clear draft"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/15 border border-red-400/35 text-xs text-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
                <div className="text-sm font-semibold text-white">
                  Running {tool.title} for {selectedIndustry}...
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Applying ARSHIEL governance rules and generating your editable assurance draft.
                </p>
              </div>
            ) : outputText ? (
              <div className="flex-1 flex flex-col pt-4 space-y-4">
                <textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  rows={16}
                  aria-label="Editable AI generated draft"
                  className="flex-1 w-full p-4 rounded-xl bg-[#071329] border border-white/15 focus:border-[#00D4FF] focus:outline-none font-mono text-xs text-slate-100 leading-relaxed resize-y"
                />
                <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#071329] border border-white/10 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={humanReviewed}
                    onChange={(e) => setHumanReviewed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-500"
                  />
                  <span>
                    <strong className="text-white">Competent Human Review Confirmation:</strong> I have reviewed and edited this AI draft for technical accuracy, factual site applicability, and official regulatory alignment.
                  </span>
                </label>
                {humanReviewed && (
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Draft marked as Reviewer-Checked — ready for DOCX/PDF export or import into {tool.targetModuleLabel}.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#071329] border border-[#087BFF]/30 flex items-center justify-center text-[#00D4FF]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-white">
                  Ready to Generate Editable Assurance Output
                </div>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Select your industry, customize the scope on the left, and click{' '}
                  <strong className="text-slate-200">Generate</strong> to produce a traceable draft you can edit directly and export to DOCX or PDF.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Switch Between All 15 AI Tools */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs font-semibold text-slate-400 mb-3">
            Switch AI Tool ({allTools.length} Interactive Tools)
          </div>
          <div className="flex flex-wrap gap-2">
            {allTools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectNewTool(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  t.id === tool.id
                    ? 'bg-[#087BFF] text-white'
                    : 'bg-[#0B1F3A] border border-white/10 text-slate-300 hover:border-[#00D4FF] hover:text-white'
                }`}
              >
                {t.number}. {t.title}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
