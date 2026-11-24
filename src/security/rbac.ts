import {
  ALL_PERMISSION_ACTIONS,
  ALL_USER_ROLES,
  type CustomRoleRecord,
  type ModuleId,
  type PermissionAction,
  type UserRole,
} from '../types/assurance';

/**
 * Backward-compatible role normalization: maps any legacy role names stored in
 * pre-existing Firestore user documents to the canonical 14 enterprise roles.
 */
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  'Super Administrator': 'Super Admin',
  'Organization Administrator': 'Organization Admin',
  'Audit Manager': 'Assurance Manager',
  'EHS Consultant': 'ISO Consultant',
  'Legal Compliance Reviewer': 'ISO Consultant',
  'Food Safety Consultant': 'ISO Consultant',
  'Fire Safety Consultant': 'ISO Consultant',
  'Document Controller': 'Certification Coordinator',
  'Client Administrator': 'Client Admin',
  'Client Auditor': 'Client Representative / Auditee',
  'Department Manager': 'Management Viewer',
  Viewer: 'Read-Only Viewer',
};

export function normalizeUserRole(rawRole?: string | null): UserRole {
  if (!rawRole) return 'Read-Only Viewer';
  if ((ALL_USER_ROLES as string[]).includes(rawRole)) {
    return rawRole as UserRole;
  }
  return LEGACY_ROLE_MAP[rawRole] || 'Read-Only Viewer';
}

export function isPrivilegedAdminRole(role?: string | null): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === 'Super Admin' || normalized === 'Organization Admin';
}

export function isSuperAdminRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'Super Admin';
}

export const ALL_MODULE_IDS: ModuleId[] = [
  'dashboard',
  'ai-intelligence-hub',
  'iso-gap',
  'legal-compliance',
  'esg-sustainability',
  'audit-planning',
  'ehs-audit',
  'doc-generator',
  'authorization-control',
  'food-safety',
  'fire-safety',
  'environmental',
  'contractor-vendor',
  'capa',
  'audit-reports',
  'risk-intelligence',
  'training-management',
  'certification-coord',
  'client-portal',
  'supplier-portal',
  'industry-master',
  'master-data',
  'activity-intelligence',
  'users-roles',
  'settings',
];

export const MODULE_DISPLAY_META: Record<
  ModuleId,
  { label: string; shortLabel: string; category: string }
> = {
  dashboard: { label: 'Role Executive Dashboard', shortLabel: 'Dashboard', category: 'Command Center' },
  'ai-intelligence-hub': { label: 'AI Intelligence Studio', shortLabel: 'AI Studio', category: 'Division 01 · AI Intelligence' },
  'iso-gap': { label: 'AI ISO Gap Analysis Engine', shortLabel: 'ISO Gap Analysis', category: 'Division 03 · ISO & Certification' },
  'legal-compliance': { label: 'AI Legal Compliance Engine', shortLabel: 'Legal Compliance', category: 'Division 04 · Compliance & ESG' },
  'esg-sustainability': { label: 'ESG, Carbon & Sustainability Hub', shortLabel: 'ESG & Carbon', category: 'Division 04 · Compliance & ESG' },
  'audit-planning': { label: 'Audit Scheduling, Auditors & Evidence', shortLabel: 'Audit Planning', category: 'Division 02 · Audit Management' },
  'ehs-audit': { label: 'AI EHS Audit Engine', shortLabel: 'EHS Audits', category: 'Division 02 · Audit Management' },
  'doc-generator': { label: 'AI Document Control & Generator', shortLabel: 'Document Control', category: 'Division 05 · CAPA & Docs' },
  'authorization-control': { label: 'Legal Authorization Control', shortLabel: 'Auth Control', category: 'Division 03 · ISO & Certification' },
  'food-safety': { label: 'Food Safety Audit Engine', shortLabel: 'Food Safety', category: 'Division 02 · Audit Management' },
  'fire-safety': { label: 'Fire & Life Safety Engine', shortLabel: 'Fire Safety', category: 'Division 02 · Audit Management' },
  environmental: { label: 'Environmental Audit Engine', shortLabel: 'Env Audits', category: 'Division 02 · Audit Management' },
  'contractor-vendor': { label: 'Contractor & Vendor Audit', shortLabel: 'Contractor Audit', category: 'Division 02 · Audit Management' },
  capa: { label: 'CAPA Management Engine', shortLabel: 'CAPA', category: 'Division 05 · CAPA & Docs' },
  'audit-reports': { label: 'Audit Reports & Export', shortLabel: 'Audit Reports', category: 'Division 02 · Audit Management' },
  'risk-intelligence': { label: 'Enterprise Risk Intelligence & Heatmap', shortLabel: 'Risk Intelligence', category: 'Division 08 · Intelligence & Security' },
  'training-management': { label: 'Training & Competency Academy', shortLabel: 'Training Academy', category: 'Division 06 · Training & Competency' },
  'certification-coord': { label: 'Certification Tracker & Support', shortLabel: 'Certification', category: 'Division 03 · ISO & Certification' },
  'client-portal': { label: 'Client Portal & Management Review', shortLabel: 'Client & Mgmt Review', category: 'Division 07 · Global Administration' },
  'supplier-portal': { label: 'Supplier Portal & Evaluation', shortLabel: 'Supplier Portal', category: 'Division 07 · Global Administration' },
  'industry-master': { label: 'Organization & Industry Management', shortLabel: 'Organizations', category: 'Division 07 · Global Administration' },
  'master-data': { label: 'Dynamic Module Builder', shortLabel: 'Module Builder', category: 'Division 07 · Global Administration' },
  'activity-intelligence': { label: 'Activity Intelligence & Security Center', shortLabel: 'Activity & Security', category: 'Division 08 · Intelligence & Security' },
  'users-roles': { label: 'Users, Roles & RBAC Matrix', shortLabel: 'Users & Roles', category: 'Division 07 · Global Administration' },
  settings: { label: 'Settings, Subscriptions & API', shortLabel: 'Settings', category: 'Division 07 · Global Administration' },
};

