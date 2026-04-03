import type { CommunityFile } from "@/models/community";

/* ═══════════════════════════════════════════════════════════════════
   COMMUNITY FILES — mock data for the Files tab
   Each file has rich metadata, an AI summary, and Q&A threads.
═══════════════════════════════════════════════════════════════════ */

export const COMMUNITY_FILES: CommunityFile[] = [
  {
    id: 1,
    name: "Community Health Guidelines 2026.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Ananya P.",
    uploadedByInitials: "AP",
    uploadedAt: "Mar 28, 2026",
    category: "Guidelines",
    aiSummary:
      "Comprehensive community health guidelines covering preventive care schedules, vaccination timelines for adults and seniors, chronic disease management best practices, and emergency contact protocols. Includes region-specific health facility directories and telemedicine access information.",
    qaCount: 3,
    questions: [
      {
        id: 1,
        question: "Does this cover vaccination schedules for seniors above 65?",
        askedBy: "Meena R.",
        askedByInitials: "MR",
        askedAt: "Mar 29, 2026",
        answer:
          "Yes — Section 3.2 covers the full adult immunisation schedule including Pneumococcal, Influenza (annual), Shingles (Zoster), and Tdap boosters specifically recommended for adults aged 65 and above.",
      },
      {
        id: 2,
        question: "Are the emergency contact numbers region-specific?",
        askedBy: "Suresh K.",
        askedByInitials: "SK",
        askedAt: "Mar 30, 2026",
        answer:
          "Yes. Appendix B lists emergency helplines, nearest government hospitals, and ambulance services organised by state and city for 12 major metros in India.",
      },
      {
        id: 3,
        question: "Is telemedicine guidance included for rural areas?",
        askedBy: "Divya M.",
        askedByInitials: "DM",
        askedAt: "Mar 31, 2026",
        answer:
          "Section 5 covers telemedicine access including low-bandwidth video consultation options, IVRS-based appointment booking, and government-subsidised teleconsultation schemes available in rural districts.",
      },
    ],
  },
  {
    id: 2,
    name: "CBC Report - Kumar - Mar 2026.pdf",
    type: "pdf",
    size: "310 KB",
    uploadedBy: "Kumar",
    uploadedByInitials: "KU",
    uploadedAt: "Mar 25, 2026",
    category: "Lab Report",
    aiSummary:
      "Complete Blood Count (CBC) report showing Haemoglobin at 13.8 g/dL (normal), WBC count 6,200/µL (normal), Platelet count 245,000/µL (normal). All values within reference range. MCV and MCH are normal suggesting no iron or B12 deficiency. ESR slightly elevated at 22 mm/hr which may warrant monitoring.",
    qaCount: 2,
    questions: [
      {
        id: 1,
        question: "Is the slightly elevated ESR something to worry about?",
        askedBy: "Ravi Kumar",
        askedByInitials: "RK",
        askedAt: "Mar 26, 2026",
        answer:
          "An ESR of 22 mm/hr is mildly elevated but non-specific. It can be caused by minor inflammation, stress, or even recent exercise. If it persists across multiple tests or is accompanied by symptoms like joint pain or fatigue, further investigation with CRP and inflammatory markers is recommended.",
      },
      {
        id: 2,
        question: "How does this compare to the December 2025 report?",
        askedBy: "Kumar",
        askedByInitials: "KU",
        askedAt: "Mar 26, 2026",
        answer:
          "Compared to Dec 2025: Haemoglobin improved from 12.9 to 13.8 g/dL (+0.9), WBC stable (6,100 → 6,200), Platelets stable (238K → 245K). ESR was 18 mm/hr previously, now 22 — a minor increase. Overall trend is positive, especially the Hb improvement.",
      },
    ],
  },
  {
    id: 3,
    name: "Diet Plan - Diabetes Management.xlsx",
    type: "xlsx",
    size: "156 KB",
    uploadedBy: "Meena R.",
    uploadedByInitials: "MR",
    uploadedAt: "Mar 22, 2026",
    category: "Nutrition",
    aiSummary:
      "Structured 7-day diabetes-friendly meal plan with glycaemic index values for each food item. Includes calorie counts, macronutrient breakdowns (carbs, protein, fat), and portion sizes. Features South Indian and North Indian variants with seasonal alternatives. Carb intake limited to 130–150g/day as recommended for Type 2 diabetes management.",
    qaCount: 2,
    questions: [
      {
        id: 1,
        question: "Can this be adapted for someone with both diabetes and kidney issues?",
        askedBy: "Rahul V.",
        askedByInitials: "RV",
        askedAt: "Mar 23, 2026",
        answer:
          "This plan would need modifications for CKD patients — primarily reducing protein to 0.6–0.8 g/kg/day and limiting potassium-rich foods. The spreadsheet has a 'Renal-Friendly' sheet (Tab 3) with adjusted portions, but please consult a renal dietitian for personalisation.",
      },
      {
        id: 2,
        question: "Are the GI values sourced from Indian food databases?",
        askedBy: "Ananya P.",
        askedByInitials: "AP",
        askedAt: "Mar 24, 2026",
        answer:
          "Yes — GI values are sourced from the Indian Food Composition Tables (IFCT 2017) published by NIN Hyderabad, supplemented with data from the International Tables of Glycemic Index (2021 edition) for items not covered in IFCT.",
      },
    ],
  },
  {
    id: 4,
    name: "Prescription - Dr. Sharma - Mar 2026.pdf",
    type: "pdf",
    size: "89 KB",
    uploadedBy: "Dr. Sharma's Clinic",
    uploadedByInitials: "DS",
    uploadedAt: "Mar 18, 2026",
    category: "Prescription",
    aiSummary:
      "Prescription issued post follow-up visit on 18 March 2026. Medications: Metformin 500mg BD (continued), Amlodipine 5mg OD (continued), Pantoprazole 40mg OD (new — for GERD symptoms). Duration: 30 days. Follow-up scheduled for 15 April 2026. Notes: Monitor BP weekly, reduce salt intake, report any dizziness or swelling.",
    qaCount: 1,
    questions: [
      {
        id: 1,
        question: "Should Pantoprazole be taken before or after meals?",
        askedBy: "Kumar",
        askedByInitials: "KU",
        askedAt: "Mar 19, 2026",
        answer:
          "Pantoprazole should be taken 30–60 minutes before breakfast on an empty stomach for maximum efficacy. It works by blocking the proton pump before acid production ramps up with eating. Do not crush or chew the tablet.",
      },
    ],
  },
  {
    id: 5,
    name: "Exercise Routine - Post Surgery.docx",
    type: "docx",
    size: "420 KB",
    uploadedBy: "Priya Singh",
    uploadedByInitials: "PS",
    uploadedAt: "Mar 15, 2026",
    category: "Wellness",
    aiSummary:
      "Post-surgical rehabilitation exercise plan spanning 8 weeks. Week 1–2: Gentle range-of-motion exercises and breathing techniques. Week 3–4: Light resistance band exercises with progressive intensity. Week 5–6: Walking program starting at 10 minutes building to 30 minutes. Week 7–8: Full activity restoration with precautions. Includes contraindication warnings and pain threshold guidelines.",
    qaCount: 2,
    questions: [
      {
        id: 1,
        question: "Is swimming allowed during weeks 5-6?",
        askedBy: "Suresh K.",
        askedByInitials: "SK",
        askedAt: "Mar 16, 2026",
        answer:
          "Swimming is generally not recommended until Week 7 at the earliest, and only after wound has fully healed and surgeon has confirmed. Chlorinated water can irritate healing tissue. Walking in a pool (aqua-walking) may be allowed from Week 5 with surgeon approval.",
      },
      {
        id: 2,
        question: "What if there is pain during the resistance exercises?",
        askedBy: "Meena R.",
        askedByInitials: "MR",
        askedAt: "Mar 17, 2026",
        answer:
          "Mild discomfort is expected, but sharp or increasing pain means stop immediately. The document uses a 1–10 pain scale — exercises should be kept at 3 or below. If pain exceeds 4 for more than 2 hours post-exercise, reduce intensity by 50% and consult the physiotherapist.",
      },
    ],
  },
  {
    id: 6,
    name: "Insurance Claim Summary.pdf",
    type: "pdf",
    size: "1.1 MB",
    uploadedBy: "Kumar",
    uploadedByInitials: "KU",
    uploadedAt: "Mar 10, 2026",
    category: "Insurance",
    aiSummary:
      "Summary of health insurance claims filed between Jan–Mar 2026 under policy #HLT-2024-08871. Three claims processed: hospitalisation (₹1,42,000 — approved), pharmacy reimbursement (₹8,450 — approved), diagnostic tests (₹12,300 — under review). Total claimed: ₹1,62,750. Total approved: ₹1,50,450. Remaining annual limit: ₹3,49,550 of ₹5,00,000.",
    qaCount: 1,
    questions: [
      {
        id: 1,
        question: "Why is the diagnostic tests claim still under review?",
        askedBy: "Kumar",
        askedByInitials: "KU",
        askedAt: "Mar 12, 2026",
        answer:
          "The insurer flagged that the MRI scan (₹8,500) requires a pre-authorisation letter that was not included in the submission. The remaining ₹3,800 for blood tests is approved. Upload the pre-auth letter to expedite the MRI reimbursement — typical processing is 5–7 business days after document submission.",
      },
    ],
  },
  {
    id: 7,
    name: "Blood Pressure Log - Feb 2026.xlsx",
    type: "xlsx",
    size: "42 KB",
    uploadedBy: "Priya Singh",
    uploadedByInitials: "PS",
    uploadedAt: "Mar 5, 2026",
    category: "Monitoring",
    aiSummary:
      "Daily blood pressure readings for February 2026 recorded twice daily (morning and evening). Average systolic: 134 mmHg, average diastolic: 86 mmHg. Three readings exceeded 150/95 (Feb 8, 14, 21 — all evening readings). Lowest reading: 122/78 on Feb 16 morning. Trend shows slight improvement in the last week of the month following medication adjustment on Feb 20.",
    qaCount: 2,
    questions: [
      {
        id: 1,
        question: "Are the evening spikes correlated with any specific activity?",
        askedBy: "Kumar",
        askedByInitials: "KU",
        askedAt: "Mar 6, 2026",
        answer:
          "The notes column shows Feb 8 and 14 evening readings were taken after stressful work calls. Feb 21 was after a high-sodium dinner. Evening BP naturally rises due to circadian rhythms, but stress and sodium are known amplifiers. Consider measuring BP 30 minutes after relaxation for more accurate evening baselines.",
      },
      {
        id: 2,
        question: "Did the medication adjustment on Feb 20 help?",
        askedBy: "Meena R.",
        askedByInitials: "MR",
        askedAt: "Mar 7, 2026",
        answer:
          "Yes. Average systolic dropped from 138 mmHg (Feb 1–19) to 128 mmHg (Feb 20–28), and no readings exceeded 145/90 after the adjustment. The Amlodipine dose increase from 5mg to 10mg appears to be effective. Continue monitoring for at least 4 more weeks before the next review.",
      },
    ],
  },
  {
    id: 8,
    name: "Discharge Summary - City Hospital.pdf",
    type: "pdf",
    size: "560 KB",
    uploadedBy: "Dr. Sharma's Clinic",
    uploadedByInitials: "DS",
    uploadedAt: "Feb 28, 2026",
    category: "Hospital",
    aiSummary:
      "Discharge summary from City Hospital following a 3-day admission (Feb 25–28, 2026) for elective minor surgery. Procedure: Laparoscopic cholecystectomy (gallbladder removal). Anaesthesia: General. Post-op recovery: Uneventful. Discharge medications: Paracetamol 500mg SOS, Pantoprazole 40mg OD x 14 days, Amoxicillin-Clavulanate 625mg BD x 5 days. Follow-up: 2 weeks at Dr. Sharma's clinic. Diet: Soft diet for 1 week, then gradual return to normal. Activity: No heavy lifting for 4 weeks.",
    qaCount: 1,
    questions: [
      {
        id: 1,
        question: "When can normal diet be fully resumed?",
        askedBy: "Priya Singh",
        askedByInitials: "PS",
        askedAt: "Mar 1, 2026",
        answer:
          "Soft diet is recommended for the first 7 days post-cholecystectomy. After that, gradually reintroduce foods over 2–3 weeks. Avoid high-fat and fried foods for at least 4 weeks as bile flow adjusts. Most patients return to a fully normal diet by 6–8 weeks post-surgery.",
      },
    ],
  },
];

