import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Scale,
  HardHat,
  FilePlus2,
  Lock,
  Utensils,
  Flame,
  Leaf,
  Briefcase,
  Building2,
  FileBarChart2,
  CheckSquare,
  Layers,
  Users,
  Settings,
  Bot,
  LogOut,
  Menu,
  X,
  Loader2,
  Globe,
  UserCircle2,
  Activity,
  GraduationCap,
  Award,
  Bell,
  Clock,
  ShieldAlert,
  Sparkles,
  CalendarDays,
  Truck,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Radar,
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AssuranceProvider, useAssurance } from './context/AssuranceContext';
import { BrandMark } from './components/BrandMark';
import { PWAInstallButton, PWAInstallBanner } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { APP_EDITION_TAG, APP_VERSION_LABEL } from './config/appVersion';
import { LandingPortal } from './components/LandingPortal';
import { IndustrySolutionPage } from './components/IndustrySolutionPage';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { IsoStandardDetailPage } from './components/IsoStandardDetailPage';
import { AiToolStudioPage } from './components/AiToolStudioPage';
import { AuthModal } from './components/AuthModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { DashboardView } from './modules/DashboardView';
import { AiIntelligenceHubModule } from './modules/AiIntelligenceHubModule';
import { AuditPlanningEvidenceModule } from './modules/AuditPlanningEvidenceModule';
import { EsgSustainabilityModule } from './modules/EsgSustainabilityModule';
import { RiskIntelligenceModule } from './modules/RiskIntelligenceModule';
import { ClientManagementReviewModule } from './modules/ClientManagementReviewModule';
import { SupplierPortalModule } from './modules/SupplierPortalModule';
import { IsoGapEngine } from './modules/IsoGapEngine';
import { LegalComplianceEngine } from './modules/LegalComplianceEngine';
import { AuthorizationControlEngine } from './modules/AuthorizationControlEngine';
import { AuditExecutionEngine } from './modules/AuditExecutionEngine';
import { DocumentGeneratorEngine } from './modules/DocumentGeneratorEngine';
import { CapaManagementEngine } from './modules/CapaManagementEngine';
import { MasterDataModuleBuilder } from './modules/MasterDataModuleBuilder';
import { AuditReportsHub } from './modules/AuditReportsHub';
import { UsersRolesModule } from './modules/UsersRolesModule';
import { SettingsModule } from './modules/SettingsModule';
import { ActivityIntelligenceModule } from './modules/ActivityIntelligenceModule';
import { TrainingManagementModule } from './modules/TrainingManagementModule';
import { CertificationCoordModule } from './modules/CertificationCoordModule';
import {
  ALL_INDUSTRY_BLUEPRINTS,
  createDynamicIndustryBlueprint,
  type IndustryBlueprint,
} from './data/industriesCatalog';
import {
  PROFESSIONAL_SERVICES,
  GLOBAL_ISO_STANDARDS,
  createDynamicIsoStandard,
  AI_SOLUTIONS_CATALOG,
  type ProfessionalServiceSpec,
  type IsoStandardDetailSpec,
  type AiToolSpec,
} from './data/enterpriseCatalog';
import { ALL_MODULE_IDS, ROLE_PORTAL_DESCRIPTORS } from './security/rbac';
import type { ModuleId } from './types/assurance';

type ViewMode = 'portal' | 'industry' | 'service' | 'iso' | 'ai-tool' | 'workspace';

