import type { ModuleId } from '../types/assurance';

export const SECTOR_IMAGES = {
  semiconductor: '/src/assets/images/industry_semiconductor_cleanroom_1795183803643.jpg',
  dataCenter: '/src/assets/images/industry_data_center_1795183943578.jpg',
  pharma: '/src/assets/images/industry_pharma_biotech_1795183841375.jpg',
  manufacturing: '/src/assets/images/industry_manufacturing_ehs_1795183857499.jpg',
  energy: '/src/assets/images/industry_energy_infrastructure_1795183802693.jpg',
} as const;

export type IndustryGroup =
  | 'High-Tech & Digital'
  | 'Process & Life Sciences'
  | 'Heavy Industrial & Manufacturing'
  | 'Energy & Infrastructure'
  | 'Commerce, Logistics & Services';

export interface IndustryBlueprint {
  id: string;
  name: string;
  group: IndustryGroup;
  sectorTag: string;
  image: string;
  shortDescription: string;
  overview: string;
  subSectors: string[];
  applicableIsoStandards: string[];
  industryServices: string[];
  thirdPartyAudits: string[];
  internalAuditServices: string[];
  certificationSupport: string[];
  legalCompliance: string[];
  ehsAuditing: string[];
  riskAssessment: string[];
  aiDocumentGeneration: string[];
  inspectionServices: string[];
  trainingCompetency: string[];
  esgSustainability: string[];
  auditReportsCapa: string[];
  industryResources: string[];
  keyRisks: string[];
  sampleChecklistFocus: string[];
  recommendedModules: Array<{ label: string; moduleId: ModuleId }>;
}

interface RawIndustryInput {
  id: string;
  name: string;
  group: IndustryGroup;
  sectorTag: string;
  image: string;
  shortDescription: string;
  subSectors: string[];
  applicableIsoStandards: string[];
  industryServices: string[];
  legalCompliance: string[];
  keyRisks: string[];
  sampleChecklistFocus: string[];
  aiDocumentGeneration: string[];
  esgFocus: string[];
  recommendedModules: Array<{ label: string; moduleId: ModuleId }>;
}

function buildBlueprint(raw: RawIndustryInput): IndustryBlueprint {
  return {
    id: raw.id,
    name: raw.name,
    group: raw.group,
    sectorTag: raw.sectorTag,
    image: raw.image,
    shortDescription: raw.shortDescription,
    overview: `${raw.shortDescription} ARSHIEL ASSURANCE delivers independent, evidence-driven auditing, management system gap assessments, statutory compliance mapping, and AI-assisted assurance documentation specifically calibrated to ${raw.name} operations.`,
    subSectors: raw.subSectors,
    applicableIsoStandards: raw.applicableIsoStandards,
    industryServices: raw.industryServices,
    thirdPartyAudits: [
      `Independent third-party EHS & management system readiness audits for ${raw.name}`,
      'Supplier, contractor & multi-site compliance benchmarking under client mandate',
      'Pre-certification & surveillance readiness verification (non-accredited advisory)',
    ],
    internalAuditServices: [
      `Risk-based internal audit program planning across ${raw.subSectors.slice(0, 3).join(', ')}`,
      'Co-sourced & outsourced ISO internal audits with objective evidence tracking',
      'Management review readiness packs & audit program effectiveness reviews',
    ],
    certificationSupport: [
      `Clause-wise gap analysis across ${raw.applicableIsoStandards.slice(0, 4).join(', ')}`,
      'Management system documentation structuring, implementation mentoring & mock readiness reviews',
      'Transparent coordination guidance with independent accredited certification bodies (ARSHIEL ASSURANCE does not issue accredited certificates)',
    ],
    legalCompliance: raw.legalCompliance,
    ehsAuditing: [
      ...raw.industryServices.slice(0, 4),
      'Permit-to-Work (PTW), LOTO, contractor control, emergency response & ergonomics verification',
    ],
    riskAssessment: [
      `Sector-specific HIRA, HAZID, JSA & Job Hazard Analysis for ${raw.name}`,
      ...raw.keyRisks.slice(0, 3),
    ],
    aiDocumentGeneration: raw.aiDocumentGeneration,
    inspectionServices: [
      `Structured digital field inspections covering ${raw.sampleChecklistFocus.slice(0, 2).join(' and ')}`,
      'Non-statutory safety, fire protection, electrical, and workplace hygiene walkthroughs',
      'Multimodal photographic evidence logging & severity grading',
    ],
    trainingCompetency: [
      `Internal auditor & hazard identification workshops tailored to ${raw.name} teams`,
      'Role-based EHS, LOTO, emergency preparedness, and ISO clause awareness sessions',
      'Competency gap matrices & training effectiveness evaluations (independent advisory)',
    ],
    esgSustainability: raw.esgFocus,
    auditReportsCapa: [
      'Auditor-verified PDF, DOCX & XLSX assessment reports with executive summaries',
      'One-click escalation of Critical & Major findings into 5-Why / Fishbone CAPA workflows',
      'Overdue action tracking, closure evidence verification & effectiveness sign-off',
    ],
    industryResources: [
      `${raw.name} Independent EHS & Compliance Inspection Checklist (.xlsx)`,
      `${raw.applicableIsoStandards[0] || 'ISO 45001'} Sector Gap Readiness Matrix`,
      `${raw.name} HIRA & Controlled SOP Starter Pack`,
    ],
    keyRisks: raw.keyRisks,
    sampleChecklistFocus: raw.sampleChecklistFocus,
    recommendedModules: raw.recommendedModules,
  };
}

