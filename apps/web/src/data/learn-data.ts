import {
  BookOpenIcon, HeartPulseIcon, PillIcon,
  FlaskConicalIcon, ClipboardListIcon, MicroscopeIcon,
} from "lucide-react";
import type {
  EduTopic, EduCategory, DrugInteraction, LabRef, EduLevelConfig, EduLevel,
} from "@/models/learn";

export const EDU_TOPICS: EduTopic[] = [
  /* ── PATIENT ──────────────────────────────────────────────────── */
  {
    id: "hba1c-basics", title: "HbA1c: What your number really means",
    category: "Lab Values", categoryIcon: FlaskConicalIcon, categoryColor: "text-blue-600",
    levels: ["patient"], readTime: "3 min",
    summary: "HbA1c (glycated haemoglobin) shows your average blood sugar over the past 2–3 months. Unlike a fasting glucose test that shows a single snapshot, HbA1c gives a long-term picture — making it the gold-standard test for diagnosing and monitoring type 2 diabetes.",
    keyFacts: [
      "Below 5.7% — Normal (no diabetes)",
      "5.7%–6.4% — Pre-diabetes (action needed)",
      "6.5% and above — Diabetes (confirmed on repeat test)",
      "A drop of just 1% (e.g. 8% → 7%) reduces diabetes complications by ~35%",
      "Tested every 3 months if on medication; every 6 months if controlled",
    ],
    source: "https://diabetes.org/tools-support/a1c-calculator",
    sourceLabel: "American Diabetes Association · 2024",
    aiPerspective: "HbA1c is the most reliable long-term marker for glycaemic control. It is not affected by short-term diet changes before the test, unlike fasting glucose. However, it can be falsely low in haemolytic anaemia (shorter red cell lifespan) and falsely high in iron-deficiency anaemia. Always interpret alongside clinical context.",
  },
  {
    id: "iron-anaemia-basics", title: "Iron deficiency anaemia: Signs, causes and what to do",
    category: "Conditions", categoryIcon: HeartPulseIcon, categoryColor: "text-red-500",
    levels: ["patient"], readTime: "4 min",
    summary: "Iron deficiency is the most common nutritional deficiency worldwide. It occurs when your body doesn't have enough iron to produce adequate haemoglobin — the protein in red blood cells that carries oxygen. When Hb falls below 12 g/dL (women) or 13 g/dL (men), it is classified as anaemia.",
    keyFacts: [
      "Common symptoms: fatigue, breathlessness, pale skin, brittle nails, unusual cravings (ice, dirt)",
      "Causes: poor diet, heavy periods, poor absorption (e.g. celiac), chronic blood loss",
      "Diagnosed by CBC + ferritin + serum iron",
      "Treatment: oral iron supplements (ferrous sulfate) + Vitamin C to enhance absorption",
      "Avoid tea, coffee, or dairy within 2 hours of iron dose",
    ],
    source: "https://www.who.int/health-topics/anaemia",
    sourceLabel: "WHO · Global Anaemia Guidelines",
    aiPerspective: "Oral ferrous sulfate (60–120 mg elemental iron/day) is first-line for mild-to-moderate iron deficiency anaemia. Liquid iron has ~40% higher bioavailability than tablets. IV iron (ferric carboxymaltose) is preferred when oral is not tolerated, absorption is impaired (IBD, post-bariatric surgery), or when a rapid response is required pre-surgery. Hb should rise 1–2 g/dL after 4 weeks of adequate treatment.",
  },
  {
    id: "bp-reading", title: "Reading your blood pressure numbers",
    category: "Conditions", categoryIcon: HeartPulseIcon, categoryColor: "text-red-500",
    levels: ["patient"], readTime: "3 min",
    summary: "Blood pressure is recorded as two numbers — systolic (top, when heart beats) over diastolic (bottom, between beats). Both numbers matter. Normal BP is below 120/80 mmHg. High BP (hypertension) usually has no symptoms but greatly increases risk of heart attack and stroke.",
    keyFacts: [
      "Normal: below 120/80 mmHg",
      "Elevated: 120–129 / below 80 mmHg",
      "Stage 1 Hypertension: 130–139 / 80–89 mmHg",
      "Stage 2 Hypertension: 140+ / 90+ mmHg (medication usually needed)",
      "Hypertensive Crisis: above 180/120 mmHg — seek emergency care",
    ],
    source: "https://www.heart.org/en/health-topics/high-blood-pressure",
    sourceLabel: "American Heart Association · 2023",
    aiPerspective: "Amlodipine (a calcium channel blocker) lowers systolic BP by 10–15 mmHg on average. It is particularly effective in Indian patients, who have a higher prevalence of salt-sensitive hypertension. Single morning dosing is preferred for BP control across the 24-hour period. Monitor for ankle oedema, which occurs in ~10% of patients.",
  },
  /* ── ADVANCED ──────────────────────────────────────────────────── */
  {
    id: "metformin-moa", title: "Metformin: Mechanism of action and pharmacokinetics",
    category: "Medications", categoryIcon: PillIcon, categoryColor: "text-emerald-600",
    levels: ["advanced", "clinical"], readTime: "5 min",
    summary: "Metformin (biguanide class) is first-line pharmacotherapy for type 2 diabetes. Its primary mechanism is inhibition of hepatic gluconeogenesis via complex I of the mitochondrial respiratory chain. It also improves peripheral insulin sensitivity and modestly reduces intestinal glucose absorption.",
    keyFacts: [
      "Reduces HbA1c by 1–2% as monotherapy",
      "Does not cause hypoglycaemia when used alone (no insulin secretagogue effect)",
      "Half-life: ~6 hours; renally excreted unchanged",
      "Hold 48 hours before iodinated contrast media if eGFR < 60 mL/min",
      "GI side effects (nausea, diarrhoea) reduce with food or extended-release formulation",
    ],
    source: "https://pubmed.ncbi.nlm.nih.gov/29467083/",
    sourceLabel: "Rena G et al. · Diabetologia 2017 · PMID 29467083",
    aiPerspective: "Metformin remains first-line despite the emergence of GLP-1 agonists and SGLT-2 inhibitors, due to its proven safety record, low cost, and cardiovascular neutrality. The UKPDS 34 trial demonstrated a 39% reduction in MI risk in overweight T2DM patients. Long-term use depletes Vitamin B12 — check B12 every 1–2 years, particularly in patients with peripheral neuropathy.",
  },
  {
    id: "tsh-interpretation", title: "Interpreting TSH: From subclinical to overt thyroid disease",
    category: "Lab Values", categoryIcon: FlaskConicalIcon, categoryColor: "text-blue-600",
    levels: ["advanced"], readTime: "4 min",
    summary: "Thyroid-stimulating hormone (TSH) is the most sensitive marker for thyroid dysfunction. It follows an inverse log-linear relationship with free T4 — a doubling of fT4 reduces TSH by ~10-fold. TSH is therefore abnormal well before fT4 leaves the reference range.",
    keyFacts: [
      "Normal TSH: 0.4–4.5 mIU/L (varies slightly by lab and trimester)",
      "Subclinical hypothyroidism: TSH 4.5–10 with normal fT4 — treat if symptomatic or TPO+",
      "Overt hypothyroidism: TSH > 10 + low fT4 — levothyroxine indicated",
      "Subclinical hyperthyroidism: TSH < 0.1 with normal fT4/fT3",
      "First-trimester pregnancy: TSH target < 2.5 mIU/L",
    ],
    source: "https://www.thyroid.org/professionals/ata-professional-guidelines/",
    sourceLabel: "American Thyroid Association Guidelines · 2023",
    aiPerspective: "The decision to treat subclinical hypothyroidism (TSH 4.5–10) remains debated. Evidence from the TRUST trial showed no symptomatic benefit from levothyroxine in older adults (>65 yr). However, in younger patients, those with positive TPO antibodies, or those with unexplained fatigue and dyslipidaemia, a trial of levothyroxine for 3–6 months is reasonable before reassessment.",
  },
  {
    id: "cbc-interpretation", title: "CBC interpretation: Beyond the normal ranges",
    category: "Lab Values", categoryIcon: FlaskConicalIcon, categoryColor: "text-blue-600",
    levels: ["advanced"], readTime: "5 min",
    summary: "A complete blood count (CBC) measures red blood cells, white blood cells, platelets, and haemoglobin. While reference ranges are useful, clinical interpretation requires looking at the complete picture — cell morphology, indices, and clinical context all matter.",
    keyFacts: [
      "MCV < 70 fL suggests iron deficiency or thalassaemia; MCV > 100 fL suggests B12/folate deficiency",
      "Isolated neutropenia (< 1.5 × 10⁹/L): check medications (e.g. carbimazole, clozapine)",
      "Lymphocytosis in adults > 5 × 10⁹/L: consider CLL, viral infection, pertussis",
      "Thrombocytopenia < 50 × 10⁹/L: bleeding risk increases; < 20 × 10⁹/L: spontaneous bleeding risk",
      "Elevated RDW with low MCV: iron deficiency; elevated RDW with high MCV: B12/folate + iron mix",
    ],
    source: "https://www.ncbi.nlm.nih.gov/books/NBK2263/",
    sourceLabel: "NCBI StatPearls · CBC Interpretation 2024",
    aiPerspective: "Automated CBC analysers flag critical values and abnormal morphology for manual peripheral smear review. Key flags that always warrant a smear: blasts, schistocytes (suspect TTP/HUS), neutrophil hypersegmentation (B12 deficiency), and giant platelets (Bernard-Soulier syndrome). Never treat a number — treat the patient and the complete clinical picture.",
  },
  /* ── CLINICAL ──────────────────────────────────────────────────── */
  {
    id: "metformin-ckd", title: "Metformin in CKD: eGFR-based dose adjustment",
    category: "Guidelines", categoryIcon: ClipboardListIcon, categoryColor: "text-violet-600",
    levels: ["clinical"], readTime: "4 min",
    summary: "Metformin is renally excreted and accumulates in renal impairment, increasing the risk of lactic acidosis. eGFR-based prescribing guidance has been updated to permit metformin use at reduced eGFR thresholds previously considered contraindications, based on better risk stratification data.",
    keyFacts: [
      "eGFR ≥ 45: Continue at full dose; monitor renal function annually",
      "eGFR 30–44: Reduce dose by 50%; monitor every 3–6 months; avoid nephrotoxins",
      "eGFR 15–29: Contraindicated — withhold (MHRA, EMA 2016 guidance)",
      "eGFR < 15 or dialysis: Absolutely contraindicated",
      "Hold 48 hours before IV contrast if eGFR < 60 — restart after checking post-procedure eGFR",
    ],
    source: "https://www.gov.uk/drug-safety-update/metformin-updated-recommendations",
    sourceLabel: "MHRA Drug Safety Update · EMA 2016 Guidance",
    aiPerspective: "Lactic acidosis from metformin is extremely rare (<10 cases/100,000 patient-years) but carries a 50% mortality if it occurs. The key risk factors are not just low eGFR but also acute illness causing dehydration, liver failure, or hypoxia. Patient education on when to temporarily hold metformin (vomiting, diarrhoea, pre-procedure) is as important as the baseline eGFR threshold.",
  },
  {
    id: "drug-interactions-research", title: "Clinically significant drug-drug interactions in primary care",
    category: "Research", categoryIcon: MicroscopeIcon, categoryColor: "text-orange-600",
    levels: ["clinical"], readTime: "6 min",
    summary: "A 2022 systematic review of primary care prescribing across 12 countries found that 7.3% of multi-drug prescriptions contained at least one clinically significant drug-drug interaction (DDI). The most common serious DDIs involved anticoagulants, antihypertensives, and antidiabetics.",
    keyFacts: [
      "CYP3A4 inhibition (e.g. clarithromycin + simvastatin) → myopathy/rhabdomyolysis",
      "ACE inhibitor + K-sparing diuretic → life-threatening hyperkalaemia",
      "Metformin + IV contrast → lactic acidosis risk (hold 48 h peri-procedure)",
      "Warfarin + NSAIDs → major GI bleed risk (additive anticoagulant + mucosal effect)",
      "Amlodipine + simvastatin > 20 mg/day → FDA recommends simvastatin dose cap at 20 mg",
    ],
    source: "https://pubmed.ncbi.nlm.nih.gov/35388784/",
    sourceLabel: "Moura CS et al. · BMJ Open 2022 · PMID 35388784",
    aiPerspective: "Electronic prescribing alert systems catch only ~50% of true DDIs in clinical practice because they are overly sensitive (high false-positive rates). Clinicians frequently override alerts. Decision support tools that stratify by severity and provide clear management options (dose adjust, monitor, avoid) improve adherence to DDI guidance. For polypharmacy patients (≥5 drugs), a structured medication review every 6 months is recommended.",
  },
  {
    id: "glp1-sglt2-comparison", title: "GLP-1 agonists vs SGLT-2 inhibitors: Evidence for second-line T2DM therapy",
    category: "Research", categoryIcon: MicroscopeIcon, categoryColor: "text-orange-600",
    levels: ["clinical"], readTime: "7 min",
    summary: "Following metformin, the choice between GLP-1 receptor agonists (e.g. semaglutide) and SGLT-2 inhibitors (e.g. empagliflozin) for second-line T2DM therapy should be guided by the patient's cardiovascular and renal risk profile, weight goals, and tolerability, per ADA 2024 consensus.",
    keyFacts: [
      "GLP-1 agonists: HbA1c reduction 1–2%; weight loss 5–15%; superior CV mortality benefit in ASCVD",
      "SGLT-2 inhibitors: HbA1c reduction 0.5–1%; weight loss 2–3 kg; superior heart failure and CKD benefit",
      "Both classes reduce MACE (major adverse cardiovascular events) vs placebo",
      "SGLT-2 inhibitors preferred if eGFR > 30 and heart failure or CKD is present",
      "GLP-1 preferred if weight loss is a priority or if GI tolerability of SGLT-2 is an issue",
    ],
    source: "https://diabetesjournals.org/care/article/46/Supplement_1/S140/148057/",
    sourceLabel: "ADA Standards of Care in Diabetes 2024 · Diabetes Care",
    aiPerspective: "The EMPA-REG OUTCOME, LEADER, and SUSTAIN-6 trials collectively established that both classes reduce CV death, but through different mechanisms. SGLT-2 inhibitors act via haemodynamic and metabolic pathways (natriuresis, preload/afterload reduction) and are effective from the first dose. GLP-1 agonists have anti-atherosclerotic effects that take months to emerge. For the typical Indian patient with T2DM, high cardiovascular risk, and CKD, early addition of an SGLT-2 inhibitor after metformin is strongly evidence-based.",
  },
];