interface NavGroup {
  id: string;
  label: string;
  items: Array<{ id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'command',
    label: 'Command Center',
    items: [{ id: 'dashboard', label: 'Executive Role Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'div-01',
    label: 'Div 01 · AI Intelligence',
    items: [
      { id: 'ai-intelligence-hub', label: 'AI Intelligence Studio', icon: Sparkles },
      { id: 'iso-gap', label: 'AI ISO Gap Analysis', icon: ShieldCheck },
      { id: 'legal-compliance', label: 'AI Legal Compliance', icon: Scale },
      { id: 'ehs-audit', label: 'AI EHS Audit Engine', icon: HardHat },
      { id: 'doc-generator', label: 'AI Document Control', icon: FilePlus2 },
    ],
  },
  {
    id: 'div-02',
    label: 'Div 02 · Audit Management',
    items: [
      { id: 'audit-planning', label: 'Schedule, Auditors & Evidence', icon: CalendarDays },
      { id: 'food-safety', label: 'Food Safety Audit', icon: Utensils },
      { id: 'fire-safety', label: 'Fire & Life Safety', icon: Flame },
      { id: 'environmental', label: 'Environmental Audit', icon: Leaf },
      { id: 'contractor-vendor', label: 'Contractor & Vendor', icon: Briefcase },
      { id: 'audit-reports', label: 'Audit Reports & Export', icon: FileBarChart2 },
    ],
  },
  {
    id: 'div-03',
    label: 'Div 03 · ISO & Certification',
    items: [
      { id: 'certification-coord', label: 'Certification Tracker', icon: Award },
      { id: 'authorization-control', label: 'Authorization Control', icon: Lock },
    ],
  },
  {
    id: 'div-04',
    label: 'Div 04 · Compliance & ESG',
    items: [
      { id: 'esg-sustainability', label: 'ESG, Carbon & Sustainability', icon: Leaf },
    ],
  },
  {
    id: 'div-05',
    label: 'Div 05 · CAPA & Docs',
    items: [
      { id: 'capa', label: 'CAPA Management', icon: CheckSquare },
    ],
  },
  {
    id: 'div-06',
    label: 'Div 06 · Training Academy',
    items: [
      { id: 'training-management', label: 'Training & Competency', icon: GraduationCap },
    ],
  },
  {
    id: 'div-07',
    label: 'Div 07 · Global Admin',
    items: [
      { id: 'client-portal', label: 'Client & Mgmt Review (9.3)', icon: ClipboardList },
      { id: 'supplier-portal', label: 'Supplier Portal & Risk', icon: Truck },
      { id: 'industry-master', label: 'Organizations & Industries', icon: Building2 },
      { id: 'master-data', label: 'Dynamic Module Builder', icon: Layers },
      { id: 'users-roles', label: 'Users, Roles & RBAC', icon: Users },
      { id: 'settings', label: 'Settings & Backups', icon: Settings },
    ],
  },
  {
    id: 'div-08',
    label: 'Div 08 · Intel & Security',
    items: [
      { id: 'risk-intelligence', label: 'Risk Intelligence & 5×5 Map', icon: Radar },
      { id: 'activity-intelligence', label: 'Activity & Security Center', icon: Activity },
    ],
  },
];

const MODULE_LABELS: Record<ModuleId, string> = {
  dashboard: 'Role Executive Dashboard',
  'ai-intelligence-hub': 'ARSHIEL AI Intelligence Studio',
  'iso-gap': 'AI ISO Gap Analysis Engine',
  'legal-compliance': 'AI Legal Compliance Engine',
  'esg-sustainability': 'ESG, Carbon & Sustainability Hub',
  'audit-planning': 'Audit Scheduling, Auditors & Evidence',
  'ehs-audit': 'AI EHS Audit Engine',
  'doc-generator': 'AI Document Control & Generator',
  'authorization-control': 'Legal Authorization Control',
  'food-safety': 'Food Safety Audit Engine',
  'fire-safety': 'Fire & Life Safety Audit Engine',
  environmental: 'Environmental Compliance Engine',
  'contractor-vendor': 'Contractor & Vendor Audit Engine',
  'industry-master': 'Organization & Industry Management',
  'audit-reports': 'Audit Report Management',
  capa: 'CAPA Management',
  'risk-intelligence': 'Enterprise Risk Intelligence & 5×5 Heatmap',
  'training-management': 'Training & Competency Academy',
  'certification-coord': 'Certification Tracker & Support',
  'client-portal': 'Client Portal & Management Review (9.3)',
  'supplier-portal': 'Supplier Portal & Vendor Risk',
  'master-data': 'Master Data & Dynamic Builder',
  'activity-intelligence': 'ARSHIEL Activity Intelligence',
  'users-roles': 'Users, Roles & RBAC Matrix',
  settings: 'Settings, Security & Backups',
};

const MODULE_DIVISION_MAP: Record<ModuleId, string> = {
  dashboard: 'Command Center',
  'ai-intelligence-hub': 'Division 01 · AI Intelligence',
  'iso-gap': 'Division 01 · AI Intelligence',
  'legal-compliance': 'Division 01 · AI Intelligence',
  'ehs-audit': 'Division 01 · AI Intelligence',
  'doc-generator': 'Division 01 · AI Intelligence',
  'audit-planning': 'Division 02 · Audit Management',
  'food-safety': 'Division 02 · Audit Management',
  'fire-safety': 'Division 02 · Audit Management',
  environmental: 'Division 02 · Audit Management',
  'contractor-vendor': 'Division 02 · Audit Management',
  'audit-reports': 'Division 02 · Audit Management',
  'certification-coord': 'Division 03 · ISO & Certification',
  'authorization-control': 'Division 03 · ISO & Certification',
  'esg-sustainability': 'Division 04 · Compliance & ESG',
  capa: 'Division 05 · CAPA & Docs',
  'training-management': 'Division 06 · Training Academy',
  'client-portal': 'Division 07 · Global Administration',
  'supplier-portal': 'Division 07 · Global Administration',
  'industry-master': 'Division 07 · Global Administration',
  'master-data': 'Division 07 · Global Administration',
  'users-roles': 'Division 07 · Global Administration',
  settings: 'Division 07 · Global Administration',
  'risk-intelligence': 'Division 08 · Intelligence & Security',
  'activity-intelligence': 'Division 08 · Intelligence & Security',
};

function ApplicationShell() {
  const {
    user,
    authReady,
    loadingData,
    userProfile,
    effectiveRole,
    isSuperAdmin,
    canEditRecords,
    visibleModules,
    can,
    organizations,
    activeOrgId,
    notifications,
    securityAlerts,
    capas,
    risks,
    certificationApplications,
    inactivityWarningSeconds,
    accountBlockedReason,
    extendActiveSession,
    performSecureLogout,
    logActivityEvent,
    logSecurityAlert,
    masterData,
    toastMessage,
    showToast,
  } = useAssurance();

  const [viewMode, setViewMode] = useState<ViewMode>('portal');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryBlueprint | null>(null);
  const [selectedService, setSelectedService] = useState<ProfessionalServiceSpec | null>(null);
  const [selectedIsoStandard, setSelectedIsoStandard] = useState<IsoStandardDetailSpec | null>(null);
  const [selectedAiTool, setSelectedAiTool] = useState<AiToolSpec | null>(null);

  const [preselectedIndustryForContact, setPreselectedIndustryForContact] = useState<string | null>(null);
  const [preselectedServiceForContact, setPreselectedServiceForContact] = useState<string | null>(null);

  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('arshiel_theme') === 'dark';
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    command: true,
    'div-01': true,
    'div-02': true,
    'div-03': false,
    'div-04': false,
    'div-05': false,
    'div-06': false,
    'div-07': true,
    'div-08': true,
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('arshiel_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auto-expand the division containing the active module
  useEffect(() => {
    const ownerGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeModule));
    if (ownerGroup) {
      setExpandedGroups((prev) => (prev[ownerGroup.id] ? prev : { ...prev, [ownerGroup.id]: true }));
    }
  }, [activeModule]);

  // Strictly filter sidebar navigation by verified user permissions (unauthorized menus NEVER render)
  const filteredNavGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => visibleModules.includes(item.id)),
    })).filter((group) => group.items.length > 0);
  }, [visibleModules]);

  const activeOrgName = useMemo(() => {
    const match = organizations.find((o) => o.id === activeOrgId);
    return match?.name || userProfile?.orgName || 'ARSHIEL ASSURANCE';
  }, [organizations, activeOrgId, userProfile]);

  const openSecurityAlertsCount = useMemo(
    () => securityAlerts.filter((a) => a.status === 'Open' || a.status === 'Investigating').length,
    [securityAlerts]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const liveOperationalAlertCount = useMemo(() => {
    const overdueCapas = capas.filter((c) => c.status === 'Overdue').length;
    const criticalRisks = risks.filter((r) => r.residualScore >= 16 && r.status !== 'Closed').length;
    const certAlerts = certificationApplications.filter(
      (c) => c.stage === 'Renewal Alert' || c.stage === 'Surveillance Due'
    ).length;
    return unreadNotificationsCount + overdueCapas + criticalRisks + certAlerts;
  }, [unreadNotificationsCount, capas, risks, certificationApplications]);

  // Merge built-in 28 industries + Firestore dynamic industries
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

  // Merge built-in 17 ISO standards + Firestore dynamic standards
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

  // Auth modal & deferred module redirect state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingTarget, setPendingTarget] = useState<{
    moduleId: ModuleId;
    label?: string;
    openAi?: boolean;
  } | null>(null);

  // If user signs out while inside workspace, safely return to portal home
  useEffect(() => {
    if (authReady && !user && viewMode === 'workspace') {
      setViewMode('portal');
    }
  }, [authReady, user, viewMode]);

  // Live RBAC safety net: if activeModule is no longer permitted for current role, reset to dashboard
  useEffect(() => {
    if (user && viewMode === 'workspace' && !visibleModules.includes(activeModule)) {
      setActiveModule('dashboard');
    }
  }, [user, viewMode, visibleModules, activeModule]);

  const guardedNavigateToModule = (moduleId: ModuleId, switchToWorkspace = false) => {
    if (!visibleModules.includes(moduleId)) {
      const targetLabel = MODULE_LABELS[moduleId] || moduleId;
      void logActivityEvent({
        eventType: 'Unauthorized Attempt',
        module: targetLabel,
        summary: `Blocked unauthorized navigation attempt to ${targetLabel} by role ${effectiveRole}`,
        result: 'Denied',
      });
      void logSecurityAlert({
        category: 'Unauthorized Access Attempt',
        severity: 'Medium',
        title: `Blocked access to ${targetLabel}`,
        description: `User with verified role "${effectiveRole}" attempted to open restricted module "${targetLabel}". Access was automatically denied.`,
        module: targetLabel,
      });
      showToast(
        `Access denied: Your verified role (${effectiveRole}) is not authorized to open ${targetLabel}.`,
        'error'
      );
      if (switchToWorkspace) {
        setActiveModule('dashboard');
        setViewMode('workspace');
      }
      return;
    }

    setActiveModule(moduleId);
    if (switchToWorkspace) {
      setViewMode('workspace');
    }
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#/workspace/${moduleId}`);
    }
    void logActivityEvent({
      eventType: 'Module Opened',
      module: MODULE_LABELS[moduleId] || moduleId,
      summary: `Opened ${MODULE_LABELS[moduleId] || moduleId} as ${effectiveRole}`,
      result: 'Success',
    });
  };

  // Direct URL / Deep-Link Enforcement (#/workspace/<moduleId>)
  useEffect(() => {
    if (!authReady) return;
    const enforceHashRoute = () => {
      const hash = window.location.hash || '';
      const match = hash.match(/^#\/workspace\/([a-z0-9-]+)$/i);
      if (!match) return;
      const requested = match[1] as ModuleId;
      if (!ALL_MODULE_IDS.includes(requested)) return;

      if (!user) {
        setPendingTarget({ moduleId: requested, label: MODULE_LABELS[requested] });
        setAuthModalMode('login');
        setAuthModalOpen(true);
        return;
      }

      if (!visibleModules.includes(requested)) {
        const targetLabel = MODULE_LABELS[requested] || requested;
        void logActivityEvent({
          eventType: 'Unauthorized Attempt',
          module: targetLabel,
          summary: `Blocked direct URL access (#/workspace/${requested}) for role ${effectiveRole}`,
          result: 'Denied',
        });
        void logSecurityAlert({
          category: 'Unauthorized Access Attempt',
          severity: 'High',
          title: `Direct URL Access Blocked: ${targetLabel}`,
          description: `Role "${effectiveRole}" attempted direct URL navigation to #/workspace/${requested}. Request was denied and redirected.`,
          module: targetLabel,
        });
        showToast(
          `Direct URL access denied: Role "${effectiveRole}" cannot access ${targetLabel}.`,
          'error'
        );
        setActiveModule('dashboard');
        setViewMode('workspace');
        window.history.replaceState(null, '', '#/workspace/dashboard');
        return;
      }

      setActiveModule(requested);
      setViewMode('workspace');
    };

    enforceHashRoute();
    window.addEventListener('hashchange', enforceHashRoute);
    return () => window.removeEventListener('hashchange', enforceHashRoute);
  }, [authReady, user, visibleModules, effectiveRole, logActivityEvent, logSecurityAlert, showToast]);

  const handleOpenModule = (moduleId: ModuleId, label?: string) => {
    if (user) {
      guardedNavigateToModule(moduleId, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPendingTarget({ moduleId, label: label || MODULE_LABELS[moduleId] });
      setAuthModalMode('login');
      setAuthModalOpen(true);
    }
  };

  const handleOpenAiAssistantFromPortal = () => {
    if (user) {
      setViewMode('workspace');
      if (isSuperAdmin) {
        setAiOpen(true);
      } else {
        showToast('AI Generation Assistant is restricted to Super Admin. Opened workspace in User (View-Only) mode.', 'warning');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPendingTarget({
        moduleId: 'dashboard',
        label: 'ARSHIEL AI Assurance Assistant',
        openAi: true,
      });
      setAuthModalMode('login');
      setAuthModalOpen(true);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register', targetLabel?: string) => {
    if (targetLabel) {
      setPendingTarget({ moduleId: 'dashboard', label: targetLabel });
    } else {
      setPendingTarget(null);
    }
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthenticated = () => {
    setAuthModalOpen(false);
    if (pendingTarget) {
      const requested = pendingTarget.moduleId;
      const safeModule = visibleModules.includes(requested)
        ? requested
        : ROLE_PORTAL_DESCRIPTORS[effectiveRole].landingModule;
      setActiveModule(safeModule);
      setViewMode('workspace');
      if (pendingTarget.openAi) {
        setAiOpen(true);
      }
      setPendingTarget(null);
    } else {
      setActiveModule(ROLE_PORTAL_DESCRIPTORS[effectiveRole].landingModule);
      setViewMode('workspace');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await performSecureLogout('User initiated manual logout');
    setAiOpen(false);
    setMobileMenuOpen(false);
    setViewMode('portal');
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/workspace/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIndustry = (ind: IndustryBlueprint) => {
    setSelectedIndustry(ind);
    setViewMode('industry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectService = (svc: ProfessionalServiceSpec) => {
    setSelectedService(svc);
    setViewMode('service');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIsoStandard = (std: IsoStandardDetailSpec) => {
    setSelectedIsoStandard(std);
    setViewMode('iso');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectIsoCode = (isoCode: string) => {
    const normalized = isoCode.trim().toLowerCase();
    const matched = allIsoStandards.find(
      (s) =>
        s.code.toLowerCase() === normalized ||
        normalized.startsWith(s.code.toLowerCase()) ||
        s.code.toLowerCase().includes(normalized)
    );
    if (matched) {
      handleSelectIsoStandard(matched);
    } else {
      handleOpenModule('iso-gap', `AI ISO Gap Analysis — ${isoCode}`);
    }
  };

  const handleSelectAiTool = (tool: AiToolSpec) => {
    setSelectedAiTool(tool);
    setViewMode('ai-tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestIndustryAssessment = (industryName: string) => {
    setPreselectedIndustryForContact(industryName);
    setViewMode('portal');
  };

  const handleRequestServiceConsultation = (serviceTitle: string) => {
    setPreselectedServiceForContact(serviceTitle);
    setViewMode('portal');
  };

  const returnToPortal = () => {
    setViewMode('portal');
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/workspace/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInactivityModal = () => {
    if (!user || inactivityWarningSeconds === null) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-modal-title"
        className="fixed inset-0 z-[70] bg-[#030917]/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 bg-[#071329] text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#F5B82E]" />
            <div>
              <h2 id="inactivity-modal-title" className="font-display text-sm font-bold">
                Session Inactivity Security Warning
              </h2>
              <p className="text-[11px] text-slate-300">
                Automatic session protection for {effectiveRole}
              </p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Your ARSHIEL ASSURANCE workspace session has been inactive and will automatically sign out to protect audit records and compliance evidence in:
            </p>
            <div className="py-3 px-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="font-mono-num text-3xl font-bold text-amber-900">
                {inactivityWarningSeconds}s
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Click &quot;Stay Signed In&quot; to continue your verified session
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-semibold cursor-pointer"
              >
                Logout Now
              </button>
              <button
                type="button"
                onClick={extendActiveSession}
                className="px-4 py-2 rounded-lg bg-[#071329] hover:bg-[#087BFF] text-white text-xs font-semibold cursor-pointer"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSharedOverlays = () => (
    <>
      <AuthModal
        open={authModalOpen}
        mode={authModalMode}
        targetLabel={pendingTarget?.label || null}
        onModeChange={setAuthModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {renderInactivityModal()}

      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-xl text-xs font-medium shadow-xl border ${
            toastMessage.tone === 'error'
              ? 'bg-red-950 text-red-100 border-red-800'
              : toastMessage.tone === 'warning'
              ? 'bg-amber-950 text-amber-100 border-amber-800'
              : 'bg-[#071329] text-white border-[#087BFF]/45'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      <OfflineIndicator />
      <PWAInstallBanner />
    </>
  );

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#071329] flex items-center justify-center text-slate-200 gap-3 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-[#00D4FF]" />
        Initializing ARSHIEL ASSURANCE...
      </div>
    );
  }

  // 1. PUBLIC ENTERPRISE PORTAL VIEW (FIRST PAGE)
  if (viewMode === 'portal') {
    return (
      <>
        <LandingPortal
          preselectedIndustry={preselectedIndustryForContact}
          preselectedService={preselectedServiceForContact}
          onClearPreselections={() => {
            setPreselectedIndustryForContact(null);
            setPreselectedServiceForContact(null);
          }}
          onOpenModule={handleOpenModule}
          onSelectIndustry={handleSelectIndustry}
          onSelectService={handleSelectService}
          onSelectIsoStandard={handleSelectIsoStandard}
          onSelectAiTool={handleSelectAiTool}
          onOpenAuth={handleOpenAuth}
          onOpenAiAssistant={handleOpenAiAssistantFromPortal}
          onLogout={handleLogout}
        />
        {renderSharedOverlays()}
      </>
    );
  }

  // 2. DEDICATED INDUSTRY SOLUTION PAGE (SECTIONS A–O)
  if (viewMode === 'industry' && selectedIndustry) {
    return (
      <>
        <IndustrySolutionPage
          industry={selectedIndustry}
          allIndustries={allIndustries}
          isAuthenticated={Boolean(user)}
          userName={userProfile?.displayName || user?.displayName}
          onBackToPortal={returnToPortal}
          onSelectIndustry={handleSelectIndustry}
          onSelectIsoCode={handleSelectIsoCode}
          onOpenModule={handleOpenModule}
          onRequestAssessment={handleRequestIndustryAssessment}
          onOpenAuth={(m) => handleOpenAuth(m)}
          onLogout={handleLogout}
        />
        {renderSharedOverlays()}
      </>
    );
  }

  // 3. DEDICATED PROFESSIONAL SERVICE DETAIL PAGE
  if (viewMode === 'service' && selectedService) {
    return (
      <>
        <ServiceDetailPage
          service={selectedService}
          allServices={PROFESSIONAL_SERVICES}
          isAuthenticated={Boolean(user)}
          onBackToPortal={returnToPortal}
          onSelectService={handleSelectService}
          onOpenModule={handleOpenModule}
          onRequestConsultation={handleRequestServiceConsultation}
          onOpenAuth={(m) => handleOpenAuth(m)}
          onLogout={handleLogout}
        />
        {renderSharedOverlays()}
      </>
    );
  }

  // 4. DEDICATED ISO STANDARD DETAIL PAGE
  if (viewMode === 'iso' && selectedIsoStandard) {
    return (
      <>
        <IsoStandardDetailPage
          standard={selectedIsoStandard}
          allStandards={allIsoStandards}
          isAuthenticated={Boolean(user)}
          onBackToPortal={returnToPortal}
          onSelectStandard={handleSelectIsoStandard}
          onOpenModule={handleOpenModule}
          onRequestConsultation={handleRequestServiceConsultation}
          onOpenAuth={(m) => handleOpenAuth(m)}
          onLogout={handleLogout}
        />
        {renderSharedOverlays()}
      </>
    );
  }

  // 5. DEDICATED INTERACTIVE AI SOLUTION STUDIO PAGE
  if (viewMode === 'ai-tool' && selectedAiTool) {
    return (
      <>
        <AiToolStudioPage
          tool={selectedAiTool}
          allTools={AI_SOLUTIONS_CATALOG}
          onBackToPortal={returnToPortal}
          onSelectTool={handleSelectAiTool}
          onOpenModule={handleOpenModule}
        />
        {renderSharedOverlays()}
      </>
    );
  }

  // 6. AUTHENTICATED ROLE-SCOPED ENTERPRISE WORKSPACE
  if (user && accountBlockedReason) {
    return (
      <div className="min-h-screen bg-[#071329] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-2xl overflow-hidden">
          <div className="bg-red-700 px-6 py-4 text-white flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <h1 className="font-display text-base font-bold">Account Access Suspended</h1>
              <p className="text-xs text-red-100">ARSHIEL ASSURANCE Security Enforcement</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-700 leading-relaxed">{accountBlockedReason}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#071329] hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Securely
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigateTo = (m: ModuleId) => {
    guardedNavigateToModule(m, false);
  };

  const renderModule = () => {
    if (loadingData) {
      return (
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-200/70 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      );
    }

    if (!visibleModules.includes(activeModule)) {
      return (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-display text-lg font-bold text-slate-900">Access Restricted by Role Policy</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your verified role ({effectiveRole}) does not permit access to {MODULE_LABELS[activeModule]}. This check is enforced automatically.
          </p>
          <button
            type="button"
            onClick={() => setActiveModule('dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Return to My Role Dashboard
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardView onNavigate={navigateTo} />;
      case 'ai-intelligence-hub':
        return <AiIntelligenceHubModule />;
      case 'audit-planning':
        return <AuditPlanningEvidenceModule />;
      case 'esg-sustainability':
        return <EsgSustainabilityModule />;
      case 'risk-intelligence':
        return <RiskIntelligenceModule />;
      case 'client-portal':
        return <ClientManagementReviewModule />;
      case 'supplier-portal':
        return <SupplierPortalModule />;
      case 'activity-intelligence':
        return <ActivityIntelligenceModule />;
      case 'iso-gap':
        return <IsoGapEngine />;
      case 'legal-compliance':
        return <LegalComplianceEngine />;
      case 'ehs-audit':
        return <AuditExecutionEngine key="EHS" engineType="EHS" />;
      case 'food-safety':
        return <AuditExecutionEngine key="Food Safety" engineType="Food Safety" />;
      case 'fire-safety':
        return <AuditExecutionEngine key="Fire & Life Safety" engineType="Fire & Life Safety" />;
      case 'environmental':
        return <AuditExecutionEngine key="Environmental" engineType="Environmental" />;
      case 'contractor-vendor':
        return <AuditExecutionEngine key="Contractor & Vendor" engineType="Contractor & Vendor" />;
      case 'doc-generator':
        return <DocumentGeneratorEngine />;
      case 'authorization-control':
        return <AuthorizationControlEngine />;
      case 'capa':
        return <CapaManagementEngine />;
      case 'training-management':
        return <TrainingManagementModule />;
      case 'certification-coord':
        return <CertificationCoordModule />;
      case 'industry-master':
        return <MasterDataModuleBuilder key="industries" initialMode="industries" />;
      case 'master-data':
        return <MasterDataModuleBuilder key="master" initialMode="master" />;
      case 'audit-reports':
        return <AuditReportsHub />;
      case 'users-roles':
        return <UsersRolesModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardView onNavigate={navigateTo} />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#071329] text-slate-200">
      <div className="px-4 py-4 border-b border-[#087BFF]/25 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={returnToPortal}
          className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer group"
          title="Return to ARSHIEL ASSURANCE Portal Home"
        >
          <BrandMark size={38} />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight text-white whitespace-nowrap group-hover:text-[#00D4FF] transition-colors">
              ARSHIEL <span className="text-[#00D4FF]">ASSURANCE</span>
            </div>
            <div className="text-[10px] text-[#F5B82E] mt-0.5 truncate">
              Enterprise Workspace · {APP_EDITION_TAG}
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Portal Home & App Install Quick Actions */}
      <div className="px-3 pt-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            returnToPortal();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B1F3A] hover:bg-[#087BFF]/20 border border-[#087BFF]/25 hover:border-[#00D4FF]/50 text-xs font-medium text-[#00D4FF] hover:text-white transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>Portal Home &amp; Resources</span>
        </button>
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* Role-Filtered 8-Division Expandable Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {filteredNavGroups.map((group) => {
          const isOpen = expandedGroups[group.id] ?? true;
          const hasActiveItem = group.items.some((item) => item.id === activeModule);
          return (
            <div key={group.id} className="rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setExpandedGroups((prev) => ({ ...prev, [group.id]: !(prev[group.id] ?? true) }))
                }
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  hasActiveItem
                    ? 'text-[#00D4FF]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{group.label}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-75" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                )}
              </button>
              {isOpen && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeModule === item.id;
                    const showAlertBadge =
                      item.id === 'activity-intelligence' && openSecurityAlertsCount > 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-[#087BFF] to-[#00D4FF]/90 text-white font-semibold shadow-sm shadow-blue-950/60'
                            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {showAlertBadge && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-[#071329] text-[10px] font-bold font-mono-num shrink-0">
                            {openSecurityAlertsCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Authenticated User Profile & Logout Footer */}
      <div className="p-3.5 border-t border-[#087BFF]/25 bg-[#0B1F3A] space-y-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserCircle2 className="w-7 h-7 text-[#00D4FF] shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {userProfile?.displayName || user?.displayName || 'Verified User'}
            </div>
            <div className="text-[11px] text-[#F5B82E] font-medium truncate">
              {isSuperAdmin ? 'Super Admin · Full Access' : `${effectiveRole} · View Only`}
            </div>
            <div className="text-[10px] text-slate-400 truncate">{activeOrgName}</div>
          </div>
        </div>
        <div
          className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-semibold flex items-center gap-1.5 ${
            isSuperAdmin
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
              : 'bg-amber-500/15 border-amber-400/30 text-amber-200'
          }`}
        >
          <Lock className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {isSuperAdmin ? 'Add / Edit / Remove Enabled' : 'User Mode · Read-Only'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-red-500/20 hover:text-red-200 border border-white/10 hover:border-red-400/35 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Secure Logout
        </button>
      </div>
    </div>
  );

  const totalHeaderAlerts =
    liveOperationalAlertCount + (can('activity-intelligence', 'view') ? openSecurityAlertsCount : 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050E1F] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Desktop Sidebar (268px) */}
      <aside className="hidden lg:block w-[268px] shrink-0 sticky top-0 h-screen border-r border-blue-950">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-[274px] h-full shadow-2xl">{sidebarContent}</div>
          <div className="flex-1 bg-[#030917]/70 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Role-Aware Workspace Header with 3-Level Breadcrumbs */}
        <header className="sticky top-0 z-30 h-15 bg-white/95 dark:bg-[#071329]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#087BFF]/25 px-4 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
              <button
                type="button"
                onClick={() => setViewMode('portal')}
                className="font-bold text-[#07142B] dark:text-white hover:text-[#087BFF] whitespace-nowrap transition-colors cursor-pointer"
              >
                ARSHIEL ASSURANCE
              </button>
              <span aria-hidden="true">/</span>
              <span className="hidden md:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {MODULE_DIVISION_MAP[activeModule]}
              </span>
              <span className="hidden md:inline" aria-hidden="true">/</span>
              <span className="text-slate-800 dark:text-[#00D4FF] font-semibold truncate">
                {MODULE_LABELS[activeModule]}
              </span>
            </div>
            <span
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap ${
                isSuperAdmin
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-400/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-400/30 text-amber-900 dark:text-amber-200'
              }`}
            >
              <Lock className="w-3 h-3 shrink-0" />
              {isSuperAdmin ? 'Super Admin · Full Control' : 'User Mode · View Only'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Light / Dark Theme Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="inline-flex items-center justify-center p-2 text-slate-600 dark:text-slate-200 hover:text-[#071329] dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#F5B82E]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Centralized Notification & Alert Center Drawer Button */}
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              title="Centralized Notification & Alert Center"
              aria-label="Open Notification & Alert Center"
              className="relative inline-flex items-center justify-center p-2 text-slate-600 dark:text-slate-200 hover:text-[#071329] dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {totalHeaderAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center font-mono-num">
                  {totalHeaderAlerts > 99 ? '99+' : totalHeaderAlerts}
                </span>
              )}
            </button>

            {/* Security Settings Shortcut (Only if authorized) */}
            {can('settings', 'view') && (
              <button
                type="button"
                onClick={() => navigateTo('settings')}
                title="Security & Governance Settings"
                className="hidden md:inline-flex items-center justify-center p-2 text-slate-600 dark:text-slate-200 hover:text-[#071329] dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={returnToPortal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Portal Home
            </button>

            {canEditRecords && (
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#071329] dark:bg-[#087BFF] hover:bg-[#087BFF] dark:hover:bg-blue-600 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-[#00D4FF] dark:text-white" />
                <span className="hidden sm:inline">ARSHIEL AI Assistant</span>
                <span className="sm:hidden">AI</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-300 border border-slate-200 dark:border-white/15 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-5">
          {!canEditRecords && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 dark:text-amber-100">
              <div className="flex items-start sm:items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong>User Mode (View-Only Access):</strong> Adding, editing, removing, approving, AI generation, and platform configuration are reserved exclusively for <strong>Super Admin</strong>.
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-[11px] font-bold text-amber-900 dark:text-amber-200 whitespace-nowrap shrink-0">
                Read-Only User
              </span>
            </div>
          )}
          {renderModule()}
        </main>

        {/* Enterprise Workspace Footer */}
        <footer className="px-6 lg:px-8 py-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#071329] text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            &copy; ARSHIEL ASSURANCE ({APP_VERSION_LABEL}) · Assessing Risks. Strengthening Compliance. Improving Performance.
          </span>
          <span>
            Independent Consultancy &amp; Assessment Platform — Not an Accredited Certification or Statutory Authority
          </span>
        </footer>
      </div>

      {renderInactivityModal()}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-xl text-xs font-medium shadow-lg border ${
            toastMessage.tone === 'error'
              ? 'bg-red-950 text-red-100 border-red-800'
              : toastMessage.tone === 'warning'
              ? 'bg-amber-950 text-amber-100 border-amber-800'
              : 'bg-[#07142B] text-white border-blue-500/40'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      <OfflineIndicator />

      {/* Centralized Notification & Alert Center Drawer */}
      <NotificationCenterDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={navigateTo}
      />

      {/* ARSHIEL AI ASSURANCE ASSISTANT Drawer */}
      <AiAssistantDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AssuranceProvider>
        <ApplicationShell />
      </AssuranceProvider>
    </ErrorBoundary>
  );
}
