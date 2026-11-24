import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Scale,
  HardHat,
  FilePlus2,
  Lock,
  Flame,
  Leaf,
  Briefcase,
  CheckSquare,
  ArrowRight,
  Menu,
  X,
  LogIn,
  LogOut,
  UserCircle2,
  LayoutDashboard,
  Download,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Send,
  Loader2,
  FileSpreadsheet,
  FileText,
  Search,
  Plus,
  ExternalLink,
  Globe,
  Layers,
  Award,
  ChevronDown,
  Smartphone,
  Tablet,
  Laptop,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { ARSHIEL_LOGO_SRC, BrandMark } from './BrandMark';
import { PWAInstallButton } from './PWAInstallButton';
import { APP_EDITION_TAG, APP_VERSION_LABEL } from '../config/appVersion';
import {
  OFFICIAL_CONTACT,
  FREE_RESOURCES_CATALOG,
  LEGAL_MODAL_CONTENT,
  type FreeResourceSpec,
} from '../data/portalCatalog';
import {
  ALL_INDUSTRY_BLUEPRINTS,
  createDynamicIndustryBlueprint,
  type IndustryBlueprint,
  type IndustryGroup,
} from '../data/industriesCatalog';
import {
  PROFESSIONAL_SERVICES,
  GLOBAL_ISO_STANDARDS,
  createDynamicIsoStandard,
  AI_SOLUTIONS_CATALOG,
  LEGAL_INTELLIGENCE_CATALOG,
  HOW_IT_WORKS_STEPS,
  WHY_CHOOSE_ADVANTAGES,
  type ProfessionalServiceSpec,
  type IsoStandardDetailSpec,
  type AiToolSpec,
  type ServiceDomainGroup,
} from '../data/enterpriseCatalog';
import type { ModuleId } from '../types/assurance';
import { useAssurance } from '../context/AssuranceContext';
import {
  exportRowsToExcel,
  exportReportToPdf,
  exportDocumentToDocx,
} from '../utils/exporters';

interface LandingPortalProps {
  preselectedIndustry?: string | null;
  preselectedService?: string | null;
  onClearPreselections?: () => void;
  onOpenModule: (moduleId: ModuleId, label?: string) => void;
  onSelectIndustry: (industry: IndustryBlueprint) => void;
  onSelectService: (service: ProfessionalServiceSpec) => void;
  onSelectIsoStandard: (standard: IsoStandardDetailSpec) => void;
  onSelectAiTool: (tool: AiToolSpec) => void;
  onOpenAuth: (mode: 'login' | 'register', targetLabel?: string) => void;
  onOpenAiAssistant: () => void;
  onLogout: () => void;
}

const COMMAND_TABS = [
  { id: 'iso', label: 'AI ISO Gap Analysis' },
  { id: 'legal', label: 'Legal Compliance Register' },
  { id: 'ehs', label: 'EHS Audit Analytics' },
  { id: 'capa', label: 'CAPA Management' },
  { id: 'risk', label: 'Risk Intelligence' },
  { id: 'esg', label: 'ESG Performance' },
] as const;

type CommandTabId = (typeof COMMAND_TABS)[number]['id'];

const DEMO_EHS_TREND = [
  { period: 'Q1', score: 71, readiness: 69 },
  { period: 'Q2', score: 77, readiness: 75 },
  { period: 'Q3', score: 83, readiness: 82 },
  { period: 'Q4', score: 88, readiness: 87 },
];

const DEMO_ESG_DATA = [
  { metric: 'Energy', pct: 84 },
  { metric: 'Water/ZLD', pct: 79 },
  { metric: 'Waste EPR', pct: 88 },
  { metric: 'Scope 1/2', pct: 76 },
  { metric: 'Safety Soc', pct: 91 },
];

const INDUSTRY_GROUPS: Array<'ALL' | IndustryGroup> = [
  'ALL',
  'High-Tech & Digital',
  'Process & Life Sciences',
  'Heavy Industrial & Manufacturing',
  'Energy & Infrastructure',
  'Commerce, Logistics & Services',
];

const SERVICE_DOMAINS: Array<'ALL' | ServiceDomainGroup> = [
  'ALL',
  'Auditing & Assessment',
  'ISO & Management Systems',
  'EHS, Fire & Risk',
  'Legal, ESG & Governance',
  'Documentation, CAPA & Training',
];

