/**
 * Mock data for ArogyaAI conversations.
 *
 * Provides:
 *  - SEED_CONVERSATION  — the initial pre-loaded Q&A shown on first visit
 *  - SUGGESTED_QUESTIONS — quick-tap suggestion chips
 *  - mockAiResponse()   — keyword-based mock response generator
 *
 * Replace with real API calls once the RAG / GPT-4o service is live.
 */

/* ── Message types ─────────────────────────────────────────────── */

export interface UserMessage {
  role: "user";
  text: string;
}

export interface AiMessage {
  role: "ai";
  /** Primary answer text */
  text: string;
  /** Bullet-point list items, shown below `text` */
  list?: string[];
  /** Source/citation badges shown below the list */
  citations?: string[];
  /** Small italic note shown at the bottom of the bubble */
  note?: string;
}

export type ConversationMessage = UserMessage | AiMessage;

/* ── Seed conversation ─────────────────────────────────────────── */

export const SEED_CONVERSATION: ConversationMessage[] = [
  {
    role: "user",
    text: "What medications am I currently on?",
  },
  {
    role: "ai",
    text: "Based on your uploaded records, you are currently on the following medications:",
    list: [
      "Metformin 500 mg — twice daily (morning & evening with meals)",
      "Amlodipine 5 mg — once daily (morning)",
    ],
    citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    note: "Always consult your doctor before making any changes to your medication.",
  },
  {
    role: "user",
    text: "Is my blood sugar improving?",
  },
  {
    role: "ai",
    text: "Your HbA1c trend based on available records shows controlled levels:",
    list: [
      "HbA1c 7.4 % — 01 Mar 2026 (latest)",
      "Target range: below 7.0 % for well-controlled Type 2 Diabetes",
    ],
    citations: [
      "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
      "Prescription · Dr. Suresh Reddy · 10 Mar 2026",
    ],
    note: "Your HbA1c is slightly above target. Your doctor may review Metformin dosage at the next visit.",
  },
];

/* ── Suggested questions ───────────────────────────────────────── */

export const SUGGESTED_QUESTIONS: string[] = [
  "When is my next follow-up?",
  "Do I have any flagged lab values?",
  "What was my last diagnosis?",
  "Summarise my records for a new doctor",
  "What is my latest blood pressure reading?",
  "List all my recent lab reports",
];

/* ── Mock AI response generator ────────────────────────────────── */

/**
 * Returns a canned AiMessage keyed on keywords in the user's query.
 * Swap this with a real `apiFetch("/ai/ask", { method:"POST", body: ... })`
 * call once the backend RAG endpoint is live.
 */
export function mockAiResponse(query: string): AiMessage {
  const q = query.toLowerCase();

  if (q.includes("medication") || q.includes("medicine") || q.includes("drug")) {
    return {
      role: "ai",
      text: "Your current medications based on uploaded records:",
      list: [
        "Metformin 500 mg — twice daily",
        "Amlodipine 5 mg — once daily",
      ],
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    };
  }

  if (
    q.includes("blood sugar") ||
    q.includes("hba1c") ||
    q.includes("sugar") ||
    q.includes("diabetes")
  ) {
    return {
      role: "ai",
      text: "Your latest HbA1c is 7.4 % (01 Mar 2026), which is slightly above the target of <7.0 % for controlled Type 2 Diabetes. Your trend shows improvement over the past 6 months.",
      citations: ["Lab Report · HbA1c & Lipid Profile · 01 Mar 2026"],
    };
  }

  if (q.includes("flag") || q.includes("abnormal") || q.includes("alert")) {
    return {
      role: "ai",
      text: "I found 2 flagged values in your recent records:",
      list: [
        "Haemoglobin 11.2 g/dL (low) — CBC · 15 Mar 2026",
        "HbA1c 7.4 % (above target) — Lab · 01 Mar 2026",
      ],
      citations: [
        "Lab Report · CBC · 15 Mar 2026",
        "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
      ],
      note: "Please discuss these with your doctor at your next visit.",
    };
  }

  if (q.includes("follow") || q.includes("appointment") || q.includes("visit")) {
    return {
      role: "ai",
      text: "Based on your prescription from Dr. Suresh Reddy (10 Mar 2026), a review was recommended in 4 weeks — that would be around 07 April 2026.",
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    };
  }

  if (q.includes("diagnos") || q.includes("condition")) {
    return {
      role: "ai",
      text: "Your records indicate the following active conditions:",
      list: [
        "Type 2 Diabetes Mellitus (managed with Metformin)",
        "Hypertension (managed with Amlodipine)",
        "Iron deficiency anaemia (mild)",
      ],
      citations: [
        "Prescription · Dr. Suresh Reddy · 10 Mar 2026",
        "Lab Report · CBC · 15 Mar 2026",
      ],
    };
  }

  if (
    q.includes("summar") ||
    q.includes("new doctor") ||
    q.includes("specialist")
  ) {
    return {
      role: "ai",
      text: "Here is a brief summary suitable for a new doctor:",
      list: [
        "Patient: Kumar, Male",
        "Known conditions: Type 2 DM, Hypertension, mild Iron-deficiency anaemia",
        "Current medications: Metformin 500 mg BD, Amlodipine 5 mg OD",
        "Last HbA1c: 7.4 % (Mar 2026) — borderline",
        "Last CBC: mild anaemia flagged",
      ],
      citations: [
        "Prescription · 10 Mar 2026",
        "Lab Report · 01 Mar 2026",
        "Lab Report · 15 Mar 2026",
      ],
      note: "Share this summary along with the original documents for the best clinical picture.",
    };
  }

  if (
    q.includes("blood pressure") ||
    q.includes("bp") ||
    q.includes("hypertension")
  ) {
    return {
      role: "ai",
      text: "Your most recent blood pressure reading on record:",
      list: ["128/84 mmHg — recorded 10 Mar 2026 at Dr. Suresh Reddy's clinic"],
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
      note: "Amlodipine 5 mg is prescribed to manage your blood pressure.",
    };
  }

  if (q.includes("lab") || q.includes("report") || q.includes("result")) {
    return {
      role: "ai",
      text: "Here are your recent lab reports on file:",
      list: [
        "HbA1c & Lipid Profile — 01 Mar 2026",
        "Complete Blood Count (CBC) — 15 Mar 2026",
      ],
      citations: [
        "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
        "Lab Report · CBC · 15 Mar 2026",
      ],
    };
  }

  /* Generic fallback */
  return {
    role: "ai",
    text: "I searched through your uploaded documents but didn't find a specific match for that question yet.",
    note: "Try uploading more records or rephrasing your question for a precise answer.",
  };
}
