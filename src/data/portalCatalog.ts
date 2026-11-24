import type { ModuleId } from '../types/assurance';

export const OFFICIAL_CONTACT = {
  organization: 'ARSHIEL EHS AI SOLUTIONS',
  brand: 'ARSHIEL ASSURANCE',
  owner: 'Jonathan Thadanki',
  founder: 'Jonathan Thadanki',
  developer: 'Jonathan Thadanki',
  email: 'jonathan.tadanki@gmail.com',
  phones: [
    { display: '+91 9133 661 933', href: 'tel:+919133661933' },
    { display: '+91 81 84 83 40 60', href: 'tel:+918184834060' },
    { display: '+91 81 86 80 88 48', href: 'tel:+918186808848' },
  ],
};

export const HERO_SERVICE_CATEGORIES = [
  'ISO Management System Consultancy',
  'Third-Party EHS Auditing',
  'OSHA-Based Safety Assessment',
  'IOSH-Based Safety Management',
  'NFPA-Based Fire Safety Assessment',
  'Indian Legal Compliance',
  'Food Safety & HACCP Consultancy',
  'Environmental & ESG Assessment',
  'Industrial Risk Management',
  'AI Documentation & Automation',
];

export interface ServiceCardSpec {
  number: string;
  id: ModuleId;
  title: string;
  shortDescription: string;
  authorizationCategory: string;
  deliverables: string[];
  aiCapabilities: string[];
  governanceNote: string;
}

export const DIGITAL_SERVICE_CARDS: ServiceCardSpec[] = [
  {
    number: '01',
    id: 'iso-gap',
    title: 'AI ISO Gap Analysis Engine',
    shortDescription:
      'Clause-wise gap assessment across 12 ISO standards with AI clause guidance, evidence review, automated scoring, and remediation plans.',
    authorizationCategory: 'Category 1 – General Consultancy',
    deliverables: [
      'Clause-by-clause readiness matrix across ISO 9001, 14001, 45001, 50001, 27001, 22000, 22301, 13485, 20000-1, 14064, 31000 & 26000',
      'Automated readiness score calculation & risk classification',
      'Executive Gap Analysis Report in PDF, DOCX, and XLSX formats',
    ],
    aiCapabilities: [
      'Non-authoritative AI clause interpretation tailored to your industry',
      'Targeted audit question generation & missing documentation identification',
      '30/60/90-day remediation roadmap drafting',
    ],
    governanceNote:
      'Independent gap assessment and readiness consultancy only. ARSHIEL ASSURANCE is not an accredited ISO certification body.',
  },
  {
    number: '02',
    id: 'legal-compliance',
    title: 'AI Legal Compliance Engine',
    shortDescription:
      'Dynamic Indian Central, Andhra Pradesh, and Telangana statutory register with official source citations and unverified-rule safeguards.',
    authorizationCategory: 'Category 1 – General Consultancy',
    deliverables: [
      'Jurisdiction-scoped register (India Central, Andhra Pradesh, Telangana & extensible states)',
      '20 legal subject categories covering OSH, Environment, Fire, Electrical, Labour, POSH & Food Safety',
      'Due-date tracking, source URLs, and Excel/PDF compliance gap registers',
    ],
    aiCapabilities: [
      'Industry & establishment legal applicability analysis',
      'Automatic flagging of unverified provisions as UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED',
      'Checklist and corrective action recommendations',
    ],
    governanceNote:
      'Advisory compliance tracking tool. Does not constitute formal legal advice or guarantee freedom from regulatory penalties.',
  },
  {
    number: '03',
    id: 'ehs-audit',
    title: 'AI EHS Audit Engine',
    shortDescription:
      'Multi-industry independent EHS auditing across 25 safety domains with dynamic checklists, photo evidence AI review, and CAPA handoff.',
    authorizationCategory: 'Category 2 – Independent Assessment',
    deliverables: [
      '25 core EHS categories (LOTO, Work at Height, Chemical, Machine, Electrical, PTW, Confined Space, etc.)',
      'Structured Critical / Major / Minor / Observation finding logs with objective evidence',
      'Auditor-verified PDF, DOCX, and XLSX audit reports',
    ],
    aiCapabilities: [
      'Industry-specific dynamic checklist generator',
      'Multimodal image & field-note observation drafter',
      'Automated executive summary generation (human verification mandatory)',
    ],
    governanceNote:
      'Independent non-statutory EHS assessment. Statutory safety audits mandated by law require Government-recognized safety auditors.',
  },
  {
    number: '04',
    id: 'doc-generator',
    title: 'AI Document Generator',
    shortDescription:
      'Generate structured HIRA, HAZID, JSA, JHA, SOP, SWMS, LOTO, ERP, and HACCP drafts under strict version control and human approval gates.',
    authorizationCategory: 'Category 1 – General Consultancy',
    deliverables: [
      '52 controlled templates across Risk Management, Safety, Audit, and Food Safety',
      'Document Number, Revision, Prepared / Reviewed / Approved metadata control',
      'Direct export to PDF, editable DOCX, and Excel control registers',
    ],
    aiCapabilities: [
      'Context-aware drafting based on industry, equipment, site conditions, and hazards',
      'Mandatory DRAFT – REVIEW REQUIRED lock preventing auto-approval of safety documents',
    ],
    governanceNote:
      'All AI-generated documents are drafts requiring technical verification and formal approval by competent personnel before use.',
  },
  {
    number: '05',
    id: 'authorization-control',
    title: 'Legal Authorization Control',
    shortDescription:
      'Core compliance governance engine enforcing Category 1/2/3 eligibility boundaries and blocking unauthorized regulated services.',
    authorizationCategory: 'Mandatory Core Security Control',
    deliverables: [
      'Real-time service classification across Consultancy, Independent Assessment, and Regulated Activities',
      'Automated block on unauthorized publication, quotation, booking, or certificate issuance',
      'Immutable restriction log & Super Administrator verification workflow',
    ],
    aiCapabilities: [
      'AI safety guardrails strictly subordinate to authorization blocks',
      'Transparent external referral guidance for accredited & statutory services',
    ],
    governanceNote:
      'Prevents misrepresentation of consultancy or non-statutory assessments as accredited certification or government inspection.',
  },
  {
    number: '06',
    id: 'food-safety',
    title: 'Food Safety Audit Engine',
    shortDescription:
      'ISO 22000, HACCP, cold chain, allergen control, sanitation, and commercial kitchen hygiene assessments with automated scoring.',
    authorizationCategory: 'Category 2 – Independent Assessment',
    deliverables: [
      'Cold chain, allergen segregation, pest control, personal hygiene & traceability checklists',
      'HACCP Plan drafts & Food Safety CAPA tracking',
      'Non-statutory hygiene assessment reports in PDF/DOCX/XLSX',
    ],
    aiCapabilities: [
      'Food-sector specific hygiene checklist generation',
      'Evidence analysis for cross-contamination and temperature control gaps',
    ],
    governanceNote:
      'Independent food hygiene assessment only. Official food sampling, statutory inspections, and FSSAI licensing are restricted to FSSAI authorities.',
  },
  {
    number: '07',
    id: 'fire-safety',
    title: 'Fire & Life Safety Engine',
    shortDescription:
      'NFPA-based independent fire risk reviews covering fire pumps, egress exits, detection alarms, extinguishers, and electrical fire risk.',
    authorizationCategory: 'Category 2 – Independent Assessment',
    deliverables: [
      'Fire pump room, hydrant/sprinkler, egress exit, hot work & drill evaluation checklists',
      'Prioritized Critical/Major life-safety findings with instant CAPA escalation',
      'Independent Fire Risk Assessment reports',
    ],
    aiCapabilities: [
      'Occupancy-tailored NFPA-aligned assessment question generation',
      'Photo evidence drafting for egress obstructions and fire protection gaps',
    ],
    governanceNote:
      'Independent NFPA-based advisory review. Statutory Fire NOC issuance and government fire inspections remain under State Fire Services.',
  },
  {
    number: '08',
    id: 'environmental',
    title: 'Environmental Compliance Engine',
    shortDescription:
      'ISO 14001/50001 alignment, waste & effluent management reviews, air emissions readiness, and ISO 14064 GHG / ESG gap assessments.',
    authorizationCategory: 'Category 2 – Independent Assessment',
    deliverables: [
      'Hazardous waste, e-waste, ETP/STP, stack monitoring & consent condition checklists',
      'Scope 1 & Scope 2 GHG data readiness and ESG gap reports',
      'Downloadable Excel & PDF environmental audit packs',
    ],
    aiCapabilities: [
      'Industry environmental aspect-impact checklist generation',
      'Evidence review & corrective action recommendations',
    ],
    governanceNote:
      'Independent environmental assessment. Regulated laboratory testing and accredited GHG verification require NABL / accredited bodies.',
  },
  {
    number: '09',
    id: 'contractor-vendor',
    title: 'Contractor & Vendor Audits',
    shortDescription:
      'Third-party contractor EHS onboarding reviews, PTW verification, lifting & rigging audits, and supplier compliance scorecards.',
    authorizationCategory: 'Category 2 – Independent Assessment',
    deliverables: [
      'Contractor safety pre-qualification & field execution scorecards',
      'Hot work, lifting gear, scaffolding & statutory labour compliance checks',
      'Vendor audit closure & CAPA tracking reports',
    ],
    aiCapabilities: [
      'Trade-specific contractor audit checklists (MEP, Civil, Rigging, Logistics)',
      'Automated contractor risk summaries',
    ],
    governanceNote:
      'Independent third-party assessment conducted under client audit mandate.',
  },
  {
    number: '10',
    id: 'capa',
    title: 'CAPA Management Engine',
    shortDescription:
      'Centralized Corrective & Preventive Action lifecycle with 5-Why, Fishbone RCA, closure evidence verification, and overdue escalations.',
    authorizationCategory: 'Category 1 – Management System Tool',
    deliverables: [
      'Direct one-click escalation from any ISO, EHS, Food, Fire, or Environmental finding',
      'Structured 5-Why & Ishikawa Fishbone root-cause capture',
      'Overdue escalation alerts, effectiveness reviews & PDF/XLSX CAPA logs',
    ],
    aiCapabilities: [
      'AI-assisted root-cause structuring and preventive control suggestions via ARSHIEL AI Assistant',
    ],
    governanceNote:
      'Requires designated owner execution and competent auditor verification before final closure.',
  },
];

