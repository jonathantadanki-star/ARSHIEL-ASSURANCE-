import type { ModuleId } from '../types/assurance';
import { SECTOR_IMAGES } from './industriesCatalog';

/* ============================================================================
   SECTION 7: 22 PROFESSIONAL SERVICE CATEGORIES
   ============================================================================ */
export type ServiceDomainGroup =
  | 'Auditing & Assessment'
  | 'ISO & Management Systems'
  | 'EHS, Fire & Risk'
  | 'Legal, ESG & Governance'
  | 'Documentation, CAPA & Training';

export interface ProfessionalServiceSpec {
  id: string;
  number: string;
  title: string;
  domain: ServiceDomainGroup;
  image: string;
  shortDescription: string;
  authorizationNotice: string;
  scopeOverview: string;
  deliverables: string[];
  methodology: string[];
  applicableIndustries: string[];
  targetModuleId: ModuleId;
  targetModuleLabel: string;
}

const RAW_SERVICES: Array<{
  id: string;
  title: string;
  domain: ServiceDomainGroup;
  image: string;
  shortDescription: string;
  targetModuleId: ModuleId;
  targetModuleLabel: string;
  deliverables: string[];
  applicableIndustries: string[];
}> = [
  {
    id: 'third-party-auditing',
    title: 'Third-Party Auditing',
    domain: 'Auditing & Assessment',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Independent, impartial third-party facility, management system, and EHS audits conducted under client governance mandates.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['Independent Third-Party Audit Report (PDF/DOCX/XLSX)', 'Severity-graded findings register', 'CAPA handoff & verification tracker'],
    applicableIndustries: ['Semiconductor Industry', 'Data Centers', 'Pharmaceutical Industry', 'Manufacturing Industry'],
  },
  {
    id: 'iso-certification-support',
    title: 'ISO Certification Support',
    domain: 'ISO & Management Systems',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription: 'End-to-end readiness preparation, pre-assessment audits, and nonconformity closure mentoring prior to independent accredited certification.',
    targetModuleId: 'iso-gap',
    targetModuleLabel: 'AI ISO Gap Analysis Engine',
    deliverables: ['Stage 1 & Stage 2 readiness roadmap', 'Clause-by-clause evidence verification matrix', 'Mock audit & finding closure guidance'],
    applicableIndustries: ['Manufacturing Industry', 'IT & Corporate', 'Healthcare & Hospitals', 'Pharmaceutical Industry'],
  },
  {
    id: 'iso-ms-implementation',
    title: 'ISO Management System Implementation',
    domain: 'ISO & Management Systems',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription: 'Structured design and rollout of single or Integrated Management Systems (ISO 9001, 14001, 45001, 27001, 50001, 22301).',
    targetModuleId: 'iso-gap',
    targetModuleLabel: 'AI ISO Gap Analysis Engine',
    deliverables: ['IMS policy, objectives & process map', 'Controlled SOPs, registers & operational forms', 'Management Review & internal audit readiness'],
    applicableIndustries: ['Semiconductor Industry', 'Automotive Industry', 'Data Centers', 'Chemical & Petrochemical Industry'],
  },
  {
    id: 'iso-gap-analysis',
    title: 'ISO Gap Analysis',
    domain: 'ISO & Management Systems',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription: 'AI-accelerated clause-wise benchmarking across 17 global ISO standards with quantified readiness scoring and remediation plans.',
    targetModuleId: 'iso-gap',
    targetModuleLabel: 'AI ISO Gap Analysis Engine',
    deliverables: ['Automated clause readiness score matrix', 'Missing documented information tracker', '30/60/90-day priority closure roadmap'],
    applicableIndustries: ['All Global Industries'],
  },
  {
    id: 'internal-auditing',
    title: 'Internal Auditing',
    domain: 'Auditing & Assessment',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Co-sourced and outsourced risk-based internal audits verifying operational conformance ahead of management reviews and external assessments.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['Annual risk-based internal audit schedule', 'Objective evidence audit checklists', 'Internal nonconformity & CAPA tracking log'],
    applicableIndustries: ['Manufacturing Industry', 'Pharmaceutical Industry', 'FMCG Industry', 'IT & Corporate'],
  },
  {
    id: 'supplier-auditing',
    title: 'Supplier Auditing',
    domain: 'Auditing & Assessment',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'Independent quality, EHS, food hygiene, and statutory compliance evaluations of Tier-1, Tier-2, and critical contract vendors.',
    targetModuleId: 'contractor-vendor',
    targetModuleLabel: 'Contractor & Vendor Audit Engine',
    deliverables: ['Vendor pre-qualification & field scorecard', 'High-risk gap escalation register', 'Supplier corrective action verification'],
    applicableIndustries: ['Automotive Industry', 'FMCG Industry', 'Construction & Infrastructure', 'Logistics & Warehousing'],
  },
  {
    id: 'social-compliance-auditing',
    title: 'Social Compliance Auditing',
    domain: 'Auditing & Assessment',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Independent workplace welfare, working hours, fair labour documentation, POSH governance, and safe working conditions assessments.',
    targetModuleId: 'contractor-vendor',
    targetModuleLabel: 'Contractor & Vendor Audit Engine',
    deliverables: ['Workplace welfare & ethical labour assessment report', 'Statutory register gap checklist', 'Remediation plan & follow-up verification'],
    applicableIndustries: ['Textile & Garments', 'FMCG Industry', 'Manufacturing Industry', 'Logistics & Warehousing'],
  },
  {
    id: 'ehs-hse-she-auditing',
    title: 'EHS / HSE / SHE Auditing',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Multi-domain workplace safety auditing across 25 technical categories including LOTO, Work at Height, Electrical, Chemical, and PTW.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['25-domain digital EHS inspection pack', 'Photographic evidence finding register', 'Executive EHS performance report'],
    applicableIndustries: ['Semiconductor Industry', 'Chemical & Petrochemical Industry', 'Oil & Gas Industry', 'Construction & Infrastructure'],
  },
  {
    id: 'fire-life-safety-auditing',
    title: 'Fire & Life Safety Auditing',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'Independent NFPA- and NBC-aligned fire risk assessments covering fire pumps, detection, suppression, egress exits, and hot work controls.',
    targetModuleId: 'fire-safety',
    targetModuleLabel: 'Fire & Life Safety Engine',
    deliverables: ['Fire pump, hydrant, alarm & egress audit report', 'Critical life-safety remediation register', 'Evacuation drill evaluation pack'],
    applicableIndustries: ['Data Centers', 'Healthcare & Hospitals', 'Hospitality & Hotels', 'Textile & Garments'],
  },
  {
    id: 'industrial-safety-assessment',
    title: 'Industrial Safety Assessment',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Shopfloor machine guarding, overhead lifting, material handling, ergonomic, and electrical hazard evaluations for heavy industrial plants.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['Machine guarding & electrical safety scorecard', 'Hazard prioritization matrix', 'Practical engineering control recommendations'],
    applicableIndustries: ['Manufacturing Industry', 'Steel Industry', 'Cement Industry', 'Automotive Industry'],
  },
  {
    id: 'legal-compliance-auditing',
    title: 'Legal Compliance Auditing',
    domain: 'Legal, ESG & Governance',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription: 'Structured statutory applicability mapping and compliance gap assessments across Indian Central, AP, Telangana, and global reference frameworks.',
    targetModuleId: 'legal-compliance',
    targetModuleLabel: 'AI Legal Compliance Engine',
    deliverables: ['Site-specific statutory compliance register', 'Official source citations & unverified-rule alerts', 'Due-date calendar & non-compliance action plan'],
    applicableIndustries: ['All Regulated Establishments'],
  },
  {
    id: 'environmental-auditing',
    title: 'Environmental Auditing',
    domain: 'Legal, ESG & Governance',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'Independent reviews of air emissions, ETP/STP/ZLD effluent controls, hazardous waste, e-waste, and consent condition adherence.',
    targetModuleId: 'environmental',
    targetModuleLabel: 'Environmental Compliance Engine',
    deliverables: ['Environmental Aspect-Impact & consent review', 'Waste manifesting & storage gap report', 'Environmental CAPA closure plan'],
    applicableIndustries: ['Pharmaceutical Industry', 'Chemical & Petrochemical Industry', 'Water & Wastewater Treatment', 'Cement Industry'],
  },
  {
    id: 'esg-sustainability-consulting',
    title: 'ESG & Sustainability Consulting',
    domain: 'Legal, ESG & Governance',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'ESG materiality assessments, governance diagnostics, environmental & social KPI structuring, and sustainability disclosure readiness.',
    targetModuleId: 'environmental',
    targetModuleLabel: 'Environmental Compliance Engine',
    deliverables: ['ESG gap & materiality readiness matrix', 'Environmental & social KPI tracking framework', 'Board-ready sustainability summary draft'],
    applicableIndustries: ['Renewable Energy', 'Data Centers', 'Manufacturing Industry', 'IT & Corporate'],
  },
  {
    id: 'ghg-carbon-management',
    title: 'GHG Accounting & Carbon Management',
    domain: 'Legal, ESG & Governance',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'ISO 14064-aligned Scope 1, Scope 2, and Scope 3 emissions inventory structuring, data readiness audits, and decarbonization tracking.',
    targetModuleId: 'environmental',
    targetModuleLabel: 'Environmental Compliance Engine',
    deliverables: ['Scope 1/2/3 boundary & activity-data register', 'ISO 14064 readiness gap checklist', 'Energy & carbon reduction action tracker'],
    applicableIndustries: ['Steel Industry', 'Cement Industry', 'Data Centers', 'Power & Energy'],
  },
  {
    id: 'risk-assessment-management',
    title: 'Risk Assessment & Management',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription: 'Structured HIRA, JSA, JHA, COSHH, ergonomic, and ISO 31000 enterprise risk assessments incorporating Hierarchy of Controls.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
    deliverables: ['5x5 HIRA & residual risk workbooks', 'Task-specific JSA/JHA & SWMS drafts', 'ISO 31000 enterprise risk register'],
    applicableIndustries: ['Semiconductor Industry', 'Construction & Infrastructure', 'Oil & Gas Industry', 'Mining & Metals'],
  },
  {
    id: 'process-safety-auditing',
    title: 'Process Safety Auditing',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.energy,
    shortDescription: 'HAZID readiness, management of change (MOC), mechanical integrity, chemical compatibility, and emergency relief system reviews.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['PSM element gap assessment report', 'HAZID & chemical compatibility review draft', 'Critical safety barrier action plan'],
    applicableIndustries: ['Chemical & Petrochemical Industry', 'Pharmaceutical Industry', 'Oil & Gas Industry', 'Semiconductor Industry'],
  },
  {
    id: 'occupational-health-safety',
    title: 'Occupational Health & Safety',
    domain: 'EHS, Fire & Risk',
    image: SECTOR_IMAGES.pharma,
    shortDescription: 'Workplace industrial hygiene reviews, PPE matrix engineering, ergonomic risk assessments, and occupational health surveillance readiness.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['OH&S hazard & exposure assessment review', 'Role-based PPE & medical surveillance matrix', 'ISO 45001 worker participation toolkit'],
    applicableIndustries: ['Manufacturing Industry', 'Healthcare & Hospitals', 'Biotechnology & Research Laboratories', 'Mining & Metals'],
  },
  {
    id: 'quality-management-consulting',
    title: 'Quality Management Consulting',
    domain: 'ISO & Management Systems',
    image: SECTOR_IMAGES.pharma,
    shortDescription: 'Process approach mapping, ISO 9001 / 13485 / 17025 readiness consulting, root-cause quality improvement, and customer focus metrics.',
    targetModuleId: 'iso-gap',
    targetModuleLabel: 'AI ISO Gap Analysis Engine',
    deliverables: ['Process interaction & KPI scorecard', 'Quality management gap & remediation plan', 'Documented SOP & CAPA control system'],
    applicableIndustries: ['Manufacturing Industry', 'Automotive Industry', 'Pharmaceutical Industry', 'Electronics & Electrical'],
  },
  {
    id: 'training-competency-development',
    title: 'Training & Competency Development',
    domain: 'Documentation, CAPA & Training',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription: 'Independent industry-tailored workshops on ISO internal auditing, HIRA, LOTO, PTW, fire safety, food hygiene, and statutory awareness.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
    deliverables: ['Role-based competency & skill matrix', 'Custom safety & ISO training module packs', 'Post-training effectiveness assessment templates'],
    applicableIndustries: ['All Global Industries'],
  },
  {
    id: 'inspection-assessment-services',
    title: 'Inspection & Assessment Services',
    domain: 'Auditing & Assessment',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription: 'Structured independent workplace, warehouse, kitchen, fire-system, and contractor field inspections using digital checklists and evidence logs.',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
    deliverables: ['Digital field inspection checklists', 'Timestamped observation & photo log', 'Immediate risk-mitigation summary'],
    applicableIndustries: ['Logistics & Warehousing', 'Food Processing Industry', 'Hospitality & Hotels', 'Education & Institutions'],
  },
  {
    id: 'capa-management-service',
    title: 'Corrective & Preventive Action Management',
    domain: 'Documentation, CAPA & Training',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription: 'Closed-loop CAPA lifecycle governance featuring 5-Why & Ishikawa Fishbone root-cause analysis, owner accountability, and effectiveness checks.',
    targetModuleId: 'capa',
    targetModuleLabel: 'CAPA Management Engine',
    deliverables: ['Centralized CAPA & RCA tracking workspace', 'Automated overdue escalation alerts', 'Verified closure & effectiveness audit trail'],
    applicableIndustries: ['All Global Industries'],
  },
  {
    id: 'documentation-ms-development',
    title: 'Documentation & Management System Development',
    domain: 'Documentation, CAPA & Training',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription: 'AI-assisted drafting and version control for 52+ controlled EHS, ISO, Risk, Audit, and Food Safety procedures under human approval gates.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
    deliverables: ['Controlled SOP, SWMS, HIRA, JSA, LOTO & ERP drafts', 'Document revision & approval register', 'Editable DOCX & controlled PDF outputs'],
    applicableIndustries: ['All Global Industries'],
  },
];