const FULL_PERMISSIONS: PermissionAction[] = [...ALL_PERMISSION_ACTIONS];
const VIEW_ONLY: PermissionAction[] = ['view'];
const VIEW_DOWNLOAD: PermissionAction[] = ['view', 'download'];
const VIEW_EXPORT: PermissionAction[] = ['view', 'download', 'export'];

export type RolePermissionMatrix = Record<UserRole, Partial<Record<ModuleId, PermissionAction[]>>>;

/**
 * Authoritative 14-Role x Module x 12-Action permission matrix.
 * Used both for strict navigation filtering and action-level authorization guards.
 */
const ORG_ADMIN_MATRIX: Partial<Record<ModuleId, PermissionAction[]>> = {
  dashboard: ['view', 'export', 'configure'],
  'ai-intelligence-hub': ['create', 'view', 'edit', 'approve', 'export'],
  'iso-gap': ['create', 'view', 'edit', 'delete', 'approve', 'reject', 'assign', 'download', 'export', 'close'],
  'legal-compliance': ['create', 'view', 'edit', 'delete', 'approve', 'assign', 'download', 'export'],
  'esg-sustainability': ['create', 'view', 'edit', 'approve', 'export'],
  'audit-planning': ['create', 'view', 'edit', 'approve', 'assign', 'export'],
  'ehs-audit': ['create', 'view', 'edit', 'delete', 'approve', 'reject', 'assign', 'download', 'export', 'close'],
  'doc-generator': ['create', 'view', 'edit', 'delete', 'approve', 'reject', 'download', 'export'],
  'authorization-control': ['create', 'view', 'edit', 'approve', 'reject', 'export'],
  'food-safety': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  'fire-safety': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  environmental: ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  'contractor-vendor': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  capa: ['create', 'view', 'edit', 'delete', 'approve', 'reject', 'assign', 'close', 'export'],
  'audit-reports': ['view', 'approve', 'download', 'export'],
  'risk-intelligence': ['create', 'view', 'edit', 'approve', 'assign', 'export'],
  'training-management': ['create', 'view', 'edit', 'delete', 'assign', 'approve', 'download', 'export'],
  'certification-coord': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  'client-portal': ['create', 'view', 'edit', 'approve', 'export'],
  'supplier-portal': ['create', 'view', 'edit', 'approve', 'export'],
  'industry-master': ['create', 'view', 'edit', 'configure'],
  'master-data': ['create', 'view', 'edit', 'configure'],
  'activity-intelligence': ['view', 'export', 'configure'],
  'users-roles': ['create', 'view', 'edit', 'assign', 'configure'],
  settings: ['view', 'edit', 'configure'],
};

const MANAGER_MATRIX: Partial<Record<ModuleId, PermissionAction[]>> = {
  dashboard: ['view', 'export'],
  'ai-intelligence-hub': ['create', 'view', 'export'],
  'iso-gap': ['create', 'view', 'edit', 'approve', 'reject', 'assign', 'download', 'export', 'close'],
  'legal-compliance': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export'],
  'esg-sustainability': ['create', 'view', 'edit', 'approve', 'export'],
  'audit-planning': ['create', 'view', 'edit', 'assign', 'approve', 'export'],
  'ehs-audit': ['create', 'view', 'edit', 'approve', 'reject', 'assign', 'download', 'export', 'close'],
  'doc-generator': ['create', 'view', 'edit', 'approve', 'reject', 'download', 'export'],
  'authorization-control': ['view', 'approve', 'reject', 'export'],
  'food-safety': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export', 'close'],
  'fire-safety': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export', 'close'],
  environmental: ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export', 'close'],
  'contractor-vendor': ['create', 'view', 'edit', 'approve', 'assign', 'download', 'export', 'close'],
  capa: ['create', 'view', 'edit', 'approve', 'reject', 'assign', 'close', 'export'],
  'audit-reports': ['view', 'approve', 'reject', 'download', 'export'],
  'risk-intelligence': ['create', 'view', 'edit', 'approve', 'export'],
  'certification-coord': ['view', 'edit', 'approve', 'assign', 'download'],
  'client-portal': ['create', 'view', 'edit', 'export'],
  'supplier-portal': ['create', 'view', 'edit', 'export'],
  'activity-intelligence': ['view', 'export'],
};