/* ── File categories for filter chips ──────────────────────────── */

export const FILE_CATEGORIES = [
  "All",
  "Lab Report",
  "Prescription",
  "Guidelines",
  "Nutrition",
  "Wellness",
  "Insurance",
  "Monitoring",
  "Hospital",
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number];

/* ── Invited-group files (smaller sets for each member) ─────── */

export const INVITED_FILES: Record<string, CommunityFile[]> = {
  ravi: [
    {
      id: 101,
      name: "CBC Report - Ravi - Mar 2026.pdf",
      type: "pdf",
      size: "280 KB",
      uploadedBy: "Ravi Kumar",
      uploadedByInitials: "RK",
      uploadedAt: "Mar 20, 2026",
      category: "Lab Report",
      aiSummary:
        "CBC report showing Haemoglobin at 11.2 g/dL (mildly low — reference 13–17 g/dL for males), WBC 5,800/µL (normal), Platelets 210,000/µL (normal). MCV 76 fL (low) and MCH 24 pg (low) suggest iron-deficiency anaemia. Recommendation: iron supplementation and retest in 4 weeks.",
      qaCount: 1,
      questions: [
        {
          id: 1,
          question: "Should Ravi also get a serum ferritin test?",
          askedBy: "Kumar",
          askedByInitials: "KU",
          askedAt: "Mar 21, 2026",
          answer:
            "Yes. Serum ferritin is the most sensitive marker for iron stores. A level below 30 ng/mL confirms iron deficiency even when Hb is only mildly low. It helps distinguish iron-deficiency anaemia from anaemia of chronic disease.",
        },
      ],
    },
    {
      id: 102,
      name: "Thyroid Panel - Ravi - Feb 2026.pdf",
      type: "pdf",
      size: "195 KB",
      uploadedBy: "Ravi Kumar",
      uploadedByInitials: "RK",
      uploadedAt: "Feb 15, 2026",
      category: "Lab Report",
      aiSummary:
        "Thyroid function test results: TSH 3.8 mIU/L (normal: 0.4–4.0), Free T4 1.1 ng/dL (normal: 0.8–1.8), Free T3 2.9 pg/mL (normal: 2.3–4.2). All values within normal reference ranges. No thyroid dysfunction detected at this time.",
      qaCount: 0,
      questions: [],
    },
  ],
  sharma: [
    {
      id: 201,
      name: "Post-Op Report - Mar 2026.pdf",
      type: "pdf",
      size: "430 KB",
      uploadedBy: "Dr. Sharma's Clinic",
      uploadedByInitials: "DS",
      uploadedAt: "Mar 5, 2026",
      category: "Hospital",
      aiSummary:
        "Post-operative assessment 1 week after laparoscopic cholecystectomy. Wound healing: Good, no signs of infection. Vitals: BP 128/82, Temp 36.8°C, HR 76 bpm. Pain: 2/10 at rest. Recommendation: Continue current medications, gradually increase physical activity, follow-up in 1 week.",
      qaCount: 1,
      questions: [
        {
          id: 1,
          question: "Are the sutures dissolvable or do they need removal?",
          askedBy: "Kumar",
          askedByInitials: "KU",
          askedAt: "Mar 6, 2026",
          answer:
            "Laparoscopic cholecystectomy typically uses absorbable sutures internally and Steri-Strips or skin glue externally. These dissolve or fall off within 7–10 days. No suture removal appointment is needed unless specific non-absorbable sutures were used — check the discharge summary for confirmation.",
        },
      ],
    },
  ],
  priya: [
    {
      id: 301,
      name: "Medication Schedule - Kumar.docx",
      type: "docx",
      size: "68 KB",
      uploadedBy: "Priya Singh",
      uploadedByInitials: "PS",
      uploadedAt: "Mar 12, 2026",
      category: "Wellness",
      aiSummary:
        "Detailed medication schedule for Kumar's daily regimen. Morning: Metformin 500mg (with breakfast), Amlodipine 5mg (empty stomach). Evening: Metformin 500mg (with dinner). As needed: Paracetamol 500mg (max 3/day), Pantoprazole 40mg (30 min before breakfast if GERD symptoms). Includes timing notes, food interactions, and refill dates.",
      qaCount: 1,
      questions: [
        {
          id: 1,
          question: "Can Metformin and Amlodipine be taken together?",
          askedBy: "Kumar",
          askedByInitials: "KU",
          askedAt: "Mar 13, 2026",
          answer:
            "Yes, Metformin and Amlodipine can be taken concurrently — there are no known clinically significant interactions. However, Amlodipine is best absorbed on an empty stomach while Metformin should be taken with food to reduce GI side effects, so staggering them by 30 minutes is optimal.",
        },
      ],
    },
    {
      id: 302,
      name: "BP Log - Kumar - Feb 2026.xlsx",
      type: "xlsx",
      size: "42 KB",
      uploadedBy: "Priya Singh",
      uploadedByInitials: "PS",
      uploadedAt: "Mar 5, 2026",
      category: "Monitoring",
      aiSummary:
        "Daily blood pressure readings for February 2026. Average readings: 134/86 mmHg. Three elevated readings noted on evenings of Feb 8, 14, and 21. Trend shows improvement after medication adjustment on Feb 20 — average dropped to 128/82 mmHg for the final week.",
      qaCount: 0,
      questions: [],
    },
  ],
};