const RAW_INDUSTRIES: RawIndustryInput[] = [
  {
    id: 'semiconductor',
    name: 'Semiconductor Industry',
    group: 'High-Tech & Digital',
    sectorTag: 'Wafer Fabs, Cleanrooms & OSAT',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription:
      'Cleanroom EHS, toxic gas & corrosive chemical safety, sub-fab LOTO, and integrated ISO 9001/14001/45001/50001 assurance for semiconductor facilities.',
    subSectors: [
      'Semiconductor Manufacturing',
      'Wafer Fabrication',
      'Cleanroom Operations',
      'Chemical Management',
      'Toxic Gas Management',
      'Equipment Manufacturing',
      'Electronics Manufacturing',
      'Semiconductor Testing',
      'Packaging & Assembly',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001'],
    industryServices: [
      'ISO 9001 Auditing',
      'ISO 14001 Auditing',
      'ISO 45001 Auditing',
      'ISO 50001 Support',
      'Cleanroom EHS Audits',
      'Chemical Safety Audits',
      'Toxic Gas Safety Assessments',
      'Electrical Safety Audits',
      'Process Safety Audits',
      'Environmental Compliance',
      'Contractor Safety Audits',
      'Emergency Preparedness Audits',
    ],
    legalCompliance: [
      'OSHWC Code Transitional & Applicable State Factory Rules',
      'Hazardous & Other Wastes (Management & Transboundary Movement) Rules',
      'Gas Cylinders Rules & MSIHC Chemical Safety Frameworks',
      'TSPCB / APPCB Consent to Establish & Operate Conditions',
      'Electricity Act, 2003 & CEA Safety Regulations',
    ],
    keyRisks: [
      'HF / corrosive acid handling & automated chemical delivery changeouts',
      'Toxic gas bunker leaks (silane, arsine, phosphine) & TGMS interlocks',
      'Sub-fab zero-energy LOTO & high-voltage tool servicing',
      'Ultra-pure water, solvent abatement & scrubber system reliability',
    ],
    sampleChecklistFocus: [
      'Cleanroom acid/base segregation, 110% secondary bunding & SDS currency',
      'TGMS detector calibration, gas cabinet exhaust & scrubber standby power',
      'Serialized personal LOTO locks on sub-fab pumps and RF generators',
      'Emergency deluge shower & eyewash 10-second reach & weekly flush logs',
    ],
    aiDocumentGeneration: [
      'Cleanroom Wet-Bench & Chemical Handling HIRA (DRAFT – REVIEW REQUIRED)',
      'Toxic Gas Bunker Emergency Response Plan & SOP',
      'Sub-Fab Equipment Zero-Energy LOTO Procedure',
    ],
    esgFocus: [
      'ISO 14064 Scope 1 PFC abatement & Scope 2 cleanroom energy GHG tracking',
      'Ultra-pure water recycling & chemical waste minimization KPIs',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
  },
  {
    id: 'data-centers',
    name: 'Data Centers',
    group: 'High-Tech & Digital',
    sectorTag: 'Hyperscale, AI & Mission-Critical Infrastructure',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription:
      'Electrical, fire & life safety, BESS/UPS risk reviews, ISO 27001/22301/50001 gap assessments, and contractor EHS audits for mission-critical data centers.',
    subSectors: [
      'Hyperscale Data Centers',
      'Colocation Data Centers',
      'Enterprise Data Centers',
      'AI Data Centers',
      'Cloud Infrastructure',
      'Edge Data Centers',
      'Data Center Construction',
      'Data Center Operations',
      'Battery Energy Storage Systems',
      'Critical Infrastructure',
    ],
    applicableIsoStandards: ['ISO 27001', 'ISO 22301', 'ISO 45001', 'ISO 14001', 'ISO 50001', 'ISO 20000-1'],
    industryServices: [
      'ISO 27001 Auditing',
      'ISO 22301 Auditing',
      'ISO 45001 Auditing',
      'ISO 14001 Auditing',
      'ISO 50001 Support',
      'Electrical Safety Audits',
      'Fire & Life Safety Audits',
      'UPS & DG Safety Assessments',
      'Battery & BESS Safety',
      'Emergency Response Audits',
      'Business Continuity Assessment',
      'Contractor EHS Audits',
    ],
    legalCompliance: [
      'Electricity Act, 2003 & CEA Measures Relating to Safety and Electric Supply',
      'Telangana / Andhra Pradesh Fire Services NOC & NBC Part 4 Alignment',
      'Air Act, 1981 (DG Set Acoustic Enclosures & Stack Emissions)',
      'E-Waste (Management) Rules & Battery Waste Management Rules',
    ],
    keyRisks: [
      'HT/LT switchgear arc-flash hazards & energized electrical work',
      'Lithium-ion UPS / BESS thermal runaway & off-gas detection',
      'Clean-agent fire suppression impairment & data hall egress blockage',
      'Bulk diesel storage, DG set exhaust & cooling water treatment safety',
    ],
    sampleChecklistFocus: [
      'Fire pump room AUTO mode, VESDA & clean-agent cylinder pressure verification',
      'Arc-flash PPE availability, insulating mats & switchgear LOTO governance',
      'BESS room thermal monitoring, exhaust interlocks & emergency isolation',
      'PUE energy sub-metering, DG emissions logs & contractor PTW controls',
    ],
    aiDocumentGeneration: [
      'Data Center Switchgear & Chiller LOTO Procedure (DRAFT – REVIEW REQUIRED)',
      'BESS Thermal Event Emergency Response & Evacuation Plan',
      'ISO 27001 / 22301 Business Continuity Assessment Report Draft',
    ],
    esgFocus: [
      'ISO 50001 PUE & WUE optimization readiness & renewable PPA tracking',
      'ISO 14064 Scope 1 DG fuel & Scope 2 grid electricity GHG reporting',
    ],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceutical Industry',
    group: 'Process & Life Sciences',
    sectorTag: 'API, Formulations & Sterile Plants',
    image: SECTOR_IMAGES.pharma,
    shortDescription:
      'Process & solvent safety, occupational hygiene, ETP/ZLD environmental compliance, and ISO 9001/14001/45001/13485 gap assessments for pharma plants.',
    subSectors: [
      'API Manufacturing',
      'Finished Dosage Formulations',
      'Sterile & Injectable Facilities',
      'R&D & Analytical QA Labs',
      'Cold Chain Pharma Warehousing',
      'Medical Devices & Diagnostics',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 13485', 'ISO 17025'],
    industryServices: [
      'Process Safety & Solvent Handling Audits',
      'ISO 14001 & ISO 45001 Gap Assessments',
      'ETP / ZLD Environmental Compliance Reviews',
      'Occupational Hygiene & Containment Reviews',
      'Chemical Warehouse & Tank Farm Safety Audits',
      'Boiler & Pressure Vessel Safety Readiness',
    ],
    legalCompliance: [
      'Environment (Protection) Act, 1986 & Water/Air Pollution Acts',
      'APPCB / TSPCB CFO, OCEMS & Hazardous Waste Manifesting',
      'MSIHC Rules & Chemical Accidents (EPPR) Rules',
      'Applicable State Factories & Boiler Safety Rules',
    ],
    keyRisks: [
      'Flammable solvent static discharge & explosive atmosphere zones',
      'High-potency API dust exposure & containment breach',
      'ZLD/ETP effluent excursion & hazardous solvent waste storage',
      'Confined space reactor entry & thermal fluid heating risks',
    ],
    sampleChecklistFocus: [
      'Solvent earthing, bonding continuity & Ex-rated flameproof fittings',
      'ETP/ZLD daily outlet parameter logs & OCEMS calibration checks',
      'Hazardous waste shed compatibility matrix & TSDF manifest logs',
      'Fume hood face velocity, respiratory PPE & emergency shower checks',
    ],
    aiDocumentGeneration: [
      'API Reactor Charging HAZID & HIRA Draft (DRAFT – REVIEW REQUIRED)',
      'Solvent Transfer Static Grounding & Spill SOP',
      'Environmental Aspect & Impact Register',
    ],
    esgFocus: [
      'Zero Liquid Discharge (ZLD) water stewardship & solvent recovery KPIs',
      'Scope 1/2 GHG accounting & sustainable packaging readiness',
    ],
    recommendedModules: [
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Industry',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Discrete, Precision & Heavy Production',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'Machine guarding, LOTO, overhead cranes, ergonomics, supplier EHS audits, and integrated ISO 9001/14001/45001/50001 management systems.',
    subSectors: [
      'Precision Engineering & CNC',
      'Industrial Machinery & Fabrication',
      'Plastics, Polymers & Packaging',
      'Consumer Durables Assembly',
      'Foundries & Metal Forming',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 50001', 'ISO 55001'],
    industryServices: [
      'Integrated IMS (ISO 9001/14001/45001) Gap Analysis',
      'Machine Guarding & LOTO Safety Audits',
      'Overhead Crane & Material Handling Audits',
      'Industrial Hygiene, Noise & Ergonomics Reviews',
      'Contractor & Supplier EHS Audits',
    ],
    legalCompliance: [
      'OSHWC Code Transitional & Applicable State Factory Rules',
      'Electricity Act, 2003 & CEA Electrical Safety Regulations',
      'Air, Water & Hazardous Waste Authorization Conditions',
      'POSH Act, 2013 & Contract Labour Welfare Provisions',
    ],
    keyRisks: [
      'Unguarded rotating shafts, hydraulic presses & pinch points',
      'Forklift-pedestrian collisions & overhead crane rigging failures',
      'Maintenance breakdown energy isolation (LOTO) lapses',
      'Welding fumes, metalworking fluids & high occupational noise',
    ],
    sampleChecklistFocus: [
      'Machine interlocks, light curtains & emergency stop functionality',
      'Lifting tackle inspection tags & safe working load markings',
      'Pedestrian walkway segregation & forklift speed controls',
      'Permit-to-Work for hot work, height & confined space entries',
    ],
    aiDocumentGeneration: [
      'Shopfloor Machine Safety HIRA (DRAFT – REVIEW REQUIRED)',
      'Press & CNC Maintenance LOTO SOP',
      'Job Safety Analysis (JSA) Field Pack',
    ],
    esgFocus: [
      'ISO 50001 motor/compressed-air energy conservation tracking',
      'Scrap recycling, circular materials & Scope 1/2 emissions accounting',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
  },
  {
    id: 'construction-infrastructure',
    name: 'Construction & Infrastructure',
    group: 'Energy & Infrastructure',
    sectorTag: 'Civil EPC, High-Rise, Metro & Highways',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Work-at-height, scaffolding, excavation, heavy lifting, temporary electrical safety, and multi-tier contractor EHS auditing for EPC projects.',
    subSectors: [
      'Commercial & High-Rise Buildings',
      'Industrial Plant EPC',
      'Highways, Bridges & Metro Rail',
      'Tunnels & Underground Works',
      'Urban Utilities & Smart Cities',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 9001', 'ISO 14001', 'ISO 31000'],
    industryServices: [
      'Project EHS & Contractor Safety Audits',
      'Scaffolding & Work-at-Height Assessments',
      'Heavy Crane & Rigging Safety Audits',
      'Excavation & Temporary Electrical Audits',
      'ISO 45001 Project Readiness Reviews',
    ],
    legalCompliance: [
      'BOCW Act & Applicable State BOCW Safety Rules',
      'OSHWC Code Transitional Safety Requirements',
      'Construction & Demolition (C&D) Waste Management Rules',
      'Contract Labour Welfare & Site Medical Compliance',
    ],
    keyRisks: [
      'Falls from scaffolding, unprotected slab edges & fragile roofs',
      'Deep trench collapse & underground utility strikes',
      'Tower crane stability, rigging failures & dropped objects',
      'Temporary site distribution boards lacking RCCB/ELCB protection',
    ],
    sampleChecklistFocus: [
      'Scaffold green-tag verification, guardrails & toe-boards',
      '100% full-body harness tie-off & certified lifeline anchorages',
      '30mA RCCB/ELCB testing on all temporary construction DB panels',
      'Daily Toolbox Talks, excavation shoring & hot-work PTW compliance',
    ],
    aiDocumentGeneration: [
      'EPC Project EHS Management Plan Draft (DRAFT – REVIEW REQUIRED)',
      'Heavy Lifting & Scaffolding Safe Work Method Statement (SWMS)',
      'Work-at-Height Rescue & Fall Protection SOP',
    ],
    esgFocus: [
      'C&D waste recycling, dust suppression & community noise monitoring',
      'Embodied carbon tracking & worker welfare social compliance',
    ],
    recommendedModules: [
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
  },
  {
    id: 'fmcg',
    name: 'FMCG Industry',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'High-Speed Consumer Goods & Packaging',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'High-speed packaging line safety, hygiene & allergen governance, warehouse ergonomics, and ISO 9001/22000/45001/14001 compliance.',
    subSectors: [
      'Home & Personal Care',
      'Packaged Foods & Beverages',
      'High-Speed Bottling & Filling',
      'Consumer Packaging & Converting',
      'Regional Distribution Hubs',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 22000', 'ISO 45001', 'ISO 14001'],
    industryServices: [
      'Packaging Line Machine Safety Audits',
      'Food & Consumer Hygiene Assessments',
      'Warehouse Racking & Ergonomics Audits',
      'Plastic EPR & Environmental Compliance Reviews',
      'Supplier Quality & Social Compliance Audits',
    ],
    legalCompliance: [
      'FSS Act, 2006 (for food/beverage product lines)',
      'Plastic Waste Management & Extended Producer Responsibility (EPR) Rules',
      'Applicable State Factories & Labour Safety Rules',
      'State PCB Consent & Fire Services NOC Conditions',
    ],
    keyRisks: [
      'High-speed conveyor nip points & palletizer interlock bypass',
      'Combustible packaging material fire load in high-bay storage',
      'Line changeover hygiene, foreign-body & allergen cross-contact',
      'Repetitive manual handling & loading dock vehicle creep',
    ],
    sampleChecklistFocus: [
      'Packaging line light curtains & safe jam-clearing procedures',
      'Warehouse sprinkler 450mm clearance & racking SWL signage',
      'Hygiene swab logs, foreign body control & pest trend reviews',
      'Dock wheel chocks, pedestrian walkways & ergonomic lift assists',
    ],
    aiDocumentGeneration: [
      'High-Speed Packaging Line JSA (DRAFT – REVIEW REQUIRED)',
      'Warehouse Fire & Racking Inspection SOP',
      'Supplier Hygiene & Social Compliance Audit Checklist',
    ],
    esgFocus: [
      'Plastic packaging circularity, EPR compliance & water intensity reduction',
      'Scope 3 supplier sustainability assessments',
    ],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
    ],
  },
  {
    id: 'food-processing',
    name: 'Food Processing Industry',
    group: 'Process & Life Sciences',
    sectorTag: 'Food Plants, Cold Chain & Dairy',
    image: SECTOR_IMAGES.pharma,
    shortDescription:
      'ISO 22000 & HACCP readiness, cold-chain CCP verification, allergen & pest controls, ammonia plant safety, and hygiene assessments.',
    subSectors: [
      'Packaged Foods & Ready-to-Eat',
      'Dairy & Cold Chain Processing',
      'Beverage & Bottling Plants',
      'Spices, Grains & Edible Oils',
      'Central Commercial Kitchens & Catering',
    ],
    applicableIsoStandards: ['ISO 22000', 'ISO 9001', 'ISO 45001', 'ISO 14001'],
    industryServices: [
      'ISO 22000 & HACCP Gap Analysis',
      'Independent Food Hygiene & Sanitation Audits',
      'Cold Chain & Allergen Control Assessments',
      'Ammonia Refrigeration & Boiler EHS Audits',
      'Supplier & Co-Packer Food Safety Audits',
    ],
    legalCompliance: [
      'Food Safety and Standards Act, 2006 & FSSAI Schedule 4 (Advisory Readiness)',
      'Water Act (Food Processing ETP & Potable Water Testing)',
      'State Factories Rules (Ammonia Refrigeration & Pressure Vessels)',
      'Legal Metrology Packaged Commodities Compliance (Verify Official Portal)',
    ],
    keyRisks: [
      'Thermal kill-step & blast-chiller Critical Control Point (CCP) excursions',
      'Allergen cross-contact & metal/glass foreign material contamination',
      'Ammonia refrigeration leaks & cold-room personnel entrapment',
      'Pest ingress, potable water contamination & sanitation gaps',
    ],
    sampleChecklistFocus: [
      'Calibrated CCP temperature probes & continuous cold-chain logs',
      'Color-coded allergen utensils & validated sanitation changeovers',
      'Batch traceability & 4-hour mock recall verification',
      'Ammonia gas detectors, SCBA readiness & cold-room interior exit releases',
    ],
    aiDocumentGeneration: [
      'HACCP Plan & CCP Monitoring Draft (DRAFT – REVIEW REQUIRED)',
      'Allergen Segregation & Sanitation SOP',
      'Ammonia Refrigeration Emergency Response Plan',
    ],
    esgFocus: [
      'Food waste minimization, ETP biogas recovery & sustainable cold-chain energy',
    ],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
  },
  {
    id: 'chemical-petrochemical',
    name: 'Chemical & Petrochemical Industry',
    group: 'Process & Life Sciences',
    sectorTag: 'Specialty Chemicals, Reactors & Tank Farms',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Process safety management (PSM), HAZID/HIRA drafting, MSIHC readiness, hazardous waste audits, and ISO 14001/45001/31000 assessments.',
    subSectors: [
      'Bulk & Specialty Chemicals',
      'Petrochemical Crackers & Polymers',
      'Agrochemicals & Intermediates',
      'Industrial Gases & Tank Terminals',
      'Coatings, Resins & Adhesives',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 31000', 'ISO 50001'],
    industryServices: [
      'Process Safety Management (PSM) Audits',
      'Chemical Warehouse & Tank Farm Safety Audits',
      'MSIHC & Emergency Preparedness Reviews',
      'Environmental & Hazardous Waste Audits',
      'Fire Protection & NFPA-Aligned Assessments',
    ],
    legalCompliance: [
      'MSIHC Rules & Chemical Accidents (EPPR) Rules',
      'Public Liability Insurance (PLI) Act Requirements',
      'Environment Protection Act & Hazardous Waste Rules',
      'PESO / Petroleum & Gas Cylinders Frameworks (Verify Authority Portal)',
    ],
    keyRisks: [
      'Exothermic runaway reactions, toxic vapour release & BLEVE risk',
      'Tank farm bunding integrity, static discharge & confined space entry',
      'Incompatible chemical storage & drum handling spills',
      'Off-site emergency response readiness & scrubber failure',
    ],
    sampleChecklistFocus: [
      'Tank farm 110% dyke capacity, flame arrestors & earthing logs',
      'Confined space 4-gas testing, standby watch & tripod rescue gear',
      'GHS chemical labeling, current SDS & incompatible storage matrix',
      'On-site Emergency Plan updates & mock drill evaluation logs',
    ],
    aiDocumentGeneration: [
      'Process Chemical HAZID & Risk Register Draft (DRAFT – REVIEW REQUIRED)',
      'Confined Space Entry & Vessel Isolation SOP',
      'Chemical Spill Containment & On-Site ERP Draft',
    ],
    esgFocus: [
      'VOC fugitive emission control (LDAR), hazardous waste co-processing & Scope 1 GHG tracking',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas Industry',
    group: 'Energy & Infrastructure',
    sectorTag: 'Refineries, Terminals, Pipelines & Depots',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'High-hazard PTW, hazardous area electrical zoning, H2S/hydrocarbon controls, fire water readiness, and ISO 45001/14001/31000/22301 audits.',
    subSectors: [
      'Upstream & Drilling Support',
      'Midstream Pipelines & Pumping Stations',
      'Downstream Refining & Blending',
      'POL Terminals & LPG Bottling',
      'City Gas Distribution (CGD)',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 31000', 'ISO 22301', 'ISO 55001'],
    industryServices: [
      'High-Hazard Permit-to-Work & SIMOPS Audits',
      'NFPA-Aligned Fire Water & Foam System Audits',
      'Contractor Safety & Turnaround EHS Audits',
      'Process Safety & Asset Integrity Reviews',
      'ISO 45001 / ISO 31000 Readiness Assessments',
    ],
    legalCompliance: [
      'Petroleum & Explosives Safety (PESO) Frameworks (Verify Official Portal)',
      'MSIHC & Oil Industry Safety Best Practices (OISD References)',
      'Air, Water & Hazardous Oil-Sludge Waste Regulations',
      'OSHWC / Contract Labour Safety Provisions',
    ],
    keyRisks: [
      'Hydrocarbon vapour cloud ignition & Zone 0/1/2 Ex-equipment defects',
      'Hot work, line-breaking & SIMOPS conflicts during turnarounds',
      'H2S / toxic gas exposure & confined space tank cleaning',
      'Fire water reservoir & foam tender availability gaps',
    ],
    sampleChecklistFocus: [
      'Hazardous area Ex-rated electrical integrity & grounding checks',
      'Calibrated portable 4-gas detectors & hot-work fire watch logs',
      'Fire water pump testing, foam concentrate inventory & deluge valves',
      'Positive isolation blinds, LOTO registers & contractor competency',
    ],
    aiDocumentGeneration: [
      'High-Hazard Permit-to-Work (PTW) & Line-Breaking SOP (DRAFT – REVIEW REQUIRED)',
      'Turnaround Contractor EHS Audit Checklist',
      'Terminal Fire & Hydrocarbon Leak Emergency Plan',
    ],
    esgFocus: [
      'Methane leak detection, flare gas reduction & ISO 14064 Scope 1/2/3 inventory',
    ],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive Industry',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'OEMs, EV Powertrain & Tier-1 Suppliers',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'Press/weld/paint shop EHS, robotic cell guarding, EV battery safety, Tier-2 vendor audits, and ISO 9001/14001/45001/50001 gap assessments.',
    subSectors: [
      'Passenger & Commercial Vehicle OEMs',
      'EV Battery & Powertrain Assembly',
      'Stamping, Press & Weld Shops',
      'Paint Shops & Surface Treatment',
      'Tier-1 & Tier-2 Component Suppliers',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001'],
    industryServices: [
      'Robotic Cell & Press Shop Safety Audits',
      'Paint Shop Fire & VOC Compliance Audits',
      'EV High-Voltage & Battery Assembly EHS Audits',
      'Tier-1 / Tier-2 Supplier Quality & EHS Audits',
      'ISO 9001/14001/45001/50001 Readiness Reviews',
    ],
    legalCompliance: [
      'State Factories / OSH Safety & Noise Exposure Rules',
      'Air & Hazardous Waste (Paint Sludge, ETP) Consent Conditions',
      'Electricity Act & High-Voltage Testing Safety Regulations',
      'Battery Waste Management Rules (EV Manufacturing)',
    ],
    keyRisks: [
      'Robotic perimeter light-curtain bypass & hydraulic press pinch points',
      'Paint booth flammable solvents, static discharge & VOC emissions',
      'EV high-voltage battery pack thermal & arc-flash risks',
      'AGV / tugger traffic interface & assembly ergonomics',
    ],
    sampleChecklistFocus: [
      'Robotic cell trapped-key interlocks & light curtain testing',
      'Paint booth earthing, CO2/foam suppression & VOC abatement checks',
      'EV high-voltage insulated tools, thermal cameras & quarantine bays',
      'Assembly line ergonomic lift assists & supplier EHS scorecards',
    ],
    aiDocumentGeneration: [
      'Robotic Cell Zero-Energy LOTO SOP (DRAFT – REVIEW REQUIRED)',
      'EV Battery Handling & Thermal Quarantine HIRA',
      'Tier-2 Vendor EHS & Quality Audit Pack',
    ],
    esgFocus: [
      'Plant decarbonization (ISO 50001), paint-shop VOC reduction & Scope 3 supplier tracking',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
  },
  {
    id: 'healthcare-hospitals',
    name: 'Healthcare & Hospitals',
    group: 'Process & Life Sciences',
    sectorTag: 'Multi-Specialty Hospitals & Diagnostics',
    image: SECTOR_IMAGES.pharma,
    shortDescription:
      'Hospital fire & life safety, medical oxygen manifold safety, bio-medical waste compliance, kitchen hygiene, and ISO 9001/15189/45001 readiness.',
    subSectors: [
      'Multi-Specialty & Tertiary Hospitals',
      'Diagnostic & Pathology Laboratories',
      'Medical Gas & Critical Care Units',
      'Hospital Facilities & Central Kitchens',
      'Ambulatory Clinics & Blood Banks',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 15189', 'ISO 22301'],
    industryServices: [
      'Hospital Fire & Non-Ambulatory Evacuation Audits',
      'Medical Oxygen & Gas Manifold Safety Reviews',
      'Bio-Medical Waste Compliance Readiness Audits',
      'Hospital Kitchen Food Safety Audits',
      'ISO 9001 & ISO 15189 Readiness Assessments',
    ],
    legalCompliance: [
      'Bio-Medical Waste Management Rules (Verify SPCB/CPCB Portal)',
      'State Fire Services Hospital Safety & NBC Part 4 Norms',
      'Gas Cylinders Rules & Electrical UPS Safety Regulations',
      'POSH Act, 2013 & FSSAI Hospital Kitchen Hygiene Norms',
    ],
    keyRisks: [
      'Oxygen-enriched ICU/OT fire hazards & manifold cylinder storage',
      'Non-ambulatory patient horizontal evacuation & smoke compartmentation',
      'Bio-medical waste segregation & needle-stick occupational injury',
      'Backup power UPS/DG failover & patient catering food safety',
    ],
    sampleChecklistFocus: [
      'Medical oxygen manifold ventilation, signage & alarm verification',
      'Fire doors, smoke dampers, ramps & ICU evacuation drill records',
      'Color-coded bio-medical waste bins & authorized CBWTF manifests',
      'Patient kitchen cold-chain logs & clinical sharps disposal checks',
    ],
    aiDocumentGeneration: [
      'Hospital Code Red Fire & Evacuation SOP (DRAFT – REVIEW REQUIRED)',
      'Medical Gas Manifold Safety Inspection Checklist',
      'Bio-Medical Waste & Sharps Safety HIRA',
    ],
    esgFocus: [
      'Safe bio-medical waste stewardship, green hospital energy & water efficiency',
    ],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
    ],
  },
  {
    id: 'it-corporate',
    name: 'IT & Corporate',
    group: 'High-Tech & Digital',
    sectorTag: 'Tech Parks, Campuses & Global Capability Centers',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription:
      'ISO 27001/20000-1/22301/41001 gap assessments, high-rise fire drills, cafeteria hygiene, POSH governance, ergonomics, and e-waste audits.',
    subSectors: [
      'Software & GCC Campuses',
      'Commercial Tech Parks & SEZs',
      'Facility Management Operations',
      'Corporate Cafeterias & Transport',
      'BPO & 24x7 Operations Centers',
    ],
    applicableIsoStandards: ['ISO 27001', 'ISO 20000-1', 'ISO 22301', 'ISO 41001', 'ISO 45001', 'ISO 14001'],
    industryServices: [
      'ISO 27001 / 20000-1 / 22301 Gap Analysis',
      'High-Rise Fire Evacuation & Life Safety Audits',
      'Corporate Cafeteria Food Hygiene Audits',
      'Workstation Ergonomics & Indoor Air Quality Reviews',
      'Facility Vendor EHS & POSH Compliance Reviews',
    ],
    legalCompliance: [
      'POSH Act, 2013 (Internal Committee & Annual Returns)',
      'E-Waste (Management) Rules & Battery Waste Rules',
      'State Fire Services High-Rise NOC & Drill Requirements',
      'State Shops & Establishments Act & FSSAI Canteen Norms',
    ],
    keyRisks: [
      'High-rise stairwell congestion & fire alarm audibility gaps',
      'Cafeteria vendor temperature control & allergen failures',
      'Musculoskeletal workstation ergonomics & IAQ fatigue',
      'Information security & business continuity disruption',
    ],
    sampleChecklistFocus: [
      'Floor fire wardens, illuminated exit routes & semi-annual drill logs',
      'POSH policy display, IC constitution & training records',
      'CPCB-authorized e-waste recycler manifests & STP compliance',
      'Cafeteria food handler medicals & cold-chain logs',
    ],
    aiDocumentGeneration: [
      'Campus Fire Evacuation & Warden Plan (DRAFT – REVIEW REQUIRED)',
      'Office Ergonomics & IAQ Risk Assessment',
      'ISO 27001 / 22301 Gap Readiness Report Draft',
    ],
    esgFocus: [
      'Green building ISO 50001/41001 energy management & Scope 2/3 commute GHG tracking',
    ],
    recommendedModules: [
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  },
  {
    id: 'power-energy',
    name: 'Power & Energy',
    group: 'Energy & Infrastructure',
    sectorTag: 'Thermal, Substations & Transmission Grids',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'High-voltage electrical safety, boiler/turbine EHS, ash & emission compliance, asset integrity, and ISO 45001/14001/50001/55001 audits.',
    subSectors: [
      'Thermal & Gas Power Generation',
      'EHV Substations & Transmission Lines',
      'Captive Power & Co-Generation Plants',
      'Distribution Utilities & Switchyards',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 50001', 'ISO 55001', 'ISO 22301'],
    industryServices: [
      'High-Voltage Electrical & Arc-Flash Safety Audits',
      'Boiler, Turbine & Confined Space EHS Audits',
      'Stack Emissions, Fly Ash & Water Compliance Reviews',
      'Contractor Outage & Overhaul Safety Audits',
      'ISO 55001 Asset Management & ISO 45001 Readiness',
    ],
    legalCompliance: [
      'Electricity Act, 2003 & CEA Safety & Technical Regulations',
      'Environment Protection Act (Thermal Emission & Fly Ash Utilization Norms)',
      'Indian Boilers Act & State Factory Safety Frameworks',
      'OSHWC & Contract Labour Safety Provisions',
    ],
    keyRisks: [
      'EHV electrocution, induction hazards & switching errors',
      'High-pressure steam leaks, boiler furnace explosions & confined space work',
      'Coal yard spontaneous combustion & dust explosions',
      'Stack SOx/NOx/PM excursions & ash pond structural integrity',
    ],
    sampleChecklistFocus: [
      'PTW electrical isolation keys, earthing rods & arc-flash boundaries',
      'Continuous Emission Monitoring System (CEMS) calibration logs',
      'Coal handling dust suppression & deluge fire protection',
      'Outage contractor height work, rigging & medical fitness records',
    ],
    aiDocumentGeneration: [
      'Switchyard Isolation & Switching LOTO SOP (DRAFT – REVIEW REQUIRED)',
      'Boiler Overhaul Confined Space HIRA',
      'Environmental Emission & Ash Compliance Register',
    ],
    esgFocus: [
      'Heat-rate efficiency (ISO 50001), fly-ash circular utilization & GHG reporting (ISO 14064)',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    group: 'Energy & Infrastructure',
    sectorTag: 'Utility Solar, Wind, Green Hydrogen & BESS',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Solar EPC & O&M safety, wind turbine work-at-height, BESS fire safety, ISO 14001/45001/14064 readiness, and ESG assurance.',
    subSectors: [
      'Utility-Scale Solar PV Parks',
      'Onshore & Offshore Wind Farms',
      'Grid-Scale Battery Storage (BESS)',
      'Green Hydrogen & Electrolyzer Plants',
      'Biomass & Waste-to-Energy',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 50001', 'ISO 14064', 'ISO 55001'],
    industryServices: [
      'Solar & Wind EPC Contractor EHS Audits',
      'DC High-Voltage & Inverter Safety Assessments',
      'Wind Turbine Work-at-Height & Rescue Audits',
      'BESS Fire & Thermal Safety Assessments',
      'ESG & GHG Accounting Readiness (ISO 14064)',
    ],
    legalCompliance: [
      'Electricity Act, 2003 & CEA Grid Connectivity / Safety Regulations',
      'BOCW & State Labour Rules during Solar/Wind Construction',
      'E-Waste & Solar Module / Battery Waste Rules',
      'Environmental & Land/Biodiversity Clearance Conditions',
    ],
    keyRisks: [
      '1500V DC arc-flash hazards during PV string commissioning & O&M',
      'Wind nacelle work-at-height, crane lifts & remote rescue delays',
      'Heat stress, snakebite & remote-site emergency medical access',
      'BESS container thermal runaway & hydrogen electrolyzer leaks',
    ],
    sampleChecklistFocus: [
      'DC isolation LOTO, thermal imaging & insulated tool inspections',
      'Wind turbine fall-arrest certification & nacelle rescue kits',
      'Remote site heat-stress hydration, ambulance & trauma response',
      'Solar panel waste & battery end-of-life tracking logs',
    ],
    aiDocumentGeneration: [
      'Utility Solar 1500V DC Commissioning HIRA (DRAFT – REVIEW REQUIRED)',
      'Wind Turbine Nacelle Rescue & Height SOP',
      'ISO 14064 Renewable Carbon Offset Data Pack',
    ],
    esgFocus: [
      'Avoided-emissions ISO 14064 documentation, land biodiversity & circular PV recycling',
    ],
    recommendedModules: [
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
  },
  {
    id: 'logistics-warehousing',
    name: 'Logistics & Warehousing',
    group: 'Commerce, Logistics & Services',
    sectorTag: 'Fulfillment Centers, Cold Storage & Fleet Hubs',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'High-bay pallet racking safety, MHE/forklift segregation, loading dock controls, hazmat transport readiness, and ISO 9001/45001/22301 audits.',
    subSectors: [
      'E-Commerce Fulfillment Centers',
      '3PL & Multi-Client Warehouses',
      'Temperature-Controlled Cold Storage',
      'Freight Forwarding & Fleet Yards',
      'Dangerous Goods Warehousing',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 9001', 'ISO 22301', 'ISO 22000', 'ISO 14064'],
    industryServices: [
      'Warehouse Racking & MHE Safety Audits',
      'Fire Sprinkler & High-Piled Storage Assessments',
      'Loading Dock & Yard Traffic Safety Audits',
      'Fleet & Contractor Transport Safety Audits',
      'Cold-Chain & Scope 3 Logistics GHG Readiness',
    ],
    legalCompliance: [
      'State Fire Services Warehouse & High-Piled Storage Norms',
      'Motor Vehicles Act & Hazardous Goods Transport Rules (TREM Cards)',
      'Shops & Commercial Establishments / OSH Rules',
      'Battery Waste Rules (MHE Charging Bays) & FSSAI Cold Storage',
    ],
    keyRisks: [
      'Pallet racking upright damage & unposted load limits',
      'Forklift-pedestrian blind-aisle collisions & trailer creep at docks',
      'MHE battery charging hydrogen build-up & lithium fire hazards',
      'High-piled cartons obstructing fire sprinklers & exits',
    ],
    sampleChecklistFocus: [
      'Rack upright protectors, floor anchors & SWL load notices',
      'Forklift daily pre-use checklists & operator certification',
      'Wheel chocks, dock locks & driver waiting zone compliance',
      'Minimum 450mm sprinkler clearance & battery bay eyewash/ventilation',
    ],
    aiDocumentGeneration: [
      'Warehouse MHE & Racking Safety HIRA (DRAFT – REVIEW REQUIRED)',
      'Loading Dock & Yard Traffic Control SOP',
      'Hazmat Road Transport Emergency TREM Checklist',
    ],
    esgFocus: [
      'Fleet fuel efficiency, EV last-mile transition & ISO 14064 Scope 1/3 freight emissions',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
  },
  {
    id: 'mining-metals',
    name: 'Mining & Metals',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Surface Mining, Beneficiation & Smelting',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Heavy mobile equipment safety, slope/dust controls, smelting EHS, contractor audits, environmental compliance, and ISO 45001/14001/55001.',
    subSectors: [
      'Open-Cast & Surface Mining',
      'Mineral Beneficiation & Crushing',
      'Non-Ferrous Smelting & Refining',
      'Haul Roads & Heavy Earthmoving (HEMM)',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 55001', 'ISO 31000', 'ISO 14064'],
    industryServices: [
      'HEMM & Haul Road Safety Assessments',
      'Dust, Silica & Occupational Health Audits',
      'Tailings & Environmental Compliance Reviews',
      'Contractor & Blasting Safety Readiness Reviews',
      'ISO 45001 / ISO 14001 Gap Analysis',
    ],
    legalCompliance: [
      'Mines Safety Frameworks & DGMS Guidelines (Advisory Alignment — Verify Official Portal)',
      'Environment Protection Act, Air/Water & Forest Clearance Conditions',
      'Explosives & Hazardous Waste Management Rules',
      'OSHWC Transitional & Occupational Health Screening Provisions',
    ],
    keyRisks: [
      'HEMM collisions, haul road edge failures & blind-spot runovers',
      'Respirable silica/mineral dust & high-decibel noise exposure',
      'Molten metal splash, conveyor entanglement & slope instability',
      'Mine dewatering runoff & tailings impoundment integrity',
    ],
    sampleChecklistFocus: [
      'Haul road berm heights, signage & HEMM proximity/brake checks',
      'Crusher conveyor emergency pull-cords & guarding integrity',
      'Water sprinkling dust suppression & ambient PM10/PM2.5 logs',
      'Occupational lung-function / audiometry health surveillance records',
    ],
    aiDocumentGeneration: [
      'HEMM Haul Road & Crusher HIRA (DRAFT – REVIEW REQUIRED)',
      'Conveyor LOTO & Maintenance Isolation SOP',
      'Environmental Dust & Runoff Monitoring Plan',
    ],
    esgFocus: [
      'Land reclamation tracking, water recycling & community/ESG disclosure readiness',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
    ],
  },
  {
    id: 'cement',
    name: 'Cement Industry',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Clinker Kilns, Grinding Units & Dispatch',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Kiln & pre-heater thermal safety, silo confined-space audits, dust/CEMS environmental compliance, and ISO 14001/45001/50001/14064.',
    subSectors: [
      'Integrated Clinker & Kiln Plants',
      'Split Grinding Units',
      'Waste Heat Recovery (WHRS) & AFR Co-Processing',
      'Bulk Cement Terminals & Packing Plants',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 14064'],
    industryServices: [
      'Kiln, Pre-Heater & Silo Confined Space Audits',
      'Conveyor, Crusher & Packing Plant EHS Audits',
      'AFR Co-Processing & Hazardous Waste Compliance',
      'Energy Management (ISO 50001) & Carbon Readiness',
      'Contractor Shutdown Safety Audits',
    ],
    legalCompliance: [
      'Environment Protection Act (Cement Kiln Emission & CEMS Standards)',
      'Hazardous Waste Co-Processing Guidelines (CPCB/SPCB)',
      'State Factories Rules & Electrical Safety Regulations',
      'OSHWC & Silicosis / Dust Occupational Health Monitoring',
    ],
    keyRisks: [
      'Hot meal burns during pre-heater cyclone jam clearing',
      'Silo engulfment & confined space fatalities',
      'Long belt conveyor entanglement & shutdown contractor falls',
      'Fugitive cement dust & alternative fuel (AFR) fire hazards',
    ],
    sampleChecklistFocus: [
      'Aluminized heat-resistant PPE & PTW for cyclone poke-hole clearing',
      'Silo entry lockouts, harness retrieval & gas testing logs',
      'Baghouse differential pressure & CEMS stack monitoring logs',
      'AFR storage fire detection, bunding & manifest compliance',
    ],
    aiDocumentGeneration: [
      'Kiln Shutdown & Cyclone Clearing HIRA (DRAFT – REVIEW REQUIRED)',
      'Cement Silo Confined Space Entry SOP',
      'ISO 14064 Clinker Process Emissions Readiness Pack',
    ],
    esgFocus: [
      'Clinker-to-cement ratio reduction, WHRS efficiency & AFR thermal substitution KPIs',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
  },
  {
    id: 'steel',
    name: 'Steel Industry',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Integrated Steelworks, Rolling Mills & Melt Shops',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'Molten metal safety, CO/blast furnace gas controls, EOT crane audits, rolling mill LOTO, and ISO 45001/14001/50001/14064 readiness.',
    subSectors: [
      'Blast Furnace & DRI / Sponge Iron',
      'Electric Arc & Induction Melt Shops',
      'Hot & Cold Rolling Mills',
      'Galvanizing, Coating & Tube Mills',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 14064'],
    industryServices: [
      'Melt Shop & Molten Metal Safety Audits',
      'CO / Toxic Gas Detection & Emergency Audits',
      'Heavy EOT Crane & Lifting Gear Audits',
      'Rolling Mill LOTO & Guarding Assessments',
      'CBAM / ISO 14064 Carbon Accounting Readiness',
    ],
    legalCompliance: [
      'State Factories Rules (Hazardous Iron & Steel Processes)',
      'Air/Water/Slag Environmental & CEMS Compliance Norms',
      'Gas Cylinders & Industrial Pipeline Safety Regulations',
      'Electricity Act & High-Current Furnace Safety Rules',
    ],
    keyRisks: [
      'Molten metal splash, ladle breakout & moisture steam explosions',
      'Carbon monoxide (CO) gas poisoning near furnaces & scrubbers',
      'Heavy hot-metal EOT crane wire-rope & limit-switch failures',
      'Rolling mill cobble hazards & extreme heat stress',
    ],
    sampleChecklistFocus: [
      'Personal CO monitors, fixed gas alarms & SCBA rescue cabinets',
      'Scrap moisture screening prior to furnace charging',
      'Hot-metal EOT crane overload limiters & NDT hook certificates',
      'Aluminized molten-metal PPE & heat-stress rest controls',
    ],
    aiDocumentGeneration: [
      'Melt Shop Molten Metal & Ladle Handling HIRA (DRAFT – REVIEW REQUIRED)',
      'CO Gas Leak Emergency Response SOP',
      'Rolling Mill Maintenance Zero-Energy LOTO Procedure',
    ],
    esgFocus: [
      'Steel decarbonization metrics, ISO 14064 product carbon footprint & slag utilization',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
    ],
  },
  {
    id: 'electronics-electrical',
    name: 'Electronics & Electrical',
    group: 'High-Tech & Digital',
    sectorTag: 'EMS, PCB Assembly, Switchgear & Appliances',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription:
      'SMT/PCB soldering fume & chemical safety, ESD/electrical testing safety, RoHS/e-waste compliance, and ISO 9001/14001/45001/27001.',
    subSectors: [
      'Electronics Manufacturing Services (EMS)',
      'PCB Fabrication & SMT Assembly',
      'Switchgear, Transformers & Cables',
      'Consumer & Industrial Electronics',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 50001'],
    industryServices: [
      'Electrical Test-Bay & High-Pot Safety Audits',
      'SMT Chemical, Flux & Lead-Fume Hygiene Reviews',
      'E-Waste & Hazardous Chemical Compliance Audits',
      'ISO 9001 / 14001 / 45001 Gap Analysis',
      'Supplier Quality & Social Compliance Audits',
    ],
    legalCompliance: [
      'E-Waste (Management) Rules, 2022 & RoHS Provisions',
      'Electricity Act, 2003 & Test-Bay Safety Standards',
      'Hazardous Waste Rules (Etching Acids, Solder Dross)',
      'Applicable State Factories & Labour Welfare Rules',
    ],
    keyRisks: [
      'High-voltage dielectric/hi-pot test bay electrocution',
      'Solder/flux inhalation, IPA solvent fire & PCB etching acids',
      'ESD grounding failures & fine assembly ergonomics',
      'Improper disposal of e-waste & solder dross',
    ],
    sampleChecklistFocus: [
      'Hi-pot test bay interlocks, warning beacons & insulated mats',
      'Local exhaust ventilation (LEV) capture at wave/reflow soldering',
      'Flammable IPA cabinet earthing & secondary chemical containment',
      'Authorized e-waste & hazardous dross recycler manifests',
    ],
    aiDocumentGeneration: [
      'High-Voltage Test Bay Safety SOP (DRAFT – REVIEW REQUIRED)',
      'SMT Line Chemical & Ergonomics HIRA',
      'E-Waste & RoHS Compliance Register',
    ],
    esgFocus: [
      'Circular electronics recycling, RoHS compliance & Scope 3 supply chain ESG',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
    ],
  },
  {
    id: 'textile-garments',
    name: 'Textile & Garments',
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Spinning, Weaving, Dyeing & Apparel Exports',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'Fire & egress safety, boiler/dye-house chemical controls, ZLD effluent compliance, social compliance audits, and ISO 9001/14001/45001.',
    subSectors: [
      'Spinning & Ginning Mills',
      'Weaving & Knitting Units',
      'Wet Processing, Dyeing & Finishing',
      'Export Garment & Apparel Factories',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001'],
    industryServices: [
      'Fire & Life Safety Egress Audits (Apparel Floors)',
      'Social Compliance & Worker Welfare Audits',
      'Dye-House Chemical & ZLD Environmental Audits',
      'Boiler, Thermic Fluid Heater & Electrical Audits',
      'Needle Guarding & Machine Safety Assessments',
    ],
    legalCompliance: [
      'State Factories Rules, Minimum Wages & Working Hours Compliance',
      'Water Act / SPCB Zero Liquid Discharge (Dyeing Units)',
      'State Fire Services NOC & Unobstructed Egress Compliance',
      'POSH Act, 2013 & Maternity/Welfare Statutory Registers',
    ],
    keyRisks: [
      'Cotton lint dust fire propagation & obstructed sewing-floor exits',
      'Dyeing/bleaching corrosive chemicals & ZLD effluent non-compliance',
      'Thermic fluid heater & steam boiler pressure hazards',
      'Social compliance, overtime & worker welfare audit findings',
    ],
    sampleChecklistFocus: [
      'Unlocked panic-bar exits, marked aisles & lint housekeeping',
      'Boiler/TFH safety valve calibration & hot-pipe insulation',
      'Dye chemical storage bunding, PPE & ZLD daily logs',
      'Needle guards, electrical panel clearance & worker welfare registers',
    ],
    aiDocumentGeneration: [
      'Apparel Floor Fire & Evacuation Plan (DRAFT – REVIEW REQUIRED)',
      'Dye-House Chemical Handling & Spill SOP',
      'Social Compliance & Worker Welfare Pre-Audit Checklist',
    ],
    esgFocus: [
      'Water stewardship (ZLD), chemical management & ethical supply chain transparency',
    ],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  },
  {
    id: 'aviation-aerospace',
    name: 'Aviation & Aerospace',
    group: 'High-Tech & Digital',
    sectorTag: 'MRO Hangars, Aerostructures & Ground Support',
    image: SECTOR_IMAGES.semiconductor,
    shortDescription:
      'MRO hangar fire & height safety, composite/chemical hygiene, precision quality readiness, and ISO 9001/14001/45001/27001/22301.',
    subSectors: [
      'Aircraft MRO & Maintenance Hangars',
      'Aerostructures & Precision Machining',
      'Composites & Surface Coating Shops',
      'Airport Ground Support & Fueling',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 22301', 'ISO 17025'],
    industryServices: [
      'MRO Hangar EHS & Fall-Protection Audits',
      'Fire Suppression & Aviation Fuel Safety Reviews',
      'Composite Dust, Hex-Chrome & Solvent Hygiene Audits',
      'ISO 9001 / Quality System Gap Assessments',
      'Calibration Lab Readiness (ISO 17025 Advisory)',
    ],
    legalCompliance: [
      'Applicable Factories / OSH Safety & Fire Services Regulations',
      'Hazardous Waste & Air Emissions (Paint/Plating Shops)',
      'Aviation Ground Safety Guidelines (Verify DGCA/AAI Official Sources)',
      'Electricity Act & Static Grounding Standards',
    ],
    keyRisks: [
      'Work-at-height on aircraft docks & fuselage scaffolding',
      'Hangar foam deluge fire suppression & aviation fuel vapour ignition',
      'Composite carbon-fiber dust, chromates & isocyanate coatings',
      'Foreign Object Debris (FOD) & tool control lapses',
    ],
    sampleChecklistFocus: [
      'Aircraft docking fall-protection rails & overhead lifeline certification',
      'Hangar fire suppression inspection & aircraft static earthing logs',
      'Paint booth RPE air-line quality & hazardous waste manifests',
      'Calibration traceability & FOD inspection logs',
    ],
    aiDocumentGeneration: [
      'MRO Hangar Work-at-Height & Docking HIRA (DRAFT – REVIEW REQUIRED)',
      'Composite Machining & Coating Hygiene SOP',
      'Hangar Emergency & Fuel Spill Response Plan',
    ],
    esgFocus: [
      'Hangar energy efficiency, hazardous coating reduction & Scope 1/2/3 aviation tracking',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
    ],
  },
  {
    id: 'ports-marine',
    name: 'Ports & Marine',
    group: 'Energy & Infrastructure',
    sectorTag: 'Container Terminals, Bulk Berths & Shipyards',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Quay crane & stevedoring safety, IMDG hazardous cargo audits, marine spill readiness, contractor EHS, and ISO 45001/14001/22301/55001.',
    subSectors: [
      'Container & Bulk Cargo Terminals',
      'Liquid & Chemical Jetty Berths',
      'Shipbuilding & Dry-Dock Repair Yards',
      'Inland Container Depots (ICDs)',
    ],
    applicableIsoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 22301', 'ISO 55001'],
    industryServices: [
      'Terminal Crane, Yard Traffic & Stevedoring Audits',
      'Hazardous Cargo (IMDG) Storage Safety Reviews',
      'Marine Oil/Chemical Spill Preparedness Audits',
      'Dry-Dock Confined Space & Hot Work Audits',
      'ISO 45001 & ISO 14001 Port Readiness Reviews',
    ],
    legalCompliance: [
      'Dock Workers (Safety, Health & Welfare) Framework (Verify Official Portal)',
      'Coastal Regulation Zone (CRZ) & Marine Pollution Control Norms',
      'Hazardous Waste & MSIHC Terminal Safety Provisions',
      'Fire Services & Electrical Safety Regulations',
    ],
    keyRisks: [
      'Quay/RTG crane operations, dropped containers & terminal traffic',
      'Drowning, berth edge falls & night-shift visibility hazards',
      'IMDG dangerous goods container leaks & jetty fires',
      'Shipyard hull confined space entry & hot-work explosions',
    ],
    sampleChecklistFocus: [
      'Quay/RTG crane load testing, wind alarms & pedestrian exclusion zones',
      'Life-buoys, berth ladders & waterside PFD compliance',
      'IMDG segregation distances & oil spill containment booms',
      'Dry-dock hot work & tank gas-free certificates',
    ],
    aiDocumentGeneration: [
      'Container Yard & Berth Operations HIRA (DRAFT – REVIEW REQUIRED)',
      'Marine Oil & Chemical Spill Emergency SOP',
      'Dry-Dock Confined Space & Hot Work Checklist',
    ],
    esgFocus: [
      'Shore-power electrification, marine biodiversity protection & port GHG inventory',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
  },
  {
    id: 'education-institutions',
    name: 'Education & Institutions',
    group: 'Commerce, Logistics & Services',
    sectorTag: 'Universities, Schools, Labs & Campuses',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription:
      'Campus fire & evacuation readiness, laboratory chemical safety, hostel food hygiene, transport safety, and ISO 9001/14001/45001/27001.',
    subSectors: [
      'Universities & Research Campuses',
      'K-12 Schools & Boarding Institutions',
      'Engineering & Science Teaching Labs',
      'Campus Hostels & Dining Facilities',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 27001', 'ISO 22000'],
    industryServices: [
      'Campus Fire & Life Safety Evacuation Audits',
      'Academic Laboratory Chemical & Electrical Audits',
      'Hostel Mess & Canteen Food Hygiene Audits',
      'School Bus & Campus Traffic Safety Reviews',
      'ISO 9001 & Green Campus Environmental Audits',
    ],
    legalCompliance: [
      'State Fire Services Educational Building Safety & NBC Part 4',
      'FSSAI Hostel Mess & Canteen Hygiene Norms',
      'POSH Act, 2013 & Institutional Safety Guidelines',
      'E-Waste, STP & Laboratory Chemical Waste Disposal Rules',
    ],
    keyRisks: [
      'High-occupancy classroom/hostel evacuation bottlenecks',
      'Unlabeled reagents & fume-hood lapses in academic labs',
      'Hostel kitchen foodborne illness & LPG bank leaks',
      'Electrical switchboard & student transport safety gaps',
    ],
    sampleChecklistFocus: [
      'Classroom/hostel exit clearance, fire drills & extinguisher readiness',
      'Academic lab chemical inventory, eyewash & PPE availability',
      'Hostel kitchen temperature logs, potable water & pest control',
      'Campus electrical panel guarding & bus safety inspection logs',
    ],
    aiDocumentGeneration: [
      'Campus Fire & Emergency Evacuation Plan (DRAFT – REVIEW REQUIRED)',
      'Academic Science Lab Safety SOP & Checklist',
      'Hostel Canteen Hygiene Inspection Pack',
    ],
    esgFocus: [
      'Green campus solar/water conservation, zero-waste composting & sustainability reporting',
    ],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
  },
  {
    id: 'hospitality-hotels',
    name: 'Hospitality & Hotels',
    group: 'Commerce, Logistics & Services',
    sectorTag: 'Hotels, Resorts, Convention Centers & Catering',
    image: SECTOR_IMAGES.pharma,
    shortDescription:
      'Commercial kitchen HACCP & food safety, guest fire & life safety, LPG/utility plant EHS, event sustainability, and ISO 22000/20121/14001.',
    subSectors: [
      'Luxury & Business Hotels',
      'Resorts & Leisure Properties',
      'Convention & Event Venues',
      'Commercial Kitchens & Banquets',
    ],
    applicableIsoStandards: ['ISO 22000', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 20121'],
    industryServices: [
      'Commercial Kitchen Food Safety & HACCP Audits',
      'Guest Floor Fire & Life Safety Assessments',
      'LPG Bank, Chiller & Utility Room EHS Audits',
      'Swimming Pool & Housekeeping Chemical Safety',
      'ISO 20121 Event Sustainability & ESG Advisory',
    ],
    legalCompliance: [
      'FSS Act, 2006 & FSSAI Hospitality Hygiene Standards',
      'State Fire Services Hotel NOC & NBC Life Safety Norms',
      'Water/STP, Solid Waste & Plastic Rules',
      'POSH Act, 2013 & Gas Cylinders Safety Rules',
    ],
    keyRisks: [
      'Kitchen exhaust hood grease fires & LPG manifold leaks',
      'Food temperature abuse, allergens & cross-contamination',
      'Guest room smoke detection, sprinklers & egress clarity',
      'Housekeeping chemical mixing & utility plant LOTO',
    ],
    sampleChecklistFocus: [
      'Kitchen hood Ansul/wet-chemical suppression & Class K extinguishers',
      'Walk-in chiller temperatures & color-coded prep surfaces',
      'Guest corridor illuminated exits, smoke detectors & fire doors',
      'LPG bank leak detectors, shutoff valves & STP outlet logs',
    ],
    aiDocumentGeneration: [
      'Commercial Kitchen HACCP & Hygiene SOP (DRAFT – REVIEW REQUIRED)',
      'Hotel Guest Evacuation & Fire Response Plan',
      'ISO 20121 Sustainable Hospitality Checklist',
    ],
    esgFocus: [
      'Single-use plastic elimination, food waste composting & ISO 20121 green events',
    ],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
  },
  {
    id: 'agriculture-agro',
    name: 'Agriculture & Agro Industries',
    group: 'Process & Life Sciences',
    sectorTag: 'Agro-Processing, Seeds, Grain Silos & Cold Chain',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      'Grain dust explosion prevention, silo safety, agro-chemical storage, food traceability, and ISO 22000/9001/14001/45001 assessments.',
    subSectors: [
      'Grain Milling & Silo Storage',
      'Seeds, Fertilizers & Agro-Inputs',
      'Cold Chain & Packhouses',
      'Sugar, Rice & Edible Oil Mills',
    ],
    applicableIsoStandards: ['ISO 22000', 'ISO 9001', 'ISO 14001', 'ISO 45001'],
    industryServices: [
      'Grain Dust & Silo Safety Assessments',
      'Agro-Chemical Storage & Spill Compliance Audits',
      'Food Safety, Traceability & Packhouse Hygiene Audits',
      'Boiler, Conveyor & Machine Guarding Audits',
      'ISO 22000 & ISO 14001 Readiness Assessments',
    ],
    legalCompliance: [
      'FSS Act, 2006 (Edible Agro-Processing Facilities)',
      'Applicable State Factories & Boiler Safety Rules',
      'Air/Water Pollution & Agricultural Waste Norms',
      'Pesticide/Agro-Chemical Storage & Labour Welfare Provisions',
    ],
    keyRisks: [
      'Combustible grain/flour dust explosions & silo engulfment',
      'Pesticide/fumigant phosphine toxicity during grain storage',
      'Unguarded screw conveyors, elevators & threshing machinery',
      'Boiler emissions & wash-water effluent management',
    ],
    sampleChecklistFocus: [
      'Dust extraction, housekeeping & ignition source control in mills',
      'Fumigation gas clearance certificates & warning signage',
      'Screw conveyor covers, interlocks & LOTO compliance',
      'Packhouse cold-chain logs & traceability batch coding',
    ],
    aiDocumentGeneration: [
      'Grain Silo & Combustible Dust HIRA (DRAFT – REVIEW REQUIRED)',
      'Fumigation & Agro-Chemical Handling SOP',
      'Packhouse Food Safety & Traceability Checklist',
    ],
    esgFocus: [
      'Biomass energy recovery, water conservation & sustainable agro supply chains',
    ],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
    ],
  },
  {
    id: 'water-wastewater',
    name: 'Water & Wastewater Treatment',
    group: 'Energy & Infrastructure',
    sectorTag: 'WTP, STP, CETP, ZLD & Desalination Plants',
    image: SECTOR_IMAGES.energy,
    shortDescription:
      'Chlorine/chemical dosing safety, H2S confined space protection, OCEMS/SPCB effluent compliance, and ISO 14001/45001/9001/17025.',
    subSectors: [
      'Municipal & Industrial WTPs',
      'Sewage Treatment Plants (STPs)',
      'Common Effluent & ZLD Facilities (CETP)',
      'Desalination & Water Reuse Plants',
    ],
    applicableIsoStandards: ['ISO 14001', 'ISO 45001', 'ISO 9001', 'ISO 50001', 'ISO 17025'],
    industryServices: [
      'Confined Space & H2S Gas Safety Audits',
      'Chlorine & Coagulant Chemical Dosing Audits',
      'Effluent Discharge & OCEMS Compliance Reviews',
      'Electrical Pump House & LOTO Safety Audits',
      'ISO 14001 & Water Lab ISO 17025 Readiness',
    ],
    legalCompliance: [
      'Water (Prevention and Control of Pollution) Act, 1974',
      'Environment Protection Act & SPCB/CPCB Discharge Standards',
      'Gas Cylinders Rules (Chlorine Tonners) & MSIHC Thresholds',
      'OSHWC Confined Space & Electrical Safety Regulations',
    ],
    keyRisks: [
      'Hydrogen sulfide (H2S) & oxygen-deficiency fatalities in sumps/wet-wells',
      'Chlorine gas tonner leaks & corrosive acid/alkali dosing splashes',
      'Drowning hazards at open aeration basins & clarifiers',
      'Submerged pump electrical faults & effluent consent breaches',
    ],
    sampleChecklistFocus: [
      '4-gas detector calibration, blower ventilation & tripod rescue gear',
      'Chlorine scrubber readiness, leak detectors & SCBA kits',
      'Handrails, life-rings & slip-resistant walkways around tanks',
      'Daily inlet/outlet BOD/COD/TSS logs & sludge disposal manifests',
    ],
    aiDocumentGeneration: [
      'STP/ETP Sump Confined Space & H2S SOP (DRAFT – REVIEW REQUIRED)',
      'Chlorine Dosing Leak Emergency Plan',
      'Effluent & ZLD Compliance Audit Register',
    ],
    esgFocus: [
      'Treated water reuse percentage, pumping energy optimization & sludge valorization',
    ],
    recommendedModules: [
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  },
  {
    id: 'telecom-infrastructure',
    name: 'Telecom & Infrastructure',
    group: 'High-Tech & Digital',
    sectorTag: 'Towers, Fiber Networks, 5G & Switching Centers',
    image: SECTOR_IMAGES.dataCenter,
    shortDescription:
      'Tower climbing & fall-protection audits, RF/electrical & DG safety, contractor EHS governance, and ISO 27001/22301/45001/14001.',
    subSectors: [
      'Telecom Tower Infrastructure (Passive)',
      'Fiber Optic Rollout & Trenching',
      'Core Switching & Edge Network Hubs',
      '5G Small-Cell & Rooftop Installations',
    ],
    applicableIsoStandards: ['ISO 27001', 'ISO 22301', 'ISO 45001', 'ISO 14001', 'ISO 20000-1'],
    industryServices: [
      'Tower Climbing & Work-at-Height Contractor Audits',
      'Switching Center Fire & Electrical Safety Audits',
      'Battery Bank, Solar Hybrid & DG Safety Reviews',
      'ISO 27001 / 22301 Network Resilience Gap Analysis',
      'Multi-Region Field Contractor EHS Scorecards',
    ],
    legalCompliance: [
      'Electricity Act, 2003 & CEA Safety Norms (Power & DG Sets)',
      'BOCW & Contractor Labour Safety Rules for Field Rollouts',
      'E-Waste & Battery Waste Management Rules',
      'EMF / Telecom Site Safety Guidelines (Verify DoT Official Portal)',
    ],
    keyRisks: [
      'Falls from telecom towers & unverified climbing harnesses',
      'Electrical shock near overhead power lines & battery banks',
      'Road safety & lone-worker risks across distributed field sites',
      'Switching center fire & business continuity outages',
    ],
    sampleChecklistFocus: [
      'Certified tower climbing harnesses, lanyards & vertigo medical fitness',
      'RF hazard signage, tower earthing & lightning arrestor continuity',
      'Battery bank ventilation, fire detection & diesel spill trays',
      'Field contractor PTW & fleet defensive driving logs',
    ],
    aiDocumentGeneration: [
      'Telecom Tower Work-at-Height & Rescue SOP (DRAFT – REVIEW REQUIRED)',
      'Field Contractor EHS Pre-Qualification & Audit Pack',
      'Switching Center Business Continuity Readiness Draft',
    ],
    esgFocus: [
      'Diesel-to-solar tower conversion, e-waste recycling & Scope 1/2 network decarbonization',
    ],
    recommendedModules: [
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
    ],
  },
  {
    id: 'biotechnology-research',
    name: 'Biotechnology & Research Laboratories',
    group: 'Process & Life Sciences',
    sectorTag: 'Biologics, BSL Labs, CROs & R&D Centers',
    image: SECTOR_IMAGES.pharma,
    shortDescription:
      'Biosafety & chemical lab EHS audits, bio-medical waste compliance, autoclave/cryogenics safety, and ISO 17025/15189/14001/45001/27001.',
    subSectors: [
      'Biologics & Vaccine Development',
      'Contract Research Organizations (CROs)',
      'Biosafety & Analytical Testing Labs',
      'Genomics & Life-Science Incubators',
    ],
    applicableIsoStandards: ['ISO 17025', 'ISO 15189', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001'],
    industryServices: [
      'Laboratory Biosafety & Chemical Hygiene Audits',
      'ISO 17025 & ISO 15189 Readiness Gap Analysis',
      'Cryogenics (LN2), Autoclave & Fume Hood Audits',
      'Bio-Medical & Lab Chemical Waste Compliance Reviews',
      'R&D Information Security (ISO 27001) Assessments',
    ],
    legalCompliance: [
      'Bio-Medical Waste Management Rules & SPCB Authorization',
      'Hazardous Waste Rules (Lab Solvents & Reagents)',
      'Biosafety Guidelines (Verify DBT / Official Regulatory Portals)',
      'State Fire Services & Lab Electrical Safety Regulations',
    ],
    keyRisks: [
      'Biological agent exposure & biosafety cabinet (BSC) airflow failure',
      'Liquid nitrogen (LN2) oxygen depletion & cryogenic burns',
      'Flammable lab solvents, compressed gas cylinders & autoclave pressure',
      'Improper segregation of infectious vs. chemical lab waste',
    ],
    sampleChecklistFocus: [
      'Annual BSC & fume hood airflow certification stickers',
      'LN2 cryo-room oxygen depletion monitors & alarm testing',
      'Autoclave biological indicator validation & pressure relief checks',
      'Lab chemical compatibility segregation & spill kit readiness',
    ],
    aiDocumentGeneration: [
      'Research Lab Chemical & Cryogenics HIRA (DRAFT – REVIEW REQUIRED)',
      'Biosafety Cabinet & Lab Waste Segregation SOP',
      'ISO 17025 Laboratory Quality Readiness Gap Pack',
    ],
    esgFocus: [
      'Green lab cold-storage energy optimization, solvent reduction & safe bio-waste governance',
    ],
    recommendedModules: [
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
    ],
  },
];

export const ALL_INDUSTRY_BLUEPRINTS: IndustryBlueprint[] = RAW_INDUSTRIES.map(buildBlueprint);

export function createDynamicIndustryBlueprint(input: {
  id: string;
  name: string;
  description?: string;
}): IndustryBlueprint {
  const safeId = input.id || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return buildBlueprint({
    id: safeId,
    name: input.name,
    group: 'Heavy Industrial & Manufacturing',
    sectorTag: 'Custom Configured Industry Sector',
    image: SECTOR_IMAGES.manufacturing,
    shortDescription:
      input.description ||
      `Customized independent auditing, ISO gap analysis, EHS compliance, and AI assurance blueprint configured for ${input.name}.`,
    subSectors: [
      `${input.name} Core Operations`,
      'Utilities & Facility Infrastructure',
      'Warehousing & Supply Chain',
      'Contractor & Maintenance Operations',
    ],
    applicableIsoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001'],
    industryServices: [
      'Third-Party EHS Auditing',
      'ISO Management System Gap Analysis',
      'Legal Compliance Register Mapping',
      'Risk Assessment (HIRA / JSA)',
      'Fire & Life Safety Assessment',
      'CAPA Management',
    ],
    legalCompliance: [
      'Applicable Central & State OSH / Factory Safety Frameworks (Verify Official Portal)',
      'Environmental Consent & Waste Management Regulations',
      'Fire Services NOC & Electrical Safety Regulations',
    ],
    keyRisks: [
      'Operational machinery, electrical & energy isolation hazards',
      'Fire & emergency evacuation readiness gaps',
      'Chemical, environmental & contractor safety exposures',
    ],
    sampleChecklistFocus: [
      'Site EHS operational controls, PTW & LOTO compliance',
      'Fire detection, suppression & unobstructed emergency exits',
      'Statutory register currency & environmental monitoring logs',
    ],
    aiDocumentGeneration: [
      `${input.name} Comprehensive HIRA Draft (DRAFT – REVIEW REQUIRED)`,
      `${input.name} Controlled EHS Standard Operating Procedure`,
      'Emergency Preparedness & Evacuation Plan Draft',
    ],
    esgFocus: [
      'Energy efficiency, waste minimization & ISO 14064 GHG data readiness',
    ],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
  });
}