const AUDITOR_MATRIX: Partial<Record<ModuleId, PermissionAction[]>> = {
  dashboard: ['view'],
  'ai-intelligence-hub': ['view', 'create'],
  'audit-planning': ['view', 'edit', 'submit'],
  'iso-gap': ['create', 'view', 'edit', 'submit', 'download'],
  'legal-compliance': ['view', 'edit', 'submit'],
  'esg-sustainability': ['view', 'submit'],
  'ehs-audit': ['create', 'view', 'edit', 'submit', 'download'],
  'doc-generator': ['view', 'download'],
  'food-safety': ['create', 'view', 'edit', 'submit', 'download'],
  'fire-safety': ['create', 'view', 'edit', 'submit', 'download'],
  environmental: ['create', 'view', 'edit', 'submit', 'download'],
  'contractor-vendor': ['create', 'view', 'edit', 'submit', 'download'],
  capa: ['create', 'view', 'edit', 'submit'],
  'risk-intelligence': ['view', 'create', 'edit'],
  'audit-reports': ['view', 'submit', 'download'],
};

const READ_ONLY_MATRIX: Partial<Record<ModuleId, PermissionAction[]>> = {
  dashboard: VIEW_ONLY,
  'ai-intelligence-hub': VIEW_ONLY,
  'audit-planning': VIEW_ONLY,
  'iso-gap': VIEW_ONLY,
  'legal-compliance': VIEW_ONLY,
  'esg-sustainability': VIEW_ONLY,
  'risk-intelligence': VIEW_ONLY,
  'audit-reports': VIEW_ONLY,
  capa: VIEW_ONLY,
  'client-portal': VIEW_ONLY,
  'supplier-portal': VIEW_ONLY,
  'certification-coord': VIEW_ONLY,
  'training-management': VIEW_ONLY,
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  'Super Admin': Object.fromEntries(ALL_MODULE_IDS.map((m) => [m, FULL_PERMISSIONS])),
  'Platform Administrator': ORG_ADMIN_MATRIX,
  'Organization Admin': ORG_ADMIN_MATRIX,
  'Corporate Admin': ORG_ADMIN_MATRIX,
  'Site Admin': MANAGER_MATRIX,
  'Department Head': MANAGER_MATRIX,
  'Assurance Manager': MANAGER_MATRIX,
  'Compliance Manager': MANAGER_MATRIX,
  'EHS Manager': MANAGER_MATRIX,
  'Quality Manager': MANAGER_MATRIX,

  'Lead Auditor': {
    ...AUDITOR_MATRIX,
    'iso-gap': ['create', 'view', 'edit', 'submit', 'approve', 'download', 'export', 'close'],
    'ehs-audit': ['create', 'view', 'edit', 'submit', 'approve', 'assign', 'download', 'export', 'close'],
    'authorization-control': ['view'],
    capa: ['create', 'view', 'edit', 'approve', 'reject', 'close', 'download', 'export'],
    'audit-reports': ['create', 'view', 'submit', 'download', 'export'],
  },

  'Internal Auditor': AUDITOR_MATRIX,
  Auditor: AUDITOR_MATRIX,

  'External Auditor': {
    dashboard: ['view'],
    'audit-planning': ['view', 'submit'],
    'iso-gap': ['view', 'edit', 'submit', 'download'],
    'ehs-audit': ['view', 'edit', 'submit', 'download'],
    'food-safety': ['view', 'edit', 'submit', 'download'],
    'fire-safety': ['view', 'edit', 'submit', 'download'],
    environmental: ['view', 'edit', 'submit', 'download'],
    capa: ['create', 'view', 'submit'],
    'audit-reports': ['view', 'submit', 'download'],
  },

  'ISO Consultant': {
    dashboard: ['view', 'export'],
    'ai-intelligence-hub': ['create', 'view', 'export'],
    'iso-gap': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'legal-compliance': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'esg-sustainability': ['create', 'view', 'edit', 'export'],
    'doc-generator': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'authorization-control': ['view'],
    'risk-intelligence': ['create', 'view', 'edit', 'export'],
    capa: ['create', 'view', 'edit', 'submit'],
    'audit-reports': ['view', 'download', 'export'],
    'certification-coord': ['view', 'edit', 'submit'],
    'client-portal': ['view', 'edit'],
  },

  Consultant: {
    dashboard: ['view', 'export'],
    'ai-intelligence-hub': ['create', 'view', 'export'],
    'iso-gap': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'legal-compliance': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'esg-sustainability': ['create', 'view', 'edit', 'export'],
    'doc-generator': ['create', 'view', 'edit', 'submit', 'download', 'export'],
    'risk-intelligence': ['create', 'view', 'edit'],
    capa: ['create', 'view', 'edit', 'submit'],
    'audit-reports': ['view', 'download', 'export'],
  },

  'Client Admin': {
    dashboard: ['view', 'export'],
    'client-portal': ['create', 'view', 'edit', 'submit', 'export'],
    'iso-gap': ['view', 'download', 'export'],
    'legal-compliance': ['view', 'edit', 'download'],
    'esg-sustainability': ['view', 'download'],
    'ehs-audit': ['view', 'download'],
    'doc-generator': ['view', 'submit', 'download'],
    capa: ['view', 'edit', 'assign', 'submit', 'export'],
    'risk-intelligence': ['view', 'export'],
    'audit-reports': ['view', 'download', 'export'],
    'certification-coord': ['view', 'submit', 'download'],
    'training-management': ['view', 'assign', 'download'],
    'users-roles': ['create', 'view', 'edit', 'assign'],
    'activity-intelligence': ['view'],
  },

  'Client Representative / Auditee': {
    dashboard: ['view'],
    'client-portal': ['view', 'submit'],
    'iso-gap': ['view', 'submit'],
    'ehs-audit': ['view', 'submit'],
    'doc-generator': ['view', 'submit', 'download'],
    capa: ['view', 'edit', 'submit'],
    'audit-reports': ['view', 'download'],
  },

  'Client User': {
    dashboard: ['view'],
    'client-portal': ['view', 'submit'],
    'iso-gap': ['view'],
    capa: ['view', 'submit'],
    'audit-reports': ['view', 'download'],
    'certification-coord': ['view'],
  },

  Supplier: {
    dashboard: ['view'],
    'supplier-portal': ['view', 'submit'],
    'contractor-vendor': ['view'],
    capa: ['view', 'submit'],
    'doc-generator': ['view', 'download'],
  },

  'Certification Coordinator': {
    dashboard: ['view', 'export'],
    'certification-coord': ['create', 'view', 'edit', 'submit', 'assign', 'download', 'export'],
    'iso-gap': ['view', 'download'],
    'doc-generator': ['create', 'view', 'edit', 'submit', 'download'],
    'authorization-control': ['view', 'submit', 'export'],
    'audit-reports': ['view', 'download', 'export'],
    'client-portal': ['view', 'edit'],
  },

  Trainer: {
    dashboard: ['view', 'export'],
    'training-management': ['create', 'view', 'edit', 'assign', 'submit', 'approve', 'download', 'export'],
    'doc-generator': ['create', 'view', 'edit', 'download'],
  },

  Trainee: {
    dashboard: ['view'],
    'training-management': ['view', 'submit', 'download'],
  },

  Employee: {
    dashboard: ['view'],
    'training-management': ['view', 'submit'],
    'doc-generator': ['view', 'download'],
    capa: ['view'],
    'risk-intelligence': ['view'],
  },

  'Management Viewer': {
    dashboard: VIEW_EXPORT,
    'iso-gap': VIEW_EXPORT,
    'legal-compliance': VIEW_EXPORT,
    'esg-sustainability': VIEW_EXPORT,
    'risk-intelligence': VIEW_EXPORT,
    'ehs-audit': VIEW_DOWNLOAD,
    capa: VIEW_EXPORT,
    'audit-reports': VIEW_EXPORT,
    'client-portal': VIEW_EXPORT,
    'supplier-portal': VIEW_EXPORT,
    'certification-coord': VIEW_ONLY,
    'training-management': VIEW_ONLY,
    'activity-intelligence': VIEW_ONLY,
  },

  'Read-Only Viewer': READ_ONLY_MATRIX,
  Viewer: READ_ONLY_MATRIX,
};