export const PROFESSIONAL_SERVICES: ProfessionalServiceSpec[] = RAW_SERVICES.map((s, i) => ({
  ...s,
  number: String(i + 1).padStart(2, '0'),
  authorizationNotice:
    'Provided strictly as independent consultancy, readiness assessment, or certification-support services. Accredited ISO certification, statutory government inspections, and official regulatory licences remain exclusively under appropriately accredited or statutory authorities.',
  scopeOverview: `${s.shortDescription} Every engagement follows ARSHIEL ASSURANCE's structured evidence-based methodology with transparent Legal Authorization Control and competent human verification.`,
  methodology: [
    'Scope & boundary definition calibrated to facility operations and applicable standards',
    'AI-assisted checklist generation & pre-audit documentation review',
    'Structured verification, objective evidence capture & risk classification',
    'Human-verified reporting, CAPA escalation & closure effectiveness sign-off',
  ],
}));

/* ============================================================================
   SECTION 8: 17 GLOBAL ISO STANDARDS & MANAGEMENT SYSTEMS
   ============================================================================ */
export interface IsoStandardDetailSpec {
  id: string;
  code: string;
  title: string;
  edition: string;
  verificationNote: string;
  category: string;
  summary: string;
  industryRelevance: string[];
  auditingServices: string[];
  keyClausesOverview: Array<{ clause: string; focus: string }>;
}

