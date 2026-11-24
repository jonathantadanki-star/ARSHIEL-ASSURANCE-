import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  getAuthIdToken,
  handleFirestoreError,
  OperationType,
  signOutUser,
  testConnection,
} from '../firebase';
import type {
  ActiveSessionRecord,
  ActivityEventRecord,
  ActivityEventType,
  AuditRecord,
  AuditTrailRecord,
  AuditorProfileRecord,
  CapaRecord,
  CertificationApplicationRecord,
  ControlledDocumentRecord,
  CustomRoleRecord,
  DocumentAccessLogRecord,
  EsgMetricRecord,
  EvidenceRecord,
  IsoAssessmentRecord,
  LegalRequirementRecord,
  LoginEventType,
  LoginHistoryRecord,
  ManagementReviewRecord,
  MasterDataRecord,
  ModuleId,
  NotificationRecord,
  OrganizationRecord,
  PermissionAction,
  PlatformSettingsRecord,
  RestrictionLogRecord,
  RiskRecord,
  SecurityAlertCategory,
  SecurityAlertRecord,
  ServiceAuthorizationRecord,
  SupplierRecord,
  TrainingRecord,
  UserProfile,
  UserRole,
} from '../types/assurance';
import {
  buildInitialAudits,
  buildInitialCapas,
  buildInitialDocuments,
  buildInitialIsoAssessments,
  buildInitialLegalRequirements,
  buildInitialMasterData,
  buildInitialNotifications,
  buildInitialServiceAuthorizations,
} from '../data/seedCatalog';
import {
  SUPER_ADMIN_ONLY_WRITE_DEFAULT,
  canAccessAuditRecord,
  canAccessOrganizationRecord,
  canUserMutateRecords,
  getVisibleModulesForRole,
  hasModulePermission,
  isAccountStatusActive,
  isPrivilegedAdminRole,
  normalizeUserRole,
  redactSensitiveText,
} from '../security/rbac';

export function generateSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

const BOOTSTRAPPED_ADMIN_EMAIL = 'jonathan.tadanki@gmail.com';

interface ClientNetworkMeta {
  ipAddress: string;
  deviceInfo: string;
  browserInfo: string;
}