export const SUPER_ADMIN_ONLY_WRITE_DEFAULT = true;

export const WRITE_PERMISSION_ACTIONS: PermissionAction[] = [
  'create',
  'edit',
  'delete',
  'approve',
  'reject',
  'assign',
  'submit',
  'close',
  'configure',
];

export function resolveModulePermissions(
  role: string | null | undefined,
  moduleId: ModuleId,
  customRoles: CustomRoleRecord[] = [],
  customRoleId?: string,
  superAdminOnlyWrite: boolean = SUPER_ADMIN_ONLY_WRITE_DEFAULT
): PermissionAction[] {
  const normalized = normalizeUserRole(role);
  if (normalized === 'Super Admin') {
    return FULL_PERMISSIONS;
  }

  let basePerms: PermissionAction[] = DEFAULT_ROLE_PERMISSIONS[normalized]?.[moduleId] || [];
  if (customRoleId) {
    const matched = customRoles.find((r) => r.id === customRoleId && r.active);
    if (matched && matched.permissions[moduleId]) {
      basePerms = matched.permissions[moduleId] || [];
    }
  }

  // Super Admin–Only Write Policy: all non-Super-Admin users are restricted to View-Only
  // (no create/add, edit, delete/remove, approve, reject, assign, submit, close, or configure)
  if (superAdminOnlyWrite) {
    return basePerms.filter((action) => action === 'view');
  }

  return basePerms;
}

