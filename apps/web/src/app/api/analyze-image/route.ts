/**
 * POST /api/analyze-image
 * Body: { filename: string; mimeType: string }
 *
 * Returns a mock AI analysis of a medical document.
 * In production, replace the mock with a real Vision API call
 * (e.g. Google Gemini Vision, OpenAI GPT-4o, or AWS Textract).
 *
 * The mock uses the filename to infer document type and returns
 * realistic extracted text + summary for demo purposes.
 */
import { NextRequest, NextResponse } from "next/server";

type DocAnalysis = {
  docType: string;
  extractedText: string;
  summary: string;
};

function analyzeByFilename(filename: string, mimeType: string): DocAnalysis {
  const lower = filename.toLowerCase();

  if (lower.includes("prescription") || lower.includes("rx") || lower.includes("medicine") || lower.includes("tablet")) {
    return {
      docType: "Prescription",
      extractedText:
        "Dr. Suresh Reddy  |  MBBS, MD (Internal Medicine)\nDate: 28 Mar 2026\nPatient: Kumar, 42 yrs\n\n" +
        "Rx:\n1. Metformin 500mg — 1-0-1 (after meals) × 90 days\n" +
        "2. Amlodipine 5mg — 0-0-1 × 90 days\n" +
        "3. Vitamin D3 60K IU — once weekly × 8 weeks\n\n" +
        "Follow-up: 28 Apr 2026\nAdvice: Low-GI diet. Walk 30 min/day.",
      summary:
        "Prescription from Dr. Suresh Reddy (28 Mar 2026) for a 42-year-old patient. " +
        "Three medications prescribed: Metformin 500mg twice daily for diabetes, " +
        "Amlodipine 5mg once daily for blood pressure control, and Vitamin D3 60K weekly for 8 weeks. " +
        "Lifestyle advice includes a low-GI diet and daily 30-minute walks. Follow-up due 28 Apr 2026.",
    };
  }

  if (lower.includes("hba1c") || lower.includes("cbc") || lower.includes("blood") || lower.includes("lab") || lower.includes("report") || lower.includes("haemo") || lower.includes("hemo")) {
    return {
      docType: "Lab Report (CBC / HbA1c)",
      extractedText:
        "SRL Diagnostics  |  28 Mar 2026\nPatient: Kumar\n\n" +
        "Complete Blood Count:\n" +
        "  Haemoglobin:  11.8 g/dL  [Ref: 13–17]  ↓ Low\n" +
        "  RBC:          4.1 × 10⁶/μL  [Ref: 4.5–5.5]\n" +
        "  WBC:          7,200 /μL  [Ref: 4,000–11,000]  ✓\n" +
        "  Platelets:    2.1 × 10⁵/μL  [Ref: 1.5–4.0]  ✓\n" +
        "  MCV:          72.3 fL  [Ref: 80–100]  ↓ Low\n\n" +
        "HbA1c:  6.9%  [Ref: <5.7% normal, 5.7–6.4% pre-DM, >6.5% DM]",
      summary:
        "CBC lab report showing mildly low Haemoglobin (11.8 g/dL) and low MCV (72.3 fL), " +
        "consistent with microcytic anaemia — likely iron deficiency. " +
        "HbA1c of 6.9% indicates diabetes is reasonably controlled but slightly above target (<6.5%). " +
        "WBC and platelets are within normal range. " +
        "Recommend discussing iron supplementation and dietary review with your doctor.",
    };
  }

  if (lower.includes("mri") || lower.includes("xray") || lower.includes("x-ray") || lower.includes("scan") || lower.includes("ct") || lower.includes("ultrasound")) {
    return {
      docType: "Imaging Report",
      extractedText:
        "MRI Brain — Plain & Contrast\nDate: 25 Mar 2026\nRef. Physician: Dr. Sharma\n\n" +
        "Technique: 3T MRI, T1/T2/FLAIR/DWI sequences\n\n" +
        "Findings:\n" +
        "  • No space-occupying lesion identified\n" +
        "  • Mild age-related periventricular white matter changes\n" +
        "  • No midline shift. Ventricles normal in size and morphology\n" +
        "  • Posterior fossa structures intact\n" +
        "  • No acute infarct on DWI\n\n" +
        "Impression: No acute intracranial abnormality. Age-appropriate changes only.",
      summary:
        "MRI brain report (25 Mar 2026) with no acute or significant findings. " +
        "Mild periventricular white matter changes noted — common in adults over 40 and generally benign. " +
        "No tumour, stroke, bleed, or structural abnormality detected. " +
        "A reassuring report overall. Recommend sharing with your treating neurologist for clinical correlation.",
    };
  }

  if (lower.includes("discharge") || lower.includes("summary") || lower.includes("hospital") || lower.includes("admission")) {
    return {
      docType: "Discharge Summary",
      extractedText:
        "City General Hospital  |  Discharge Summary\n" +
        "Patient: Kumar  |  IP No: 2026-0892\n" +
        "Admission: 20 Mar 2026  |  Discharge: 24 Mar 2026  (4 days)\n\n" +
        "Diagnosis: Type 2 Diabetes Mellitus + Hypertension (uncontrolled)\n" +
        "Procedure: IV insulin protocol, BP stabilisation, dietary counselling\n\n" +
        "Discharge Medications:\n" +
        "  Metformin 500mg BD  |  Amlodipine 5mg OD  |  Aspirin 75mg OD\n\n" +
        "Follow-up: OPD in 2 weeks. Repeat FBS/PPBS at follow-up.",
      summary:
        "Discharge summary for a 4-day hospitalisation (20–24 Mar 2026) for uncontrolled T2DM and hypertension. " +
        "Patient was managed with IV insulin protocol and blood pressure stabilisation. " +
        "Discharged on Metformin, Amlodipine, and Aspirin 75mg. " +
        "No surgery performed. Follow-up in OPD in 2 weeks with repeat fasting blood sugar.",
    };
  }

  if (lower.includes("thyroid") || lower.includes("tsh") || lower.includes("t3") || lower.includes("t4")) {
    return {
      docType: "Thyroid Function Test",
      extractedText:
        "Thyroid Function Test  |  28 Mar 2026\n\n" +
        "TSH:   6.8 mIU/L   [Ref: 0.4–4.0]  ↑ High\n" +
        "T3:    0.9 ng/mL   [Ref: 0.8–2.0]  ✓\n" +
        "T4:    6.2 μg/dL   [Ref: 5.0–12.0]  ✓\n" +
        "Anti-TPO: 48 IU/mL  [Ref: <35]  ↑ Elevated",
      summary:
        "Thyroid function test showing elevated TSH (6.8 mIU/L) with normal T3 and T4 — " +
        "consistent with subclinical hypothyroidism. " +
        "Mildly elevated Anti-TPO antibodies suggest possible autoimmune thyroiditis (Hashimoto's). " +
        "Recommend follow-up with your endocrinologist to discuss whether thyroid replacement therapy is warranted.",
    };
  }

  // Generic fallback
  return {
    docType: mimeType.includes("pdf") ? "PDF Document" : "Medical Document",
    extractedText:
      "Medical document detected.\n\n" +
      "Patient details, clinical notes, and treatment information identified in the uploaded document. " +
      "Multiple sections including diagnosis, medications, test results, and follow-up instructions are visible.",
    summary:
      "This appears to be a medical document containing patient information and clinical details. " +
      "Key sections including diagnosis, treatment plan, and follow-up recommendations have been identified. " +
      "Add a caption below to give the community context about what this document shows before sharing.",
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { filename?: string; mimeType?: string };
  // Simulate realistic AI processing time
  await new Promise((resolve) => setTimeout(resolve, 1800));
  const analysis = analyzeByFilename(body.filename ?? "", body.mimeType ?? "");
  return NextResponse.json(analysis);
}