export const EDU_CATEGORIES: EduCategory[] = [
  { id: "all",         label: "All Topics",  icon: BookOpenIcon,     color: "text-foreground"  },
  { id: "Conditions",  label: "Conditions",  icon: HeartPulseIcon,   color: "text-red-500"     },
  { id: "Medications", label: "Medications", icon: PillIcon,         color: "text-emerald-600" },
  { id: "Lab Values",  label: "Lab Values",  icon: FlaskConicalIcon, color: "text-blue-600"    },
  { id: "Guidelines",  label: "Guidelines",  icon: ClipboardListIcon,color: "text-violet-600"  },
  { id: "Research",    label: "Research",    icon: MicroscopeIcon,   color: "text-orange-600"  },
];

export const DRUG_INTERACTIONS: Record<string, DrugInteraction> = {
  "metformin+amlodipine":   { severity: "none",     effect: "No clinically significant interaction.", advice: "Continue both as prescribed." },
  "amlodipine+metformin":   { severity: "none",     effect: "No clinically significant interaction.", advice: "Continue both as prescribed." },
  "metformin+alcohol":      { severity: "moderate", effect: "Increased risk of lactic acidosis, especially with heavy or binge drinking.", advice: "Limit alcohol. Avoid completely during illness or dehydration." },
  "alcohol+metformin":      { severity: "moderate", effect: "Increased risk of lactic acidosis, especially with heavy or binge drinking.", advice: "Limit alcohol. Avoid completely during illness or dehydration." },
  "amlodipine+simvastatin": { severity: "moderate", effect: "Amlodipine inhibits CYP3A4, raising simvastatin levels — risk of myopathy.", advice: "Do not exceed simvastatin 20 mg/day. Consider switching to rosuvastatin (not CYP3A4-dependent)." },
  "simvastatin+amlodipine": { severity: "moderate", effect: "Amlodipine inhibits CYP3A4, raising simvastatin levels — risk of myopathy.", advice: "Do not exceed simvastatin 20 mg/day. Consider switching to rosuvastatin." },
  "metformin+contrast":     { severity: "major",    effect: "IV contrast media may cause acute kidney injury, impairing metformin excretion and raising lactic acidosis risk.", advice: "Hold metformin 48 hours before and after iodinated contrast. Resume only after confirming normal eGFR." },
  "contrast+metformin":     { severity: "major",    effect: "IV contrast media may cause acute kidney injury, impairing metformin excretion and raising lactic acidosis risk.", advice: "Hold metformin 48 hours before and after iodinated contrast. Resume only after confirming normal eGFR." },
  "iron+antacid":           { severity: "major",    effect: "Antacids (especially calcium or magnesium-based) drastically reduce oral iron absorption by raising gastric pH.", advice: "Separate iron and antacid doses by at least 2 hours. Take iron on an empty stomach or with Vitamin C." },
  "antacid+iron":           { severity: "major",    effect: "Antacids reduce oral iron absorption.", advice: "Separate iron and antacid doses by at least 2 hours." },
  "metformin+iron":         { severity: "minor",    effect: "No pharmacokinetic interaction. Both are best taken with food for tolerability.", advice: "No dose adjustment needed. Take iron with Vitamin C to maximise absorption." },
  "iron+metformin":         { severity: "minor",    effect: "No pharmacokinetic interaction.", advice: "No dose adjustment needed." },
  "amlodipine+grapefruit":  { severity: "moderate", effect: "Grapefruit juice inhibits CYP3A4 in the gut wall, increasing amlodipine bioavailability by up to 40%.", advice: "Avoid grapefruit juice entirely while on amlodipine." },
  "grapefruit+amlodipine":  { severity: "moderate", effect: "Grapefruit juice inhibits CYP3A4, increasing amlodipine levels.", advice: "Avoid grapefruit juice." },
  "warfarin+aspirin":       { severity: "major",    effect: "Additive anticoagulation + mucosal prostaglandin inhibition dramatically increases GI bleed risk.", advice: "Avoid combination unless clearly indicated (e.g. post-ACS with mechanical valve). Use PPI if concurrent use is essential." },
  "aspirin+warfarin":       { severity: "major",    effect: "Additive anticoagulation + mucosal effect increases major bleed risk.", advice: "Avoid unless clearly indicated. Monitor INR closely and add PPI." },
};