export function hasModulePermission(
  role: string | null | undefined,
  moduleId: ModuleId,
  action: PermissionAction,
  customRoles: CustomRoleRecord[] = [],
  customRoleId?: string,
  superAdminOnlyWrite: boolean = SUPER_ADMIN_ONLY_WRITE_DEFAULT
): boolean {
  const perms = resolveModulePermissions(
    role,
    moduleId,
    customRoles,
    customRoleId,
    superAdminOnlyWrite
  );
  return perms.includes(action);
}

export function canUserMutateRecords(
  role: string | null | undefined,
  superAdminOnlyWrite: boolean = SUPER_ADMIN_ONLY_WRITE_DEFAULT
): boolean {
  const normalized = normalizeUserRole(role);
  if (normalized === 'Super Admin') return true;
  return !superAdminOnlyWrite && !['Read-Only Viewer', 'Management Viewer'].includes(normalized);
}

export function getVisibleModulesForRole(
  role: string | null | undefined,
  customRoles: CustomRoleRecord[] = [],
  customRoleId?: string,
  superAdminOnlyWrite: boolean = SUPER_ADMIN_ONLY_WRITE_DEFAULT
): ModuleId[] {
  return ALL_MODULE_IDS.filter((mod) =>
    hasModulePermission(role, mod, 'view', customRoles, customRoleId, superAdminOnlyWrite)
  );
}

export interface RolePortalDescriptor {
  role: UserRole;
  portalTitle: string;
  scopeBadge: string;
  summary: string;
  dashboardHighlights: string[];
  landingModule: ModuleId;
}