/* ── Recent Q&A across all files (for default panel) ────────── */

export interface RecentFileQA {
  fileId: number;
  fileName: string;
  fileCategory: string;
  question: string;
  askedBy: string;
  askedByInitials: string;
  askedAt: string;
  answer: string;
}

export const RECENT_FILE_QA: RecentFileQA[] = [
  {
    fileId: 1,
    fileName: "Community Health Guidelines 2026.pdf",
    fileCategory: "Guidelines",
    question: "Is telemedicine guidance included for rural areas?",
    askedBy: "Divya M.",
    askedByInitials: "DM",
    askedAt: "Mar 31, 2026",
    answer:
      "Section 5 covers telemedicine access including low-bandwidth video consultation options, IVRS-based appointment booking, and government-subsidised teleconsultation schemes available in rural districts.",
  },
  {
    fileId: 2,
    fileName: "CBC Report - Kumar - Mar 2026.pdf",
    fileCategory: "Lab Report",
    question: "Is the slightly elevated ESR something to worry about?",
    askedBy: "Ravi Kumar",
    askedByInitials: "RK",
    askedAt: "Mar 26, 2026",
    answer:
      "An ESR of 22 mm/hr is mildly elevated but non-specific. It can be caused by minor inflammation, stress, or even recent exercise.",
  },
  {
    fileId: 7,
    fileName: "Blood Pressure Log - Feb 2026.xlsx",
    fileCategory: "Monitoring",
    question: "Did the medication adjustment on Feb 20 help?",
    askedBy: "Meena R.",
    askedByInitials: "MR",
    askedAt: "Mar 7, 2026",
    answer:
      "Yes. Average systolic dropped from 138 mmHg (Feb 1–19) to 128 mmHg (Feb 20–28). The Amlodipine dose increase from 5mg to 10mg appears to be effective.",
  },
  {
    fileId: 5,
    fileName: "Exercise Routine - Post Surgery.docx",
    fileCategory: "Wellness",
    question: "Is swimming allowed during weeks 5-6?",
    askedBy: "Suresh K.",
    askedByInitials: "SK",
    askedAt: "Mar 16, 2026",
    answer:
      "Swimming is generally not recommended until Week 7 at the earliest. Aqua-walking may be allowed from Week 5 with surgeon approval.",
  },
  {
    fileId: 4,
    fileName: "Prescription - Dr. Sharma - Mar 2026.pdf",
    fileCategory: "Prescription",
    question: "Should Pantoprazole be taken before or after meals?",
    askedBy: "Kumar",
    askedByInitials: "KU",
    askedAt: "Mar 19, 2026",
    answer:
      "Pantoprazole should be taken 30–60 minutes before breakfast on an empty stomach for maximum efficacy.",
  },
];