export interface IndustrySolutionSpec {
  id: string;
  name: string;
  sectorTag: string;
  summary: string;
  keyRisks: string[];
  isoStandards: string[];
  legalFocus: string[];
  recommendedModules: Array<{ label: string; moduleId: ModuleId }>;
  sampleChecklistFocus: string[];
  documentTemplates: string[];
}

export const INDUSTRY_SOLUTIONS: IndustrySolutionSpec[] = [
  {
    id: 'semiconductor',
    name: 'Semiconductor',
    sectorTag: 'Cleanroom & Sub-Fab',
    summary: 'Specialized EHS, chemical delivery, toxic gas monitoring, cleanroom safety, and ISO 45001/14001 readiness for wafer fabs and OSAT facilities.',
    keyRisks: ['HF / corrosive acid handling & manifold changeouts', 'Toxic gas bunker leaks (TGMS interlocks)', 'Sub-fab LOTO & high-voltage tool servicing', 'Ultra-pure water & solvent hazardous waste'],
    isoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 50001', 'ISO 27001'],
    legalFocus: ['OSH Code / State Factories Rules', 'Hazardous & Other Wastes Rules, 2016', 'Gas Cylinders & MSIHC Rules', 'TSPCB / APPCB Consent Conditions', 'CEA Electrical Safety Regulations'],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI Document Generator (HIRA/SOP)', moduleId: 'doc-generator' },
    ],
    sampleChecklistFocus: ['Cleanroom acid/base segregation & 110% bunding', 'TGMS calibration & emergency scrubber readiness', 'Personal serialized LOTO hardware on sub-fab utilities', 'Emergency deluge shower & eyewash 10-second reach'],
    documentTemplates: ['Cleanroom Wet-Bench HIRA', 'Corrosive Chemical Handling SOP', 'Sub-Fab Zero-Energy LOTO Procedure'],
  },
  {
    id: 'data-centers',
    name: 'Data Centers',
    sectorTag: 'Mission-Critical Infrastructure',
    summary: 'NFPA-based fire & life safety reviews, electrical arc-flash safety, DG emissions, ISO 27001/22301/50001 gap assessments for hyperscale & Tier-3/4 facilities.',
    keyRisks: ['HT switchgear arc-flash & UPS battery thermal runaway', 'Fire egress obstruction & clean-agent suppression readiness', 'Diesel generator bulk fuel & stack emissions', 'Business continuity & cooling energy efficiency'],
    isoStandards: ['ISO 27001', 'ISO 22301', 'ISO 50001', 'ISO 45001', 'ISO 14001'],
    legalFocus: ['Electricity Act, 2003 & CEA Safety Regulations', 'Telangana / AP Fire Services NOC Compliance', 'Air Act, 1981 (DG Set Stack & Acoustic Norms)', 'E-Waste (Management) Rules, 2022'],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
    sampleChecklistFocus: ['Fire pump AUTO mode & clean-agent cylinder pressure', 'Unobstructed data hall emergency exits & lighting', 'Switchgear insulating mats & LOTO interlocks', 'Sub-meter calibration & PUE energy tracking'],
    documentTemplates: ['Data Center Fire Risk Assessment', 'Switchgear & Chiller LOTO Procedure', 'Emergency Response & Evacuation Plan'],
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    sectorTag: 'API & Formulations',
    summary: 'Process safety, solvent storage, effluent/ZLD compliance, occupational hygiene, and ISO 9001/14001/45001/13485 gap assessments for pharma plants.',
    keyRisks: ['Flammable solvent handling & static ignition control', 'Potent compound occupational exposure & containment', 'ETP/ZLD effluent discharge & hazardous waste manifests', 'Boiler, pressure vessel & cold-room safety'],
    isoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 13485'],
    legalFocus: ['Environment (Protection) Act, 1986 & Water/Air Acts', 'APPCB / TSPCB CFO & OCEMS Requirements', 'Hazardous Waste Rules (Form 4 & Form 10)', 'MSIHC & Chemical Accidents Rules'],
    recommendedModules: [
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
    sampleChecklistFocus: ['Solvent earthing/bonding & flameproof fittings', 'ETP/ZLD daily outlet parameter verification', 'Hazardous waste shed labeling & TSDF manifests', 'Fume hood face velocity & PPE adherence'],
    documentTemplates: ['Process Chemical Risk Assessment (HAZID)', 'Environmental Aspect & Impact Register', 'Spill Containment & Emergency Response Plan'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    sectorTag: 'Discrete & Heavy Industry',
    summary: 'Machine guarding, LOTO, overhead cranes, noise/ergonomics, contractor control, and integrated ISO 9001/14001/45001 management system consultancy.',
    keyRisks: ['Unguarded rotating shafts, presses & pinch points', 'Forklift-pedestrian interface & overhead crane rigging', 'Hot work, welding fumes & compressed air safety', 'Maintenance LOTO & non-routine breakdown risks'],
    isoStandards: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 50001'],
    legalFocus: ['OSH Code / State Factories Rules', 'Electricity Act & CEA Safety Regulations', 'Air & Water Pollution Control Consent', 'Contract Labour & POSH Compliance'],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
    sampleChecklistFocus: ['Machine interlocks, light curtains & emergency stops', 'Lifting gear inspection tags & safe working loads', 'Pedestrian walkways & forklift speed governance', 'Permit-to-Work for hot work & confined space'],
    documentTemplates: ['Shopfloor Machine Safety HIRA', 'Standard Operating Procedure (SOP)', 'Job Safety Analysis (JSA) Pack'],
  },
  {
    id: 'fmcg',
    name: 'FMCG',
    sectorTag: 'High-Speed Consumer Goods',
    summary: 'High-speed packaging line safety, food/hygiene compliance, warehouse ergonomics, and sustainability readiness for FMCG manufacturing & distribution.',
    keyRisks: ['High-speed conveyor nip points & palletizer interlocks', 'Dust explosion / packaging warehouse fire load', 'Allergen & hygiene controls on consumer lines', 'Manual handling ergonomics & dispatch dock safety'],
    isoStandards: ['ISO 9001', 'ISO 22000', 'ISO 45001', 'ISO 14001'],
    legalFocus: ['FSS Act, 2006 (where food/beverage lines apply)', 'Plastic/Packaging & E-Waste Rules', 'Factories / OSH Safety Rules', 'State PCB & Fire NOC Requirements'],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
    ],
    sampleChecklistFocus: ['Packaging machine interlocks & safe jam clearing', 'Warehouse racking load ratings & sprinkler clearance', 'Line changeover hygiene & foreign body controls', 'Ergonomic palletizing & dock leveler chocks'],
    documentTemplates: ['Packaging Line JSA', 'Ergonomic Risk Assessment', 'Food & Hygiene Sanitation SOP'],
  },
  {
    id: 'construction',
    name: 'Construction',
    sectorTag: 'Civil & EPC Projects',
    summary: 'Work at height, scaffolding, excavation, tower cranes, electrical temporary power, and contractor safety audits for civil and industrial projects.',
    keyRisks: ['Falls from scaffolding, open edges & roof work', 'Excavation collapse & underground utility strikes', 'Heavy lifting, crane stability & rigging failures', 'Temporary site electrical panels & hot work'],
    isoStandards: ['ISO 45001', 'ISO 9001', 'ISO 14001'],
    legalFocus: ['BOCW Act & Applicable State BOCW Rules', 'OSH Code Transitional Provisions', 'Contractor Labour Welfare & Medical Checks', 'Construction Dust & Noise Guidelines'],
    recommendedModules: [
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
    sampleChecklistFocus: ['Scaffold green-tag inspection & guardrail integrity', '100% harness tie-off & lifeline anchorage above 1.8m', 'RCCB/ELCB protection on temporary DB boards', 'Daily Toolbox Talks & Work-at-Height PTW'],
    documentTemplates: ['Construction Safety Plan', 'Safe Work Method Statement (SWMS)', 'Work at Height Procedure'],
  },
  {
    id: 'it-corporate',
    name: 'IT & Corporate',
    sectorTag: 'Campuses & Tech Parks',
    summary: 'ISO 27001/20000-1/22301 readiness, fire evacuation drills, ergonomics, cafeteria food hygiene, POSH compliance, and e-waste governance for campuses.',
    keyRisks: ['High-rise fire evacuation & stairwell accessibility', 'Cafeteria food hygiene & vendor safety', 'Workstation ergonomics & indoor air quality', 'E-waste disposal & information security governance'],
    isoStandards: ['ISO 27001', 'ISO 20000-1', 'ISO 22301', 'ISO 45001', 'ISO 14001'],
    legalFocus: ['POSH Act, 2013 (Internal Committee & Returns)', 'E-Waste (Management) Rules, 2022', 'State Fire Services NOC & Evacuation Drills', 'FSSAI Canteen Hygiene & State Shops/Establishments'],
    recommendedModules: [
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
    sampleChecklistFocus: ['Fire alarm audibility, floor wardens & drill timings', 'POSH notice boards & IC annual return tracking', 'Registered CPCB e-waste recycler manifests', 'Cafeteria cold-chain & vendor medical records'],
    documentTemplates: ['Fire Evacuation Plan', 'Ergonomic Risk Assessment', 'Information Security Gap Readiness Pack'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    sectorTag: 'Hospitals & Diagnostics',
    summary: 'Hospital fire & life safety, medical gas safety, infection hygiene, bio-medical waste compliance readiness, and ISO 9001/13485/45001 assessments.',
    keyRisks: ['Oxygen manifold & medical gas cylinder fire hazards', 'Non-ambulatory patient evacuation & compartmentation', 'Bio-medical waste segregation & sharps safety', 'Kitchen hygiene & electrical UPS continuity'],
    isoStandards: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 13485', 'ISO 22301'],
    legalFocus: ['Bio-Medical Waste Management Rules (Verify Portal)', 'State Fire Services Hospital Safety Norms', 'Gas Cylinders Rules & Electrical Safety', 'POSH Act & Food Safety (Hospital Kitchen)'],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
    ],
    sampleChecklistFocus: ['Medical oxygen storage ventilation & signage', 'ICU/OT fire doors, smoke dampers & evacuation ramps', 'Color-coded bio-medical waste bins & CBWTF logs', 'Patient kitchen temperature & hygiene logs'],
    documentTemplates: ['Hospital Fire & Evacuation Plan', 'Chemical & Disinfectant Handling SOP', 'Emergency Response Plan'],
  },
  {
    id: 'food-processing',
    name: 'Food Processing',
    sectorTag: 'Plants, Cold Chain & Catering',
    summary: 'End-to-end ISO 22000 & HACCP readiness, cold-chain verification, allergen management, sanitation SOPs, and FSSAI Schedule 4 advisory assessments.',
    keyRisks: ['Thermal kill-step & blast-chill CCP deviations', 'Allergen cross-contact & foreign material contamination', 'Ammonia/refrigeration plant safety & cold-room entrapment', 'Pest intrusion & water potability failures'],
    isoStandards: ['ISO 22000', 'ISO 9001', 'ISO 45001', 'ISO 14001'],
    legalFocus: ['Food Safety and Standards Act, 2006 & FSSAI Regulations', 'Water Act (ETP for processing washwater)', 'Factories / OSH Safety (Refrigeration & Boilers)', 'Legal Metrology & Packaging Verification'],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'AI Document Generator (HACCP/SOP)', moduleId: 'doc-generator' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
    ],
    sampleChecklistFocus: ['CCP temperature monitoring & probe calibration', 'Color-coded allergen utensils & sanitation swabs', 'Forward/backward batch traceability & mock recall', 'Cold-room interior release & ammonia gas detectors'],
    documentTemplates: ['HACCP Plan Draft', 'Allergen Control Procedure', 'Cleaning & Sanitation SOP'],
  },
  {
    id: 'chemical',
    name: 'Chemical',
    sectorTag: 'Process & Specialty Chemicals',
    summary: 'Process safety assessments, HAZID/HIRA drafting, MSIHC readiness, hazardous waste audits, emergency preparedness, and ISO 14001/45001 gap reviews.',
    keyRisks: ['Exothermic runaway, toxic release & vapour cloud fire', 'Tank farm bunding, static discharge & confined space entry', 'Incompatible chemical storage & drum handling', 'Effluent toxicity & off-site emergency coordination'],
    isoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 31000'],
    legalFocus: ['MSIHC Rules & Chemical Accidents (EPPR) Rules', 'Public Liability Insurance (PLI) Act', 'Environment Protection Act & Hazardous Waste Rules', 'Petroleum & Explosives / Gas Cylinders Rules'],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI Document Generator (HAZID/HIRA)', moduleId: 'doc-generator' },
      { label: 'AI Legal Compliance Engine', moduleId: 'legal-compliance' },
    ],
    sampleChecklistFocus: ['Tank farm dyke capacity & flame arrestors', 'Confined space gas testing & rescue tripod readiness', 'Updated SDS & GHS labeling across all reactors', 'On-site Emergency Plan & mock drill compliance'],
    documentTemplates: ['HAZID Study Draft', 'Chemical Risk Assessment', 'Confined Space Entry Procedure'],
  },
  {
    id: 'oil-gas',
    name: 'Oil & Gas',
    sectorTag: 'Terminals, Pipelines & Depots',
    summary: 'High-hazard Permit-to-Work, H2S/flammable gas controls, hot work safety, contractor audits, fire protection readiness, and ISO 45001/14001/31000 assessments.',
    keyRisks: ['Hydrocarbon vapour ignition & hazardous area zoning', 'Hot work, line-breaking & SIMOPS conflicts', 'High-pressure piping & storage terminal fire water', 'Contractor workforce competency & emergency response'],
    isoStandards: ['ISO 45001', 'ISO 14001', 'ISO 31000', 'ISO 22301'],
    legalFocus: ['Petroleum & Explosives Safety (PESO) Framework', 'MSIHC & Oil Industry Safety Practices', 'Air/Water/Hazardous Waste Environmental Laws', 'Contract Labour & OSH Frameworks'],
    recommendedModules: [
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
    sampleChecklistFocus: ['Hazardous area Ex-rated electrical equipment check', 'Calibrated 4-gas detectors & hot-work fire watch', 'Fire water reservoir, foam tenders & deluge testing', 'Positive isolation blinds & LOTO logs'],
    documentTemplates: ['Permit to Work (PTW) Procedure', 'Process Risk Assessment', 'Emergency Response Plan'],
  },
  {
    id: 'automotive',
    name: 'Automotive',
    sectorTag: 'OEMs & Tier-1 Suppliers',
    summary: 'Press shop, weld shop, paint booth fire/VOC safety, robotic cell guarding, ergonomic audits, and ISO 9001/14001/45001/50001 gap assessments.',
    keyRisks: ['Robotic cell entry interlocks & hydraulic press safety', 'Paint shop flammable solvents & VOC air emissions', 'Material handling AGVs, tuggers & ergonomics', 'Tier-2 vendor EHS & quality compliance'],
    isoStandards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001'],
    legalFocus: ['State Factories / OSH Safety Rules', 'Air & Hazardous Waste (Paint Sludge) Rules', 'Electricity Act & CEA Safety Regulations', 'Noise & Occupational Health Screening Rules'],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'AI ISO Gap Analysis', moduleId: 'iso-gap' },
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
    ],
    sampleChecklistFocus: ['Robotic perimeter light curtains & trapped-key LOTO', 'Paint booth earthing, ventilation & CO2 flooding checks', 'Paint sludge hazardous waste manifesting', 'Assembly line ergonomic lift-assist compliance'],
    documentTemplates: ['Robotic Cell LOTO Procedure', 'Ergonomic Risk Assessment', 'Vendor EHS Audit Checklist'],
  },
  {
    id: 'warehousing',
    name: 'Warehousing',
    sectorTag: 'Fulfillment & Cold Storage',
    summary: 'High-bay racking safety, MHE/forklift traffic segregation, battery charging fire safety, sprinkler clearance, and warehouse EHS audits.',
    keyRisks: ['Pallet racking collapse & unposted load limits', 'Forklift-pedestrian collisions & blind aisles', 'Lithium/lead-acid battery charging hydrogen & fire risk', 'High-piled storage blocking fire sprinklers & exits'],
    isoStandards: ['ISO 45001', 'ISO 9001', 'ISO 22000 (Cold Storage)', 'ISO 14001'],
    legalFocus: ['State Fire Services Warehouse Norms', 'OSH / Shop & Commercial Establishment Rules', 'Electricity Act & Battery Waste Rules', 'FSSAI Storage Hygiene (Food Warehouses)'],
    recommendedModules: [
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'CAPA Management Engine', moduleId: 'capa' },
    ],
    sampleChecklistFocus: ['Rack upright guards, anchors & SWL signage', 'Forklift daily pre-use checklist & operator licenses', 'Minimum 450mm sprinkler deflector clearance', 'Battery charging ventilation, eyewash & spill kits'],
    documentTemplates: ['Warehouse Safety HIRA', 'Forklift & Material Handling SOP', 'Fire Evacuation Plan'],
  },
  {
    id: 'logistics',
    name: 'Logistics',
    sectorTag: 'Fleet, Hubs & Supply Chain',
    summary: 'Loading dock safety, hazardous cargo transport readiness, driver fatigue & fleet compliance, yard traffic control, and ISO 9001/45001/22301 assessments.',
    keyRisks: ['Loading dock trailer creep & dock leveler falls', 'Securing heavy cargo & hazardous material placarding', 'Yard pedestrian-truck blind spots & night lighting', 'Cold-chain excursion during transit'],
    isoStandards: ['ISO 9001', 'ISO 45001', 'ISO 22301', 'ISO 14064'],
    legalFocus: ['Motor Vehicles / Hazardous Goods Transport Rules', 'Contract Labour & Driver Welfare Norms', 'Fire & Yard Electrical Safety', 'Scope 3 Fleet GHG Data Readiness'],
    recommendedModules: [
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
    ],
    sampleChecklistFocus: ['Wheel chocks, dock locks & driver waiting zones', 'TREM cards & spill kits on chemical transport vehicles', 'Yard one-way traffic marking & hi-vis PPE', 'Fleet fuel & Scope 1/3 emissions logging'],
    documentTemplates: ['Loading Dock JSA', 'Contractor Transport Safety Plan', 'Emergency Spill Response SOP'],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    sectorTag: 'Hotels, Resorts & Catering',
    summary: 'Commercial kitchen food safety, LPG/PNG gas safety, guest fire & life safety, swimming pool & utility EHS audits, and ISO 22000/14001 readiness.',
    keyRisks: ['Commercial kitchen hood grease fires & LPG leaks', 'Food temperature abuse, allergens & cross-contamination', 'Guest room egress signage, smoke detectors & sprinklers', 'Chiller/STP utility plant & chemical housekeeping safety'],
    isoStandards: ['ISO 22000', 'ISO 9001', 'ISO 14001', 'ISO 45001'],
    legalFocus: ['FSS Act, 2006 & FSSAI Hygiene Standards', 'State Fire Services Hotel NOC Requirements', 'Water/STP & Solid Waste Management Rules', 'POSH Act & Gas Cylinder Safety Rules'],
    recommendedModules: [
      { label: 'Food Safety Audit Engine', moduleId: 'food-safety' },
      { label: 'Fire & Life Safety Engine', moduleId: 'fire-safety' },
      { label: 'AI Document Generator', moduleId: 'doc-generator' },
    ],
    sampleChecklistFocus: ['Kitchen hood suppression & Class K/wet-chemical extinguishers', 'Walk-in chiller temperatures & color-coded chopping boards', 'Guest floor smoke detectors & illuminated exit routes', 'LPG bank manifold leak detection & shutoff valves'],
    documentTemplates: ['Commercial Kitchen Food Safety SOP', 'Hotel Fire Evacuation Plan', 'Allergen & Hygiene Training Pack'],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    sectorTag: 'Roads, Rail, Ports & Renewables',
    summary: 'Large-scale EPC safety governance, heavy lifting, public/traffic interface, environmental impact monitoring, and ISO 45001/14001/9001 audits.',
    keyRisks: ['Heavy civil earthworks, bridge girders & crane lifts', 'Work near live traffic, railways & overhead power lines', 'Subcontractor multi-tier safety compliance', 'Dust, noise, dewatering & biodiversity impacts'],
    isoStandards: ['ISO 45001', 'ISO 14001', 'ISO 9001', 'ISO 31000', 'ISO 26000'],
    legalFocus: ['BOCW & OSH Transitional Frameworks', 'Environment Protection Act & SPCB Clearances', 'Electricity Act (Overhead Line Clearances)', 'Contract Labour & Worker Camp Welfare Norms'],
    recommendedModules: [
      { label: 'Contractor & Vendor Audits', moduleId: 'contractor-vendor' },
      { label: 'AI EHS Audit Engine', moduleId: 'ehs-audit' },
      { label: 'Environmental Compliance Engine', moduleId: 'environmental' },
    ],
    sampleChecklistFocus: ['Heavy lift plans, crane ground bearing & outrigger mats', 'Work-zone barricading, signage & flagmen control', 'Overhead power line goalposts & permit clearances', 'Worker camp sanitation, potable water & first-aid'],
    documentTemplates: ['Infrastructure Project EHS Plan', 'Heavy Lifting SWMS', 'Environmental Management Monitoring Checklist'],
  },
];

