import type { PdfMessage } from "@/models/learn";

/**
 * Mock AI response generator for PDF Q&A.
 * In production this would call a real RAG / vector-search pipeline.
 * Responses include page-level citations and related external research links.
 */
export function getPdfAiResponse(question: string, docName: string): PdfMessage {
  const q = question.toLowerCase();

  if (q.includes("dose") || q.includes("dosage") || q.includes("mg")) {
    return {
      role: "ai",
      text: `Based on the document "${docName}", the recommended dosage information was found on pages 12–14. Standard adult dosing follows weight-adjusted protocols. The document references WHO guidelines for dose escalation in special populations (renal/hepatic impairment).`,
      citations: ["Page 12: Initial dosing protocol", "Page 13: Dose titration table", "Page 14: Special populations"],
      related: ["WHO Essential Medicines List 2023", "PubMed: Meta-analysis of dosing outcomes (PMID: 34521890)", "ADA Standards of Care 2024 – Section 9"],
    };
  }

  if (q.includes("side effect") || q.includes("adverse") || q.includes("complication")) {
    return {
      role: "ai",
      text: `The document discusses adverse effects in Section 3 (pages 18–22). Key concerns include GI disturbance (18%), hepatotoxicity (rare, <1%), and drug hypersensitivity reactions. The risk profile was derived from a pooled analysis of 12 RCTs.`,
      citations: ["Page 18: Common adverse effects table", "Page 20: Hepatotoxicity monitoring protocol", "Page 22: Patient counselling checklist"],
      related: ["Cochrane Review: Safety profile (2022)", "FDA Drug Safety Communication", "Indian Pharmacopoeia – Adverse Drug Reactions"],
    };
  }

  if (q.includes("mechanism") || q.includes("how does") || q.includes("mode of action")) {
    return {
      role: "ai",
      text: `According to the document, the mechanism of action is described in Chapter 2 (pages 8–11). The primary pathway involves receptor-mediated inhibition with downstream signalling cascade effects. Two alternative pathways are proposed based on in-vitro evidence from 2021 studies.`,
      citations: ["Page 8: Primary mechanism diagram", "Page 10: Receptor binding kinetics", "Page 11: Comparative mechanism table"],
      related: ["Nature Reviews Drug Discovery 2022", "Pharmacology & Therapeutics: MOA review", "NCBI Bookshelf: Receptor pharmacology"],
    };
  }

  if (q.includes("contraindication") || q.includes("avoid") || q.includes("do not use")) {
    return {
      role: "ai",
      text: `The document lists contraindications on pages 15–16. Absolute contraindications include severe hepatic failure (Child-Pugh C), known hypersensitivity, and concurrent use with strong CYP3A4 inhibitors. Relative contraindications include pregnancy (Category D) and renal impairment (eGFR <30).`,
      citations: ["Page 15: Absolute contraindications", "Page 16: Relative contraindications & precautions"],
      related: ["BNF Contraindications Reference", "UpToDate: Drug contraindications overview", "CDSCO Drug Safety Alert"],
    };
  }

  return {
    role: "ai",
    text: `I searched the document "${docName}" for "${question}". Relevant content was found across multiple sections. The document references clinical trial data, systematic reviews, and guideline recommendations supporting this topic.`,
    citations: ["Page 5: Introduction & background", "Page 24: Clinical evidence summary", "Page 31: Recommendations & conclusions"],
    related: [`PubMed search: ${question}`, "WHO Guidelines repository", "Cochrane Library: Systematic reviews"],
  };
}