export const GLOBAL_ISO_STANDARDS: IsoStandardDetailSpec[] = [
  {
    id: 'iso-9001',
    code: 'ISO 9001',
    title: 'Quality Management Systems',
    edition: 'ISO 9001:2015 (Monitor ISO/TC 176 revision status)',
    verificationNote: 'Verify latest published edition & applicable amendments on iso.org before formal certification scheduling.',
    category: 'Quality & Operations',
    summary: 'Global benchmark for consistent product/service quality, process-based risk thinking, customer satisfaction, and continual improvement.',
    industryRelevance: ['Manufacturing', 'Semiconductor', 'Pharmaceuticals', 'Automotive', 'IT & Corporate', 'Healthcare'],
    auditingServices: ['Clause-wise ISO 9001 Gap Analysis', 'Internal QMS Auditing', 'Supplier Quality Auditing', 'Pre-Certification Readiness Support'],
    keyClausesOverview: [
      { clause: 'Clause 4', focus: 'Organizational context, interested parties & QMS scope' },
      { clause: 'Clause 5 & 6', focus: 'Leadership commitment, quality policy, risks & quality objectives' },
      { clause: 'Clause 7 & 8', focus: 'Resources, competence, documented information & operational control' },
      { clause: 'Clause 9 & 10', focus: 'Monitoring, internal audit, management review & nonconformity CAPA' },
    ],
  },
  {
    id: 'iso-14001',
    code: 'ISO 14001',
    title: 'Environmental Management Systems',
    edition: 'ISO 14001:2015 + Amd 1:2024 (Climate Action)',
    verificationNote: 'Includes 2024 climate-change context amendment; confirm current revision status on iso.org.',
    category: 'Environment & ESG',
    summary: 'Systematic management of environmental aspects, compliance obligations, pollution prevention, and life-cycle sustainability performance.',
    industryRelevance: ['Chemical & Petrochemical', 'Pharmaceuticals', 'Semiconductor', 'Power & Energy', 'Manufacturing', 'Water & Wastewater'],
    auditingServices: ['ISO 14001 Gap & Aspect-Impact Review', 'Environmental Compliance Auditing', 'Climate Amendment Readiness', 'Internal EMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'Environmental context (including climate change) & policy leadership' },
      { clause: 'Clause 6', focus: 'Environmental aspects, compliance obligations & environmental objectives' },
      { clause: 'Clause 7 & 8', focus: 'Awareness, operational pollution controls & emergency response' },
      { clause: 'Clause 9 & 10', focus: 'Compliance evaluation, internal audit & continual improvement' },
    ],
  },
  {
    id: 'iso-45001',
    code: 'ISO 45001',
    title: 'Occupational Health & Safety Management',
    edition: 'ISO 45001:2018 + Amd 1:2024 (Climate Action)',
    verificationNote: 'Verify latest published edition and national adoptions via ISO/BIS official portals.',
    category: 'Occupational Health & Safety',
    summary: 'Framework for eliminating workplace hazards, reducing OH&S risks, ensuring active worker participation, and preventing work-related injury.',
    industryRelevance: ['Construction & Infrastructure', 'Manufacturing', 'Oil & Gas', 'Semiconductor', 'Data Centers', 'Mining & Metals'],
    auditingServices: ['ISO 45001 Gap Analysis', 'HIRA & Hierarchy of Controls Review', 'Contractor OH&S Auditing', 'Internal Safety System Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'Worker consultation, participation & visible safety leadership' },
      { clause: 'Clause 6', focus: 'Hazard identification (HIRA), legal requirements & OH&S objectives' },
      { clause: 'Clause 7 & 8', focus: 'Operational controls, MOC, procurement, contractors & emergency readiness' },
      { clause: 'Clause 9 & 10', focus: 'Incident investigation, internal OH&S audit & corrective action' },
    ],
  },
  {
    id: 'iso-27001',
    code: 'ISO 27001',
    title: 'Information Security Management',
    edition: 'ISO/IEC 27001:2022 + Amd 1:2024',
    verificationNote: 'Reflects ISO/IEC 27001:2022 Annex A 93-control structure; verify current transition dates via official bodies.',
    category: 'Information Security & IT',
    summary: 'Risk-based governance protecting confidentiality, integrity, and availability of enterprise, cloud, and data center information assets.',
    industryRelevance: ['Data Centers', 'IT & Corporate', 'Telecom & Infrastructure', 'Semiconductor', 'Biotechnology & Research'],
    auditingServices: ['ISO 27001 Clause & Annex A Gap Analysis', 'Statement of Applicability (SoA) Review', 'Internal ISMS Auditing', 'Risk Treatment Plan Support'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'ISMS scope, security governance & leadership roles' },
      { clause: 'Clause 6', focus: 'Information security risk assessment, treatment & SoA' },
      { clause: 'Annex A', focus: 'Organizational, People, Physical & Technological security controls' },
      { clause: 'Clause 9 & 10', focus: 'Security monitoring, internal ISMS audit & continual improvement' },
    ],
  },
  {
    id: 'iso-22301',
    code: 'ISO 22301',
    title: 'Business Continuity Management',
    edition: 'ISO 22301:2019 + Amd 1:2024',
    verificationNote: 'Confirm current edition applicability via iso.org prior to formal BCMS scoping.',
    category: 'Resilience & Continuity',
    summary: 'Prepares organizations to protect against, reduce the likelihood of, respond to, and recover swiftly from disruptive operational incidents.',
    industryRelevance: ['Data Centers', 'IT & Corporate', 'Healthcare & Hospitals', 'Oil & Gas', 'Ports & Marine', 'Logistics'],
    auditingServices: ['BCMS Gap Analysis', 'BIA & Recovery Strategy Reviews', 'Crisis Exercise & Drill Evaluations', 'Internal BCMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4–6', focus: 'Continuity context, leadership & disruption risk planning' },
      { clause: 'Clause 8.2', focus: 'Business Impact Analysis (BIA) & RTO/RPO definition' },
      { clause: 'Clause 8.4–8.5', focus: 'Business continuity plans, incident response & exercise programs' },
      { clause: 'Clause 9 & 10', focus: 'BCMS performance evaluation, audit & post-incident improvement' },
    ],
  },
  {
    id: 'iso-50001',
    code: 'ISO 50001',
    title: 'Energy Management Systems',
    edition: 'ISO 50001:2018 + Amd 1:2024',
    verificationNote: 'Verify current edition and regional energy-audit statutory intersections.',
    category: 'Energy & Decarbonization',
    summary: 'Data-driven framework for identifying Significant Energy Uses (SEUs), setting EnPIs, and systematically improving energy performance.',
    industryRelevance: ['Data Centers', 'Semiconductor', 'Power & Energy', 'Cement', 'Steel', 'Manufacturing'],
    auditingServices: ['ISO 50001 Gap Assessment', 'Energy Review & EnPI Structuring', 'Internal EnMS Auditing', 'Decarbonization Readiness Support'],
    keyClausesOverview: [
      { clause: 'Clause 6.3', focus: 'Energy review, Significant Energy Uses (SEUs) & baselines' },
      { clause: 'Clause 6.4–6.5', focus: 'Energy Performance Indicators (EnPIs) & measurement planning' },
      { clause: 'Clause 8', focus: 'Energy-efficient design, procurement & operational control' },
      { clause: 'Clause 9 & 10', focus: 'Energy performance verification & continual improvement' },
    ],
  },
  {
    id: 'iso-22000',
    code: 'ISO 22000',
    title: 'Food Safety Management Systems',
    edition: 'ISO 22000:2018 + Amd 1:2024',
    verificationNote: 'Verify edition & sector PRPs (ISO/TS 22002 series) before certification scoping.',
    category: 'Food Safety & Hygiene',
    summary: 'Integrates Prerequisite Programs (PRPs), HACCP hazard control, interactive supply chain communication, and system management across the food chain.',
    industryRelevance: ['Food Processing', 'FMCG', 'Hospitality & Hotels', 'Agriculture & Agro', 'Cold Storage Logistics'],
    auditingServices: ['ISO 22000 & HACCP Gap Analysis', 'PRP & Hygiene Audits', 'Traceability & Mock Recall Reviews', 'Internal FSMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4–6', focus: 'Food chain context, food safety policy & risk planning' },
      { clause: 'Clause 8.2', focus: 'Prerequisite Programs (PRPs) & sanitation/allergen controls' },
      { clause: 'Clause 8.5', focus: 'Hazard analysis, CCP/OPRP determination & monitoring' },
      { clause: 'Clause 8.8–10', focus: 'Verification, traceability, withdrawal readiness & CAPA' },
    ],
  },
  {
    id: 'iso-13485',
    code: 'ISO 13485',
    title: 'Medical Devices Quality Management',
    edition: 'ISO 13485:2016 (Reconfirmed — verify latest status)',
    verificationNote: 'Verify country-specific medical device regulatory rules alongside ISO 13485:2016.',
    category: 'Life Sciences & Healthcare',
    summary: 'Specialized QMS requirements for organizations involved in design, production, installation, or servicing of medical devices.',
    industryRelevance: ['Pharmaceutical Industry', 'Healthcare & Hospitals', 'Biotechnology & Research'],
    auditingServices: ['ISO 13485 Readiness Gap Analysis', 'Medical Device File & Risk Review Support', 'Internal QMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4', focus: 'QMS documentation, Medical Device File & software validation' },
      { clause: 'Clause 6 & 7', focus: 'Cleanroom work environment, risk management & design controls' },
      { clause: 'Clause 7.5', focus: 'Production traceability, sterilization & contamination control' },
      { clause: 'Clause 8', focus: 'Post-market feedback, advisory notices & CAPA rigor' },
    ],
  },
  {
    id: 'iso-37001',
    code: 'ISO 37001',
    title: 'Anti-Bribery Management Systems',
    edition: 'ISO 37001:2025 (Updated edition — verify transition)',
    verificationNote: 'ISO 37001:2025 supersedes 2016 edition; confirm transition schedule via iso.org.',
    category: 'Governance & Ethics',
    summary: 'Establishes reasonable and proportionate controls to prevent, detect, and respond to bribery risks across operations and business associates.',
    industryRelevance: ['Construction & Infrastructure', 'Oil & Gas', 'Pharmaceuticals', 'IT & Corporate', 'Manufacturing'],
    auditingServices: ['Anti-Bribery Gap Assessment', 'Bribery Risk & Due Diligence Review', 'Internal ABMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4.5', focus: 'Bribery risk assessment across geographies & third parties' },
      { clause: 'Clause 5 & 7', focus: 'Governing body oversight, compliance function & anti-bribery training' },
      { clause: 'Clause 8', focus: 'Due diligence, financial/non-financial controls & gifts governance' },
      { clause: 'Clause 8.9–10', focus: 'Whistleblowing channels, investigation & system improvement' },
    ],
  },
  {
    id: 'iso-37301',
    code: 'ISO 37301',
    title: 'Compliance Management Systems',
    edition: 'ISO 37301:2021 + Amd 1:2024',
    verificationNote: 'Certifiable Type A standard; verify applicable legal obligations per jurisdiction.',
    category: 'Governance & Legal',
    summary: 'Requirements and guidance for establishing, implementing, evaluating, and maintaining an effective organization-wide compliance culture.',
    industryRelevance: ['All Regulated Industries', 'IT & Corporate', 'Pharmaceuticals', 'Power & Energy', 'Chemical'],
    auditingServices: ['CMS Readiness Gap Analysis', 'Compliance Obligation Mapping', 'Internal CMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4.5–4.6', focus: 'Compliance obligations identification & compliance risk assessment' },
      { clause: 'Clause 5', focus: 'Compliance culture, governance independence & leadership' },
      { clause: 'Clause 8', focus: 'Operational controls, raising concerns & investigation processes' },
      { clause: 'Clause 9 & 10', focus: 'Compliance reporting, KPIs, internal audit & remediation' },
    ],
  },
  {
    id: 'iso-14064',
    code: 'ISO 14064',
    title: 'Greenhouse Gas Accounting & Verification',
    edition: 'ISO 14064-1:2018 / -2:2019 / -3:2019',
    verificationNote: 'Independent GHG verification statements require accredited VVBs; ARSHIEL provides readiness & inventory consulting.',
    category: 'Climate & Carbon',
    summary: 'International standard for quantifying, monitoring, and reporting organization-level Scope 1, 2, and 3 GHG emissions and removals.',
    industryRelevance: ['Steel', 'Cement', 'Data Centers', 'Renewable Energy', 'Power & Energy', 'Logistics', 'Manufacturing'],
    auditingServices: ['ISO 14064-1 Inventory Readiness Review', 'Emission Factor & Data Quality Audit', 'Pre-Verification Gap Assessment'],
    keyClausesOverview: [
      { clause: 'Part 1 — Boundaries', focus: 'Organizational & reporting boundaries across Categories 1–6' },
      { clause: 'Part 1 — Quantification', focus: 'Activity data, verified emission factors & uncertainty assessment' },
      { clause: 'Part 1 — Reporting', focus: 'Transparent GHG report structure & base-year recalculation rules' },
      { clause: 'Part 3 — Readiness', focus: 'Audit trail preparation for independent accredited verification' },
    ],
  },
  {
    id: 'iso-20121',
    code: 'ISO 20121',
    title: 'Event Sustainability Management',
    edition: 'ISO 20121:2024',
    verificationNote: 'Updated 2024 edition; verify transition requirements on iso.org.',
    category: 'Sustainability & Events',
    summary: 'Framework for minimizing environmental impact and enhancing social and economic legacy across conferences, venues, and hospitality events.',
    industryRelevance: ['Hospitality & Hotels', 'IT & Corporate', 'Education & Institutions'],
    auditingServices: ['Event Sustainability Gap Analysis', 'Venue Waste & Energy Audits', 'Pre-Event Readiness Reviews'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'Sustainable development principles & stakeholder engagement' },
      { clause: 'Clause 6', focus: 'Event sustainability issue identification & measurable targets' },
      { clause: 'Clause 8', focus: 'Sustainable supply chain, waste, mobility & accessibility controls' },
      { clause: 'Clause 9 & 10', focus: 'Post-event impact review, audit & legacy improvement' },
    ],
  },
  {
    id: 'iso-55001',
    code: 'ISO 55001',
    title: 'Asset Management Systems',
    edition: 'ISO 55001:2024',
    verificationNote: 'Updated 2024 edition; confirm applicable alignment for critical infrastructure.',
    category: 'Infrastructure & Reliability',
    summary: 'Balances lifecycle cost, operational risk, and reliability performance across physical industrial and infrastructure assets.',
    industryRelevance: ['Power & Energy', 'Renewable Energy', 'Oil & Gas', 'Ports & Marine', 'Mining & Metals', 'Manufacturing'],
    auditingServices: ['Asset Management Maturity Gap Analysis', 'Lifecycle Risk & Maintenance Review', 'Internal AMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 6', focus: 'Strategic Asset Management Plan (SAMP) & lifecycle objectives' },
      { clause: 'Clause 7', focus: 'Asset information quality, competence & lifecycle data governance' },
      { clause: 'Clause 8', focus: 'Operational maintenance, change management & outsourced asset work' },
      { clause: 'Clause 9 & 10', focus: 'Asset reliability KPIs, predictive review & corrective action' },
    ],
  },
  {
    id: 'iso-41001',
    code: 'ISO 41001',
    title: 'Facility Management Systems',
    edition: 'ISO 41001:2018 + Amd 1:2024',
    verificationNote: 'Verify current edition status via iso.org.',
    category: 'Facilities & Workplace',
    summary: 'Standardizes workplace safety, service quality, energy efficiency, and vendor governance for corporate campuses and commercial real estate.',
    industryRelevance: ['IT & Corporate', 'Data Centers', 'Healthcare & Hospitals', 'Hospitality & Hotels', 'Education'],
    auditingServices: ['Facility Management Gap Analysis', 'IFM Vendor & SLA Compliance Audits', 'Workplace Safety & Readiness Reviews'],
    keyClausesOverview: [
      { clause: 'Clause 4–6', focus: 'Demand-organization alignment, FM policy & service risk planning' },
      { clause: 'Clause 7', focus: 'FM staff competence, CAFM records & stakeholder communication' },
      { clause: 'Clause 8', focus: 'Service delivery, hard/soft FM vendor control & emergency readiness' },
      { clause: 'Clause 9 & 10', focus: 'Occupant satisfaction, SLA audits & continual improvement' },
    ],
  },
  {
    id: 'iso-20000-1',
    code: 'ISO 20000-1',
    title: 'IT Service Management Systems',
    edition: 'ISO/IEC 20000-1:2018 + Amd 1:2024',
    verificationNote: 'Verify current ISO/IEC edition before formal ITSM scoping.',
    category: 'Information Security & IT',
    summary: 'Requirements for planning, establishing, implementing, and continually improving reliable IT service delivery and incident management.',
    industryRelevance: ['IT & Corporate', 'Data Centers', 'Telecom & Infrastructure'],
    auditingServices: ['ITSM Gap Analysis', 'Incident, Problem & Change Management Audits', 'Internal SMS Auditing'],
    keyClausesOverview: [
      { clause: 'Clause 4–6', focus: 'Service portfolio context, leadership & service risk planning' },
      { clause: 'Clause 8.2–8.5', focus: 'Service catalog, SLA management, change & release control' },
      { clause: 'Clause 8.6', focus: 'Incident resolution, problem management & service continuity' },
      { clause: 'Clause 9 & 10', focus: 'Service reporting, internal ITSM audit & service improvement' },
    ],
  },
  {
    id: 'iso-17025',
    code: 'ISO 17025',
    title: 'Testing & Calibration Laboratories',
    edition: 'ISO/IEC 17025:2017 (Reconfirmed)',
    verificationNote: 'Laboratory accreditation is granted strictly by NABL/ILAC signatories; ARSHIEL provides readiness consulting & internal audit support.',
    category: 'Laboratory Competence',
    summary: 'General requirements for impartiality, technical competence, measurement traceability, and valid results in testing and calibration labs.',
    industryRelevance: ['Biotechnology & Research', 'Pharmaceuticals', 'Aviation & Aerospace', 'Water & Wastewater', 'Manufacturing'],
    auditingServices: ['ISO 17025 Readiness Gap Analysis', 'Impartiality & Documentation Review', 'Internal Lab Audit Support'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'Impartiality, confidentiality & laboratory legal/structural clarity' },
      { clause: 'Clause 6', focus: 'Personnel competence, equipment calibration & metrological traceability' },
      { clause: 'Clause 7', focus: 'Method validation, sampling, uncertainty & reporting of results' },
      { clause: 'Clause 8', focus: 'Management system options, internal lab audit & corrective actions' },
    ],
  },
  {
    id: 'iso-15189',
    code: 'ISO 15189',
    title: 'Medical Laboratories Quality & Competence',
    edition: 'ISO 15189:2022',
    verificationNote: 'Medical lab accreditation is granted by NABL/accredited bodies; ARSHIEL provides readiness gap analysis & internal audit support.',
    category: 'Clinical & Laboratory',
    summary: 'Requirements for quality, patient safety, risk management, and technical competence in clinical and diagnostic medical laboratories.',
    industryRelevance: ['Healthcare & Hospitals', 'Biotechnology & Research', 'Pharmaceuticals'],
    auditingServices: ['ISO 15189:2022 Gap Analysis', 'Pre/Post-Examination Process Review', 'Internal Medical Lab Audit Support'],
    keyClausesOverview: [
      { clause: 'Clause 4 & 5', focus: 'Patient welfare, impartiality, ethics & laboratory director governance' },
      { clause: 'Clause 6', focus: 'Clinical staff competence, reagents, POCT & equipment verification' },
      { clause: 'Clause 7', focus: 'Pre-examination, analytical validity, critical results & post-examination' },
      { clause: 'Clause 8', focus: 'Risk management, nonconforming work control & continual improvement' },
    ],
  },
];