export const LAB_QUICK_REF: LabRef[] = [
  { test: "HbA1c",            normal: "< 5.7%",    prediabetes: "5.7–6.4%",   diabetes: "≥ 6.5%",        unit: "%" },
  { test: "Fasting Glucose",  normal: "70–99",     prediabetes: "100–125",    diabetes: "≥ 126",          unit: "mg/dL" },
  { test: "Haemoglobin (M)",  normal: "13.0–17.5", prediabetes: "11.0–12.9",  diabetes: "< 11.0",         unit: "g/dL" },
  { test: "Haemoglobin (F)",  normal: "12.0–15.5", prediabetes: "10.0–11.9",  diabetes: "< 10.0",         unit: "g/dL" },
  { test: "TSH",              normal: "0.4–4.5",   prediabetes: "4.5–10.0",   diabetes: "< 0.4 or >10",  unit: "mIU/L" },
  { test: "Creatinine (M)",   normal: "0.7–1.3",   prediabetes: "1.3–1.9",    diabetes: "> 2.0",          unit: "mg/dL" },
  { test: "Ferritin (M)",     normal: "20–300",     prediabetes: "10–19",      diabetes: "< 10",           unit: "ng/mL" },
  { test: "Ferritin (F)",     normal: "12–150",     prediabetes: "5–11",       diabetes: "< 5",            unit: "ng/mL" },
];

export const LEVEL_CONFIG: Record<EduLevel, EduLevelConfig> = {
  patient:  { label: "Patient",  desc: "Plain language, evidence-based facts",             color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  advanced: { label: "Advanced", desc: "Medical terminology, lab interpretation",           color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-300"    },
  clinical: { label: "Clinical", desc: "For healthcare professionals — protocols & trials", color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-300"  },
};