export const ROLE_PORTAL_DESCRIPTORS: Record<UserRole, RolePortalDescriptor> = {
  'Super Admin': {
    role: 'Super Admin',
    portalTitle: 'Global Platform Command',
    scopeBadge: 'Global Multi-Org',
    summary: 'Full platform governance, organizations, roles, subscriptions, security monitoring, Activity Intelligence, backups, and system health.',
    dashboardHighlights: [
      'Global Platform Dashboard',
      'Organization & Subscription Management',
      'All User, Role & Custom Permission Governance',
      'Security Monitoring & Activity Intelligence',
      'Database, Retention & System Health',
    ],
    landingModule: 'dashboard',
  },
  'Organization Admin': {
    role: 'Organization Admin',
    portalTitle: 'Organization Operations Center',
    scopeBadge: 'Organization Scoped',
    summary: 'Manage company profile, employees, departments, auditors, clients, audits, controlled documents, training, and organization activity logs.',
    dashboardHighlights: [
      'Organization Dashboard & Company Profile',
      'Employee, Department & Auditor Management',
      'Client, Audit & Document Control',
      'Training Management & Compliance Reports',
      'Organization Activity Logs',
    ],
    landingModule: 'dashboard',
  },
  'Assurance Manager': {
    role: 'Assurance Manager',
    portalTitle: 'Assurance Operations Hub',
    scopeBadge: 'Operations Lead',
    summary: 'Audit planning, scheduling, team allocation, client assignments, auditor performance, findings/NC oversight, and CAPA closure.',
    dashboardHighlights: [
      'Audit Planning & Scheduling',
      'Audit Team Allocation & Client Assignments',
      'Auditor Performance & Audit Progress',
      'Findings, NC & CAPA Closure Oversight',
      'Executive Management Reports',
    ],
    landingModule: 'dashboard',
  },
  'Lead Auditor': {
    role: 'Lead Auditor',
    portalTitle: 'Lead Auditor Workbench',
    scopeBadge: 'Audit Lead',
    summary: 'Assigned audits, audit plans, checklists, objective evidence, findings & non-conformities, report submission, and CAPA verification.',
    dashboardHighlights: [
      'Assigned Audits & Audit Plans',
      'Interactive ISO & EHS Checklists',
      'Objective Evidence & Findings Verification',
      'Non-Conformity & CAPA Closure Verification',
      'Audit Report Submission',
    ],
    landingModule: 'dashboard',
  },
  'Internal Auditor': {
    role: 'Internal Auditor',
    portalTitle: 'Internal Audit Execution',
    scopeBadge: 'Internal Assurance',
    summary: 'Internal audit schedules, checklists, observations, evidence uploads, non-conformity recording, and follow-up tracking.',
    dashboardHighlights: [
      'Internal Audit Schedules',
      'Assigned Checklists & Observations',
      'Evidence Uploads & NC Recording',
      'Internal Follow-Up Tracking',
    ],
    landingModule: 'dashboard',
  },
  'External Auditor': {
    role: 'External Auditor',
    portalTitle: 'Third-Party Assessment Portal',
    scopeBadge: 'Assignment Scoped',
    summary: 'Strict assignment-scoped third-party assessments, evidence verification, independent observations, and authorized assessment reports.',
    dashboardHighlights: [
      'Assigned Third-Party Assessments Only',
      'Audit Scope & Independent Criteria',
      'Evidence Verification & Observations',
      'Authorized Assessment Reports',
    ],
    landingModule: 'dashboard',
  },
  'ISO Consultant': {
    role: 'ISO Consultant',
    portalTitle: 'ISO Consultancy Workspace',
    scopeBadge: 'Advisory & Readiness',
    summary: 'ISO gap assessments, client implementation roadmaps, controlled documentation templates, readiness reviews, and mock audit prep.',
    dashboardHighlights: [
      'Assigned ISO Gap Assessments',
      'Documentation Templates & AI Drafting',
      'Implementation Roadmap & Readiness Review',
      'Pre-Certification Mock Audit Support',
    ],
    landingModule: 'dashboard',
  },
  'Client Admin': {
    role: 'Client Admin',
    portalTitle: 'Client Compliance Portal',
    scopeBadge: 'Client Organization',
    summary: 'Client organization dashboard, audit status, compliance score, controlled documents, CAPA action tracking, and authorized reports.',
    dashboardHighlights: [
      'Client Dashboard & Compliance Score',
      'Company & User Management',
      'Audit Status & Controlled Documents',
      'Corrective Actions & Authorized Reports',
    ],
    landingModule: 'dashboard',
  },
  'Client Representative / Auditee': {
    role: 'Client Representative / Auditee',
    portalTitle: 'Auditee Evidence Desk',
    scopeBadge: 'Assigned Actions',
    summary: 'Assigned audit schedule, evidence upload desk, non-conformity responses, corrective action submissions, and authorized status updates.',
    dashboardHighlights: [
      'Assigned Audit Schedule',
      'Evidence Submission Desk',
      'Non-Conformity Responses & CAPA Updates',
      'Document Status Tracking',
    ],
    landingModule: 'dashboard',
  },
  'Certification Coordinator': {
    role: 'Certification Coordinator',
    portalTitle: 'Certification Coordination Desk',
    scopeBadge: 'Accredited Liaison',
    summary: 'Certification support applications, readiness dossiers, assessment scheduling with accredited bodies, status tracking, and renewal alerts.',
    dashboardHighlights: [
      'Certification Application Tracking',
      'Readiness Dossiers & Authorization Check',
      'Stage 1 / Stage 2 Assessment Scheduling',
      'Surveillance & Certificate Renewal Alerts',
    ],
    landingModule: 'dashboard',
  },
  Trainer: {
    role: 'Trainer',
    portalTitle: 'Training Academy Console',
    scopeBadge: 'Competency Lead',
    summary: 'Training calendar, ISO & EHS courses, participant attendance, competency assessments, and training completion certificates.',
    dashboardHighlights: [
      'Training Dashboard & Calendar',
      'Course Materials & Curriculum',
      'Participant Attendance & Competency Scores',
      'Training Completion Certificates',
    ],
    landingModule: 'dashboard',
  },
  Trainee: {
    role: 'Trainee',
    portalTitle: 'Learner Portal',
    scopeBadge: 'Enrolled Courses',
    summary: 'Enrolled ISO/EHS courses, course materials, competency assessments, completion status, and earned training certificates.',
    dashboardHighlights: [
      'Enrolled Courses & Schedule',
      'Course Materials & References',
      'Competency Assessments & Scores',
      'Earned Training Certificates',
    ],
    landingModule: 'dashboard',
  },
  'Management Viewer': {
    role: 'Management Viewer',
    portalTitle: 'Executive Governance View',
    scopeBadge: 'Read-Only Executive',
    summary: 'Executive compliance KPIs, audit trends, CAPA closure velocity, risk exposure, and board-ready report exports.',
    dashboardHighlights: [
      'Executive Compliance KPIs',
      'Audit Trends & Readiness Trajectory',
      'CAPA Closure & Risk Summary',
      'Authorized Board Report Exports',
    ],
    landingModule: 'dashboard',
  },
  'Read-Only Viewer': {
    role: 'Read-Only Viewer',
    portalTitle: 'Authorized Read-Only View',
    scopeBadge: 'Strict Read-Only',
    summary: 'View-only access to explicitly authorized compliance summaries and published reports with zero modification rights.',
    dashboardHighlights: [
      'Authorized Dashboard Overview',
      'Read-Only Published Audit Reports',
      'No Edit, Delete, or Configuration Rights',
    ],
    landingModule: 'dashboard',
  },
  'Platform Administrator': {
    role: 'Platform Administrator',
    portalTitle: 'Platform Administration Console',
    scopeBadge: 'Platform Ops',
    summary: 'Enterprise workspace configuration, dynamic modules, subscriptions, and cross-division oversight.',
    dashboardHighlights: ['Global Analytics', 'Dynamic Module Governance', 'Security & Backup Monitoring'],
    landingModule: 'dashboard',
  },
  'Corporate Admin': {
    role: 'Corporate Admin',
    portalTitle: 'Corporate Group Assurance Hub',
    scopeBadge: 'Multi-Site Corporate',
    summary: 'Corporate-wide ISO compliance, ESG performance, multi-site audits, and management reviews.',
    dashboardHighlights: ['Multi-Site Compliance', 'Management Review KPIs', 'Enterprise Risk Register'],
    landingModule: 'dashboard',
  },
  'Site Admin': {
    role: 'Site Admin',
    portalTitle: 'Facility Assurance Operations',
    scopeBadge: 'Site Scoped',
    summary: 'Site-level audits, EHS inspections, local legal register, CAPA tracking, and training compliance.',
    dashboardHighlights: ['Site Audit Schedule', 'Facility CAPA Closure', 'Local Legal Register'],
    landingModule: 'dashboard',
  },
  'Department Head': {
    role: 'Department Head',
    portalTitle: 'Department Compliance Desk',
    scopeBadge: 'Department Scoped',
    summary: 'Departmental audit findings, corrective actions, risk controls, and staff competency tracking.',
    dashboardHighlights: ['Department CAPAs', 'Control Effectiveness', 'Training Readiness'],
    landingModule: 'dashboard',
  },
  'Compliance Manager': {
    role: 'Compliance Manager',
    portalTitle: 'Global Legal & ESG Hub',
    scopeBadge: 'Compliance Lead',
    summary: 'Country and state statutory registers, ESG/GHG metrics, regulatory updates, and compliance calendars.',
    dashboardHighlights: ['Statutory Compliance Calendar', 'ESG & Carbon Metrics', 'Legal Verification Log'],
    landingModule: 'dashboard',
  },
  'EHS Manager': {
    role: 'EHS Manager',
    portalTitle: 'EHS & Industrial Safety Center',
    scopeBadge: 'EHS Lead',
    summary: 'EHS audits, fire & life safety assessments, HIRA/risk heatmaps, and industrial safety CAPA.',
    dashboardHighlights: ['EHS & Fire Audits', '5x5 Risk Heatmap', 'Safety CAPA & Training'],
    landingModule: 'dashboard',
  },
  'Quality Manager': {
    role: 'Quality Manager',
    portalTitle: 'Quality & ISO Management Center',
    scopeBadge: 'QMS Lead',
    summary: 'ISO 9001/13485 gap readiness, document version control, supplier quality, and management reviews.',
    dashboardHighlights: ['ISO Readiness Score', 'Controlled Document Register', 'Management Review KPIs'],
    landingModule: 'dashboard',
  },
  Auditor: {
    role: 'Auditor',
    portalTitle: 'Auditor Execution Workbench',
    scopeBadge: 'Audit Operations',
    summary: 'Assigned audits, interactive checklists, evidence uploads, findings classification, and draft reports.',
    dashboardHighlights: ['Assigned Audits', 'Evidence Vault', 'Findings & Draft Reports'],
    landingModule: 'dashboard',
  },
  Consultant: {
    role: 'Consultant',
    portalTitle: 'Assurance Advisory Workspace',
    scopeBadge: 'Advisory',
    summary: 'ISO gap assessments, ESG advisory, risk modeling, controlled documentation, and readiness roadmaps.',
    dashboardHighlights: ['Gap Assessments', 'AI Drafting Studio', 'Readiness Roadmaps'],
    landingModule: 'dashboard',
  },
  Supplier: {
    role: 'Supplier',
    portalTitle: 'Supplier Assurance Portal',
    scopeBadge: 'Vendor Scoped',
    summary: 'Supplier profile, compliance documentation submission, supplier audit status, and corrective actions.',
    dashboardHighlights: ['Supplier Evaluation Score', 'Compliance Documents', 'Assigned Vendor CAPAs'],
    landingModule: 'supplier-portal',
  },
  'Client User': {
    role: 'Client User',
    portalTitle: 'Client Workspace Portal',
    scopeBadge: 'Client Scoped',
    summary: 'Audit request tracking, compliance progress, authorized reports, and certification readiness status.',
    dashboardHighlights: ['Audit Requests & Progress', 'Open Findings & CAPAs', 'Certification Status'],
    landingModule: 'client-portal',
  },
  Employee: {
    role: 'Employee',
    portalTitle: 'Employee Compliance & Learning',
    scopeBadge: 'Staff Access',
    summary: 'Assigned ISO/EHS training modules, published SOPs, safety policies, and competency certificates.',
    dashboardHighlights: ['Assigned Courses', 'Published SOPs & Policies', 'Training Certificates'],
    landingModule: 'dashboard',
  },
  Viewer: {
    role: 'Viewer',
    portalTitle: 'Authorized Read-Only View',
    scopeBadge: 'Strict Read-Only',
    summary: 'Read-only access to authorized compliance dashboards and published reports.',
    dashboardHighlights: ['Authorized Dashboards', 'Published Reports', 'View-Only Access'],
    landingModule: 'dashboard',
  },
};