export function createDynamicIsoStandard(input: {
  id: string;
  code: string;
  name: string;
  description?: string;
}): IsoStandardDetailSpec {
  return {
    id: input.id,
    code: input.code || input.name,
    title: input.name,
    edition: 'Custom Configured Standard (Verify Official Edition)',
    verificationNote: 'Dynamically added by workspace administrator. Verify current published edition via official standards portal.',
    category: 'Custom Management Standard',
    summary: input.description || `Custom management system standard configured for independent gap analysis and internal auditing in ARSHIEL ASSURANCE.`,
    industryRelevance: ['Configured Target Industries'],
    auditingServices: ['Clause-wise Gap Analysis', 'Internal Audit Support', 'Documentation Readiness Review'],
    keyClausesOverview: [
      { clause: 'Clauses 4–6', focus: 'Context, leadership, risk planning & objectives' },
      { clause: 'Clauses 7–8', focus: 'Support, competence & operational execution controls' },
      { clause: 'Clauses 9–10', focus: 'Performance evaluation, internal audit & CAPA' },
    ],
  };
}

/* ============================================================================
   SECTION 9: 15 INTERACTIVE AI-POWERED SOLUTIONS
   ============================================================================ */
export interface AiToolSpec {
  id: string;
  number: string;
  title: string;
  category: 'Auditing' | 'Compliance & ESG' | 'Risk & Safety' | 'Documentation & CAPA';
  shortDescription: string;
  placeholderContext: string;
  defaultTopic: string;
  promptInstruction: string;
  targetModuleId: ModuleId;
  targetModuleLabel: string;
}

