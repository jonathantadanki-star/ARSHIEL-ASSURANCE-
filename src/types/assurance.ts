export type UserRole =
  | 'Super Admin'
  | 'Platform Administrator'
  | 'Organization Admin'
  | 'Corporate Admin'
  | 'Site Admin'
  | 'Department Head'
  | 'Assurance Manager'
  | 'Compliance Manager'
  | 'EHS Manager'
  | 'Quality Manager'
  | 'Lead Auditor'
  | 'Internal Auditor'
  | 'Auditor'
  | 'External Auditor'
  | 'ISO Consultant'
  | 'Consultant'
  | 'Client Admin'
  | 'Client Representative / Auditee'
  | 'Client User'
  | 'Supplier'
  | 'Certification Coordinator'
  | 'Trainer'
  | 'Trainee'
  | 'Employee'
  | 'Management Viewer'
  | 'Read-Only Viewer'
  | 'Viewer';

export const ALL_USER_ROLES: UserRole[] = [
  'Super Admin',
  'Platform Administrator',
  'Organization Admin',
  'Corporate Admin',
  'Site Admin',
  'Department Head',
  'Assurance Manager',
  'Compliance Manager',
  'EHS Manager',
  'Quality Manager',
  'Lead Auditor',
  'Internal Auditor',
  'Auditor',
  'External Auditor',
  'ISO Consultant',
  'Consultant',
  'Client Admin',
  'Client Representative / Auditee',
  'Client User',
  'Supplier',
  'Certification Coordinator',
  'Trainer',
  'Trainee',
  'Employee',
  'Management Viewer',
  'Read-Only Viewer',
  'Viewer',
];

export type PermissionAction =
  | 'create'
  | 'view'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'download'
  | 'export'
  | 'submit'
  | 'close'
  | 'configure';

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'create',
  'view',
  'edit',
  'delete',
  'approve',
  'reject',
  'assign',
  'download',
  'export',
  'submit',
  'close',
  'configure',
];

export type ModuleId =
  | 'dashboard'
  | 'ai-intelligence-hub'
  | 'iso-gap'
  | 'legal-compliance'
  | 'esg-sustainability'
  | 'audit-planning'
  | 'ehs-audit'
  | 'doc-generator'
  | 'authorization-control'
  | 'food-safety'
  | 'fire-safety'
  | 'environmental'
  | 'contractor-vendor'
  | 'industry-master'
  | 'audit-reports'
  | 'capa'
  | 'risk-intelligence'
  | 'client-portal'
  | 'supplier-portal'
  | 'master-data'
  | 'training-management'
  | 'certification-coord'
  | 'activity-intelligence'
  | 'users-roles'
  | 'settings';

export type ActivitySubmenuId =
  | 'live-users'
  | 'login-history'
  | 'activity-timeline'
  | 'document-access'
  | 'data-modification'
  | 'approval-history'
  | 'security-alerts'
  | 'activity-reports';

export interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  orgId: string;
  orgName?: string;
  department?: string;
  siteAccess?: string;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
  status: 'Active' | 'Suspended' | 'Invited' | 'Locked';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomRoleRecord {
  id: string;
  orgId: string;
  ownerId: string;
  name: string;
  baseRole: UserRole;
  description?: string;
  permissions: Partial<Record<ModuleId, PermissionAction[]>>;
  active: boolean;
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrganizationRecord {
  id: string;
  ownerId: string;
  name: string;
  industry: string;
  state?: string;
  sites?: string;
  subscriptionTier?: 'Enterprise' | 'Professional' | 'Starter';
  status: 'Active' | 'Inactive';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ClauseComplianceStatus =
  | 'Compliant'
  | 'Partially Compliant'
  | 'Non-Compliant'
  | 'Not Applicable'
  | 'Not Verified'
  | 'Pending Evidence';

export interface IsoClauseItem {
  id: string;
  clauseNumber: string;
  clauseTitle: string;
  requirementDescription: string;
  applicability: 'Applicable' | 'Not Applicable';
  assessmentQuestion: string;
  expectedEvidence: string;
  evidenceNote: string;
  evidenceFileName?: string;
  implementationStatus: 'Implemented' | 'In Progress' | 'Not Started' | 'N/A';
  complianceStatus: ClauseComplianceStatus;
  gapDescription: string;
  riskClassification: 'Critical' | 'High' | 'Medium' | 'Low';
  auditorComments: string;
  recommendedAction: string;
  responsiblePerson: string;
  targetDate: string;
  closureStatus: 'Open' | 'In Progress' | 'Closed';
  aiAssistedNote?: string;
}

export interface IsoAssessmentRecord {
  id: string;
  orgId: string;
  ownerId: string;
  referenceNo: string;
  standardCode: string;
  standardName: string;
  edition?: string;
  industry?: string;
  organizationName?: string;
  siteLocation?: string;
  assessmentType?: string;
  auditDate?: string;
  scope?: string;
  status: 'Planned' | 'In Progress' | 'Under Review' | 'Completed';
  complianceScore: number;
  clauses: IsoClauseItem[];
  executiveSummary?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type LegalVerificationStatus =
  | 'Verified Against Official Source'
  | 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED'
  | 'Amendment Review Pending';

export type LegalComplianceStatus =
  | 'Compliant'
  | 'Partially Compliant'
  | 'Non-Compliant'
  | 'Under Review'
  | 'Not Applicable';

export interface LegalRequirementRecord {
  id: string;
  orgId: string;
  ownerId: string;
  actName: string;
  ruleName?: string;
  sectionRef?: string;
  jurisdiction: string;
  classification: 'Central' | 'State';
  authority?: string;
  category?: string;
  industryApplicability?: string;
  establishmentApplicability?: string;
  requirement?: string;
  frequency?: string;
  responsibleDept?: string;
  responsiblePerson?: string;
  requiredDocs?: string;
  evidenceNotes?: string;
  dueDate?: string;
  lastVerifiedDate?: string;
  effectiveDate?: string;
  amendmentDate?: string;
  legalStatus?: string;
  officialSource?: string;
  sourceUrl?: string;
  verificationStatus: LegalVerificationStatus;
  complianceStatus: LegalComplianceStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type AuditEngineType =
  | 'EHS'
  | 'Food Safety'
  | 'Fire & Life Safety'
  | 'Environmental'
  | 'Contractor & Vendor';

export type FindingSeverity =
  | 'Critical'
  | 'Major'
  | 'Minor'
  | 'Observation'
  | 'Opportunity for Improvement'
  | 'Good Practice';

export interface AuditChecklistItem {
  id: string;
  category: string;
  question: string;
  criteria: string;
  expectedEvidence: string;
  response: 'Compliant' | 'Partial' | 'Non-Compliant' | 'N/A' | 'Pending';
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  auditorComments: string;
  evidenceRef?: string;
  evidenceFileName?: string;
}

export interface AuditFindingItem {
  id: string;
  findingId: string;
  requirementRef: string;
  classification: FindingSeverity;
  actualCondition: string;
  objectiveEvidence: string;
  potentialConsequence: string;
  riskRating: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  responsiblePerson: string;
  targetDate: string;
  verificationStatus: 'Open' | 'Pending Verification' | 'Verified & Closed';
}

export interface AuditRecord {
  id: string;
  orgId: string;
  ownerId: string;
  auditRef: string;
  engineType: AuditEngineType;
  title: string;
  clientName?: string;
  industry?: string;
  siteLocation?: string;
  scope?: string;
  leadAuditor?: string;
  assignedAuditorIds?: string[];
  assignedAuditorEmails?: string[];
  auditDate?: string;
  gpsLocation?: string;
  status: 'Planned' | 'In Progress' | 'Pending Approval' | 'Completed';
  score: number;
  checklistItems: AuditChecklistItem[];
  findings: AuditFindingItem[];
  executiveSummary?: string;
  auditorVerified?: boolean;
  approvedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type DocumentCategory = 'Risk Management' | 'Safety' | 'Audit' | 'Food Safety';

export type DocumentWorkflowStatus =
  | 'DRAFT – REVIEW REQUIRED'
  | 'Technical Verification'
  | 'Approved'
  | 'Superseded';

export interface ControlledDocumentRecord {
  id: string;
  orgId: string;
  ownerId: string;
  docNumber: string;
  revisionNumber?: string;
  issueDate?: string;
  docCategory: DocumentCategory;
  docType: string;
  title: string;
  industry?: string;
  activity?: string;
  department?: string;
  equipment?: string;
  standardRef?: string;
  siteConditions?: string;
  hazards?: string;
  content?: string;
  status: DocumentWorkflowStatus;
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  aiGenerated?: boolean;
  revisionNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type ServiceCategoryType =
  | 'CATEGORY 1 – GENERAL CONSULTANCY'
  | 'CATEGORY 2 – INDEPENDENT ASSESSMENT'
  | 'CATEGORY 3 – AUTHORIZATION / ACCREDITATION / STATUTORY REQUIREMENT';

export type AuthorizationStatusType =
  | 'Not Required for This Defined Consultancy Scope'
  | 'Requirement Verification Pending'
  | 'Authorization Required'
  | 'Authorization Not Available'
  | 'Authorization Verified'
  | 'Authorization Expired'
  | 'Restricted Service';

export interface ServiceAuthorizationRecord {
  id: string;
  orgId: string;
  ownerId: string;
  serviceName: string;
  category: ServiceCategoryType;
  applicableLaw?: string;
  requiredQualification?: string;
  requiredAuthorization?: string;
  requiredAccreditation?: string;
  requiredAppointment?: string;
  competenceRequirements?: string;
  authorizationValidity?: string;
  verificationStatus?: string;
  approvalStatus: 'Approved for Delivery' | 'Blocked / Restricted' | 'Pending Review';
  authStatus: AuthorizationStatusType;
  evidenceDocs?: string;
  externalReferralGuidance?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RestrictionLogRecord {
  id: string;
  orgId: string;
  ownerId: string;
  serviceId?: string;
  serviceName: string;
  actionAttempted: string;
  reason: string;
  actorName?: string;
  createdAt?: unknown;
}

export type CapaStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Pending Verification'
  | 'Closed'
  | 'Rejected'
  | 'Overdue';

export interface CapaRecord {
  id: string;
  orgId: string;
  ownerId: string;
  capaRef: string;
  findingRef?: string;
  auditRef?: string;
  findingDescription: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Observation';
  rootCause?: string;
  fiveWhys?: string;
  fishbone?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  responsiblePerson?: string;
  department?: string;
  targetDate?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: CapaStatus;
  closureEvidence?: string;
  verificationNotes?: string;
  effectivenessReview?: string;
  escalated?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type MasterDataType =
  | 'Industry'
  | 'Standard'
  | 'AuditCategory'
  | 'ParentModule'
  | 'ChildModule'
  | 'SubChildModule'
  | 'ChecklistQuestion'
  | 'DocumentTemplate'
  | 'RiskCategory'
  | 'ComplianceParameter';

export interface MasterDataRecord {
  id: string;
  orgId: string;
  ownerId: string;
  dataType: MasterDataType;
  code: string;
  name: string;
  parentId?: string;
  description?: string;
  criteria?: string;
  evidenceRequired?: string;
  riskLevel?: string;
  active: boolean;
  version: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditTrailRecord {
  id: string;
  orgId: string;
  ownerId: string;
  userId?: string;
  actorName?: string;
  actorRole?: string;
  eventType?: string;
  module: string;
  action: string;
  recordId?: string;
  entityRef?: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  result?: 'Success' | 'Denied' | 'Failed';
  ipAddress?: string;
  createdAt?: unknown;
}

export interface ActiveSessionRecord {
  id: string;
  orgId: string;
  ownerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  orgName?: string;
  department?: string;
  deviceInfo: string;
  browserInfo: string;
  ipAddress: string;
  loginTime: string;
  lastActivityAt: string;
  expiresAt: string;
  status: 'Active' | 'Idle' | 'Revoked' | 'Expired';
  revokedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type LoginEventType =
  | 'Login Success'
  | 'Login Failed'
  | 'Logout'
  | 'Password Reset Requested'
  | 'Email Verification Sent'
  | 'MFA Verified'
  | 'MFA Failed'
  | 'Session Expired'
  | 'Session Revoked'
  | 'Account Locked';

export interface LoginHistoryRecord {
  id: string;
  orgId: string;
  ownerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  orgName?: string;
  eventType: LoginEventType;
  authMethod: 'Email/Password' | 'Google OAuth' | 'MFA Code' | 'Session System';
  deviceInfo: string;
  browserInfo: string;
  ipAddress: string;
  result: 'Success' | 'Failed' | 'Blocked';
  reason?: string;
  timestampIso: string;
  createdAt?: unknown;
}

export type ActivityEventType =
  | 'App Opened'
  | 'Module Opened'
  | 'Page Viewed'
  | 'Document Viewed'
  | 'Document Downloaded'
  | 'Report Downloaded'
  | 'Record Created'
  | 'Record Updated'
  | 'Record Deleted'
  | 'Approval Submitted'
  | 'Record Approved'
  | 'Record Rejected'
  | 'Data Exported'
  | 'Role Updated'
  | 'Settings Configured'
  | 'Unauthorized Attempt';

export interface ActivityEventRecord {
  id: string;
  orgId: string;
  ownerId: string;
  userId: string;
  userName: string;
  userRole: string;
  orgName?: string;
  department?: string;
  eventType: ActivityEventType;
  module: string;
  recordId?: string;
  entityRef?: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
  remarks?: string;
  result: 'Success' | 'Denied' | 'Failed';
  ipAddress?: string;
  timestampIso: string;
  createdAt?: unknown;
}

export interface DocumentAccessLogRecord {
  id: string;
  orgId: string;
  ownerId: string;
  documentId: string;
  documentName: string;
  docNumber?: string;
  userId: string;
  userName: string;
  userRole: string;
  orgName?: string;
  accessType: 'View' | 'Download' | 'Export' | 'Approve' | 'Reject';
  exportFormat?: string;
  authorized: boolean;
  ipAddress?: string;
  timestampIso: string;
  createdAt?: unknown;
}

export type SecurityAlertCategory =
  | 'Multiple Failed Logins'
  | 'Suspicious Login Activity'
  | 'Unauthorized Access Attempt'
  | 'Expired Session Access'
  | 'Unusual Export Activity'
  | 'Account Lockout'
  | 'Policy Violation'
  | 'Role Escalation Attempt';

export interface SecurityAlertRecord {
  id: string;
  orgId: string;
  ownerId: string;
  category: SecurityAlertCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  actorUserId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  module?: string;
  ipAddress?: string;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
  resolvedBy?: string;
  resolutionNotes?: string;
  timestampIso: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TrainingRecord {
  id: string;
  orgId: string;
  ownerId: string;
  courseCode: string;
  courseTitle: string;
  standardRef: string;
  trainerName: string;
  scheduledDate: string;
  mode: 'Live Online' | 'On-Site Workshop' | 'Self-Paced Module';
  department?: string;
  attendeesCount: number;
  completionRate: number;
  assessmentPassScore: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  certificateRef?: string;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CertificationApplicationRecord {
  id: string;
  orgId: string;
  ownerId: string;
  applicationRef: string;
  clientName: string;
  standardCode: string;
  accreditedBodyName: string;
  stage: 'Readiness Assessment' | 'Application Submitted' | 'Stage 1 Audit Scheduled' | 'Stage 2 Audit Scheduled' | 'Surveillance Due' | 'Renewal Alert' | 'Completed';
  coordinatorName: string;
  targetAssessmentDate: string;
  renewalDueDate?: string;
  documentsReady: boolean;
  authorizationVerified: boolean;
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationRecord {
  id: string;
  orgId: string;
  ownerId: string;
  title: string;
  message?: string;
  category?: string;
  severity: 'Info' | 'Warning' | 'Critical';
  dueDate?: string;
  read: boolean;
  createdAt?: unknown;
}

export interface PlatformSettingsRecord {
  id: string;
  orgId: string;
  ownerId: string;
  companyName: string;
  tagline?: string;
  docNumberPrefix?: string;
  dateFormat?: string;
  currency?: string;
  timezone?: string;
  retentionYears?: number;
  emailAlertsEnabled?: boolean;
  aiHumanReviewMandatory?: boolean;
  inactivityTimeoutMinutes?: number;
  sessionMaxHours?: number;
  mfaEnforced?: boolean;
  activityRetentionDays?: number;
  maxFailedLoginAttempts?: number;
  superAdminOnlyWrite?: boolean;
  updatedAt?: unknown;
}

// =========================================================================
// 8-DIVISION ENTERPRISE EXTENSIONS (RISKS, SUPPLIERS, MANAGEMENT REVIEWS, ESG, EVIDENCE, AUDITORS)
// =========================================================================

export type RiskCategoryType =
  | 'Operational'
  | 'EHS & Safety'
  | 'Legal & Regulatory'
  | 'Environmental & ESG'
  | 'Information Security'
  | 'Supply Chain'
  | 'Quality & Product'
  | 'Business Continuity';

export interface RiskRecord {
  id: string;
  orgId: string;
  ownerId: string;
  riskRef: string;
  title: string;
  category: RiskCategoryType;
  industry?: string;
  siteLocation?: string;
  department?: string;
  standardRef?: string;
  hazardOrThreat: string;
  existingControls?: string;
  likelihood: number; // 1-5
  consequence: number; // 1-5
  inherentScore: number; // 1-25
  controlEffectiveness: 'Strong' | 'Adequate' | 'Partial' | 'Weak';
  residualLikelihood: number; // 1-5
  residualConsequence: number; // 1-5
  residualScore: number; // 1-25
  mitigationPlan?: string;
  riskOwner?: string;
  reviewDate?: string;
  status: 'Open' | 'Mitigating' | 'Controlled' | 'Accepted' | 'Closed';
  aiRecommended?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SupplierRecord {
  id: string;
  orgId: string;
  ownerId: string;
  supplierCode: string;
  companyName: string;
  category: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  isoCertifications?: string;
  evaluationScore: number; // 0-100
  esgScore?: number; // 0-100
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceDocsStatus: 'Verified' | 'Pending Review' | 'Incomplete' | 'Expired';
  lastAuditDate?: string;
  nextAuditDate?: string;
  openCapaCount: number;
  status: 'Approved' | 'Conditional' | 'Under Evaluation' | 'Suspended';
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ManagementReviewRecord {
  id: string;
  orgId: string;
  ownerId: string;
  reviewRef: string;
  title: string;
  standardScope: string;
  meetingDate: string;
  chairperson: string;
  attendees?: string;
  agendaItems?: string;
  auditPerformanceSummary?: string;
  customerFeedbackSummary?: string;
  riskOpportunitySummary?: string;
  capaStatusSummary?: string;
  decisionsAndActions?: string;
  minutesSummary?: string;
  nextReviewDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Approved';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EsgMetricRecord {
  id: string;
  orgId: string;
  ownerId: string;
  metricRef: string;
  pillar: 'Environmental' | 'Social' | 'Governance';
  category: 'GHG Scope 1' | 'GHG Scope 2' | 'GHG Scope 3' | 'Energy' | 'Water' | 'Waste' | 'Social Responsibility' | 'Governance';
  reportingPeriod: string;
  siteLocation?: string;
  metricName: string;
  value: number;
  unit: string;
  targetValue?: number;
  frameworkRef?: string;
  verificationStatus: 'Verified' | 'Draft' | 'Pending Review';
  notes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EvidenceRecord {
  id: string;
  orgId: string;
  ownerId: string;
  evidenceRef: string;
  auditRef?: string;
  standardRef?: string;
  title: string;
  evidenceType: 'Photo' | 'PDF Document' | 'Spreadsheet' | 'Video Reference' | 'Certificate / Record' | 'Interview Note';
  fileName?: string;
  tags?: string;
  uploadedBy?: string;
  siteLocation?: string;
  approvalStatus: 'Pending Review' | 'Approved' | 'Rejected';
  reviewerNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditorProfileRecord {
  id: string;
  orgId: string;
  ownerId: string;
  auditorCode: string;
  fullName: string;
  email: string;
  auditorType: 'Lead Auditor' | 'Internal Auditor' | 'External Auditor' | 'Technical Specialist';
  qualifications: string;
  certifiedStandards: string;
  availability: 'Available' | 'Assigned' | 'On Leave' | 'Unavailable';
  activeAssignments: number;
  maxWorkload: number;
  conflictOfInterestDeclared: boolean;
  coiNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