export interface PasswordStrengthResult {
  score: number; // 0-5
  label: 'Weak' | 'Fair' | 'Strong' | 'Enterprise Grade';
  isValid: boolean;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 10,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label: PasswordStrengthResult['label'] =
    score >= 5 && password.length >= 12
      ? 'Enterprise Grade'
      : score >= 4
      ? 'Strong'
      : score >= 3
      ? 'Fair'
      : 'Weak';

  return {
    score,
    label,
    isValid: checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial,
    checks,
  };
}

const SENSITIVE_KEY_PATTERN = /(password|passwd|secret|token|authorization|cookie|mfaCode|privateMessage|apiKey|credential)/i;

/**
 * Privacy & Transparency safeguard: recursively strips sensitive credentials,
 * auth tokens, and private secrets before writing any audit or activity record.
 */
export function redactSensitiveText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/(password|passwd|token|secret|apiKey)\s*[:=]\s*\S+/gi, '$1=[REDACTED]')
    .slice(0, 1200);
}

export function redactSensitiveObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = redactSensitiveText(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Multi-Organization Data Isolation Policy:
 * Super Admin has cross-organization oversight; every other role is strictly
 * confined to its own organization ID.
 */
export function canAccessOrganizationRecord(
  role: string | null | undefined,
  userOrgId: string | null | undefined,
  recordOrgId: string | null | undefined
): boolean {
  const normalized = normalizeUserRole(role);
  if (normalized === 'Super Admin') return true;
  if (!userOrgId || !recordOrgId) return false;
  return userOrgId === recordOrgId;
}

/**
 * Auditor Assignment-Level Isolation Policy:
 * - Super Admin: cross-org access
 * - Organization Admin / Assurance Manager / Client Admin: own organization only
 * - External Auditor: strictly assigned audits (assignedAuditorIds / assignedAuditorEmails) or owned
 * - Lead / Internal Auditor: assigned audits or owned within same organization
 * - Other roles: own organization only (when module view permission allows)
 */
export function canAccessAuditRecord(
  role: string | null | undefined,
  userUid: string | null | undefined,
  userEmail: string | null | undefined,
  userOrgId: string | null | undefined,
  audit: {
    orgId?: string;
    ownerId?: string;
    assignedAuditorIds?: string[];
    assignedAuditorEmails?: string[];
  }
): boolean {
  const normalized = normalizeUserRole(role);
  if (normalized === 'Super Admin') return true;

  const uid = userUid || '';
  const emailLower = (userEmail || '').trim().toLowerCase();
  const isOwner = Boolean(uid && audit.ownerId === uid);
  const isAssignedByUid = Boolean(uid && audit.assignedAuditorIds?.includes(uid));
  const isAssignedByEmail = Boolean(
    emailLower &&
      audit.assignedAuditorEmails?.some((e) => e.trim().toLowerCase() === emailLower)
  );
  const isAssigned = isAssignedByUid || isAssignedByEmail;

  if (normalized === 'External Auditor') {
    return isOwner || isAssigned;
  }

  if (normalized === 'Lead Auditor' || normalized === 'Internal Auditor') {
    if (audit.assignedAuditorIds?.length || audit.assignedAuditorEmails?.length) {
      return isOwner || isAssigned;
    }
    return isOwner || canAccessOrganizationRecord(normalized, userOrgId, audit.orgId);
  }

  return canAccessOrganizationRecord(normalized, userOrgId, audit.orgId);
}

export function isAccountStatusActive(status?: string | null): boolean {
  return !status || status === 'Active';
}

export const ALLOWED_EVIDENCE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateClientFileUpload(
  fileName: string,
  mimeType: string,
  sizeBytes: number
): { valid: boolean; error?: string } {
  const lowerName = (fileName || '').toLowerCase();
  const blockedExtensions = ['.svg', '.html', '.htm', '.js', '.mjs', '.exe', '.bat', '.sh', '.php', '.jsp'];
  if (blockedExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      error: 'Blocked file extension. Only JPG, PNG, WEBP, and PDF audit evidence files are permitted.',
    };
  }
  if (!(ALLOWED_EVIDENCE_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type (${mimeType || 'unknown'}). Allowed: JPEG, PNG, WEBP, PDF.`,
    };
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_EVIDENCE_FILE_BYTES) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${Math.round(MAX_EVIDENCE_FILE_BYTES / (1024 * 1024))} MB.`,
    };
  }
  return { valid: true };
}