export function LandingPortal({
  preselectedIndustry,
  preselectedService,
  onClearPreselections,
  onOpenModule,
  onSelectIndustry,
  onSelectService,
  onSelectIsoStandard,
  onSelectAiTool,
  onOpenAuth,
  onOpenAiAssistant,
  onLogout,
}: LandingPortalProps) {
  const {
    user,
    userProfile,
    audits,
    isoAssessments,
    legalRequirements,
    capas,
    documents,
    masterData,
    canEditRecords,
    createRecord,
    showToast,
  } = useAssurance();

  // Navigation & Search
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  // Hero Command Center Tab
  const [commandTab, setCommandTab] = useState<CommandTabId>('iso');

  // Industries Filters & Dynamic Creation
  const [industryGroup, setIndustryGroup] = useState<'ALL' | IndustryGroup>('ALL');
  const [industryQuery, setIndustryQuery] = useState('');
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [addIndustryOpen, setAddIndustryOpen] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [newIndustryDesc, setNewIndustryDesc] = useState('');
  const [savingDynamicItem, setSavingDynamicItem] = useState(false);

  // Services Filters
  const [serviceDomain, setServiceDomain] = useState<'ALL' | ServiceDomainGroup>('ALL');
  const [serviceQuery, setServiceQuery] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  // ISO Standards Filters & Dynamic Creation
  const [isoQuery, setIsoQuery] = useState('');
  const [addIsoOpen, setAddIsoOpen] = useState(false);
  const [newIsoCode, setNewIsoCode] = useState('');
  const [newIsoName, setNewIsoName] = useState('');
  const [newIsoDesc, setNewIsoDesc] = useState('');

  // AI Solutions Filter
  const [aiCategoryFilter, setAiCategoryFilter] = useState<string>('ALL');

  // Legal Compliance Filters
  const [legalCountryFilter, setLegalCountryFilter] = useState<'ALL' | 'India' | 'International Reference'>('ALL');
  const [legalQuery, setLegalQuery] = useState('');

  // How It Works Interactive Step
  const [activeWorkflowIdx, setActiveWorkflowIdx] = useState(0);

  // Free Resources Filter
  const [resourceFilter, setResourceFilter] = useState<'ALL' | 'XLSX' | 'PDF' | 'DOCX'>('ALL');
  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null);

  // About Banner & Legal Modal
  const [bannerImgError, setBannerImgError] = useState(false);
  const [legalModalKey, setLegalModalKey] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  // Contact & Consultation Form State
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('Semiconductor Industry');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requiredService, setRequiredService] = useState('Third-Party Auditing');
  const [country, setCountry] = useState('India');
  const [message, setMessage] = useState('');
  const [submittingMode, setSubmittingMode] = useState<'enquiry' | 'consultation' | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [enquiryReceipt, setEnquiryReceipt] = useState<{
    referenceId: string;
    enquiryType: string;
    restrictedNotice: string | null;
    emailDelivery: {
      delivered: boolean;
      activationPending?: boolean;
      provider: string;
      recipient: string;
      statusMessage: string;
    };
    summary: {
      fullName: string;
      company: string;
      email: string;
      phone: string;
      industry: string;
      requiredService: string;
      country: string;
      message: string;
    };
  } | null>(null);

  // Combine Built-in 28 Industries + Admin Dynamic Industries from Firestore
  const allIndustries = useMemo(() => {
    const customIndustries = masterData
      .filter((m) => m.dataType === 'Industry' && m.active)
      .filter(
        (m) =>
          !ALL_INDUSTRY_BLUEPRINTS.some(
            (base) => base.name.toLowerCase() === m.name.toLowerCase()
          )
      )
      .map((m) =>
        createDynamicIndustryBlueprint({
          id: m.id,
          name: m.name,
          description: m.description,
        })
      );
    return [...ALL_INDUSTRY_BLUEPRINTS, ...customIndustries];
  }, [masterData]);

  // Combine Built-in 17 ISO Standards + Admin Dynamic Standards from Firestore
  const allIsoStandards = useMemo(() => {
    const customStandards = masterData
      .filter((m) => m.dataType === 'Standard' && m.active)
      .filter(
        (m) =>
          !GLOBAL_ISO_STANDARDS.some(
            (base) => base.code.toLowerCase() === m.code.toLowerCase()
          )
      )
      .map((m) =>
        createDynamicIsoStandard({
          id: m.id,
          code: m.code,
          name: m.name,
          description: m.description,
        })
      );
    return [...GLOBAL_ISO_STANDARDS, ...customStandards];
  }, [masterData]);

  useEffect(() => {
    if (preselectedIndustry || preselectedService) {
      if (preselectedIndustry) setIndustry(preselectedIndustry);
      if (preselectedService) setRequiredService(preselectedService);
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      onClearPreselections?.();
    }
  }, [preselectedIndustry, preselectedService, onClearPreselections]);

  const scrollToSection = (id: string) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Command Center Metrics (Real Firestore Data when signed in vs clearly labeled DEMO DATA when signed out)
  const commandMetrics = useMemo(() => {
    const isLive = Boolean(
      user && (audits.length > 0 || isoAssessments.length > 0 || capas.length > 0)
    );
    if (isLive) {
      const avgIso = isoAssessments.length
        ? Math.round(
            isoAssessments.reduce((acc, i) => acc + (i.complianceScore || 0), 0) /
              isoAssessments.length
          )
        : 0;
      const allFindings = audits.flatMap((a) => a.findings || []);
      const openFindings = allFindings.filter(
        (f) => f.verificationStatus !== 'Verified & Closed'
      ).length;
      const criticalRisks = allFindings.filter(
        (f) =>
          (f.classification === 'Critical' || f.riskRating === 'Critical') &&
          f.verificationStatus !== 'Verified & Closed'
      ).length;
      const compliantLaws = legalRequirements.filter(
        (l) => l.complianceStatus === 'Compliant'
      ).length;
      const legalPct = legalRequirements.length
        ? Math.round((compliantLaws / legalRequirements.length) * 100)
        : 0;
      const pendingCapa = capas.filter((c) => c.status !== 'Closed').length;
      const upcomingAudits = audits.filter(
        (a) => a.status === 'Planned' || a.status === 'In Progress'
      ).length;
      const controlledDocs = documents.length;
      const approvedDocs = documents.filter((d) => d.status === 'Approved').length;
      const auditReadiness = audits.length
        ? Math.round(audits.reduce((acc, a) => acc + (a.score || 0), 0) / audits.length)
        : avgIso;

      return {
        isLive: true,
        avgIso,
        auditReadiness,
        openFindings,
        criticalRisks,
        legalPct,
        pendingCapa,
        upcomingAudits,
        controlledDocs,
        approvedDocs,
      };
    }

    return {
      isLive: false,
      avgIso: 84,
      auditReadiness: 87,
      openFindings: 12,
      criticalRisks: 2,
      legalPct: 89,
      pendingCapa: 9,
      upcomingAudits: 4,
      controlledDocs: 52,
      approvedDocs: 38,
    };
  }, [user, audits, isoAssessments, legalRequirements, capas, documents]);

  // Filtered Lists
  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase();
    return allIndustries.filter((item) => {
      const groupOk = industryGroup === 'ALL' || item.group === industryGroup;
      const qOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sectorTag.toLowerCase().includes(q) ||
        item.subSectors.some((s) => s.toLowerCase().includes(q)) ||
        item.applicableIsoStandards.some((iso) => iso.toLowerCase().includes(q));
      return groupOk && qOk;
    });
  }, [allIndustries, industryGroup, industryQuery]);

  const visibleIndustries =
    showAllIndustries || industryQuery.trim() || industryGroup !== 'ALL'
      ? filteredIndustries
      : filteredIndustries.slice(0, 8);

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    return PROFESSIONAL_SERVICES.filter((svc) => {
      const domOk = serviceDomain === 'ALL' || svc.domain === serviceDomain;
      const qOk =
        !q ||
        svc.title.toLowerCase().includes(q) ||
        svc.shortDescription.toLowerCase().includes(q);
      return domOk && qOk;
    });
  }, [serviceDomain, serviceQuery]);

  const visibleServices =
    showAllServices || serviceQuery.trim() || serviceDomain !== 'ALL'
      ? filteredServices
      : filteredServices.slice(0, 8);

  const filteredIsoStandards = useMemo(() => {
    const q = isoQuery.trim().toLowerCase();
    if (!q) return allIsoStandards;
    return allIsoStandards.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.industryRelevance.some((i) => i.toLowerCase().includes(q))
    );
  }, [allIsoStandards, isoQuery]);

  const filteredAiTools = useMemo(() => {
    if (aiCategoryFilter === 'ALL') return AI_SOLUTIONS_CATALOG;
    return AI_SOLUTIONS_CATALOG.filter((t) => t.category === aiCategoryFilter);
  }, [aiCategoryFilter]);

  const filteredLegalItems = useMemo(() => {
    const q = legalQuery.trim().toLowerCase();
    return LEGAL_INTELLIGENCE_CATALOG.filter((item) => {
      const countryOk = legalCountryFilter === 'ALL' || item.country === legalCountryFilter;
      const qOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.stateScope.toLowerCase().includes(q) ||
        item.activityScope.toLowerCase().includes(q) ||
        item.industries.some((ind) => ind.toLowerCase().includes(q));
      return countryOk && qOk;
    });
  }, [legalCountryFilter, legalQuery]);

  const filteredResources = useMemo(() => {
    if (resourceFilter === 'ALL') return FREE_RESOURCES_CATALOG;
    return FREE_RESOURCES_CATALOG.filter((r) => r.format === resourceFilter);
  }, [resourceFilter]);

  // Global Instant Search Results
  const globalSearchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return { industries: [], services: [], standards: [], aiTools: [] };
    return {
      industries: allIndustries
        .filter((i) => i.name.toLowerCase().includes(q) || i.sectorTag.toLowerCase().includes(q))
        .slice(0, 5),
      services: PROFESSIONAL_SERVICES.filter(
        (s) => s.title.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)
      ).slice(0, 5),
      standards: allIsoStandards
        .filter((s) => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q))
        .slice(0, 5),
      aiTools: AI_SOLUTIONS_CATALOG.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [globalQuery, allIndustries, allIsoStandards]);

  // Dynamic Admin Handlers
  const handleAddCustomIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAddIndustryOpen(false);
      onOpenAuth('login', 'Industry Management Engine');
      return;
    }
    if (!canEditRecords) {
      showToast('Read-Only User Mode: Only Super Admin can add industries.', 'error');
      setAddIndustryOpen(false);
      return;
    }
    if (!newIndustryName.trim()) return;
    setSavingDynamicItem(true);
    try {
      const code = `IND-${newIndustryName.trim().slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-3)}`;
      await createRecord(
        'masterData',
        'ind',
        {
          dataType: 'Industry',
          code,
          name: newIndustryName.trim(),
          description: newIndustryDesc.trim(),
          active: true,
          version: 1,
        },
        'Industry Management',
        'Added Dynamic Industry',
        code
      );
      showToast(`Industry "${newIndustryName.trim()}" added to live catalog.`);
      setNewIndustryName('');
      setNewIndustryDesc('');
      setAddIndustryOpen(false);
    } finally {
      setSavingDynamicItem(false);
    }
  };

  const handleAddCustomStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAddIsoOpen(false);
      onOpenAuth('login', 'Dynamic ISO Standards Manager');
      return;
    }
    if (!canEditRecords) {
      showToast('Read-Only User Mode: Only Super Admin can add ISO standards.', 'error');
      setAddIsoOpen(false);
      return;
    }
    if (!newIsoCode.trim() || !newIsoName.trim()) return;
    setSavingDynamicItem(true);
    try {
      await createRecord(
        'masterData',
        'std',
        {
          dataType: 'Standard',
          code: newIsoCode.trim().toUpperCase(),
          name: newIsoName.trim(),
          description: newIsoDesc.trim(),
          active: true,
          version: 1,
        },
        'ISO Standards',
        'Added Dynamic Standard',
        newIsoCode.trim().toUpperCase()
      );
      showToast(`Standard "${newIsoCode.trim().toUpperCase()}" added to live catalog.`);
      setNewIsoCode('');
      setNewIsoName('');
      setNewIsoDesc('');
      setAddIsoOpen(false);
    } finally {
      setSavingDynamicItem(false);
    }
  };

  const handleDownloadResource = async (res: FreeResourceSpec) => {
    setDownloadingResourceId(res.id);
    try {
      const safeName = res.title.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
      if (res.format === 'XLSX') {
        exportRowsToExcel(res.category.slice(0, 28), res.rows, `ARSHIEL_${safeName}.xlsx`);
      } else if (res.format === 'PDF') {
        const headers = Object.keys(res.rows[0] || { Item: '', Details: '' });
        const tableRows = res.rows.map((r) => headers.map((h) => String(r[h] ?? '')));
        exportReportToPdf({
          title: res.title,
          subtitle: `${res.category} — ARSHIEL ASSURANCE Resource`,
          referenceNo: res.id.toUpperCase(),
          status: 'TEMPLATE — REVIEW BEFORE USE',
          metadata: [
            ['Category', res.category],
            ['Issued By', 'ARSHIEL ASSURANCE (ARSHIEL EHS AI SOLUTIONS)'],
            ['Format', 'Controlled PDF Template'],
            ['Scope', res.itemsCount],
          ],
          summaryText: res.description,
          tableHeaders: headers,
          tableRows,
          filename: `ARSHIEL_${safeName}.pdf`,
        });
      } else {
        const bodyText = res.rows
          .map((row) =>
            Object.entries(row)
              .map(([k, v]) => `## ${k}\n${v}`)
              .join('\n')
          )
          .join('\n\n');
        await exportDocumentToDocx({
          title: res.title,
          docNumber: `AA-TPL-${res.id.toUpperCase().slice(-4)}`,
          revision: 'Rev 01',
          status: 'TEMPLATE – REVIEW & CUSTOMIZE BEFORE USE',
          metadata: [
            ['Category', res.category],
            ['Platform', 'ARSHIEL ASSURANCE'],
            ['Prepared By', 'ARSHIEL EHS AI SOLUTIONS'],
          ],
          bodyText: `# Overview\n${res.description}\n\n${bodyText}`,
          filename: `ARSHIEL_${safeName}.docx`,
        });
      }
    } finally {
      window.setTimeout(() => setDownloadingResourceId(null), 450);
    }
  };

  const submitEnquiryForm = async (mode: 'enquiry' | 'consultation') => {
    setEnquiryError(null);
    if (fullName.trim().length < 2) {
      setEnquiryError('Please provide your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEnquiryError('Please provide a valid email address.');
      return;
    }
    if (message.trim().length < 8) {
      setEnquiryError('Please briefly describe your audit, ISO, or consultancy requirement.');
      return;
    }

    setSubmittingMode(mode);
    setEnquiryReceipt(null);
    const snapshot = {
      fullName: fullName.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      industry,
      requiredService,
      country: country.trim() || 'India',
      message: message.trim(),
    };

    try {
      const resp = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionMode: mode,
          enquiryType: mode === 'consultation' ? 'Consultation Request' : 'Business Enquiry',
          fullName: snapshot.fullName,
          organization: snapshot.company,
          email: snapshot.email,
          phone: snapshot.phone,
          industry: snapshot.industry,
          serviceFocus: snapshot.requiredService,
          country: snapshot.country,
          location: snapshot.country,
          message: snapshot.message,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Could not submit your request.');
      setEnquiryReceipt({
        referenceId: data.referenceId,
        enquiryType: data.enquiryType,
        restrictedNotice: data.restrictedNotice || null,
        emailDelivery: data.emailDelivery || {
          delivered: false,
          provider: 'none',
          recipient: OFFICIAL_CONTACT.email,
          statusMessage: `Routed to ${OFFICIAL_CONTACT.email}.`,
        },
        summary: snapshot,
      });
      setMessage('');
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : 'Unable to submit right now.');
    } finally {
      setSubmittingMode(null);
    }
  };

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About Us', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Industries', id: 'industries' },
    { label: 'ISO Standards', id: 'iso-standards' },
    { label: 'Legal Compliance', id: 'legal-compliance' },
    { label: 'AI Solutions', id: 'ai-solutions' },
    { label: 'Free Resources', id: 'resources' },
    { label: 'Contact Us', id: 'contact' },
  ];

  const activeStep = HOW_IT_WORKS_STEPS[activeWorkflowIdx] || HOW_IT_WORKS_STEPS[0];

  return (
    <div className="min-h-screen bg-[#071329] text-white flex flex-col selection:bg-[#087BFF] selection:text-white">
      {/* ===================================================================
          3. PROFESSIONAL FIXED NAVIGATION BAR
         =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#071329]/95 backdrop-blur-md border-b border-[#087BFF]/25">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between gap-4">
          {/* Left: Official Logo + Brand Name + Subtitle */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 text-left shrink-0 cursor-pointer"
          >
            <BrandMark size={42} />
            <div className="leading-tight">
              <div className="font-display text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap flex items-center gap-1.5">
                <span>
                  ARSHIEL <span className="text-[#00D4FF]">ASSURANCE</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F5B82E]/15 border border-[#F5B82E]/35 text-[9.5px] font-mono font-semibold text-[#F5B82E]">
                  {APP_EDITION_TAG}
                </span>
              </div>
              <div className="text-[10.5px] text-[#F5B82E] font-medium tracking-wide whitespace-nowrap">
                AI Auditing &amp; Compliance Platform
              </div>
            </div>
          </button>

          {/* Center: 9 Navigation Links (Desktop) */}
          <nav aria-label="Primary navigation" className="hidden 2xl:flex items-center gap-5">
            {navItems.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="text-xs font-medium text-slate-300 hover:text-[#00D4FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Compact Desktop Nav (xl to 2xl) with More dropdown so nothing wraps */}
          <nav aria-label="Compact desktop navigation" className="hidden xl:flex 2xl:hidden items-center gap-4">
            {navItems.slice(0, 6).map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="text-xs font-medium text-slate-300 hover:text-[#00D4FF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer py-2"
              >
                More
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute right-0 top-full pt-1 w-44">
                <div className="rounded-xl bg-[#0B1F3A] border border-[#087BFF]/35 shadow-xl p-1.5 space-y-0.5">
                  {navItems.slice(6).map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#087BFF]/20 hover:text-white cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right: Search + Open Platform + Login/Register / Profile / Logout */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              aria-label="Search platform"
              className="p-2 rounded-lg border border-white/15 text-slate-300 hover:text-white hover:border-[#00D4FF]/60 transition-colors cursor-pointer"
              title="Search Industries, Services, ISO Standards & AI Tools"
            >
              <Search className="w-4 h-4" />
            </button>
            <PWAInstallButton variant="header" />
            <button
              type="button"
              onClick={() => onOpenModule('dashboard', 'Executive Dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-950/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Open Platform
            </button>

            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenModule('settings', 'User Profile')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1F3A] hover:bg-white/10 border border-white/15 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="User Profile & Governance Settings"
                >
                  <UserCircle2 className="w-4 h-4 text-[#00D4FF]" />
                  <span className="max-w-[100px] truncate">
                    {userProfile?.displayName || user.displayName || 'Profile'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 hover:border-red-400/50 hover:bg-red-500/10 text-xs font-medium text-slate-200 hover:text-red-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#00D4FF]/45 hover:bg-[#00D4FF]/10 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00D4FF]" />
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile Install + Search + Hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <div className="md:hidden">
              <PWAInstallButton variant="compact" />
            </div>
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              aria-label="Search platform"
              className="md:hidden p-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Drawer */}
        {mobileNavOpen && (
          <div className="xl:hidden bg-[#0B1F3A] border-t border-[#087BFF]/25 px-4 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navItems.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
              <PWAInstallButton variant="header" />
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenModule('dashboard', 'Executive Dashboard');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#087BFF] text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Open Platform
              </button>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      onOpenModule('settings', 'User Profile');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#071329] border border-white/15 text-xs font-medium text-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    <UserCircle2 className="w-4 h-4 text-[#00D4FF]" />
                    {userProfile?.displayName || user.displayName || 'Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      onLogout();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-red-400/40 bg-red-500/10 text-xs font-semibold text-red-200 whitespace-nowrap cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#00D4FF]/50 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#00D4FF]" />
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================
          4. HOMEPAGE HERO SECTION (TWO-COLUMN ENTERPRISE COMMAND HERO)
         =================================================================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-b from-[#071329] via-[#0B1F3A] to-[#071329] border-b border-[#087BFF]/25"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 w-[680px] h-[680px] rounded-full bg-[#087BFF]/14 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 -left-24 w-[480px] h-[480px] rounded-full bg-[#00D4FF]/10 blur-3xl"
        />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-6 space-y-5">
              <div className="text-xs font-semibold tracking-wider text-[#00D4FF] uppercase">
                ARSHIEL ASSURANCE – AI-POWERED ASSURANCE &amp; COMPLIANCE PLATFORM
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-white leading-[1.12]">
                Transforming Auditing, Assurance &amp; Compliance Through{' '}
                <span className="bg-gradient-to-r from-[#00D4FF] via-[#087BFF] to-[#F5B82E] bg-clip-text text-transparent">
                  Artificial Intelligence.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-2xl">
                One Integrated Platform for ISO Management Systems, Third-Party Auditing, Industrial
                Safety, Legal Compliance, ESG, Sustainability and AI-Powered Business Assurance.
              </p>

              {/* Highlighted Core Pillars (Unboxed clean typographic strip) */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-semibold text-[#F5B82E]">
                <span>AI Auditing</span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span className="text-[#00D4FF]">ISO Compliance</span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span className="text-white">Risk Intelligence</span>
                <span className="text-slate-500" aria-hidden="true">·</span>
                <span className="text-[#F5B82E]">Industrial Assurance</span>
              </div>

              <p className="text-base font-display font-semibold text-[#F5B82E]">
                &ldquo;Assessing Risks. Strengthening Compliance. Improving Performance.&rdquo;
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                ARSHIEL ASSURANCE delivers intelligent auditing, certification support, third-party
                assessment coordination, management system implementation, legal compliance,
                industrial EHS auditing and AI-powered assurance solutions across multiple industries.
              </p>

              {/* 4 Working CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenModule('dashboard', 'Executive Dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/60 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Explore Platform
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('services')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/8 hover:bg-white/14 border border-white/15 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Explore Our Services
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('industries')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/8 hover:bg-white/14 border border-[#00D4FF]/35 text-[#00D4FF] hover:text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Explore Industries
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('contact')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Contact Our Experts
                </button>
              </div>

              {/* Free Multi-Device App Install Bar */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <PWAInstallButton variant="hero" />
                <span className="text-xs text-slate-400">
                  Free standalone app · iOS · Android · Windows · macOS
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: ARSHIEL INTELLIGENCE COMMAND CENTER */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#071329]/95 border border-[#087BFF]/35 shadow-2xl shadow-black/60 backdrop-blur-md overflow-hidden">
                {/* Command Header */}
                <div className="px-5 py-3.5 bg-[#050E20] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <BrandMark size={24} />
                    <span className="font-display text-xs font-bold tracking-wide text-white uppercase">
                      ARSHIEL INTELLIGENCE COMMAND CENTER
                    </span>
                  </div>
                  <span
                    className={`font-mono-num text-[11px] font-semibold ${
                      commandMetrics.isLive ? 'text-emerald-300' : 'text-[#F5B82E]'
                    }`}
                  >
                    {commandMetrics.isLive ? 'LIVE WORKSPACE DATA' : 'DEMO DATA (ILLUSTRATIVE)'}
                  </span>
                </div>

                {/* 6 Interactive Tabs */}
                <div className="px-4 py-2.5 bg-[#0B1F3A]/80 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto">
                  {COMMAND_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCommandTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        commandTab === t.id
                          ? 'bg-[#087BFF] text-white'
                          : 'text-slate-300 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  {/* Top Row: Official Brand Crest + Core Readiness Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                    <div className="sm:col-span-4 flex items-center justify-center rounded-xl bg-[#030A1A] border border-[#F5B82E]/35 p-2 overflow-hidden">
                      <img
                        src={ARSHIEL_LOGO_SRC}
                        alt="ARSHIEL ASSURANCE Official Brand Crest"
                        referrerPolicy="no-referrer"
                        className="w-full max-w-[170px] aspect-square object-contain rounded-lg block"
                      />
                    </div>
                    <div className="sm:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">ISO Overview</div>
                        <div className="font-mono-num text-lg font-bold text-[#00D4FF] mt-0.5">
                          {commandMetrics.avgIso}%
                        </div>
                        <div className="text-[10px] text-slate-400">Readiness</div>
                      </div>
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">Audit Readiness</div>
                        <div className="font-mono-num text-lg font-bold text-white mt-0.5">
                          {commandMetrics.auditReadiness}%
                        </div>
                        <div className="text-[10px] text-emerald-300">{commandMetrics.upcomingAudits} Upcoming</div>
                      </div>
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">Open Findings</div>
                        <div className="font-mono-num text-lg font-bold text-[#F5B82E] mt-0.5">
                          {commandMetrics.openFindings}
                        </div>
                        <div className="text-[10px] text-red-300">{commandMetrics.criticalRisks} Critical</div>
                      </div>
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">Corrective Actions</div>
                        <div className="font-mono-num text-lg font-bold text-emerald-300 mt-0.5">
                          {commandMetrics.pendingCapa}
                        </div>
                        <div className="text-[10px] text-slate-400">Active CAPA</div>
                      </div>
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">Legal Status</div>
                        <div className="font-mono-num text-lg font-bold text-[#087BFF] mt-0.5">
                          {commandMetrics.legalPct}%
                        </div>
                        <div className="text-[10px] text-slate-400">Central · AP · TS</div>
                      </div>
                      <div className="rounded-xl bg-[#0B1F3A] border border-white/10 p-3">
                        <div className="text-[10px] text-slate-400">Document Control</div>
                        <div className="font-mono-num text-lg font-bold text-white mt-0.5">
                          {commandMetrics.approvedDocs}/{commandMetrics.controlledDocs}
                        </div>
                        <div className="text-[10px] text-slate-400">Approved</div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Tab View Body */}
                  {commandTab === 'iso' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">ISO Compliance Overview</span>
                        <span className="text-[11px] font-mono-num text-[#00D4FF]">17 Global Standards</span>
                      </div>
                      {[
                        { std: 'ISO 9001:2015 Quality', pct: 90, bar: 'bg-[#087BFF]' },
                        { std: 'ISO 45001:2018 OH&S', pct: 86, bar: 'bg-[#00D4FF]' },
                        { std: 'ISO 14001:2015 Environment', pct: 83, bar: 'bg-emerald-400' },
                        { std: 'ISO/IEC 27001:2022 InfoSec', pct: 79, bar: 'bg-[#F5B82E]' },
                      ].map((row) => (
                        <div key={row.std} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">{row.std}</span>
                            <span className="font-mono-num font-semibold text-white">{row.pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {commandTab === 'legal' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Statutory Compliance Monitor</span>
                        <span className="text-[11px] text-[#F5B82E]">Portal Verification Active</span>
                      </div>
                      {[
                        { act: 'Environment Protection Act & SPCB Consent', reg: 'Central / AP / TS', status: 'Compliant' },
                        { act: 'Electricity Act & CEA Safety Regulations, 2023', reg: 'Central / CEIG', status: 'Review Scheduled' },
                        { act: 'OSHWC Code & State Factory Transitional Rules', reg: 'Verify Official Portal', status: 'Verify Source' },
                        { act: 'State Fire Services NOC & NBC Part 4', reg: 'Telangana / AP', status: 'Compliant' },
                      ].map((item) => (
                        <div key={item.act} className="flex items-center justify-between py-1.5 border-t border-white/10 gap-2">
                          <div className="min-w-0">
                            <div className="text-slate-200 truncate">{item.act}</div>
                            <div className="text-[10px] text-slate-400">{item.reg}</div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#00D4FF] whitespace-nowrap">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {commandTab === 'ehs' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white">EHS Audit Performance Progression</span>
                        <span className="text-[11px] font-mono-num text-[#00D4FF]">Quarterly %</span>
                      </div>
                      <div className="h-[145px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={DEMO_EHS_TREND} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="cmdEhsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                            <XAxis dataKey="period" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[50, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#071329', border: '1px solid #087BFF', borderRadius: '8px', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="score" name="EHS Score %" stroke="#00D4FF" strokeWidth={2} fill="url(#cmdEhsGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {commandTab === 'capa' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">CAPA Closure &amp; Verification Status</span>
                        <span className="text-[11px] text-emerald-300">5-Why &amp; Fishbone RCA</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                          <div className="font-mono-num text-lg font-bold text-[#F5B82E]">{commandMetrics.pendingCapa}</div>
                          <div className="text-[10px] text-slate-400">Open Actions</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                          <div className="font-mono-num text-lg font-bold text-red-400">{commandMetrics.criticalRisks}</div>
                          <div className="text-[10px] text-slate-400">Critical Escalated</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                          <div className="font-mono-num text-lg font-bold text-emerald-300">92%</div>
                          <div className="text-[10px] text-slate-400">On-Time Rate</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {commandTab === 'risk' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Risk Assessment Status (HIRA / HAZID / JSA)</span>
                        <span className="text-[11px] text-[#F5B82E]">5x5 Matrix Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                          <div className="text-slate-400">High-Priority Domains</div>
                          <div className="text-white font-semibold mt-0.5">LOTO · Chemical · Fire · Height</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0B1F3A] border border-white/10">
                          <div className="text-slate-400">Document Control Gate</div>
                          <div className="text-[#00D4FF] font-semibold mt-0.5">DRAFT – REVIEW REQUIRED</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {commandTab === 'esg' && (
                    <div className="rounded-xl bg-[#050E20] border border-white/10 p-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white">ESG &amp; ISO 14064 Readiness Index</span>
                        <span className="text-[11px] font-mono-num text-emerald-300">Scope 1/2/3 Tracking</span>
                      </div>
                      <div className="h-[145px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DEMO_ESG_DATA} margin={{ top: 4, right: 6, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                            <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#071329', border: '1px solid #087BFF', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="pct" name="Readiness %" fill="#087BFF" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#F5B82E]" />
                      Legal Authorization Control Enforced
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenModule('dashboard', 'Executive Dashboard')}
                      className="text-[#00D4FF] hover:text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Live Dashboard
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. INDUSTRIES WE SERVE – GLOBAL INDUSTRY COVERAGE (28+ INDUSTRIES)
         =================================================================== */}
      <section id="industries" className="bg-slate-50 text-slate-900 py-16 lg:py-24 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#087BFF] mb-2">
                INDUSTRIES WE SERVE · {allIndustries.length} Global Industrial Sectors
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#071329]">
                Intelligent Assurance, Auditing &amp; Compliance Solutions Across Global Industries.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={industryQuery}
                  onChange={(e) => setIndustryQuery(e.target.value)}
                  placeholder="Search 28 industries or ISO..."
                  className="pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-300 focus:border-[#087BFF] focus:outline-none text-xs text-slate-900 w-56"
                />
              </div>
              {canEditRecords && (
                <button
                  type="button"
                  onClick={() => setAddIndustryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Industry
                </button>
              )}
            </div>
          </div>

          {/* Group Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {INDUSTRY_GROUPS.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setIndustryGroup(grp)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  industryGroup === grp
                    ? 'bg-[#071329] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF] hover:text-[#087BFF]'
                }`}
              >
                {grp === 'ALL' ? `All Industries (${allIndustries.length})` : grp}
              </button>
            ))}
          </div>

          {/* Industry Cards Grid */}
          {visibleIndustries.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center">
              <div className="text-sm font-semibold text-slate-800">No matching industries found</div>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search filter or add a custom industry sector dynamically.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIndustryQuery('');
                  setIndustryGroup('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#071329] text-white text-xs font-semibold cursor-pointer"
              >
                Reset Industry Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleIndustries.map((ind) => (
                <div
                  key={ind.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#087BFF] shadow-sm hover:shadow-xl hover:shadow-blue-950/10 transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Realistic Industry Photograph */}
                    <button
                      type="button"
                      onClick={() => onSelectIndustry(ind)}
                      className="relative w-full aspect-[16/10] overflow-hidden bg-[#071329] block text-left cursor-pointer"
                    >
                      <img
                        src={ind.image}
                        alt={ind.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071329]/90 via-[#071329]/30 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <div className="text-[10.5px] font-semibold text-[#F5B82E]">{ind.group}</div>
                        <h3 className="font-display text-base font-bold text-white leading-snug">
                          {ind.name}
                        </h3>
                      </div>
                    </button>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {ind.shortDescription}
                      </p>

                      <div className="space-y-1.5 text-[11px]">
                        <div className="text-slate-500">
                          <strong className="text-slate-800">Sub-sectors:</strong>{' '}
                          {ind.subSectors.slice(0, 3).join(' · ')}
                        </div>
                        <div className="text-slate-500">
                          <strong className="text-slate-800">Key Services:</strong>{' '}
                          {ind.industryServices.slice(0, 2).join(' · ')}
                        </div>
                        <div className="font-mono-num text-[#087BFF] font-medium">
                          {ind.applicableIsoStandards.slice(0, 4).join(' · ')}
                        </div>
                        <div className="text-slate-500 truncate">
                          <strong className="text-slate-800">Legal:</strong> {ind.legalCompliance[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectIndustry(ind)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#071329] hover:text-[#087BFF] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      View Industry Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenModule(
                          ind.recommendedModules[0]?.moduleId || 'ehs-audit',
                          ind.recommendedModules[0]?.label || 'AI EHS Audit Engine'
                        )
                      }
                      className="text-[11px] font-semibold text-[#087BFF] hover:text-blue-800 whitespace-nowrap cursor-pointer"
                    >
                      Explore Services
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expand All 28 Industries Toggle */}
          {!industryQuery.trim() && industryGroup === 'ALL' && filteredIndustries.length > 8 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAllIndustries((v) => !v)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {showAllIndustries
                  ? 'Show Featured 8 Industries'
                  : `View All ${filteredIndustries.length} Global Industries`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          7. OUR PROFESSIONAL SERVICES (22 CLICKABLE SERVICE CATEGORIES)
         =================================================================== */}
      <section
        id="services"
        className="bg-[#071329] text-white py-16 lg:py-24 border-b border-[#087BFF]/25"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#00D4FF] mb-2">
                OUR PROFESSIONAL SERVICES · 22 Enterprise Assurance Practices
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Comprehensive Auditing, ISO Support, EHS, Legal &amp; ESG Services.
              </h2>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Every service opens its dedicated methodology and deliverables page connected
                directly to our live workspace engines. Independent consulting &amp; readiness
                services are strictly distinguished from accredited certification bodies.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Search 22 services..."
                className="pl-9 pr-3.5 py-2 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-xs text-white placeholder:text-slate-400 w-56"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            {SERVICE_DOMAINS.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => setServiceDomain(dom)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  serviceDomain === dom
                    ? 'bg-[#087BFF] text-white'
                    : 'bg-[#0B1F3A] border border-white/10 text-slate-300 hover:border-[#00D4FF] hover:text-white'
                }`}
              >
                {dom === 'ALL' ? `All Services (${PROFESSIONAL_SERVICES.length})` : dom}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleServices.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => onSelectService(svc)}
                className="text-left rounded-2xl bg-[#0B1F3A] border border-white/10 hover:border-[#00D4FF]/60 overflow-hidden transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#050E20]">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/40 to-transparent" />
                    <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between">
                      <span className="font-mono-num text-xs font-bold text-[#F5B82E]">
                        {svc.number}
                      </span>
                      <span className="text-[10.5px] font-medium text-[#00D4FF]">{svc.domain}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-bold text-white group-hover:text-[#00D4FF] transition-colors">
                      {svc.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {svc.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#00D4FF]">
                  <span>View Service Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {!serviceQuery.trim() && serviceDomain === 'ALL' && filteredServices.length > 8 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAllServices((v) => !v)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#087BFF] border border-[#087BFF]/45 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {showAllServices
                  ? 'Show Featured 8 Services'
                  : `View All ${filteredServices.length} Professional Services`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Governance Boundary Notice */}
          <div className="mt-8 rounded-2xl bg-[#0B1F3A] border border-[#F5B82E]/35 p-5 flex items-start gap-3.5">
            <Lock className="w-5 h-5 text-[#F5B82E] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-[#F5B82E]">Clear Governance Separation:</strong> ARSHIEL
              ASSURANCE delivers independent consulting, gap analysis, internal/third-party
              auditing, and certification-support services. Accredited ISO certification, statutory
              government inspections, and official regulatory licences are strictly performed by
              independent accredited certification bodies or authorized government authorities.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          8. GLOBAL ISO STANDARDS & MANAGEMENT SYSTEMS (17+ STANDARDS)
         =================================================================== */}
      <section
        id="iso-standards"
        className="bg-white text-slate-900 py-16 lg:py-24 border-b border-slate-200"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#087BFF] mb-2">
                GLOBAL ISO STANDARDS &amp; MANAGEMENT SYSTEMS · {allIsoStandards.length} Standards
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#071329]">
                Clause-Wise Gap Analysis &amp; Auditing Across International Standards.
              </h2>
              <p className="mt-2.5 text-sm text-slate-600">
                Select any standard to review its edition applicability, clause structure overview,
                industry relevance, and auditing services. Verify latest official editions prior to
                formal certification scheduling.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={isoQuery}
                  onChange={(e) => setIsoQuery(e.target.value)}
                  placeholder="Filter ISO 9001, 45001, 27001..."
                  className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#087BFF] focus:outline-none text-xs text-slate-900 w-56"
                />
              </div>
              {canEditRecords && (
                <button
                  type="button"
                  onClick={() => setAddIsoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Standard
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredIsoStandards.map((std) => (
              <button
                key={std.id}
                type="button"
                onClick={() => onSelectIsoStandard(std)}
                className="text-left p-5 rounded-2xl bg-slate-50 hover:bg-[#071329] border border-slate-200 hover:border-[#087BFF] transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-num text-sm font-bold text-[#087BFF] group-hover:text-[#00D4FF]">
                      {std.code}
                    </span>
                    <Award className="w-4 h-4 text-slate-400 group-hover:text-[#F5B82E]" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-950 group-hover:text-white leading-snug">
                    {std.title}
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 group-hover:text-[#F5B82E] mt-1">
                    {std.edition}
                  </div>
                  <p className="mt-2.5 text-xs text-slate-600 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                    {std.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 group-hover:border-white/10 flex items-center justify-between text-[11px] font-semibold text-[#087BFF] group-hover:text-[#00D4FF]">
                  <span className="truncate">{std.auditingServices[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          9. AI-POWERED SOLUTIONS (15 INTERACTIVE AI TOOLS)
         =================================================================== */}
      <section
        id="ai-solutions"
        className="bg-gradient-to-b from-[#071329] via-[#0B1F3A] to-[#071329] text-white py-16 lg:py-24 border-b border-[#087BFF]/25"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#00D4FF] mb-2">
                AI-POWERED ASSURANCE SUITE · 15 Interactive Working Tools
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                INTELLIGENCE THAT TRANSFORMS ASSURANCE.
              </h2>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Click any AI tool below to launch its dedicated interactive studio — generate
                editable, traceable drafts and export directly to DOCX or PDF under mandatory human
                verification.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-950/60 transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              Open Workspace AI Assistant
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            {['ALL', 'Auditing', 'Compliance & ESG', 'Risk & Safety', 'Documentation & CAPA'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAiCategoryFilter(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    aiCategoryFilter === cat
                      ? 'bg-[#087BFF] text-white'
                      : 'bg-[#0B1F3A] border border-white/10 text-slate-300 hover:border-[#00D4FF]'
                  }`}
                >
                  {cat === 'ALL' ? 'All 15 AI Tools' : cat}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredAiTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectAiTool(tool)}
                className="text-left p-5 rounded-2xl bg-[#071329]/80 hover:bg-[#087BFF]/15 border border-white/10 hover:border-[#00D4FF]/60 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                    <span className="font-mono-num text-[11px] font-bold text-[#F5B82E]">
                      {tool.number}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white group-hover:text-[#00D4FF] leading-snug">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {tool.shortDescription}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-[#00D4FF]">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          10. GLOBAL LEGAL & REGULATORY COMPLIANCE INTELLIGENCE
         =================================================================== */}
      <section
        id="legal-compliance"
        className="bg-slate-50 text-slate-900 py-16 lg:py-24 border-b border-slate-200"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#087BFF] mb-2">
                GLOBAL LEGAL &amp; REGULATORY COMPLIANCE INTELLIGENCE
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#071329]">
                Country, State, Industry &amp; Activity-Based Compliance Mapping.
              </h2>
              <p className="mt-2.5 text-sm text-slate-600">
                Track Indian Central, Andhra Pradesh, Telangana, and international reference
                standards with effective dates, amendment flags, and official portal sources.
                Unverified or transitional provisions are explicitly flagged for official review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenModule('legal-compliance', 'AI Legal Compliance Engine')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <Scale className="w-4 h-4 text-[#00D4FF]" />
              Open Full Legal Register Module
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'India', 'International Reference'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setLegalCountryFilter(c)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    legalCountryFilter === c
                      ? 'bg-[#071329] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF]'
                  }`}
                >
                  {c === 'ALL' ? `All Frameworks (${LEGAL_INTELLIGENCE_CATALOG.length})` : c}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={legalQuery}
                onChange={(e) => setLegalQuery(e.target.value)}
                placeholder="Search AP, Telangana, OSHWC, NFPA..."
                className="pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-300 focus:border-[#087BFF] focus:outline-none text-xs text-slate-900 w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLegalItems.map((leg) => (
              <div
                key={leg.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#087BFF]/70 p-5 shadow-sm flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5">
                    <span className="font-semibold text-[#087BFF]">{leg.stateScope}</span>
                    <span
                      className={`font-semibold ${
                        leg.verificationStatus === 'Verified Reference'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {leg.verificationStatus === 'Verified Reference'
                        ? 'Verified Reference'
                        : 'Verify Portal'}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-950">{leg.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{leg.summary}</p>
                  <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                    <div>
                      <strong className="text-slate-700">Activity Scope:</strong> {leg.activityScope}
                    </div>
                    <div>
                      <strong className="text-slate-700">Effective / Edition:</strong> {leg.effectiveDate}
                    </div>
                    <div>
                      <strong className="text-slate-700">Amendments:</strong> {leg.amendmentStatus}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                  <a
                    href={leg.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#087BFF] hover:underline font-medium truncate"
                  >
                    {leg.sourceLabel}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenModule('legal-compliance', 'AI Legal Compliance Engine')}
                    className="font-semibold text-slate-800 hover:text-[#087BFF] whitespace-nowrap cursor-pointer"
                  >
                    Map Site
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          11. HOW ARSHIEL ASSURANCE WORKS (10-STEP INTERACTIVE WORKFLOW)
         =================================================================== */}
      <section className="bg-[#071329] text-white py-16 lg:py-24 border-b border-[#087BFF]/25">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-bold tracking-wider uppercase text-[#00D4FF] mb-2">
              HOW ARSHIEL ASSURANCE WORKS · 10-Stage Closed-Loop Lifecycle
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              From Sector Selection to Final Verified Assessment Report.
            </h2>
          </div>

          {/* 10 Interactive Step Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
            {HOW_IT_WORKS_STEPS.map((st, idx) => {
              const isActive = idx === activeWorkflowIdx;
              return (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setActiveWorkflowIdx(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#087BFF] border-[#00D4FF] text-white shadow-lg shadow-blue-950/60'
                      : 'bg-[#0B1F3A] border-white/10 text-slate-300 hover:border-[#00D4FF]/50 hover:text-white'
                  }`}
                >
                  <div
                    className={`font-mono-num text-xs font-bold ${
                      isActive ? 'text-[#F5B82E]' : 'text-[#00D4FF]'
                    }`}
                  >
                    Step {st.step}
                  </div>
                  <div className="text-xs font-semibold mt-1 leading-snug">{st.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Step Detail Panel */}
          <div className="rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/35 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="font-mono-num text-xs font-bold text-[#F5B82E]">
                STAGE {activeStep.step} OF 10
              </div>
              <h3 className="font-display text-2xl font-bold text-white">{activeStep.title}</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{activeStep.summary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#071329] border border-white/10 text-xs">
                  <div className="font-semibold text-[#00D4FF] mb-1">AI Acceleration</div>
                  <p className="text-slate-300 leading-relaxed">{activeStep.aiSupport}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#071329] border border-white/10 text-xs">
                  <div className="font-semibold text-[#F5B82E] mb-1">Human Governance Check</div>
                  <p className="text-slate-300 leading-relaxed">{activeStep.humanControl}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenModule(activeStep.targetModuleId, activeStep.actionLabel)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                {activeStep.actionLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeWorkflowIdx === 0}
                  onClick={() => setActiveWorkflowIdx((i) => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                >
                  Previous Step
                </button>
                <button
                  type="button"
                  disabled={activeWorkflowIdx === HOW_IT_WORKS_STEPS.length - 1}
                  onClick={() =>
                    setActiveWorkflowIdx((i) => Math.min(HOW_IT_WORKS_STEPS.length - 1, i + 1))
                  }
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          12. WHY CHOOSE ARSHIEL ASSURANCE + ABOUT US
         =================================================================== */}
      <section id="about" className="bg-white text-slate-900 py-16 lg:py-24 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold tracking-wider uppercase text-[#087BFF]">
                ABOUT US · WHY CHOOSE ARSHIEL ASSURANCE
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#071329]">
                Built for Enterprise Rigor, Transparent Governance &amp; Real Industrial Safety.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                <strong className="text-slate-900">ARSHIEL ASSURANCE</strong> is developed under{' '}
                <strong className="text-slate-900">{OFFICIAL_CONTACT.organization}</strong> by
                founder and software developer{' '}
                <strong className="text-slate-900">{OFFICIAL_CONTACT.founder}</strong> to unify
                independent auditing, ISO management system consultancy, Indian &amp; global legal
                compliance mapping, EHS risk management, and human-verified AI intelligence.
              </p>
            </div>
            <div className="lg:col-span-6">
              {!bannerImgError && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-[#071329]">
                  <img
                    src="/assets/aistudio/69ee94b6-c57f-4889-a564-1aba33dc1c99_a6f19f6a.png"
                    alt="ARSHIEL ASSURANCE Independent EHS Consultancy and Assessment Services"
                    referrerPolicy="no-referrer"
                    onError={() => setBannerImgError(true)}
                    className="w-full h-auto object-cover block"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 10 Why Choose Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WHY_CHOOSE_ADVANTAGES.map((adv, idx) => (
              <div
                key={adv.title}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#087BFF] transition-colors"
              >
                <div className="font-mono-num text-xs font-bold text-[#087BFF] mb-2">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-sm font-bold text-slate-950">{adv.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{adv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          13. FREE RESOURCES
         =================================================================== */}
      <section
        id="resources"
        className="bg-slate-50 text-slate-900 py-16 lg:py-24 border-b border-slate-200"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-10">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-wider uppercase text-[#087BFF] mb-2">
                FREE RESOURCES · Downloadable Audit &amp; Compliance Library
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#071329]">
                Checklists, HIRA/JSA/SOP Templates &amp; Implementation Guides.
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'XLSX', 'PDF', 'DOCX'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setResourceFilter(fmt)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    resourceFilter === fmt
                      ? 'bg-[#071329] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#087BFF]'
                  }`}
                >
                  {fmt === 'ALL' ? 'All Resources (10)' : `${fmt} Files`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredResources.map((res) => {
              const isDownloading = downloadingResourceId === res.id;
              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#087BFF] shadow-sm p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-[#087BFF]">
                        {res.format === 'XLSX' ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="font-mono-num text-[11px] font-bold">{res.format}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{res.itemsCount}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#087BFF] mb-1">
                      {res.category}
                    </div>
                    <h3 className="font-display text-sm font-bold text-slate-950 leading-snug">
                      {res.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{res.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownloadResource(res)}
                    className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download {res.format}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          14. CONTACT & BUSINESS ENQUIRY
         =================================================================== */}
      <section
        id="contact"
        className="bg-gradient-to-b from-[#071329] via-[#0B1F3A] to-[#071329] text-white py-16 lg:py-24 border-b border-[#087BFF]/25"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Official Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#00D4FF] mb-2">
                  CONTACT &amp; BUSINESS ENQUIRY
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Speak With ARSHIEL Assurance Experts.
                </h2>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Request an independent third-party audit, ISO gap assessment, Indian or global
                  legal compliance mapping, EHS consultation, or enterprise platform onboarding.
                </p>
              </div>

              <div className="rounded-2xl bg-[#071329] border border-[#087BFF]/30 p-6 space-y-5">
                <div>
                  <div className="text-[11px] text-[#00D4FF] uppercase tracking-wider font-semibold">
                    Organization &amp; Platform
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">
                    {OFFICIAL_CONTACT.organization}
                  </div>
                  <div className="text-xs text-[#F5B82E] mt-0.5">
                    Platform: {OFFICIAL_CONTACT.brand}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Owner, Founder, Software Developer &amp; Creator
                  </div>
                  <div className="text-base font-semibold text-white mt-0.5 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#00D4FF]" />
                    {OFFICIAL_CONTACT.owner}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Official Email
                  </div>
                  <a
                    href={`mailto:${OFFICIAL_CONTACT.email}`}
                    className="flex items-center gap-2.5 text-sm font-medium text-[#00D4FF] hover:text-white transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    {OFFICIAL_CONTACT.email}
                  </a>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Official Contact Numbers
                  </div>
                  {OFFICIAL_CONTACT.phones.map((ph) => (
                    <a
                      key={ph.display}
                      href={ph.href}
                      className="flex items-center gap-2.5 text-sm font-mono-num text-slate-100 hover:text-[#00D4FF] transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#F5B82E] shrink-0" />
                      {ph.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Business Enquiry & Consultation Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#071329] border border-[#087BFF]/30 p-6 sm:p-8 shadow-2xl shadow-black/40">
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  Submit Enquiry or Request Consultation
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  All consultation requests and enquiries are delivered directly to{' '}
                  <span className="text-[#00D4FF] font-medium">{OFFICIAL_CONTACT.email}</span> with
                  automatic reference tracking and authorization screening.
                </p>

                {enquiryReceipt ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/35 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-white">
                          {enquiryReceipt.enquiryType} Confirmed
                        </div>
                        <div className="text-xs text-emerald-200 mt-1">
                          Reference ID:{' '}
                          <span className="font-mono-num font-bold text-white">
                            {enquiryReceipt.referenceId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                          {enquiryReceipt.emailDelivery.statusMessage}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/[0.06] border border-white/10 text-[#00D4FF]">
                          <Mail className="w-3.5 h-3.5" />
                          Recipient Gmail: {enquiryReceipt.emailDelivery.recipient}
                        </div>
                      </div>
                    </div>
                    {enquiryReceipt.emailDelivery.activationPending && (
                      <div className="rounded-lg bg-amber-500/15 border border-amber-400/35 p-3 text-xs text-amber-200 leading-relaxed">
                        <strong>Owner Action Required (One-Time):</strong> Open{' '}
                        <span className="font-semibold text-white">{enquiryReceipt.emailDelivery.recipient}</span>{' '}
                        in Gmail and click the confirmation email link once so every future Request Consultation and Submit Enquiry lands in your inbox automatically.
                      </div>
                    )}
                    {enquiryReceipt.restrictedNotice && (
                      <div className="rounded-lg bg-amber-500/15 border border-amber-400/35 p-3 text-xs text-amber-200">
                        {enquiryReceipt.restrictedNotice}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {(() => {
                        const s = enquiryReceipt.summary;
                        const subject = `[${enquiryReceipt.referenceId}] ${enquiryReceipt.enquiryType} - ${s.company || s.fullName}`;
                        const body = [
                          `Reference ID: ${enquiryReceipt.referenceId}`,
                          `Request Type: ${enquiryReceipt.enquiryType}`,
                          `Name: ${s.fullName}`,
                          `Company: ${s.company || 'N/A'}`,
                          `Email: ${s.email}`,
                          `Phone: ${s.phone || 'N/A'}`,
                          `Industry: ${s.industry}`,
                          `Required Service: ${s.requiredService}`,
                          `Country / Location: ${s.country}`,
                          ``,
                          `Message:`,
                          s.message,
                        ].join('\n');
                        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                          enquiryReceipt.emailDelivery.recipient
                        )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        return (
                          <a
                            href={gmailComposeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-white text-xs font-semibold"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Send Copy via Gmail
                          </a>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => setEnquiryReceipt(null)}
                        className="px-4 py-2 rounded-lg border border-white/15 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                      >
                        New Enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitEnquiryForm('enquiry');
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Company
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Organization / Facility name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Industry
                        </label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white"
                        >
                          {allIndustries.map((ind) => (
                            <option key={ind.id} value={ind.name}>
                              {ind.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 ..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Required Service
                        </label>
                        <select
                          value={requiredService}
                          onChange={(e) => setRequiredService(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white"
                        >
                          {PROFESSIONAL_SERVICES.map((svc) => (
                            <option key={svc.id} value={svc.title}>
                              {svc.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Country / State Location
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., India (Hyderabad, Telangana / Andhra Pradesh), UAE, UK, USA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your ISO standards, facility scope, audit timeline, or compliance questions..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1F3A] border border-white/15 focus:border-[#00D4FF] focus:outline-none text-sm text-white placeholder:text-slate-500 resize-y"
                      />
                    </div>

                    {enquiryError && (
                      <div className="px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/35 text-xs text-red-200">
                        {enquiryError}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                      <button
                        type="button"
                        disabled={submittingMode !== null}
                        onClick={() => submitEnquiryForm('consultation')}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-bold transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
                      >
                        {submittingMode === 'consultation' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                        Request Consultation
                      </button>
                      <button
                        type="submit"
                        disabled={submittingMode !== null}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/60 transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer"
                      >
                        {submittingMode === 'enquiry' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Submit Enquiry
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          14B. FREE MULTI-DEVICE APP DOWNLOAD SECTION (iOS, ANDROID, LAPTOPS)
         =================================================================== */}
      <section id="install-app" className="py-12 bg-[#071329] border-t border-b border-[#087BFF]/25">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] via-[#0A1B34] to-[#071329] border border-[#087BFF]/35 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#F5B82E]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free Cross-Platform App · {APP_VERSION_LABEL}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Install ARSHIEL ASSURANCE on Any Device — Free &amp; Instant.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Download ARSHIEL ASSURANCE {APP_EDITION_TAG} directly onto your iPhone, iPad,
                  Android phone, Android tablet, Windows laptop, macOS MacBook, or Chromebook.
                  Launches full-screen with offline caching, automatic silent updates, and zero app
                  store friction across OS versions.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <PWAInstallButton variant="card" />
                  <span className="text-xs text-slate-400">
                    Works on iOS · Android · Windows · macOS · ChromeOS
                  </span>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                {[
                  {
                    icon: Smartphone,
                    title: 'iOS & iPadOS',
                    detail: 'iPhone & iPad Safari Home Screen App',
                  },
                  {
                    icon: Tablet,
                    title: 'Android',
                    detail: 'Phones & Tablets Native Install + Maskable Icon',
                  },
                  {
                    icon: Laptop,
                    title: 'Laptops & PC',
                    detail: 'Windows, macOS & ChromeOS Desktop Window',
                  },
                ].map((dev) => {
                  const Icon = dev.icon;
                  return (
                    <div
                      key={dev.title}
                      className="rounded-xl bg-[#071329]/90 border border-white/10 p-4 space-y-1.5"
                    >
                      <Icon className="w-5 h-5 text-[#00D4FF]" />
                      <div className="text-xs font-bold text-white">{dev.title}</div>
                      <div className="text-[11px] text-slate-400 leading-snug">{dev.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          15. ENTERPRISE FOOTER
         =================================================================== */}
      <footer className="bg-[#050C1B] text-slate-300 pt-14 pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <BrandMark size={38} />
                <div>
                  <div className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                    <span>ARSHIEL ASSURANCE</span>
                    <span className="text-[10px] font-mono text-[#F5B82E]">{APP_EDITION_TAG}</span>
                  </div>
                  <div className="text-[11px] text-[#00D4FF]">AI Auditing &amp; Compliance Platform</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assessing Risks. Strengthening Compliance. Improving Performance.
              </p>
              <div className="text-[11px] text-slate-400">
                Operated by <strong className="text-slate-200">{OFFICIAL_CONTACT.organization}</strong>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Quick Links
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                {[
                  ['Home', 'home'],
                  ['About', 'about'],
                  ['Services', 'services'],
                  ['Industries', 'industries'],
                  ['ISO Standards', 'iso-standards'],
                  ['AI Solutions', 'ai-solutions'],
                  ['Resources', 'resources'],
                  ['Contact', 'contact'],
                ].map(([label, target]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => scrollToSection(target)}
                    className="text-left hover:text-[#00D4FF] transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Services
              </div>
              <ul className="space-y-2 text-xs">
                {[
                  ['Auditing', 'third-party-auditing'],
                  ['ISO Support', 'iso-certification-support'],
                  ['EHS', 'ehs-hse-she-auditing'],
                  ['Legal Compliance', 'legal-compliance-auditing'],
                  ['ESG', 'esg-sustainability-consulting'],
                  ['Training', 'training-competency-development'],
                  ['Risk Management', 'risk-assessment-management'],
                ].map(([label, svcId]) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => {
                        const found = PROFESSIONAL_SERVICES.find((s) => s.id === svcId);
                        if (found) onSelectService(found);
                      }}
                      className="hover:text-[#00D4FF] transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Contact &amp; Legal
              </div>
              <div className="space-y-2 text-xs text-slate-400 mb-4">
                <div className="text-slate-200 font-medium">{OFFICIAL_CONTACT.owner}</div>
                <a href={`mailto:${OFFICIAL_CONTACT.email}`} className="block text-[#00D4FF] hover:text-white break-all">
                  {OFFICIAL_CONTACT.email}
                </a>
                {OFFICIAL_CONTACT.phones.map((ph) => (
                  <a key={ph.display} href={ph.href} className="block font-mono-num hover:text-white">
                    {ph.display}
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-xs pt-2 border-t border-white/10">
                <button type="button" onClick={() => setLegalModalKey('privacy')} className="hover:text-white cursor-pointer">
                  Privacy Policy
                </button>
                <button type="button" onClick={() => setLegalModalKey('terms')} className="hover:text-white cursor-pointer">
                  Terms &amp; Conditions
                </button>
                <button type="button" onClick={() => setLegalModalKey('disclaimer')} className="text-[#F5B82E] hover:underline cursor-pointer">
                  Disclaimer
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-[#F5B82E]">Mandatory Independence &amp; Legal Disclaimer:</strong>{' '}
            ARSHIEL ASSURANCE is an independent consultancy, auditing, and compliance intelligence
            platform. It is not an accredited ISO certification body, government inspection agency,
            OSHA enforcement authority, IOSH-approved training provider, NFPA-authorized
            certification organization, or FSSAI licensing authority.
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>&copy; ARSHIEL ASSURANCE · {APP_VERSION_LABEL}. All Rights Reserved.</span>
            <span>Developed by {OFFICIAL_CONTACT.developer} · {OFFICIAL_CONTACT.organization}</span>
          </div>
        </div>
      </footer>

      {/* ===================================================================
          GLOBAL SEARCH MODAL
         =================================================================== */}
      {globalSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-[#030917]/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/40 shadow-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#00D4FF] shrink-0" />
              <input
                type="text"
                autoFocus
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Search 28 industries, 22 services, 17 ISO standards, or 15 AI tools..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setGlobalSearchOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-5">
              {!globalQuery.trim() ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  Type a keyword like <strong className="text-white">Semiconductor</strong>,{' '}
                  <strong className="text-white">Data Centers</strong>,{' '}
                  <strong className="text-white">ISO 45001</strong>,{' '}
                  <strong className="text-white">Fire</strong>, or{' '}
                  <strong className="text-white">HIRA</strong> to jump directly to its page.
                </div>
              ) : globalSearchResults.industries.length +
                  globalSearchResults.services.length +
                  globalSearchResults.standards.length +
                  globalSearchResults.aiTools.length ===
                0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  No direct matches found for &ldquo;{globalQuery}&rdquo;.
                </div>
              ) : (
                <>
                  {globalSearchResults.industries.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F5B82E] mb-2">
                        Industries
                      </div>
                      <div className="space-y-1">
                        {globalSearchResults.industries.map((ind) => (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchOpen(false);
                              onSelectIndustry(ind);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span>{ind.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {globalSearchResults.services.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#00D4FF] mb-2">
                        Professional Services
                      </div>
                      <div className="space-y-1">
                        {globalSearchResults.services.map((svc) => (
                          <button
                            key={svc.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchOpen(false);
                              onSelectService(svc);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span>{svc.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {globalSearchResults.standards.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 mb-2">
                        ISO Standards
                      </div>
                      <div className="space-y-1">
                        {globalSearchResults.standards.map((std) => (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchOpen(false);
                              onSelectIsoStandard(std);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span>
                              {std.code} — {std.title}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {globalSearchResults.aiTools.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F5B82E] mb-2">
                        AI Tools
                      </div>
                      <div className="space-y-1">
                        {globalSearchResults.aiTools.map((tool) => (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              setGlobalSearchOpen(false);
                              onSelectAiTool(tool);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span>{tool.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00D4FF]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          DYNAMIC ADD INDUSTRY MODAL
         =================================================================== */}
      {addIndustryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030917]/85 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/40 p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Add Dynamic Industry Sector</h3>
              <button type="button" onClick={() => setAddIndustryOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              {user
                ? 'Save a custom industry directly to your Firestore workspace. It immediately appears in the global industry showcase with a dedicated blueprint page.'
                : 'Sign in as an authorized administrator to create and persist custom industry sectors.'}
            </p>
            <form onSubmit={handleAddCustomIndustry} className="space-y-3">
              <input
                type="text"
                required
                value={newIndustryName}
                onChange={(e) => setNewIndustryName(e.target.value)}
                placeholder="e.g., Defense & Space Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 text-sm text-white"
              />
              <textarea
                rows={3}
                value={newIndustryDesc}
                onChange={(e) => setNewIndustryDesc(e.target.value)}
                placeholder="Brief industry assurance scope..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 text-sm text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddIndustryOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDynamicItem}
                  className="px-4 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                >
                  {savingDynamicItem ? 'Saving...' : user ? 'Save Industry' : 'Login to Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          DYNAMIC ADD ISO STANDARD MODAL
         =================================================================== */}
      {addIsoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030917]/85 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/40 p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Add Dynamic ISO / Management Standard</h3>
              <button type="button" onClick={() => setAddIsoOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              {user
                ? 'Configure additional international or sector standards (e.g., ISO 42001 AI Management, IATF 16949, AS9100) dynamically in Firestore.'
                : 'Sign in as an authorized administrator to add custom ISO standards.'}
            </p>
            <form onSubmit={handleAddCustomStandard} className="space-y-3">
              <input
                type="text"
                required
                value={newIsoCode}
                onChange={(e) => setNewIsoCode(e.target.value)}
                placeholder="Standard Code (e.g., ISO/IEC 42001)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 text-sm text-white"
              />
              <input
                type="text"
                required
                value={newIsoName}
                onChange={(e) => setNewIsoName(e.target.value)}
                placeholder="Standard Title (e.g., AI Management Systems)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 text-sm text-white"
              />
              <textarea
                rows={3}
                value={newIsoDesc}
                onChange={(e) => setNewIsoDesc(e.target.value)}
                placeholder="Edition & applicability notes..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#071329] border border-white/15 text-sm text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddIsoOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDynamicItem}
                  className="px-4 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                >
                  {savingDynamicItem ? 'Saving...' : user ? 'Save Standard' : 'Login to Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          LEGAL / PRIVACY / TERMS / DISCLAIMER MODAL
         =================================================================== */}
      {legalModalKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030917]/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/40 shadow-2xl overflow-hidden text-slate-100">
            <div className="h-1 bg-gradient-to-r from-[#087BFF] via-[#00D4FF] to-[#F5B82E]" />
            <div className="p-6 max-h-[82vh] overflow-y-auto space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-lg font-bold text-white">
                  {LEGAL_MODAL_CONTENT[legalModalKey].title}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalModalKey(null)}
                  aria-label="Close legal modal"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {LEGAL_MODAL_CONTENT[legalModalKey].paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLegalModalKey(null)}
                  className="px-4 py-2 rounded-xl bg-[#087BFF] hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Acknowledge &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