interface AssuranceContextValue {
  user: User | null;
  authReady: boolean;
  loadingData: boolean;
  userProfile: UserProfile | null;
  effectiveRole: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  superAdminOnlyWriteMode: boolean;
  canEditRecords: boolean;
  orgId: string;
  currentSessionId: string | null;
  clientMeta: ClientNetworkMeta;
  inactivityWarningSeconds: number | null;
  accountBlockedReason: string | null;
  extendActiveSession: () => void;
  can: (moduleId: ModuleId, action: PermissionAction) => boolean;
  visibleModules: ModuleId[];
  fetchWithAuth: (input: string, init?: RequestInit) => Promise<Response>;
  organizations: OrganizationRecord[];
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  isoAssessments: IsoAssessmentRecord[];
  legalRequirements: LegalRequirementRecord[];
  audits: AuditRecord[];
  documents: ControlledDocumentRecord[];
  serviceAuthorizations: ServiceAuthorizationRecord[];
  restrictionLogs: RestrictionLogRecord[];
  capas: CapaRecord[];
  masterData: MasterDataRecord[];
  auditLogs: AuditTrailRecord[];
  notifications: NotificationRecord[];
  allUsers: UserProfile[];
  settings: PlatformSettingsRecord | null;
  // Enterprise Security & Activity Intelligence collections
  activeSessions: ActiveSessionRecord[];
  loginHistory: LoginHistoryRecord[];
  activityEvents: ActivityEventRecord[];
  documentAccessLogs: DocumentAccessLogRecord[];
  securityAlerts: SecurityAlertRecord[];
  customRoles: CustomRoleRecord[];
  trainingRecords: TrainingRecord[];
  certificationApplications: CertificationApplicationRecord[];
  // 8-Division Enterprise collections
  risks: RiskRecord[];
  suppliers: SupplierRecord[];
  managementReviews: ManagementReviewRecord[];
  esgMetrics: EsgMetricRecord[];
  evidenceRecords: EvidenceRecord[];
  auditorProfiles: AuditorProfileRecord[];
  toastMessage: { text: string; tone: 'success' | 'error' | 'warning' } | null;
  showToast: (text: string, tone?: 'success' | 'error' | 'warning') => void;
  // CRUD helpers with automatic audit & activity intelligence logging
  createRecord: <T extends Record<string, unknown>>(
    colName: string,
    idPrefix: string,
    payload: T,
    auditModule?: string,
    auditAction?: string,
    entityRef?: string
  ) => Promise<string>;
  updateRecord: (
    colName: string,
    id: string,
    patch: Record<string, unknown>,
    auditModule?: string,
    auditAction?: string,
    entityRef?: string,
    previousSummary?: string
  ) => Promise<void>;
  deleteRecord: (
    colName: string,
    id: string,
    auditModule?: string,
    auditAction?: string,
    entityRef?: string
  ) => Promise<void>;
  logAuditTrail: (
    module: string,
    action: string,
    entityRef: string,
    details: string,
    extra?: {
      eventType?: string;
      recordId?: string;
      previousValue?: string;
      newValue?: string;
      result?: 'Success' | 'Denied' | 'Failed';
    }
  ) => Promise<void>;
  logActivityEvent: (params: {
    eventType: ActivityEventType;
    module: string;
    summary: string;
    recordId?: string;
    entityRef?: string;
    previousValue?: string;
    newValue?: string;
    remarks?: string;
    result?: 'Success' | 'Denied' | 'Failed';
  }) => Promise<void>;
  logLoginEvent: (params: {
    eventType: LoginEventType;
    authMethod: 'Email/Password' | 'Google OAuth' | 'MFA Code' | 'Session System';
    result: 'Success' | 'Failed' | 'Blocked';
    reason?: string;
    userEmail?: string;
  }) => Promise<void>;
  logDocumentAccess: (params: {
    documentId: string;
    documentName: string;
    docNumber?: string;
    accessType: 'View' | 'Download' | 'Export' | 'Approve' | 'Reject';
    exportFormat?: string;
    authorized?: boolean;
  }) => Promise<void>;
  logSecurityAlert: (params: {
    category: SecurityAlertCategory;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    title: string;
    description: string;
    module?: string;
  }) => Promise<void>;
  logRestrictionAttempt: (
    serviceId: string,
    serviceName: string,
    actionAttempted: string,
    reason: string
  ) => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  resolveSecurityAlert: (
    alertId: string,
    status: 'Investigating' | 'Resolved' | 'Dismissed',
    resolutionNotes: string
  ) => Promise<void>;
  saveSettings: (patch: Partial<PlatformSettingsRecord>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  performSecureLogout: (reason?: string) => Promise<void>;
}

const AssuranceContext = createContext<AssuranceContextValue | null>(null);

export function AssuranceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [clientMeta, setClientMeta] = useState<ClientNetworkMeta>({
    ipAddress: 'Detecting...',
    deviceInfo: 'Enterprise Client',
    browserInfo: 'Web Browser',
  });
  const [inactivityWarningSeconds, setInactivityWarningSeconds] = useState<number | null>(null);

  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>('ALL');
  const [isoAssessments, setIsoAssessments] = useState<IsoAssessmentRecord[]>([]);
  const [legalRequirements, setLegalRequirements] = useState<LegalRequirementRecord[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [documents, setDocuments] = useState<ControlledDocumentRecord[]>([]);
  const [serviceAuthorizations, setServiceAuthorizations] = useState<ServiceAuthorizationRecord[]>([]);
  const [restrictionLogs, setRestrictionLogs] = useState<RestrictionLogRecord[]>([]);
  const [capas, setCapas] = useState<CapaRecord[]>([]);
  const [masterData, setMasterData] = useState<MasterDataRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditTrailRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<PlatformSettingsRecord | null>(null);

  const [activeSessions, setActiveSessions] = useState<ActiveSessionRecord[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEventRecord[]>([]);
  const [documentAccessLogs, setDocumentAccessLogs] = useState<DocumentAccessLogRecord[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlertRecord[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRoleRecord[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [certificationApplications, setCertificationApplications] = useState<CertificationApplicationRecord[]>([]);
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [managementReviews, setManagementReviews] = useState<ManagementReviewRecord[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<EsgMetricRecord[]>([]);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const [auditorProfiles, setAuditorProfiles] = useState<AuditorProfileRecord[]>([]);

  const [toastMessage, setToastMessage] = useState<{ text: string; tone: 'success' | 'error' | 'warning' } | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionInitializedForUidRef = useRef<string | null>(null);

  const showToast = useCallback((text: string, tone: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage({ text, tone });
    window.setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  }, []);

  // Fetch server-extracted IP & device metadata once on load
  useEffect(() => {
    fetch('/api/security/client-meta')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Partial<ClientNetworkMeta> | null) => {
        if (data?.ipAddress) {
          setClientMeta({
            ipAddress: data.ipAddress,
            deviceInfo: data.deviceInfo || 'Enterprise Client',
            browserInfo: data.browserInfo || 'Web Browser',
          });
        }
      })
      .catch(() => {
        // Fallback metadata retained
      });
  }, []);

  useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setUserProfile(null);
        setCurrentSessionId(null);
        sessionInitializedForUidRef.current = null;
        setInactivityWarningSeconds(null);
        setLoadingData(false);
      }
    });
    return () => unsub();
  }, []);

  const isBootstrappedAdmin = Boolean(
    user?.emailVerified && user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );

  const effectiveRole: UserRole = useMemo(() => {
    if (isBootstrappedAdmin && !userProfile?.role) return 'Super Admin';
    return normalizeUserRole(userProfile?.role || (isBootstrappedAdmin ? 'Super Admin' : 'Read-Only Viewer'));
  }, [isBootstrappedAdmin, userProfile?.role]);

  const isSuperAdmin = isBootstrappedAdmin || effectiveRole === 'Super Admin';
  const isAdmin = isSuperAdmin || isPrivilegedAdminRole(effectiveRole);
  const superAdminOnlyWriteMode = settings?.superAdminOnlyWrite ?? SUPER_ADMIN_ONLY_WRITE_DEFAULT;
  const defaultOrgId = user ? `org_${user.uid.slice(0, 12)}` : 'org_default';
  const orgId = userProfile?.orgId || defaultOrgId;

  const accountBlockedReason = useMemo(() => {
    if (!user || isBootstrappedAdmin || !userProfile) return null;
    if (!isAccountStatusActive(userProfile.status)) {
      return `Your account is currently marked "${userProfile.status}". Workspace access has been suspended by an administrator. Please contact your Organization Admin or Super Admin.`;
    }
    return null;
  }, [user, isBootstrappedAdmin, userProfile]);

  const canEditRecords =
    !accountBlockedReason && (isSuperAdmin || canUserMutateRecords(effectiveRole, superAdminOnlyWriteMode));

  const can = useCallback(
    (moduleId: ModuleId, action: PermissionAction): boolean => {
      if (accountBlockedReason) return false;
      if (isSuperAdmin) return true;
      return hasModulePermission(
        effectiveRole,
        moduleId,
        action,
        customRoles,
        userProfile?.customRoleId,
        superAdminOnlyWriteMode
      );
    },
    [
      accountBlockedReason,
      isSuperAdmin,
      effectiveRole,
      customRoles,
      userProfile?.customRoleId,
      superAdminOnlyWriteMode,
    ]
  );

  const visibleModules = useMemo(() => {
    if (accountBlockedReason) return [];
    if (isSuperAdmin) {
      return getVisibleModulesForRole('Super Admin', customRoles, undefined, superAdminOnlyWriteMode);
    }
    return getVisibleModulesForRole(
      effectiveRole,
      customRoles,
      userProfile?.customRoleId,
      superAdminOnlyWriteMode
    );
  }, [
    accountBlockedReason,
    isSuperAdmin,
    effectiveRole,
    customRoles,
    userProfile?.customRoleId,
    superAdminOnlyWriteMode,
  ]);

  // Multi-Organization & Auditor-Assignment Isolation Projections
  const scopedAudits = useMemo(() => {
    if (isSuperAdmin) return audits;
    return audits.filter((a) =>
      canAccessAuditRecord(effectiveRole, user?.uid, user?.email, orgId, a)
    );
  }, [isSuperAdmin, audits, effectiveRole, user?.uid, user?.email, orgId]);

  const scopedDocuments = useMemo(() => {
    if (isSuperAdmin) return documents;
    return documents.filter((d) => canAccessOrganizationRecord(effectiveRole, orgId, d.orgId));
  }, [isSuperAdmin, documents, effectiveRole, orgId]);

  const scopedCapas = useMemo(() => {
    if (isSuperAdmin) return capas;
    return capas.filter((c) => canAccessOrganizationRecord(effectiveRole, orgId, c.orgId));
  }, [isSuperAdmin, capas, effectiveRole, orgId]);

  const scopedIsoAssessments = useMemo(() => {
    if (isSuperAdmin) return isoAssessments;
    return isoAssessments.filter((i) => canAccessOrganizationRecord(effectiveRole, orgId, i.orgId));
  }, [isSuperAdmin, isoAssessments, effectiveRole, orgId]);

  const scopedRisks = useMemo(() => {
    if (isSuperAdmin) return risks;
    return risks.filter((r) => canAccessOrganizationRecord(effectiveRole, orgId, r.orgId));
  }, [isSuperAdmin, risks, effectiveRole, orgId]);

  const scopedSuppliers = useMemo(() => {
    if (isSuperAdmin) return suppliers;
    return suppliers.filter((s) => canAccessOrganizationRecord(effectiveRole, orgId, s.orgId));
  }, [isSuperAdmin, suppliers, effectiveRole, orgId]);

  const scopedManagementReviews = useMemo(() => {
    if (isSuperAdmin) return managementReviews;
    return managementReviews.filter((m) => canAccessOrganizationRecord(effectiveRole, orgId, m.orgId));
  }, [isSuperAdmin, managementReviews, effectiveRole, orgId]);

  const scopedEsgMetrics = useMemo(() => {
    if (isSuperAdmin) return esgMetrics;
    return esgMetrics.filter((e) => canAccessOrganizationRecord(effectiveRole, orgId, e.orgId));
  }, [isSuperAdmin, esgMetrics, effectiveRole, orgId]);

  const scopedEvidenceRecords = useMemo(() => {
    if (isSuperAdmin) return evidenceRecords;
    return evidenceRecords.filter((e) => canAccessOrganizationRecord(effectiveRole, orgId, e.orgId));
  }, [isSuperAdmin, evidenceRecords, effectiveRole, orgId]);

  const scopedAuditorProfiles = useMemo(() => {
    if (isSuperAdmin) return auditorProfiles;
    return auditorProfiles.filter((a) => canAccessOrganizationRecord(effectiveRole, orgId, a.orgId));
  }, [isSuperAdmin, auditorProfiles, effectiveRole, orgId]);

  const fetchWithAuth = useCallback(async (input: string, init?: RequestInit): Promise<Response> => {
    const token = await getAuthIdToken();
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && init?.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(input, { ...init, headers });
  }, []);

  // Bootstrap User Profile + Workspace Records on First Sign-In
  useEffect(() => {
    if (!authReady || !user) return;
    let cancelled = false;

    async function bootstrapWorkspace(u: User) {
      setLoadingData(true);
      const safeOrgId = `org_${u.uid.slice(0, 12)}`.replace(/[^a-zA-Z0-9_-]/g, '');
      const userDocRef = doc(db, 'users', u.uid);

      try {
        const snap = await getDoc(userDocRef);
        const isEmailAdmin =
          u.emailVerified && u.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        if (!snap.exists()) {
          const newProfile = {
            uid: u.uid,
            displayName: (u.displayName || u.email?.split('@')[0] || 'Assurance User').slice(0, 150),
            email: (u.email || 'user@arshiel.example').slice(0, 200),
            role: isEmailAdmin ? 'Super Admin' : 'Read-Only Viewer',
            orgId: safeOrgId,
            orgName: 'ARSHIEL ASSURANCE Workspace',
            department: isEmailAdmin ? 'Platform Governance' : 'Standard User',
            siteAccess: 'Hyderabad (Telangana), Visakhapatnam (Andhra Pradesh)',
            mfaEnabled: false,
            emailVerified: Boolean(u.emailVerified),
            lastLoginAt: new Date().toISOString(),
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newProfile);
        } else {
          // Update lastLoginAt & emailVerified safely without touching role/status
          try {
            await updateDoc(userDocRef, {
              emailVerified: Boolean(u.emailVerified),
              lastLoginAt: new Date().toISOString(),
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Non-blocking profile sync
          }
        }

        // Seed core workspace collections strictly for verified Super Admin (standard users are view-only)
        if (isEmailAdmin) {
          const existingIso = await getDocs(
            query(collection(db, 'isoAssessments'), where('ownerId', '==', u.uid))
          );
          if (existingIso.empty && !cancelled) {
            const batch = writeBatch(db);

            const org1Id = `${safeOrgId}_deccan`;
            const org2Id = `${safeOrgId}_coastal`;
            batch.set(doc(db, 'organizations', org1Id), {
              ownerId: u.uid,
              name: 'Deccan Precision Microelectronics Pvt. Ltd.',
              industry: 'Semiconductor',
              state: 'Telangana',
              sites: 'Hyderabad Fab Park, HITEC City Data Center',
              subscriptionTier: 'Enterprise',
              status: 'Active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            batch.set(doc(db, 'organizations', org2Id), {
              ownerId: u.uid,
              name: 'Coastal BioFormulations & Fresh Foods Group',
              industry: 'Pharmaceuticals',
              state: 'Andhra Pradesh',
              sites: 'Visakhapatnam Pharma City, Vijayawada Food Park, Sri City',
              subscriptionTier: 'Enterprise',
              status: 'Active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            for (const item of buildInitialIsoAssessments(safeOrgId, u.uid)) {
              batch.set(doc(db, 'isoAssessments', generateSafeId('iso')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialLegalRequirements(safeOrgId, u.uid)) {
              batch.set(doc(db, 'legalRequirements', generateSafeId('leg')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialAudits(safeOrgId, u.uid)) {
              batch.set(doc(db, 'audits', generateSafeId('aud')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialDocuments(safeOrgId, u.uid)) {
              batch.set(doc(db, 'documents', generateSafeId('doc')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialServiceAuthorizations(safeOrgId, u.uid)) {
              batch.set(doc(db, 'serviceAuthorizations', generateSafeId('svc')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialCapas(safeOrgId, u.uid)) {
              batch.set(doc(db, 'capas', generateSafeId('capa')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialMasterData(safeOrgId, u.uid)) {
              batch.set(doc(db, 'masterData', generateSafeId('md')), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            for (const item of buildInitialNotifications(safeOrgId, u.uid)) {
              batch.set(doc(db, 'notifications', generateSafeId('ntf')), {
                ...item,
                createdAt: serverTimestamp(),
              });
            }

            batch.set(doc(db, 'settings', safeOrgId), {
              orgId: safeOrgId,
              ownerId: u.uid,
              companyName: 'ARSHIEL ASSURANCE',
              tagline: 'Assessing Risks. Strengthening Compliance. Improving Performance.',
              docNumberPrefix: 'AA',
              dateFormat: 'YYYY-MM-DD',
              currency: 'INR (₹)',
              timezone: 'Asia/Kolkata (IST)',
              retentionYears: 7,
              emailAlertsEnabled: true,
              aiHumanReviewMandatory: true,
              superAdminOnlyWrite: SUPER_ADMIN_ONLY_WRITE_DEFAULT,
              inactivityTimeoutMinutes: 30,
              sessionMaxHours: 8,
              mfaEnforced: false,
              activityRetentionDays: 365,
              maxFailedLoginAttempts: 5,
              updatedAt: serverTimestamp(),
            });

            batch.set(doc(db, 'auditLogs', generateSafeId('alog')), {
              orgId: safeOrgId,
              ownerId: u.uid,
              userId: u.uid,
              actorName: (u.displayName || u.email || 'User').slice(0, 140),
              actorRole: 'Super Admin',
              eventType: 'Workspace Initialized',
              module: 'Platform Governance',
              action: 'Workspace Initialized',
              entityRef: safeOrgId,
              details: 'ARSHIEL ASSURANCE multi-engine database provisioned with RBAC, Activity Intelligence, and legal frameworks.',
              result: 'Success',
              createdAt: serverTimestamp(),
            });

            await batch.commit();
          }

          // Seed initial Training & Certification Support records if empty
          const existingTraining = await getDocs(
            query(collection(db, 'trainingRecords'), where('ownerId', '==', u.uid))
          );
          if (existingTraining.empty && !cancelled) {
            const extraBatch = writeBatch(db);
            extraBatch.set(doc(db, 'trainingRecords', generateSafeId('trn')), {
              orgId: safeOrgId,
              ownerId: u.uid,
              courseCode: 'TRN-ISO45001-IA',
              courseTitle: 'ISO 45001:2018 Internal Auditor & Hazard Identification Workshop',
              standardRef: 'ISO 45001:2018',
              trainerName: 'Senior EHS Principal Trainer',
              scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
              mode: 'Live Online',
              department: 'EHS & Operations',
              attendeesCount: 24,
              completionRate: 88,
              assessmentPassScore: 80,
              status: 'In Progress',
              certificateRef: 'AA-TRN-2026-001',
              notes: 'Includes practical non-conformity writing and CAPA root-cause simulation.',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            extraBatch.set(doc(db, 'trainingRecords', generateSafeId('trn')), {
              orgId: safeOrgId,
              ownerId: u.uid,
              courseCode: 'TRN-ISO9001-LEAD',
              courseTitle: 'ISO 9001:2015 Quality Management & Process Audit Readiness',
              standardRef: 'ISO 9001:2015',
              trainerName: 'ISO Lead Consultant',
              scheduledDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              mode: 'On-Site Workshop',
              department: 'Quality Assurance',
              attendeesCount: 18,
              completionRate: 100,
              assessmentPassScore: 85,
              status: 'Completed',
              certificateRef: 'AA-TRN-2026-002',
              notes: 'Training completion acknowledgement issued by ARSHIEL ASSURANCE (non-accredited awareness training).',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            extraBatch.set(doc(db, 'certificationApplications', generateSafeId('cert')), {
              orgId: safeOrgId,
              ownerId: u.uid,
              applicationRef: 'CERT-SUP-2026-01',
              clientName: 'Deccan Precision Microelectronics Pvt. Ltd.',
              standardCode: 'ISO 45001:2018',
              accreditedBodyName: 'Independent NABCB/IAF Accredited CB (Client Selected)',
              stage: 'Stage 1 Audit Scheduled',
              coordinatorName: u.displayName || 'Certification Coordinator',
              targetAssessmentDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
              renewalDueDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
              documentsReady: true,
              authorizationVerified: true,
              notes: 'ARSHIEL ASSURANCE coordinates readiness documentation and mock audits only; certification decision rests exclusively with the independent accredited CB.',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            extraBatch.set(doc(db, 'certificationApplications', generateSafeId('cert')), {
              orgId: safeOrgId,
              ownerId: u.uid,
              applicationRef: 'CERT-SUP-2026-02',
              clientName: 'Coastal BioFormulations & Fresh Foods Group',
              standardCode: 'ISO 22000:2018 / HACCP',
              accreditedBodyName: 'Accredited Food Safety CB (Pending Selection)',
              stage: 'Readiness Assessment',
              coordinatorName: u.displayName || 'Certification Coordinator',
              targetAssessmentDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
              renewalDueDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
              documentsReady: false,
              authorizationVerified: true,
              notes: 'Pre-certification gap closure and CCP monitoring records under verification.',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            await extraBatch.commit();
          }
        }
      } catch (err) {
        console.error('Workspace bootstrap error:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    bootstrapWorkspace(user);
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  // Attach Real-Time Firestore Listeners scoped securely to ownerId (or global for Bootstrapped Super Admin)
  useEffect(() => {
    if (!authReady || !user) return;

    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          if (snap.exists()) {
            const raw = snap.data() as Omit<UserProfile, 'id'>;
            setUserProfile({
              id: snap.id,
              ...raw,
              role: normalizeUserRole(raw.role),
            });
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`)
      )
    );

    const subscribeOwned = <T,>(
      colName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      allowGlobalAdminList = false
    ) => {
      const q =
        allowGlobalAdminList && isBootstrappedAdmin
          ? query(collection(db, colName))
          : query(collection(db, colName), where('ownerId', '==', user.uid));
      unsubs.push(
        onSnapshot(
          q,
          (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
            setter(list);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, colName)
        )
      );
    };

    subscribeOwned<OrganizationRecord>('organizations', setOrganizations, true);
    subscribeOwned<IsoAssessmentRecord>('isoAssessments', setIsoAssessments, true);
    subscribeOwned<LegalRequirementRecord>('legalRequirements', setLegalRequirements, true);
    subscribeOwned<AuditRecord>('audits', setAudits, true);
    subscribeOwned<ControlledDocumentRecord>('documents', setDocuments, true);
    subscribeOwned<ServiceAuthorizationRecord>('serviceAuthorizations', setServiceAuthorizations, true);
    subscribeOwned<RestrictionLogRecord>('restrictionLogs', setRestrictionLogs, true);
    subscribeOwned<CapaRecord>('capas', setCapas, true);
    subscribeOwned<MasterDataRecord>('masterData', setMasterData, true);
    subscribeOwned<AuditTrailRecord>('auditLogs', setAuditLogs, true);
    subscribeOwned<NotificationRecord>('notifications', setNotifications, true);

    // Enterprise Security, Activity Intelligence & New Role Modules
    subscribeOwned<ActiveSessionRecord>('activeSessions', setActiveSessions, true);
    subscribeOwned<LoginHistoryRecord>('loginHistory', setLoginHistory, true);
    subscribeOwned<ActivityEventRecord>('activityEvents', setActivityEvents, true);
    subscribeOwned<DocumentAccessLogRecord>('documentAccessLogs', setDocumentAccessLogs, true);
    subscribeOwned<SecurityAlertRecord>('securityAlerts', setSecurityAlerts, true);
    subscribeOwned<CustomRoleRecord>('customRoles', setCustomRoles, true);
    subscribeOwned<TrainingRecord>('trainingRecords', setTrainingRecords, true);
    subscribeOwned<CertificationApplicationRecord>('certificationApplications', setCertificationApplications, true);

    // 8-Division Enterprise Collections
    subscribeOwned<RiskRecord>('risks', setRisks, true);
    subscribeOwned<SupplierRecord>('suppliers', setSuppliers, true);
    subscribeOwned<ManagementReviewRecord>('managementReviews', setManagementReviews, true);
    subscribeOwned<EsgMetricRecord>('esgMetrics', setEsgMetrics, true);
    subscribeOwned<EvidenceRecord>('evidenceRecords', setEvidenceRecords, true);
    subscribeOwned<AuditorProfileRecord>('auditorProfiles', setAuditorProfiles, true);

    // Settings listener
    const qSettings = query(collection(db, 'settings'), where('ownerId', '==', user.uid));
    unsubs.push(
      onSnapshot(
        qSettings,
        (snap) => {
          if (!snap.empty) {
            const d = snap.docs[0];
            setSettings({ id: d.id, ...(d.data() as Omit<PlatformSettingsRecord, 'id'>) });
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'settings')
      )
    );

    // Users directory (Super Admin only for strict PII isolation)
    if (isBootstrappedAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (snap) => {
            setAllUsers(
              snap.docs.map((d) => {
                const raw = d.data() as Omit<UserProfile, 'id'>;
                return { id: d.id, ...raw, role: normalizeUserRole(raw.role) };
              })
            );
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'users')
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [authReady, user, isBootstrappedAdmin]);

  // --- Logging Helpers ---
  const logAuditTrail = useCallback(
    async (
      module: string,
      action: string,
      entityRef: string,
      details: string,
      extra?: {
        eventType?: string;
        recordId?: string;
        previousValue?: string;
        newValue?: string;
        result?: 'Success' | 'Denied' | 'Failed';
      }
    ) => {
      if (!user) return;
      const id = generateSafeId('alog');
      try {
        await setDoc(doc(db, 'auditLogs', id), {
          orgId,
          ownerId: user.uid,
          userId: user.uid,
          actorName: (userProfile?.displayName || user.displayName || user.email || 'User').slice(0, 140),
          actorRole: effectiveRole.slice(0, 80),
          eventType: (extra?.eventType || action).slice(0, 80),
          module: module.slice(0, 80),
          action: action.slice(0, 120),
          ...(extra?.recordId ? { recordId: extra.recordId.slice(0, 128) } : {}),
          entityRef: entityRef.slice(0, 120),
          details: redactSensitiveText(details).slice(0, 1000),
          ...(extra?.previousValue ? { previousValue: redactSensitiveText(extra.previousValue).slice(0, 1200) } : {}),
          ...(extra?.newValue ? { newValue: redactSensitiveText(extra.newValue).slice(0, 1200) } : {}),
          result: extra?.result || 'Success',
          ipAddress: clientMeta.ipAddress.slice(0, 80),
          createdAt: serverTimestamp(),
        });
      } catch {
        // Never crash UI on non-verified audit log attempts
      }
    },
    [user, orgId, userProfile?.displayName, effectiveRole, clientMeta.ipAddress]
  );

  const logActivityEvent = useCallback(
    async (params: {
      eventType: ActivityEventType;
      module: string;
      summary: string;
      recordId?: string;
      entityRef?: string;
      previousValue?: string;
      newValue?: string;
      remarks?: string;
      result?: 'Success' | 'Denied' | 'Failed';
    }) => {
      if (!user) return;
      const id = generateSafeId('act');
      try {
        await setDoc(doc(db, 'activityEvents', id), {
          orgId,
          ownerId: user.uid,
          userId: user.uid,
          userName: (userProfile?.displayName || user.displayName || user.email || 'User').slice(0, 150),
          userRole: effectiveRole.slice(0, 80),
          orgName: (userProfile?.orgName || 'ARSHIEL ASSURANCE Workspace').slice(0, 180),
          department: (userProfile?.department || 'Assurance').slice(0, 120),
          eventType: params.eventType.slice(0, 80),
          module: params.module.slice(0, 80),
          ...(params.recordId ? { recordId: params.recordId.slice(0, 128) } : {}),
          ...(params.entityRef ? { entityRef: params.entityRef.slice(0, 120) } : {}),
          summary: redactSensitiveText(params.summary).slice(0, 800),
          ...(params.previousValue ? { previousValue: redactSensitiveText(params.previousValue).slice(0, 1200) } : {}),
          ...(params.newValue ? { newValue: redactSensitiveText(params.newValue).slice(0, 1200) } : {}),
          ...(params.remarks ? { remarks: redactSensitiveText(params.remarks).slice(0, 600) } : {}),
          result: params.result || 'Success',
          ipAddress: clientMeta.ipAddress.slice(0, 80),
          timestampIso: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking activity logging
      }
    },
    [user, orgId, userProfile?.displayName, userProfile?.orgName, userProfile?.department, effectiveRole, clientMeta.ipAddress]
  );

  const logLoginEvent = useCallback(
    async (params: {
      eventType: LoginEventType;
      authMethod: 'Email/Password' | 'Google OAuth' | 'MFA Code' | 'Session System';
      result: 'Success' | 'Failed' | 'Blocked';
      reason?: string;
      userEmail?: string;
    }) => {
      if (!user) return;
      const id = generateSafeId('lgn');
      try {
        await setDoc(doc(db, 'loginHistory', id), {
          orgId,
          ownerId: user.uid,
          userId: user.uid,
          userName: (userProfile?.displayName || user.displayName || user.email || 'User').slice(0, 150),
          userEmail: (params.userEmail || user.email || '').slice(0, 200),
          userRole: effectiveRole.slice(0, 80),
          orgName: (userProfile?.orgName || 'ARSHIEL ASSURANCE Workspace').slice(0, 180),
          eventType: params.eventType.slice(0, 80),
          authMethod: params.authMethod.slice(0, 60),
          deviceInfo: clientMeta.deviceInfo.slice(0, 120),
          browserInfo: clientMeta.browserInfo.slice(0, 120),
          ipAddress: clientMeta.ipAddress.slice(0, 80),
          result: params.result,
          ...(params.reason ? { reason: redactSensitiveText(params.reason).slice(0, 400) } : {}),
          timestampIso: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking login history logging
      }
    },
    [user, orgId, userProfile?.displayName, userProfile?.orgName, effectiveRole, clientMeta]
  );

  const logDocumentAccess = useCallback(
    async (params: {
      documentId: string;
      documentName: string;
      docNumber?: string;
      accessType: 'View' | 'Download' | 'Export' | 'Approve' | 'Reject';
      exportFormat?: string;
      authorized?: boolean;
    }) => {
      if (!user) return;
      const id = generateSafeId('dacc');
      try {
        await setDoc(doc(db, 'documentAccessLogs', id), {
          orgId,
          ownerId: user.uid,
          documentId: params.documentId.slice(0, 128),
          documentName: params.documentName.slice(0, 240),
          ...(params.docNumber ? { docNumber: params.docNumber.slice(0, 80) } : {}),
          userId: user.uid,
          userName: (userProfile?.displayName || user.displayName || user.email || 'User').slice(0, 150),
          userRole: effectiveRole.slice(0, 80),
          orgName: (userProfile?.orgName || 'ARSHIEL ASSURANCE Workspace').slice(0, 180),
          accessType: params.accessType,
          ...(params.exportFormat ? { exportFormat: params.exportFormat.slice(0, 40) } : {}),
          authorized: params.authorized ?? true,
          ipAddress: clientMeta.ipAddress.slice(0, 80),
          timestampIso: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking doc access logging
      }
    },
    [user, orgId, userProfile?.displayName, userProfile?.orgName, effectiveRole, clientMeta.ipAddress]
  );

  const logSecurityAlert = useCallback(
    async (params: {
      category: SecurityAlertCategory;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      title: string;
      description: string;
      module?: string;
    }) => {
      if (!user) return;
      const id = generateSafeId('salert');
      try {
        await setDoc(doc(db, 'securityAlerts', id), {
          orgId,
          ownerId: user.uid,
          category: params.category.slice(0, 80),
          severity: params.severity,
          title: params.title.slice(0, 200),
          description: redactSensitiveText(params.description).slice(0, 1000),
          actorUserId: user.uid,
          actorName: (userProfile?.displayName || user.displayName || user.email || 'User').slice(0, 150),
          actorEmail: (user.email || '').slice(0, 200),
          actorRole: effectiveRole.slice(0, 80),
          module: (params.module || 'Security').slice(0, 80),
          ipAddress: clientMeta.ipAddress.slice(0, 80),
          status: 'Open',
          timestampIso: new Date().toISOString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Non-blocking alert creation
      }
    },
    [user, orgId, userProfile?.displayName, effectiveRole, clientMeta.ipAddress]
  );

  // --- Register Live Authenticated Session & Log Login Event ---
  useEffect(() => {
    if (!authReady || !user || !userProfile) return;
    if (sessionInitializedForUidRef.current === user.uid) return;
    sessionInitializedForUidRef.current = user.uid;

    const sid = generateSafeId('sess');
    const nowIso = new Date().toISOString();
    const maxHours = settings?.sessionMaxHours || 8;
    const expiresIso = new Date(Date.now() + maxHours * 3600_000).toISOString();
    const providerId = user.providerData?.[0]?.providerId || 'password';
    const authMethod = providerId.includes('google') ? 'Google OAuth' : 'Email/Password';

    setCurrentSessionId(sid);
    lastActivityRef.current = Date.now();

    setDoc(doc(db, 'activeSessions', sid), {
      orgId: userProfile.orgId || defaultOrgId,
      ownerId: user.uid,
      userId: user.uid,
      userName: (userProfile.displayName || user.displayName || user.email || 'User').slice(0, 150),
      userEmail: (user.email || '').slice(0, 200),
      userRole: effectiveRole,
      orgName: (userProfile.orgName || 'ARSHIEL ASSURANCE Workspace').slice(0, 180),
      department: (userProfile.department || 'Assurance').slice(0, 120),
      deviceInfo: clientMeta.deviceInfo.slice(0, 120),
      browserInfo: clientMeta.browserInfo.slice(0, 120),
      ipAddress: clientMeta.ipAddress.slice(0, 80),
      loginTime: nowIso,
      lastActivityAt: nowIso,
      expiresAt: expiresIso,
      status: 'Active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});

    logLoginEvent({
      eventType: 'Login Success',
      authMethod,
      result: 'Success',
      reason: `Authenticated session started (${effectiveRole})`,
    });

    logActivityEvent({
      eventType: 'App Opened',
      module: 'Platform Shell',
      summary: `Authenticated workspace session initialized for role ${effectiveRole}.`,
      recordId: sid,
      result: 'Success',
    });
  }, [authReady, user, userProfile, effectiveRole, defaultOrgId, clientMeta, settings?.sessionMaxHours, logLoginEvent, logActivityEvent]);

  const performSecureLogout = useCallback(
    async (reason = 'User initiated logout') => {
      if (user) {
        if (currentSessionId) {
          try {
            await updateDoc(doc(db, 'activeSessions', currentSessionId), {
              status: reason.toLowerCase().includes('expired') ? 'Expired' : 'Revoked',
              lastActivityAt: new Date().toISOString(),
              updatedAt: serverTimestamp(),
            });
          } catch {
            // Non-blocking session closure
          }
        }
        await logLoginEvent({
          eventType: reason.toLowerCase().includes('expired') ? 'Session Expired' : 'Logout',
          authMethod: 'Session System',
          result: 'Success',
          reason,
        });
      }
      setCurrentSessionId(null);
      sessionInitializedForUidRef.current = null;
      setInactivityWarningSeconds(null);
      await signOutUser();
    },
    [user, currentSessionId, logLoginEvent]
  );

  // --- Remote Session Revocation Enforcement ---
  useEffect(() => {
    if (!user || !currentSessionId) return;
    const mySession = activeSessions.find((s) => s.id === currentSessionId);
    if (!mySession) return;
    if (mySession.status === 'Revoked') {
      showToast('Your session was terminated by an administrator. Please sign in again.', 'warning');
      setCurrentSessionId(null);
      sessionInitializedForUidRef.current = null;
      signOutUser();
    } else if (mySession.expiresAt && Date.now() > new Date(mySession.expiresAt).getTime()) {
      showToast('Your maximum session lifetime has expired. Please sign in again.', 'warning');
      performSecureLogout('Session maximum lifetime expired');
    }
  }, [activeSessions, currentSessionId, user, showToast, performSecureLogout]);

  // --- Session Heartbeat & Configurable Inactivity Timeout ---
  const extendActiveSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setInactivityWarningSeconds(null);
    if (currentSessionId && user) {
      updateDoc(doc(db, 'activeSessions', currentSessionId), {
        lastActivityAt: new Date().toISOString(),
        status: 'Active',
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
  }, [currentSessionId, user]);

  useEffect(() => {
    if (!user || !currentSessionId) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
      setInactivityWarningSeconds((curr) => (curr !== null ? null : curr));
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, markActivity, { passive: true }));

    const heartbeatInterval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const timeoutMinutes = settings?.inactivityTimeoutMinutes || 30;
      const timeoutMs = timeoutMinutes * 60_000;
      const status = idleMs > 5 * 60_000 ? 'Idle' : 'Active';

      updateDoc(doc(db, 'activeSessions', currentSessionId), {
        lastActivityAt: new Date(lastActivityRef.current).toISOString(),
        status,
        updatedAt: serverTimestamp(),
      }).catch(() => {});

      if (idleMs >= timeoutMs) {
        showToast('Signed out automatically due to session inactivity timeout.', 'warning');
        performSecureLogout(`Inactivity timeout (${timeoutMinutes} min) exceeded`);
      }
    }, 60_000);

    const idleCheckInterval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const timeoutMinutes = settings?.inactivityTimeoutMinutes || 30;
      const timeoutMs = timeoutMinutes * 60_000;
      const remainingMs = timeoutMs - idleMs;

      if (remainingMs <= 0) {
        showToast('Signed out automatically due to session inactivity timeout.', 'warning');
        performSecureLogout(`Inactivity timeout (${timeoutMinutes} min) exceeded`);
      } else if (remainingMs <= 120_000) {
        setInactivityWarningSeconds(Math.ceil(remainingMs / 1000));
      } else {
        setInactivityWarningSeconds((curr) => (curr !== null ? null : curr));
      }
    }, 5_000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActivity));
      window.clearInterval(heartbeatInterval);
      window.clearInterval(idleCheckInterval);
    };
  }, [user, currentSessionId, settings?.inactivityTimeoutMinutes, performSecureLogout, showToast]);

  const assertSuperAdminWriteAccess = useCallback(
    async (actionLabel: string, colName: string, auditModule?: string, entityRef?: string) => {
      if (isSuperAdmin) return;
      const targetModule = auditModule || colName;
      void logActivityEvent({
        eventType: 'Unauthorized Attempt',
        module: targetModule,
        entityRef: entityRef || colName,
        summary: `Blocked non-Super-Admin ${actionLabel} on ${colName} (Role: ${effectiveRole}).`,
        result: 'Denied',
      });
      void logSecurityAlert({
        category: 'Policy Violation',
        severity: 'Medium',
        title: `Write Blocked: ${actionLabel} on ${targetModule}`,
        description: `Standard User (${effectiveRole}) attempted ${actionLabel} in ${colName}. Write access is restricted exclusively to Super Admin.`,
        module: targetModule,
      });
      showToast(
        'Restricted: Only Super Admin can add, edit, remove, or configure records. Your account is in User (View-Only) mode.',
        'error'
      );
      throw new Error('SUPER_ADMIN_ONLY_WRITE');
    },
    [isSuperAdmin, effectiveRole, logActivityEvent, logSecurityAlert, showToast]
  );

  const terminateSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      await assertSuperAdminWriteAccess('Session Termination', 'activeSessions', 'Activity Intelligence', sessionId);
      try {
        await updateDoc(doc(db, 'activeSessions', sessionId), {
          status: 'Revoked',
          revokedBy: (userProfile?.displayName || user.email || 'Admin').slice(0, 150),
          updatedAt: serverTimestamp(),
        });
        await logActivityEvent({
          eventType: 'Settings Configured',
          module: 'Activity Intelligence',
          recordId: sessionId,
          summary: `Administrator terminated active session ${sessionId}.`,
          result: 'Success',
        });
        showToast('Session revoked immediately.', 'warning');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `activeSessions/${sessionId}`);
      }
    },
    [user, assertSuperAdminWriteAccess, userProfile?.displayName, logActivityEvent, showToast]
  );

  const resolveSecurityAlert = useCallback(
    async (alertId: string, status: 'Investigating' | 'Resolved' | 'Dismissed', resolutionNotes: string) => {
      if (!user) return;
      await assertSuperAdminWriteAccess('Security Alert Update', 'securityAlerts', 'Security Alert Centre', alertId);
      try {
        await updateDoc(doc(db, 'securityAlerts', alertId), {
          status,
          resolvedBy: (userProfile?.displayName || user.email || 'Admin').slice(0, 150),
          resolutionNotes: redactSensitiveText(resolutionNotes).slice(0, 800),
          updatedAt: serverTimestamp(),
        });
        await logActivityEvent({
          eventType: 'Record Updated',
          module: 'Security Alert Centre',
          recordId: alertId,
          summary: `Security alert marked as ${status}.`,
          newValue: `${status}: ${resolutionNotes}`,
          result: 'Success',
        });
        showToast(`Security alert updated to ${status}.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `securityAlerts/${alertId}`);
      }
    },
    [user, assertSuperAdminWriteAccess, userProfile?.displayName, logActivityEvent, showToast]
  );

  const logRestrictionAttempt = useCallback(
    async (serviceId: string, serviceName: string, actionAttempted: string, reason: string) => {
      if (!user) return;
      const id = generateSafeId('rlog');
      try {
        await setDoc(doc(db, 'restrictionLogs', id), {
          orgId,
          ownerId: user.uid,
          serviceId: serviceId.slice(0, 128),
          serviceName: serviceName.slice(0, 200),
          actionAttempted: actionAttempted.slice(0, 120),
          reason: reason.slice(0, 600),
          actorName: (userProfile?.displayName || user.email || 'User').slice(0, 140),
          createdAt: serverTimestamp(),
        });
        await logSecurityAlert({
          category: 'Policy Violation',
          severity: 'Medium',
          title: `Restricted Service Blocked: ${serviceName}`,
          description: `${actionAttempted} was blocked by Legal Authorization Control. Reason: ${reason}`,
          module: 'Authorization Control',
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `restrictionLogs/${id}`);
      }
    },
    [user, orgId, userProfile?.displayName, logSecurityAlert]
  );

  const createRecord = useCallback(
    async <T extends Record<string, unknown>>(
      colName: string,
      idPrefix: string,
      payload: T,
      auditModule?: string,
      auditAction?: string,
      entityRef?: string
    ): Promise<string> => {
      if (!user) throw new Error('Authentication required');
      await assertSuperAdminWriteAccess(auditAction || 'Create Record', colName, auditModule, entityRef);
      const id = generateSafeId(idPrefix);
      const hasUpdatedAt = colName !== 'notifications' && colName !== 'restrictionLogs' && colName !== 'auditLogs';
      const docPayload = {
        ...payload,
        orgId,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        ...(hasUpdatedAt ? { updatedAt: serverTimestamp() } : {}),
      };
      try {
        await setDoc(doc(db, colName, id), docPayload);
        if (auditModule && auditAction) {
          const newVal = JSON.stringify(payload).slice(0, 500);
          await logAuditTrail(auditModule, auditAction, entityRef || id, `Created record in ${colName}`, {
            eventType: 'Record Created',
            recordId: id,
            newValue: newVal,
            result: 'Success',
          });
          await logActivityEvent({
            eventType: 'Record Created',
            module: auditModule,
            recordId: id,
            entityRef: entityRef || id,
            summary: `${auditAction} (${entityRef || id})`,
            newValue: newVal,
            result: 'Success',
          });
        }
        return id;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `${colName}/${id}`);
      }
    },
    [user, orgId, assertSuperAdminWriteAccess, logAuditTrail, logActivityEvent]
  );

  const updateRecord = useCallback(
    async (
      colName: string,
      id: string,
      patch: Record<string, unknown>,
      auditModule?: string,
      auditAction?: string,
      entityRef?: string,
      previousSummary?: string
    ) => {
      if (!user) throw new Error('Authentication required');
      const isNotificationReadOnly =
        colName === 'notifications' && Object.keys(patch).length === 1 && 'read' in patch;
      if (!isNotificationReadOnly) {
        await assertSuperAdminWriteAccess(auditAction || 'Update Record', colName, auditModule, entityRef || id);
      }
      const hasUpdatedAt = colName !== 'notifications';
      try {
        await updateDoc(doc(db, colName, id), {
          ...patch,
          ...(hasUpdatedAt ? { updatedAt: serverTimestamp() } : {}),
        });
        if (auditModule && auditAction) {
          const lowerAction = auditAction.toLowerCase();
          const eventType: ActivityEventType = lowerAction.includes('approv')
            ? 'Record Approved'
            : lowerAction.includes('reject')
            ? 'Record Rejected'
            : lowerAction.includes('submit')
            ? 'Approval Submitted'
            : lowerAction.includes('role')
            ? 'Role Updated'
            : 'Record Updated';
          const newVal = JSON.stringify(patch).slice(0, 600);
          await logAuditTrail(auditModule, auditAction, entityRef || id, `Updated record in ${colName}`, {
            eventType,
            recordId: id,
            previousValue: previousSummary,
            newValue: newVal,
            result: 'Success',
          });
          await logActivityEvent({
            eventType,
            module: auditModule,
            recordId: id,
            entityRef: entityRef || id,
            summary: `${auditAction} (${entityRef || id})`,
            previousValue: previousSummary,
            newValue: newVal,
            result: 'Success',
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${colName}/${id}`);
      }
    },
    [user, assertSuperAdminWriteAccess, logAuditTrail, logActivityEvent]
  );

  const deleteRecord = useCallback(
    async (
      colName: string,
      id: string,
      auditModule?: string,
      auditAction?: string,
      entityRef?: string
    ) => {
      if (!user) throw new Error('Authentication required');
      await assertSuperAdminWriteAccess(auditAction || 'Delete Record', colName, auditModule, entityRef || id);
      try {
        await deleteDoc(doc(db, colName, id));
        if (auditModule && auditAction) {
          await logAuditTrail(auditModule, auditAction, entityRef || id, `Deleted record in ${colName}`, {
            eventType: 'Record Deleted',
            recordId: id,
            result: 'Success',
          });
          await logActivityEvent({
            eventType: 'Record Deleted',
            module: auditModule,
            recordId: id,
            entityRef: entityRef || id,
            summary: `${auditAction} (${entityRef || id})`,
            result: 'Success',
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${colName}/${id}`);
      }
    },
    [user, assertSuperAdminWriteAccess, logAuditTrail, logActivityEvent]
  );

  const saveSettings = useCallback(
    async (patch: Partial<PlatformSettingsRecord>) => {
      if (!user) return;
      const settingId = settings?.id || orgId;
      await assertSuperAdminWriteAccess('Update Platform Settings', 'settings', 'Settings', settingId);
      try {
        if (settings?.id) {
          await updateDoc(doc(db, 'settings', settingId), {
            ...patch,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, 'settings', settingId), {
            orgId,
            ownerId: user.uid,
            companyName: patch.companyName || 'ARSHIEL ASSURANCE',
            tagline: patch.tagline || 'Assessing Risks. Strengthening Compliance. Improving Performance.',
            docNumberPrefix: patch.docNumberPrefix || 'AA',
            dateFormat: patch.dateFormat || 'YYYY-MM-DD',
            currency: patch.currency || 'INR (₹)',
            timezone: patch.timezone || 'Asia/Kolkata (IST)',
            retentionYears: patch.retentionYears || 7,
            emailAlertsEnabled: patch.emailAlertsEnabled ?? true,
            aiHumanReviewMandatory: patch.aiHumanReviewMandatory ?? true,
            superAdminOnlyWrite: patch.superAdminOnlyWrite ?? SUPER_ADMIN_ONLY_WRITE_DEFAULT,
            inactivityTimeoutMinutes: patch.inactivityTimeoutMinutes || 30,
            sessionMaxHours: patch.sessionMaxHours || 8,
            mfaEnforced: patch.mfaEnforced ?? false,
            activityRetentionDays: patch.activityRetentionDays || 365,
            maxFailedLoginAttempts: patch.maxFailedLoginAttempts || 5,
            updatedAt: serverTimestamp(),
          });
        }
        await logAuditTrail('Settings', 'Updated Platform Settings', settingId, 'Modified governance & security parameters', {
          eventType: 'Settings Configured',
          recordId: settingId,
          newValue: JSON.stringify(patch).slice(0, 600),
        });
        await logActivityEvent({
          eventType: 'Settings Configured',
          module: 'Settings',
          recordId: settingId,
          summary: 'Updated platform governance and session security configuration.',
          newValue: JSON.stringify(patch).slice(0, 600),
          result: 'Success',
        });
        showToast('Platform & security settings saved to database.');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `settings/${settingId}`);
      }
    },
    [user, settings?.id, orgId, assertSuperAdminWriteAccess, logAuditTrail, logActivityEvent, showToast]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  }, []);

  const value = useMemo<AssuranceContextValue>(
    () => ({
      user,
      authReady,
      loadingData,
      userProfile,
      effectiveRole,
      isSuperAdmin,
      isAdmin,
      superAdminOnlyWriteMode,
      canEditRecords,
      orgId,
      currentSessionId,
      clientMeta,
      inactivityWarningSeconds,
      accountBlockedReason,
      extendActiveSession,
      can,
      visibleModules,
      fetchWithAuth,
      organizations,
      activeOrgId,
      setActiveOrgId,
      isoAssessments: scopedIsoAssessments,
      legalRequirements,
      audits: scopedAudits,
      documents: scopedDocuments,
      serviceAuthorizations,
      restrictionLogs,
      capas: scopedCapas,
      masterData,
      auditLogs,
      notifications,
      allUsers: isBootstrappedAdmin ? allUsers : userProfile ? [userProfile] : [],
      settings,
      activeSessions,
      loginHistory,
      activityEvents,
      documentAccessLogs,
      securityAlerts,
      customRoles,
      trainingRecords,
      certificationApplications,
      risks: scopedRisks,
      suppliers: scopedSuppliers,
      managementReviews: scopedManagementReviews,
      esgMetrics: scopedEsgMetrics,
      evidenceRecords: scopedEvidenceRecords,
      auditorProfiles: scopedAuditorProfiles,
      toastMessage,
      showToast,
      createRecord,
      updateRecord,
      deleteRecord,
      logAuditTrail,
      logActivityEvent,
      logLoginEvent,
      logDocumentAccess,
      logSecurityAlert,
      logRestrictionAttempt,
      terminateSession,
      resolveSecurityAlert,
      saveSettings,
      markNotificationRead,
      performSecureLogout,
    }),
    [
      user,
      authReady,
      loadingData,
      userProfile,
      effectiveRole,
      isSuperAdmin,
      isAdmin,
      superAdminOnlyWriteMode,
      canEditRecords,
      orgId,
      currentSessionId,
      clientMeta,
      inactivityWarningSeconds,
      accountBlockedReason,
      extendActiveSession,
      can,
      visibleModules,
      fetchWithAuth,
      organizations,
      activeOrgId,
      scopedIsoAssessments,
      legalRequirements,
      scopedAudits,
      scopedDocuments,
      serviceAuthorizations,
      restrictionLogs,
      scopedCapas,
      masterData,
      auditLogs,
      notifications,
      allUsers,
      isBootstrappedAdmin,
      settings,
      activeSessions,
      loginHistory,
      activityEvents,
      documentAccessLogs,
      securityAlerts,
      customRoles,
      trainingRecords,
      certificationApplications,
      scopedRisks,
      scopedSuppliers,
      scopedManagementReviews,
      scopedEsgMetrics,
      scopedEvidenceRecords,
      scopedAuditorProfiles,
      toastMessage,
      showToast,
      createRecord,
      updateRecord,
      deleteRecord,
      logAuditTrail,
      logActivityEvent,
      logLoginEvent,
      logDocumentAccess,
      logSecurityAlert,
      logRestrictionAttempt,
      terminateSession,
      resolveSecurityAlert,
      saveSettings,
      markNotificationRead,
      performSecureLogout,
    ]
  );

  return <AssuranceContext.Provider value={value}>{children}</AssuranceContext.Provider>;
}

export function useAssurance() {
  const ctx = useContext(AssuranceContext);
  if (!ctx) throw new Error('useAssurance must be used inside AssuranceProvider');
  return ctx;
}