export const AI_SOLUTIONS_CATALOG: AiToolSpec[] = [
  {
    id: 'ai-iso-gap',
    number: '01',
    title: 'AI ISO Gap Analysis',
    category: 'Auditing',
    shortDescription: 'Generate clause-wise readiness questions, expected evidence, gap descriptions, and 30/60/90-day remediation plans.',
    defaultTopic: 'ISO 45001:2018 Clause 6.1.2 & 8.1 Operational Controls',
    placeholderContext: 'Describe your ISO standard, facility scope, and current maturity or gaps...',
    promptInstruction: 'Draft an original, structured ISO Gap Analysis readiness matrix including clause expectations (paraphrased, never verbatim copyrighted text), targeted audit questions, expected objective evidence, likely gaps, and a prioritized remediation plan.',
    targetModuleId: 'iso-gap',
    targetModuleLabel: 'AI ISO Gap Analysis Engine',
  },
  {
    id: 'ai-audit-checklist',
    number: '02',
    title: 'AI Audit Checklist Generator',
    category: 'Auditing',
    shortDescription: 'Build domain-calibrated audit checklists with verification criteria, expected evidence, and risk ratings in seconds.',
    defaultTopic: 'Cleanroom Chemical Handling & Sub-Fab LOTO Audit',
    placeholderContext: 'Specify the audit area, equipment, process, or standard to build a checklist for...',
    promptInstruction: 'Generate a comprehensive, practical 10-point field audit checklist formatted clearly with Checkpoint Number, Audit Question, Verification Criteria, Expected Objective Evidence, and Risk Level (Critical/High/Medium/Low).',
    targetModuleId: 'ehs-audit',
    targetModuleLabel: 'AI EHS Audit Engine',
  },
  {
    id: 'ai-audit-report',
    number: '03',
    title: 'AI Audit Report Generator',
    category: 'Auditing',
    shortDescription: 'Synthesize field observations into structured executive audit report drafts with findings summaries and governance notices.',
    defaultTopic: 'Quarterly Independent Third-Party EHS & Fire Safety Audit',
    placeholderContext: 'Paste your real audit scope, key verified findings, and positive observations...',
    promptInstruction: 'Draft a structured Executive Audit Report strictly based on the user-provided findings (never invent site observations). Include Executive Overview, Strengths, Findings Summary, Priority Actions, and Mandatory Independent Review Disclaimer.',
    targetModuleId: 'audit-reports',
    targetModuleLabel: 'Audit Report Management Hub',
  },
  {
    id: 'ai-legal-assistant',
    number: '04',
    title: 'AI Legal Compliance Assistant',
    category: 'Compliance & ESG',
    shortDescription: 'Map Central, Andhra Pradesh, Telangana, and global safety frameworks with strict official-portal verification flags.',
    defaultTopic: 'Industrial Facility in Hyderabad, Telangana (250 workers, solvents & DG sets)',
    placeholderContext: 'Enter country/state jurisdiction, industry, workforce size, and regulated activities...',
    promptInstruction: 'Provide an applicability overview of key statutory frameworks for the described facility. Clearly mark any state-specific amendment or transitional rule requiring official verification as "UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED" and never fabricate statutory sections.',
    targetModuleId: 'legal-compliance',
    targetModuleLabel: 'AI Legal Compliance Engine',
  },
  {
    id: 'ai-risk-assessment',
    number: '05',
    title: 'AI Risk Assessment Generator',
    category: 'Risk & Safety',
    shortDescription: 'Structure 5x5 quantitative risk assessments aligned to ISO 31000 and Hierarchy of Controls.',
    defaultTopic: 'High-Voltage Switchgear Maintenance & Arc-Flash Risk Assessment',
    placeholderContext: 'Describe the facility process, energy sources, or operational risk scenario...',
    promptInstruction: 'Draft a structured 5x5 Risk Assessment including Activity/Scenario, Hazard/Threat, Potential Consequence, Initial Risk Rating, Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE), and Residual Risk.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
  {
    id: 'ai-hira-jsa',
    number: '06',
    title: 'AI HIRA & JSA Generator',
    category: 'Risk & Safety',
    shortDescription: 'Create activity-level Hazard Identification & Risk Assessments (HIRA) and step-by-step Job Safety Analyses (JSA).',
    defaultTopic: 'Roof HVAC Maintenance & Work-at-Height (> 1.8m)',
    placeholderContext: 'Specify the job task, tools, height/chemical conditions, and site environment...',
    promptInstruction: 'Draft a step-by-step Job Safety Analysis (JSA) and HIRA breakdown covering Task Steps, Specific Hazards, Required Permits/PPE, Engineering & Administrative Controls, and Emergency Actions. Mark clearly as DRAFT – REVIEW REQUIRED.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
  {
    id: 'ai-sop-generator',
    number: '07',
    title: 'AI SOP Generator',
    category: 'Documentation & CAPA',
    shortDescription: 'Draft controlled Standard Operating Procedures with document control metadata, safe work sequences, and sign-off blocks.',
    defaultTopic: 'Zero-Energy Lockout/Tagout (LOTO) Maintenance Procedure',
    placeholderContext: 'Describe the procedure title, department, equipment, and mandatory safety steps...',
    promptInstruction: 'Draft a controlled Standard Operating Procedure (SOP) with Document Control Header (DRAFT – REVIEW REQUIRED), Purpose, Scope, Roles & Competence, PPE Requirements, Step-by-Step Safe Execution Sequence, Abnormal/Emergency Handling, and Review Sign-off.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
  {
    id: 'ai-ehs-doc',
    number: '08',
    title: 'AI EHS Document Generator',
    category: 'Documentation & CAPA',
    shortDescription: 'Generate Emergency Response Plans, SWMS, PTW procedures, Chemical Safety plans, and Contractor Safety manuals.',
    defaultTopic: 'Site Emergency Preparedness & Evacuation Plan (ERP)',
    placeholderContext: 'Specify the EHS document type (ERP, SWMS, PTW, Chemical Plan) and site details...',
    promptInstruction: 'Draft a comprehensive EHS management document tailored to the facility details provided, with clear section headings, practical controls, roles, emergency actions, and a mandatory DRAFT – REVIEW REQUIRED governance banner.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
  {
    id: 'ai-capa-engine',
    number: '09',
    title: 'AI CAPA Recommendation Engine',
    category: 'Documentation & CAPA',
    shortDescription: 'Recommend immediate containment, systemic corrective actions, preventive controls, and verification evidence for findings.',
    defaultTopic: 'Critical Finding: Shared padlock used during utility chiller maintenance',
    placeholderContext: 'Paste an audit finding or nonconformity to generate structured CAPA recommendations...',
    promptInstruction: 'Generate a complete CAPA action plan for the provided finding: 1) Immediate Containment, 2) Corrective Action, 3) Systemic Preventive Action, 4) Suggested Owner Role & Target Timeline, and 5) Objective Verification Evidence required for closure.',
    targetModuleId: 'capa',
    targetModuleLabel: 'CAPA Management Engine',
  },
  {
    id: 'ai-root-cause',
    number: '10',
    title: 'AI Root Cause Analysis',
    category: 'Documentation & CAPA',
    shortDescription: 'Conduct structured 5-Why and Ishikawa Fishbone (6M) root-cause inquiries to prevent recurring nonconformities.',
    defaultTopic: 'Recurring fire-exit corridor obstruction in warehouse dispatch bay',
    placeholderContext: 'Describe the recurring audit finding, incident, or compliance deviation...',
    promptInstruction: 'Perform a structured Root Cause Analysis combining a 5-Why inquiry chain and Ishikawa Fishbone (Man, Machine, Method, Material, Measurement, Environment) factors, distinguishing immediate symptoms from systemic root causes.',
    targetModuleId: 'capa',
    targetModuleLabel: 'CAPA Management Engine',
  },
  {
    id: 'ai-esg-assistant',
    number: '11',
    title: 'AI ESG Reporting Assistant',
    category: 'Compliance & ESG',
    shortDescription: 'Structure ESG materiality topics, Scope 1/2/3 data inventories, and sustainability governance readiness drafts.',
    defaultTopic: 'Manufacturing Enterprise ESG & ISO 14064 Scope 1/2 Readiness Plan',
    placeholderContext: 'Describe your industry, operational footprint, and ESG/GHG reporting goals...',
    promptInstruction: 'Draft an ESG & Sustainability Readiness Framework covering Material E/S/G Topics, ISO 14064 Scope 1/2/3 Activity Data Checklist, Governance Controls, and Data Verification Readiness steps.',
    targetModuleId: 'environmental',
    targetModuleLabel: 'Environmental Compliance Engine',
  },
  {
    id: 'ai-env-assistant',
    number: '12',
    title: 'AI Environmental Compliance Assistant',
    category: 'Compliance & ESG',
    shortDescription: 'Build Environmental Aspect-Impact registers, waste segregation plans, and ETP/emission compliance readiness checklists.',
    defaultTopic: 'Pharmaceutical Plant Solvent Emissions, ETP/ZLD & Hazardous Waste Controls',
    placeholderContext: 'Describe your site processes, waste streams, water/air emissions, and jurisdiction...',
    promptInstruction: 'Create an Environmental Aspect-Impact & Compliance Readiness Checklist covering Air Emissions, Wastewater/ETP, Hazardous & E-Waste, Chemical Storage, and Monitoring Records (noting official SPCB/CPCB portal verification).',
    targetModuleId: 'environmental',
    targetModuleLabel: 'Environmental Compliance Engine',
  },
  {
    id: 'ai-training-generator',
    number: '13',
    title: 'AI Training Content Generator',
    category: 'Documentation & CAPA',
    shortDescription: 'Create toolbox talks, induction outlines, ISO awareness decks, and competency assessment quizzes for site teams.',
    defaultTopic: 'Contractor LOTO, Work-at-Height & Permit-to-Work Toolbox Talk',
    placeholderContext: 'Specify audience role, safety or ISO topic, and session duration...',
    promptInstruction: 'Generate a ready-to-deliver workplace training session outline including Learning Objectives, Key Practical Points, Real-World Do/Don’t Examples, 5 Competency Check Questions with Answer Key, and Attendance Sign-off guidance.',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
  {
    id: 'ai-inspection-generator',
    number: '14',
    title: 'AI Inspection Checklist Generator',
    category: 'Auditing',
    shortDescription: 'Generate daily, weekly, or monthly site inspection forms for fire systems, cranes, kitchens, warehouses, and electrical rooms.',
    defaultTopic: 'Monthly Fire Pump Room, Hydrant, Alarm & Emergency Exit Inspection',
    placeholderContext: 'Specify the equipment, room, or inspection frequency...',
    promptInstruction: 'Create a practical, scannable site inspection checklist organized by area with Inspection Item, Pass/Fail Acceptance Criteria, Frequency, and Corrective Action Trigger.',
    targetModuleId: 'fire-safety',
    targetModuleLabel: 'Fire & Life Safety Engine',
  },
  {
    id: 'ai-doc-review',
    number: '15',
    title: 'AI Document Review Assistant',
    category: 'Documentation & CAPA',
    shortDescription: 'Review existing SOPs, policies, and HIRAs for missing ISO clauses, unclear controls, and document-control gaps.',
    defaultTopic: 'Review existing Site EHS Policy & Contractor Safety Procedure for ISO 45001 gaps',
    placeholderContext: 'Paste a snippet or summary of an existing procedure/policy to check for completeness...',
    promptInstruction: 'Perform a structured technical document completeness review: identify strengths, missing operational/ISO controls, ambiguous responsibilities, document-control gaps, and prioritized revision suggestions (advisory review requiring competent human approval).',
    targetModuleId: 'doc-generator',
    targetModuleLabel: 'AI Document Generator',
  },
];

/* ============================================================================
   SECTION 10: GLOBAL & INDIAN LEGAL COMPLIANCE INTELLIGENCE
   ============================================================================ */
export interface LegalIntelligenceItem {
  id: string;
  title: string;
  country: 'India' | 'International Reference';
  stateScope: string;
  industries: string[];
  activityScope: string;
  effectiveDate: string;
  amendmentStatus: string;
  verificationStatus: 'Verified Reference' | 'Verify Official Portal (Transitional / State Rules)';
  sourceLabel: string;
  sourceUrl: string;
  summary: string;
}

export const LEGAL_INTELLIGENCE_CATALOG: LegalIntelligenceItem[] = [
  {
    id: 'leg-central-labour',
    title: 'Indian Central Labour Laws',
    country: 'India',
    stateScope: 'India (Central)',
    industries: ['All Industries', 'Manufacturing', 'Construction', 'IT & Corporate'],
    activityScope: 'Workforce employment, contract labour, welfare, POSH & statutory registers',
    effectiveDate: 'Multiple Central Acts (Verify Active Consolidation)',
    amendmentStatus: 'Subject to Labour Code commencement notifications',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'India Code / Ministry of Labour & Employment',
    sourceUrl: 'https://labour.gov.in/',
    summary: 'Core central employment, contract labour, equal remuneration, POSH Act (2013), and workplace welfare statutes governing establishments across India.',
  },
  {
    id: 'leg-oshwc-code',
    title: 'Applicable OSHWC Code Requirements',
    country: 'India',
    stateScope: 'India (Central & Notified State Rules)',
    industries: ['Manufacturing', 'Semiconductor', 'Construction', 'Mining', 'Logistics'],
    activityScope: 'Occupational safety, health, working conditions, factory licensing & welfare',
    effectiveDate: 'Enacted 2020 — Verify State Rule Commencement Date',
    amendmentStatus: 'Transitional — Check MoLE & State Gazette Notifications',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'India Code (OSHWC Code, 2020)',
    sourceUrl: 'https://www.indiacode.nic.in/',
    summary: 'Consolidates 13 central OSH & working-condition enactments; applicability and enforcement depend strictly on notified Central and State rules.',
  },
  {
    id: 'leg-state-factory-rules',
    title: 'Relevant State Factory Rules',
    country: 'India',
    stateScope: 'State-Specific Jurisdictions',
    industries: ['Manufacturing', 'Pharmaceuticals', 'Chemical', 'Automotive', 'Steel', 'Cement'],
    activityScope: 'Machine guarding, pressure vessels, safety officers, medical checks & accident reporting',
    effectiveDate: 'State-Specific Notified Rules',
    amendmentStatus: 'Check State Directorate of Factories Amendments',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'State Directorate of Factories / DISH Portals',
    sourceUrl: 'https://www.indiacode.nic.in/',
    summary: 'Operational safety schedules covering dangerous operations, ventilation, lifting tackles, safety committees, and statutory Form filings.',
  },
  {
    id: 'leg-ap-compliance',
    title: 'Andhra Pradesh Legal Compliance',
    country: 'India',
    stateScope: 'Andhra Pradesh',
    industries: ['Pharmaceuticals', 'Manufacturing', 'Food Processing', 'Ports & Marine', 'Renewable Energy'],
    activityScope: 'AP Factories, APPCB CFO/CTE, AP Fire Services NOC & AP Shops/Labour',
    effectiveDate: 'Active State Rules — Verify Latest AP Gazette',
    amendmentStatus: 'Monitor AP Single Desk & APPCB Circulars',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'APPCB & AP Factories Department',
    sourceUrl: 'https://pcb.ap.gov.in/',
    summary: 'State-level industrial compliance for Visakhapatnam, Vijayawada, Sri City, and Tirupati industrial corridors including APPCB consents and AP Fire NOC.',
  },
  {
    id: 'leg-ts-compliance',
    title: 'Telangana Legal Compliance',
    country: 'India',
    stateScope: 'Telangana',
    industries: ['Semiconductor', 'Data Centers', 'Pharmaceuticals', 'IT & Corporate', 'Biotechnology'],
    activityScope: 'TS Factories, TSPCB Consent, TG Fire Services NOC & TS Shops/Establishments',
    effectiveDate: 'Active State Rules — Verify Latest TS Gazette',
    amendmentStatus: 'Monitor TG-iPASS & TSPCB Notifications',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'TSPCB & Telangana State Portals',
    sourceUrl: 'https://tspcb.cgg.gov.in/',
    summary: 'Statutory compliance mapping for Hyderabad, Genome Valley, HITEC City, and Telangana industrial parks across environment, fire, and factory safety.',
  },
  {
    id: 'leg-env-legislation',
    title: 'Environmental Legislation (EPA, Air & Water Acts)',
    country: 'India',
    stateScope: 'India (Central & SPCB)',
    industries: ['Pharmaceuticals', 'Chemical', 'Power & Energy', 'Cement', 'Steel', 'Water & Wastewater'],
    activityScope: 'Air emissions, effluent discharge (ETP/ZLD), OCEMS & Environmental Statement',
    effectiveDate: 'EPA 1986 / Water Act 1974 / Air Act 1981',
    amendmentStatus: 'Amended periodically via MoEFCC Notifications',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'MoEFCC & Central Pollution Control Board (CPCB)',
    sourceUrl: 'https://cpcb.nic.in/',
    summary: 'Foundational environmental statutes requiring valid Consent to Establish/Operate, emission/effluent limits, and annual environmental compliance returns.',
  },
  {
    id: 'leg-fire-life-safety',
    title: 'Fire & Life Safety Requirements',
    country: 'India',
    stateScope: 'State Fire Services & NBC Part 4',
    industries: ['Data Centers', 'Healthcare', 'Hospitality', 'IT & Corporate', 'Textile & Garments', 'Warehousing'],
    activityScope: 'Fire NOC, detection/suppression maintenance, egress width & mock drills',
    effectiveDate: 'State Fire Services Acts & NBC 2016 Part 4',
    amendmentStatus: 'Verify State Fire Department Renewal Cycles',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'State Fire & Emergency Services / BIS NBC',
    sourceUrl: 'https://www.bis.gov.in/',
    summary: 'Mandatory building fire prevention, active fire-fighting installations, compartmentation, and periodic statutory Fire NOC renewals.',
  },
  {
    id: 'leg-electrical-safety',
    title: 'Electrical Safety Regulations',
    country: 'India',
    stateScope: 'India (Central CEA & State CEIG)',
    industries: ['Data Centers', 'Power & Energy', 'Semiconductor', 'Manufacturing', 'Renewable Energy'],
    activityScope: 'HT/LT installations, earthing, arc-flash, CEIG inspections & electrical LOTO',
    effectiveDate: 'CEA Safety Regulations, 2023 (Superseding 2010)',
    amendmentStatus: 'Verify Latest CEA Gazette Notifications',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'Central Electricity Authority (CEA)',
    sourceUrl: 'https://cea.nic.in/',
    summary: 'National technical safety regulations governing electrical supply, switchgear clearance, protective earthing, periodic testing, and designated safety officers.',
  },
  {
    id: 'leg-building-construction',
    title: 'Building & Construction Regulations (BOCW)',
    country: 'India',
    stateScope: 'India (Central & State BOCW Boards)',
    industries: ['Construction & Infrastructure', 'Renewable Energy', 'Data Centers', 'Telecom'],
    activityScope: 'Scaffolding, excavation, cranes, worker registration & cess compliance',
    effectiveDate: 'BOCW Act, 1996 & Applicable State Rules',
    amendmentStatus: 'Monitor OSHWC Transitional Integration',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'Ministry of Labour & State BOCW Portals',
    sourceUrl: 'https://www.indiacode.nic.in/',
    summary: 'Safety, health, and welfare framework for civil, industrial EPC, and infrastructure construction projects employing 10+ building workers.',
  },
  {
    id: 'leg-hazardous-chemical',
    title: 'Hazardous Chemical Regulations (MSIHC / PESO)',
    country: 'India',
    stateScope: 'India (Central & State Authorities)',
    industries: ['Chemical & Petrochemical', 'Semiconductor', 'Pharmaceuticals', 'Oil & Gas'],
    activityScope: 'Threshold chemical storage, Safety Reports, On-Site ERP & gas cylinders',
    effectiveDate: 'MSIHC Rules, 1989 / Gas Cylinders Rules, 2016',
    amendmentStatus: 'Verify PESO & MoEFCC Latest Amendments',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'PESO & MoEFCC',
    sourceUrl: 'https://peso.gov.in/',
    summary: 'Governs bulk storage of toxic, flammable, and explosive chemicals, safety audit schedules, MSDS availability, and on-site emergency preparedness.',
  },
  {
    id: 'leg-waste-management',
    title: 'Waste Management Regulations (Hazardous, E-Waste, Plastic, BMW)',
    country: 'India',
    stateScope: 'India (Central CPCB & SPCB)',
    industries: ['All Industries', 'Pharmaceuticals', 'Healthcare', 'IT & Corporate', 'FMCG', 'Electronics'],
    activityScope: 'Authorized disposal manifests, EPR registration, Form 4 & CBWTF compliance',
    effectiveDate: 'HOWM 2016 / E-Waste 2022 / Battery 2022 / BMW 2016',
    amendmentStatus: 'Active EPR Portal Amendments — Verify CPCB Portal',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'CPCB Waste & EPR Portals',
    sourceUrl: 'https://cpcb.nic.in/',
    summary: 'End-to-end segregation, storage time limits, authorized TSDF/recycler manifesting, and annual return filings across regulated waste streams.',
  },
  {
    id: 'leg-osha-ref',
    title: 'International OSHA Safety References (29 CFR 1910 / 1926)',
    country: 'International Reference',
    stateScope: 'Global Best-Practice Benchmark (US Statutory)',
    industries: ['Semiconductor', 'Data Centers', 'Manufacturing', 'Construction', 'Oil & Gas'],
    activityScope: 'LOTO (1910.147), Machine Guarding, HazCom, Confined Space & Fall Protection',
    effectiveDate: 'Current 29 CFR Standards — Verify osha.gov',
    amendmentStatus: 'Continuous Federal Updates',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'OSHA Official Standards Portal',
    sourceUrl: 'https://www.osha.gov/',
    summary: 'Widely adopted international industrial safety benchmarks used by multinational sites for LOTO, fall protection, and hazard communication audits (advisory outside US jurisdiction).',
  },
  {
    id: 'leg-nfpa-ref',
    title: 'NFPA Fire & Electrical Safety References',
    country: 'International Reference',
    stateScope: 'Global Engineering Standard Reference',
    industries: ['Data Centers', 'Oil & Gas', 'Semiconductor', 'Healthcare', 'Hospitality', 'Warehousing'],
    activityScope: 'NFPA 10/13/20/25/70E/72/101/855 Fire Protection, Arc-Flash & BESS Safety',
    effectiveDate: 'Cycle-Updated Editions (Verify Latest Year on nfpa.org)',
    amendmentStatus: '3–5 Year Standard Revision Cycles',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'NFPA Codes & Standards Catalog',
    sourceUrl: 'https://www.nfpa.org/',
    summary: 'Global consensus benchmarks for fire pump systems, sprinklers, clean-agent suppression, electrical arc-flash (NFPA 70E), life safety (NFPA 101), and BESS (NFPA 855).',
  },
  {
    id: 'leg-nbc-ref',
    title: 'National Building Code of India (NBC 2016)',
    country: 'India',
    stateScope: 'India (National Technical Code)',
    industries: ['Data Centers', 'IT & Corporate', 'Healthcare', 'Hospitality', 'Construction', 'Education'],
    activityScope: 'Part 4 Fire & Life Safety, Occupancy Classification, Egress & Building Services',
    effectiveDate: 'NBC 2016 (Monitor BIS Revision Notices)',
    amendmentStatus: 'Verify BIS Amendments & State Adoption',
    verificationStatus: 'Verified Reference',
    sourceLabel: 'Bureau of Indian Standards (BIS)',
    sourceUrl: 'https://www.bis.gov.in/',
    summary: 'Comprehensive Indian technical code for building fire protection, compartmentation, travel distances, ventilation, and structural life safety.',
  },
  {
    id: 'leg-global-country',
    title: 'International & Country-Specific EHS / ESG Frameworks',
    country: 'International Reference',
    stateScope: 'EU / UK / Middle East / APAC Operations',
    industries: ['Export Manufacturing', 'Semiconductor', 'Data Centers', 'Steel', 'IT & Corporate'],
    activityScope: 'EU CSRD/CBAM readiness, UK HSE/IOSH principles & GCC EHS frameworks',
    effectiveDate: 'Jurisdiction-Dependent — Verify Local Gazette',
    amendmentStatus: 'Verify Local Regulatory Authority Before Reliance',
    verificationStatus: 'Verify Official Portal (Transitional / State Rules)',
    sourceLabel: 'Official National Regulatory Portals',
    sourceUrl: 'https://www.ilo.org/',
    summary: 'Extensible compliance mapping structure enabling multi-country enterprises to maintain localized registers alongside ILO, EU CBAM, and regional EHS expectations.',
  },
];

/* ============================================================================
   SECTION 11: 10-STEP INTERACTIVE PROCESS WORKFLOW
   ============================================================================ */
export interface WorkflowStepSpec {
  step: string;
  title: string;
  summary: string;
  aiSupport: string;
  humanControl: string;
  targetModuleId: ModuleId;
  actionLabel: string;
}

export const HOW_IT_WORKS_STEPS: WorkflowStepSpec[] = [
  {
    step: '01',
    title: 'Select Industry',
    summary: 'Choose from 28 pre-built global industrial sectors or dynamically create a custom sector profile with tailored risk parameters.',
    aiSupport: 'Automatically calibrates hazard themes, legal categories, and ISO applicability to your industry.',
    humanControl: 'Confirm facility scope, headcount, and operational boundaries.',
    targetModuleId: 'industry-master',
    actionLabel: 'Open Industry Manager',
  },
  {
    step: '02',
    title: 'Select Service',
    summary: 'Pick from 22 assurance services — third-party audits, ISO gap analysis, EHS, fire, food safety, legal, or ESG consulting.',
    aiSupport: 'Screens every requested scope automatically through Legal Authorization Control (Category 1/2/3).',
    humanControl: 'Super Administrator verifies any regulated service boundaries before scheduling.',
    targetModuleId: 'authorization-control',
    actionLabel: 'View Authorization Control',
  },
  {
    step: '03',
    title: 'Identify Applicable Standards',
    summary: 'Map relevant ISO standards (9001, 14001, 45001, 27001, 22301, 50001, 14064, etc.) and Central/State legal registers.',
    aiSupport: 'Suggests applicable ISO clauses and statutory registers with official source links.',
    humanControl: 'Competent reviewer validates state rule applicability against official portals.',
    targetModuleId: 'legal-compliance',
    actionLabel: 'Open Legal Register',
  },
  {
    step: '04',
    title: 'Conduct Gap Assessment',
    summary: 'Evaluate current management system maturity clause-by-clause with evidence uploads and automated readiness scoring.',
    aiSupport: 'Provides non-authoritative clause interpretation and highlights missing documentation.',
    humanControl: 'Lead Auditor validates compliance status and risk classification per clause.',
    targetModuleId: 'iso-gap',
    actionLabel: 'Launch ISO Gap Engine',
  },
  {
    step: '05',
    title: 'Perform Auditing & Inspection',
    summary: 'Execute structured field audits across EHS, Fire, Food Safety, Environmental, or Contractor engines with photo evidence.',
    aiSupport: 'Generates dynamic industry checklists and assists in structuring field notes.',
    humanControl: 'Auditor verifies actual site conditions — AI never fabricates observations.',
    targetModuleId: 'ehs-audit',
    actionLabel: 'Launch Audit Engine',
  },
  {
    step: '06',
    title: 'Identify Findings',
    summary: 'Classify Critical, Major, Minor, Observation, and Good Practice items with objective evidence and risk ratings.',
    aiSupport: 'Flags high-severity themes and links observations to standard/legal references.',
    humanControl: 'Auditor reviews severity grading and factual evidence accuracy.',
    targetModuleId: 'ehs-audit',
    actionLabel: 'Review Findings Log',
  },
  {
    step: '07',
    title: 'Generate Corrective Actions',
    summary: 'Escalate findings into centralized CAPA records with 5-Why and Ishikawa Fishbone root-cause analysis.',
    aiSupport: 'Recommends containment steps, root-cause lines of inquiry, and preventive controls.',
    humanControl: 'Department Owner commits to realistic actions and target closure dates.',
    targetModuleId: 'capa',
    actionLabel: 'Open CAPA Engine',
  },
  {
    step: '08',
    title: 'Track Implementation',
    summary: 'Monitor remediation progress, controlled SOP/HIRA updates, due dates, and overdue escalation alerts in real time.',
    aiSupport: 'Drafts controlled SOPs/HIRAs locked as DRAFT – REVIEW REQUIRED for approval.',
    humanControl: 'Document Controller & Managers approve operational rollout.',
    targetModuleId: 'doc-generator',
    actionLabel: 'Open Document Control',
  },
  {
    step: '09',
    title: 'Conduct Verification',
    summary: 'Audit closure evidence, site photos, and effectiveness reviews before closing Critical or Major CAPA actions.',
    aiSupport: 'Summarizes closure completeness and highlights overdue or repeat findings.',
    humanControl: 'Qualified Auditor formally signs off Verified & Closed status.',
    targetModuleId: 'capa',
    actionLabel: 'Verify CAPA Closures',
  },
  {
    step: '10',
    title: 'Prepare Final Assessment Report',
    summary: 'Generate branded, audit-ready executive PDF, editable DOCX, and XLSX reports with mandatory governance disclaimers.',
    aiSupport: 'Synthesizes executive management summaries from verified audit records.',
    humanControl: 'Lead Auditor approves and releases final independent assessment pack.',
    targetModuleId: 'audit-reports',
    actionLabel: 'Open Reports Hub',
  },
];

/* ============================================================================
   SECTION 12: WHY CHOOSE ARSHIEL ASSURANCE (10 ADVANTAGES)
   ============================================================================ */
export const WHY_CHOOSE_ADVANTAGES = [
  {
    title: 'AI-Powered Assurance Intelligence',
    description: '15 integrated AI tools accelerating ISO gap analysis, checklist creation, HIRA/SOP drafting, and root-cause analysis.',
  },
  {
    title: 'Multi-Industry Expertise',
    description: '28 specialized industry blueprints spanning Semiconductor, Data Centers, Pharma, Energy, Manufacturing, and Infrastructure.',
  },
  {
    title: 'Integrated ISO Management Systems',
    description: 'Unified assessment architecture across 17 global ISO standards including Quality, Environment, OH&S, InfoSec, Energy, and GHG.',
  },
  {
    title: 'Legal & Statutory Compliance Mapping',
    description: 'Jurisdiction-aware Central, Andhra Pradesh, Telangana, and global compliance registers with official portal source links.',
  },
  {
    title: 'Risk-Based Auditing',
    description: 'Prioritizes Critical and High operational hazards across LOTO, Process Safety, Fire, Chemical, and Contractor domains.',
  },
  {
    title: 'Digital Audit Management',
    description: 'End-to-end execution replacing fragmented spreadsheets with real-time Firebase-backed workspaces and instant exports.',
  },
  {
    title: 'Centralized Documentation',
    description: '52 controlled EHS, Risk, Audit, and Food Safety templates with revision tracking and mandatory approval workflows.',
  },
  {
    title: 'CAPA Lifecycle Tracking',
    description: 'Direct escalation from audit findings to 5-Why / Fishbone RCA, owner assignments, overdue alerts, and effectiveness sign-off.',
  },
  {
    title: 'ESG & Sustainability Support',
    description: 'ISO 14064 Scope 1/2/3 readiness, waste & ZLD environmental monitoring, and board-level ESG compliance reporting.',
  },
  {
    title: 'Human-Verified AI Governance',
    description: 'Built-in Legal Authorization Control and DRAFT – REVIEW REQUIRED safeguards ensuring technical rigor and regulatory integrity.',
  },
];