export interface FreeResourceSpec {
  id: string;
  title: string;
  category: string;
  format: 'XLSX' | 'PDF' | 'DOCX';
  description: string;
  itemsCount: string;
  rows: Record<string, string>[];
}

export const FREE_RESOURCES_CATALOG: FreeResourceSpec[] = [
  {
    id: 'res-ehs-chk',
    title: 'Comprehensive Workplace EHS Inspection Checklist',
    category: 'Free EHS Checklists',
    format: 'XLSX',
    description: 'Ready-to-use multi-category inspection sheet covering LOTO, Electrical, Chemical, Work at Height, Machine Guarding, PPE, and Emergency Readiness.',
    itemsCount: '12 Core Controls',
    rows: [
      { Section: 'Electrical Safety', Checkpoint: 'Insulating rubber mats & 1m clearance in front of HT/LT panels', Criteria: 'IS-certified mat, clear access, updated SLD', Status: 'Pending' },
      { Section: 'LOTO', Checkpoint: 'Serialized personal padlocks & try-out verification used during maintenance', Criteria: 'Zero shared keys, written isolation SOP', Status: 'Pending' },
      { Section: 'Chemical Safety', Checkpoint: 'Secondary bunding (110%) & updated SDS available at point of use', Criteria: 'Incompatible acids/bases segregated', Status: 'Pending' },
      { Section: 'Work at Height', Checkpoint: 'Valid PTW, inspected harness & certified lifeline above 1.8m', Criteria: '100% tie-off & valid inspection tag', Status: 'Pending' },
      { Section: 'Machine Safety', Checkpoint: 'Fixed guards, interlocks & E-stops tested on rotating/pressing machinery', Criteria: 'Zero bypassed interlocks', Status: 'Pending' },
      { Section: 'Emergency', Checkpoint: 'Eyewash, deluge showers, first-aid kits & assembly points unobstructed', Criteria: 'Weekly flush logs current', Status: 'Pending' },
    ],
  },
  {
    id: 'res-iso-self',
    title: 'ISO 9001 / 14001 / 45001 Integrated Self-Assessment Template',
    category: 'ISO Self-Assessment Templates',
    format: 'XLSX',
    description: 'High-level HLS clause self-assessment tracker (Clauses 4 to 10) for internal readiness checks prior to independent gap analysis.',
    itemsCount: 'Clauses 4–10 Matrix',
    rows: [
      { Clause: '4.1 / 4.2', Topic: 'Context & Interested Parties', ExpectedEvidence: 'Context register, stakeholder obligations matrix', Compliance: 'Pending' },
      { Clause: '5.1 / 5.4', Topic: 'Leadership, Policy & Worker Participation', ExpectedEvidence: 'Signed Policy, Safety Committee minutes', Compliance: 'Pending' },
      { Clause: '6.1', Topic: 'Risks, Opportunities, HIRA & Legal Register', ExpectedEvidence: 'HIRA, Aspect-Impact, Legal Compliance Register', Compliance: 'Pending' },
      { Clause: '7.2 / 7.5', Topic: 'Competence, Training & Documented Information', ExpectedEvidence: 'Skill matrix, training logs, master doc list', Compliance: 'Pending' },
      { Clause: '8.1 / 8.2', Topic: 'Operational Controls & Emergency Preparedness', ExpectedEvidence: 'SOPs, PTW, LOTO, mock drill evaluations', Compliance: 'Pending' },
      { Clause: '9.2 / 10.2', Topic: 'Internal Audits, Management Review & CAPA', ExpectedEvidence: 'Audit reports, MRM minutes, verified CAPA log', Compliance: 'Pending' },
    ],
  },
  {
    id: 'res-food-chk',
    title: 'Food Safety & Commercial Kitchen Hygiene Checklist',
    category: 'Food Safety Checklists',
    format: 'XLSX',
    description: 'Practical food hygiene, cold-chain temperature control, allergen segregation, pest control, and sanitation inspection template.',
    itemsCount: '8 Hygiene Domains',
    rows: [
      { Domain: 'Cold Chain', Checkpoint: 'Chillers <= 5°C and Freezers <= -18°C with calibrated logs', Target: 'Continuous verified log', Status: 'Pending' },
      { Domain: 'Allergens', Checkpoint: 'Dedicated color-coded utensils & segregated allergen storage', Target: 'Zero cross-contact', Status: 'Pending' },
      { Domain: 'Personal Hygiene', Checkpoint: 'Valid food handler medical fitness, hairnets & handwash stations', Target: '100% staff compliance', Status: 'Pending' },
      { Domain: 'Sanitation & Pest', Checkpoint: 'Master cleaning schedule & pest trend chart verified', Target: 'Zero pest sighting', Status: 'Pending' },
      { Domain: 'Traceability', Checkpoint: 'FIFO/FEFO date labeling & batch traceability verified', Target: 'Mock recall < 4 hrs', Status: 'Pending' },
    ],
  },
  {
    id: 'res-fire-chk',
    title: 'NFPA-Aligned Fire & Life Safety Inspection Checklist',
    category: 'Fire Safety Checklists',
    format: 'PDF',
    description: 'Monthly and quarterly facility fire readiness sheet covering fire pump room, extinguishers, alarms, exits, and hot work controls.',
    itemsCount: 'Fire & Egress Pack',
    rows: [
      { Area: 'Fire Pump Room', Check: 'Electric, Diesel & Jockey pumps in AUTO mode; diesel tank >= 75%', StandardRef: 'NFPA-Aligned Best Practice' },
      { Area: 'Emergency Exits', Check: 'Unlocked panic bars, illuminated exit signage, completely unobstructed corridors', StandardRef: 'Life Safety Egress' },
      { Area: 'Extinguishers', Check: 'Pressure gauge in green zone, tamper seal intact, monthly inspection tag', StandardRef: 'Portable Fire Equipment' },
      { Area: 'Fire Alarm Panel', Check: 'Zero uncleared trouble/fault alerts; manual call points unobstructed', StandardRef: 'Detection & Alarm' },
      { Area: 'Hot Work', Check: 'Active Hot Work PTW, fire blanket, spark arrestor & 60-min fire watch', StandardRef: 'Hot Work Control' },
    ],
  },
  {
    id: 'res-hira-tpl',
    title: 'HIRA (Hazard Identification & Risk Assessment) Workbook',
    category: 'HIRA Templates',
    format: 'XLSX',
    description: '5x5 Likelihood x Severity risk matrix template incorporating Hierarchy of Controls and Residual Risk tracking.',
    itemsCount: '5x5 Risk Matrix',
    rows: [
      { Activity: 'Chemical Drum Changeout', Hazard: 'Corrosive splash / vapour', Consequence: 'Severe burn / inhalation', ExistingControls: 'PPE, exhaust hood', InitialRisk: 'High (15)', AdditionalControls: 'N2 purge interlock, deluge shower check', ResidualRisk: 'Low (4)' },
      { Activity: 'Chiller Maintenance', Hazard: 'Unexpected energization', Consequence: 'Electrocution / crush', ExistingControls: 'Isolator switch', InitialRisk: 'Critical (20)', AdditionalControls: 'Serialized personal LOTO & live-dead-live test', ResidualRisk: 'Low (4)' },
      { Activity: 'Roof HVAC Servicing', Hazard: 'Fall from height (> 1.8m)', Consequence: 'Fatality / fracture', ExistingControls: 'Warning line', InitialRisk: 'Critical (20)', AdditionalControls: 'Certified lifeline, full harness & WAH PTW', ResidualRisk: 'Medium (6)' },
    ],
  },
  {
    id: 'res-jsa-tpl',
    title: 'Job Safety Analysis (JSA) Field Worksheet',
    category: 'JSA Templates',
    format: 'DOCX',
    description: 'Step-by-step Job Safety Analysis template ready for pre-task briefings and competent supervisor review.',
    itemsCount: 'Editable DOCX',
    rows: [
      { Step: '1. Pre-Task Preparation', Hazards: 'Unfamiliar site hazards, missing permits', Controls: 'Verify active PTW, conduct Toolbox Talk, inspect PPE & tools' },
      { Step: '2. Energy Isolation & Barricading', Hazards: 'Stored energy, unauthorized entry', Controls: 'Apply personal LOTO lock, verify zero energy, barricade perimeter' },
      { Step: '3. Task Execution & Housekeeping', Hazards: 'Pinch points, dropped tools, slips', Controls: 'Use tool lanyards, maintain clean egress, assign spotter' },
    ],
  },
  {
    id: 'res-sop-tpl',
    title: 'Controlled EHS Standard Operating Procedure (SOP) Template',
    category: 'SOP Templates',
    format: 'DOCX',
    description: 'Standardized SOP format with Document Control header, Scope, Roles, Stepwise Controls, Emergency Response, and Approval sign-off.',
    itemsCount: 'Controlled DOCX',
    rows: [
      { Section: 'Document Control', Content: 'Document No, Revision, Issue Date, Prepared By, Reviewed By, Approved By (DRAFT – REVIEW REQUIRED)' },
      { Section: 'Scope & Roles', Content: 'Applicable area, equipment, competent personnel qualifications & PPE matrix' },
      { Section: 'Safe Work Sequence', Content: 'Pre-checks, isolation, operational steps, abnormal/emergency response & sign-off' },
    ],
  },
  {
    id: 'res-capa-trk',
    title: 'CAPA & Root Cause Analysis (5-Why / Fishbone) Tracker',
    category: 'CAPA Trackers',
    format: 'XLSX',
    description: 'Enterprise CAPA tracking spreadsheet linking audit findings, root causes, owners, target dates, verification, and effectiveness review.',
    itemsCount: 'Full CAPA Lifecycle',
    rows: [
      { CAPA_ID: 'CAPA-SAMPLE-01', Severity: 'Critical', Finding: 'Sample: Missing personal LOTO lock', RootCause: 'Onboarding kit gap', CorrectiveAction: 'Issue serialized locks', Owner: 'Utilities Lead', TargetDate: 'YYYY-MM-DD', Status: 'Open' },
      { CAPA_ID: 'CAPA-SAMPLE-02', Severity: 'Major', Finding: 'Sample: Obstructed fire exit', RootCause: 'No staging bay SOP', CorrectiveAction: 'Clear corridor & demarcate floor', Owner: 'Facility Mgr', TargetDate: 'YYYY-MM-DD', Status: 'In Progress' },
    ],
  },
  {
    id: 'res-legal-tpl',
    title: 'Indian Central / AP / Telangana Legal Register Starter',
    category: 'Legal Register Templates',
    format: 'XLSX',
    description: 'Structured statutory compliance register template with Jurisdiction, Official Source, Verification Status, and Due-Date fields.',
    itemsCount: 'India / AP / TS Columns',
    rows: [
      { Act: 'Environment (Protection) Act, 1986', Jurisdiction: 'India (Central)', Authority: 'MoEFCC / CPCB / SPCB', VerificationStatus: 'Verify Official Source', Source: 'https://www.indiacode.nic.in/' },
      { Act: 'Electricity Act, 2003 & CEA Safety Regs', Jurisdiction: 'India (Central)', Authority: 'CEA / State Electrical Inspectorate', VerificationStatus: 'Verify Official Source', Source: 'https://cea.nic.in/' },
      { Act: 'APPCB / TSPCB Consent Conditions', Jurisdiction: 'Andhra Pradesh / Telangana', Authority: 'APPCB / TSPCB', VerificationStatus: 'Verify State Portal', Source: 'https://pcb.ap.gov.in/ | https://tspcb.cgg.gov.in/' },
      { Act: 'OSH Code, 2020 & Transitional State Rules', Jurisdiction: 'Central & State', Authority: 'MoLE / State Factories Dept', VerificationStatus: 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED', Source: 'https://www.indiacode.nic.in/' },
    ],
  },
  {
    id: 'res-audit-sample',
    title: 'Independent Third-Party Audit Report Sample (PDF)',
    category: 'Audit Report Samples',
    format: 'PDF',
    description: 'Illustrative ARSHIEL ASSURANCE independent assessment report format demonstrating executive summary, findings matrix, and mandatory disclaimers.',
    itemsCount: 'Sample Executive PDF',
    rows: [
      { FindingID: 'FND-DEMO-01', Severity: 'Critical', Condition: 'Sample: Shared padlock used during equipment maintenance', Action: 'Deploy individual serialized LOTO locks and group lockbox' },
      { FindingID: 'FND-DEMO-02', Severity: 'Major', Condition: 'Sample: Temporary pallets staged near emergency egress door', Action: 'Remove pallets and enforce daily egress inspection checklist' },
      { FindingID: 'FND-DEMO-03', Severity: 'Minor', Condition: 'Sample: Two torque wrenches awaiting updated calibration sticker', Action: 'Automate 30-day calibration recall reminders' },
    ],
  },
];

export const AI_CAPABILITIES_LIST = [
  {
    title: 'AI-Based ISO Gap Analysis',
    description: 'Interprets management system clauses in plain industry language, recommends targeted questions, and highlights missing documented evidence.',
  },
  {
    title: 'AI Legal Applicability Assessment',
    description: 'Maps Central, Andhra Pradesh, and Telangana frameworks to establishment profiles while flagging any unverified items for official portal review.',
  },
  {
    title: 'AI Audit Checklist Generation',
    description: 'Builds dynamic, domain-specific audit questions with clear criteria, risk levels, and expected objective evidence in seconds.',
  },
  {
    title: 'AI Evidence Review',
    description: 'Analyzes uploaded site photographs and field notes to draft structured findings without fabricating observations.',
  },
  {
    title: 'AI Risk Assessment',
    description: 'Assists specialists in structuring HIRA, HAZID, JSA, chemical, fire, and ergonomic risk matrices aligned to Hierarchy of Controls.',
  },
  {
    title: 'AI Document Generation',
    description: 'Drafts SOPs, SWMS, LOTO procedures, Emergency Plans, and HACCP drafts locked under mandatory DRAFT – REVIEW REQUIRED governance.',
  },
  {
    title: 'AI CAPA Recommendations',
    description: 'Suggests structured 5-Why root-cause inquiries, containment steps, and preventive controls for recurring nonconformities.',
  },
  {
    title: 'AI Compliance Monitoring',
    description: 'Synthesizes audit scores, overdue CAPAs, unverified legal rules, and restricted service blocks into executive summaries.',
  },
];

export const CORE_VALUES = [
  { title: 'Integrity', detail: 'Objective, honest assessment reporting grounded strictly in verifiable evidence.' },
  { title: 'Independence', detail: 'Impartial third-party advisory free from false certification or regulatory claims.' },
  { title: 'Transparency', detail: 'Explicit legal source citations, unverified-law warnings, and clear authorization boundaries.' },
  { title: 'Professional Competence', detail: 'Human technical verification and competent review required for every safety-critical deliverable.' },
  { title: 'Innovation', detail: 'Purpose-built AI workflows accelerating auditing speed without compromising engineering rigor.' },
  { title: 'Continuous Improvement', detail: 'Closed-loop CAPA governance turning audit findings into durable operational resilience.' },
];

export const LEGAL_MODAL_CONTENT: Record<'privacy' | 'terms' | 'disclaimer', { title: string; paragraphs: string[] }> = {
  privacy: {
    title: 'Privacy Policy & Data Governance — ARSHIEL ASSURANCE',
    paragraphs: [
      'ARSHIEL ASSURANCE (operated under ARSHIEL EHS AI SOLUTIONS by Jonathan Thadanki) respects the confidentiality of client organizations, audit findings, evidence records, and user accounts.',
      'All workspace data is transmitted over encrypted HTTPS/TLS connections and isolated per authenticated user and organization via strict Firebase Authentication and Firestore security rules.',
      'Uploaded client documents, audit photographs, and compliance registers are processed exclusively to deliver your requested auditing and documentation workflows and are never used to train external AI models without explicit contractual permission.',
      'For privacy inquiries, data export requests, or deletion support, contact Jonathan Thadanki directly at jonathan.tadanki@gmail.com.',
    ],
  },
  terms: {
    title: 'Terms & Conditions — ARSHIEL ASSURANCE',
    paragraphs: [
      'By accessing ARSHIEL ASSURANCE, you acknowledge that the platform operates strictly as an independent consultancy, auditing support, and compliance management software system.',
      'All AI-assisted gap analyses, checklists, legal applicability outputs, and generated safety documents (HIRA, JSA, SOP, HACCP, ERP) are issued as drafts ("DRAFT – REVIEW REQUIRED") and must be verified and approved by qualified competent personnel before operational deployment.',
      'Category 3 regulated services — including accredited ISO certification, statutory government inspections, accredited laboratory testing, official FSSAI licensing/inspections, and regulated statutory certificates — are blocked from unauthorized delivery under the Legal Authorization Control Engine.',
      'Users remain solely responsible for verifying statutory deadlines and regulatory amendments against official Government portals and seeking qualified legal counsel where required.',
    ],
  },
  disclaimer: {
    title: 'Mandatory Legal Branding & Independence Disclaimer',
    paragraphs: [
      'ARSHIEL ASSURANCE is an independent consultancy and assessment platform. It is not an accredited ISO certification body, government inspection agency, OSHA enforcement authority, IOSH-approved training provider, NFPA-authorized certification organization, or FSSAI licensing authority.',
      'All services are provided within applicable legal requirements and verified professional competence. No accreditation, statutory authorization, government approval, or certification status is implied unless independently verified and legally applicable.',
      'The application does not issue official ISO certificates, statutory inspection certificates, government approvals, accredited verification certificates, or regulatory licences.',
      'The platform does not guarantee legal compliance, regulatory approval, or freedom from penalties.',
    ],
  },
};
