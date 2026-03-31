import type { LinkedMember } from "@/models/community";

export const LINKED_MEMBER_DATA: Record<string, LinkedMember> = {
  ravi: {
    name: "Ravi Kumar", relation: "Family Member", direction: "You invited them",
    scope: "App Access — you can view all their records",
    badgeLabel: "Family", initials: "RK",
    posts: [
      {
        id: 0, initials: "RK", author: "Ravi Kumar", time: "1 hour ago", tag: "Lab Report",
        text: "Just uploaded my latest CBC report. Let me know if anything looks off — flagging it here so you can check too.",
        likes: 2, replyCount: 1,
        replies: [{ initials: "KU", author: "Kumar", time: "45 min ago", text: "Checked it — Haemoglobin is at 11.2 g/dL, mildly low again. Let's get you back on the iron supplements and retest in 4 weeks." }],
      },
      {
        id: 1, initials: "KU", author: "You", time: "Yesterday", tag: "Reminder",
        text: "Ravi, your Haemoglobin was 11.2 g/dL last time — mildly low. Please make sure you're taking the iron supplements daily.",
        likes: 0, replyCount: 0, replies: [],
      },
      {
        id: 2, initials: "RK", author: "Ravi Kumar", time: "3 days ago", tag: "Follow-up",
        text: "Doctor suggested we get a thyroid panel done this month. Will upload once the report comes in.",
        likes: 1, replyCount: 1,
        replies: [{ initials: "KU", author: "Kumar", time: "3 days ago", text: "Good idea. Let me know once it's done — I'll add it to your health timeline and flag anything outside normal range." }],
      },
    ],
  },
  sharma: {
    name: "Dr. Sharma's Clinic", relation: "Doctor", direction: "They invited you",
    scope: "Group Access — they can see documents you share",
    badgeLabel: "Clinic", initials: "DS",
    posts: [
      {
        id: 0, initials: "DS", author: "Dr. Sharma's Clinic", time: "2 hours ago", tag: "Post-op",
        text: "Your post-operative report has been reviewed. Healing is on track. Please continue the prescribed antibiotics for the full course.",
        likes: 0, replyCount: 1,
        replies: [{ initials: "KU", author: "Kumar", time: "1 hour ago", text: "Thank you, Doctor. Noted — I'll complete the full antibiotic course and monitor for any swelling or fever." }],
      },
      {
        id: 1, initials: "KU", author: "You", time: "Yesterday", tag: "Update",
        text: "Doctor, I've uploaded the wound photos as requested. Please review at your earliest convenience.",
        likes: 0, replyCount: 0, replies: [],
      },
      {
        id: 2, initials: "DS", author: "Dr. Sharma's Clinic", time: "4 days ago", tag: "Discharge",
        text: "Discharge summary has been added to your group. Please review the follow-up schedule — next visit in 2 weeks.",
        likes: 0, replyCount: 1,
        replies: [{ initials: "KU", author: "Kumar", time: "4 days ago", text: "Reviewed — follow-up booked for 13 April. I've also shared the discharge summary with my caregiver Priya for reference." }],
      },
    ],
  },
  priya: {
    name: "Priya Singh", relation: "Caregiver", direction: "Mutual access",
    scope: "App Access — both directions active",
    badgeLabel: "Caregiver", initials: "PS",
    posts: [
      {
        id: 0, initials: "PS", author: "Priya Singh", time: "30 min ago", tag: "Medication",
        text: "Kumar took his morning medications on time. Also reminded him about the follow-up with Dr. Suresh on 7 April.",
        likes: 1, replyCount: 0, replies: [],
      },
      {
        id: 1, initials: "KU", author: "You", time: "This morning", tag: "Symptom",
        text: "Priya, please note I had a mild headache last night — could be BP-related. Will monitor today and update here.",
        likes: 0, replyCount: 1,
        replies: [{ initials: "PS", author: "Priya Singh", time: "This morning", text: "Noted Kumar. I've logged it. If it returns this evening, please check your BP and we'll call Dr. Suresh's clinic to report it." }],
      },
      {
        id: 2, initials: "PS", author: "Priya Singh", time: "2 days ago", tag: "Lab Report",
        text: "Haemogram results uploaded. Iron levels are still low — have asked the pharmacy to refill the Iron supplement prescription.",
        likes: 2, replyCount: 1,
        replies: [{ initials: "KU", author: "Kumar", time: "2 days ago", text: "Thanks Priya. I'll make sure to take them consistently this time — with Vitamin C to help absorption." }],
      },
    ],
  },
};

export const LINKED_POST_SUMMARIES: Record<string, Record<number, string>> = {
  ravi: {
    0: "Kumar reviewed the CBC report and identified mildly low Haemoglobin (11.2 g/dL). A plan to resume iron supplements with a 4-week retest has been agreed upon.",
    2: "Kumar acknowledged the thyroid panel plan and offered to flag any out-of-range values once the report is uploaded.",
  },
  sharma: {
    0: "Kumar confirmed understanding of the antibiotic course and will monitor for warning signs such as swelling or fever.",
    2: "Kumar confirmed the follow-up appointment is booked for 13 April and has shared the discharge summary with his caregiver for coordination.",
  },
  priya: {
    1: "Priya logged the headache symptom and has established a monitoring plan — escalating to Dr. Suresh's clinic if the headache returns in the evening.",
    2: "Kumar acknowledged the low iron levels and committed to consistent supplementation combined with Vitamin C to maximise absorption.",
  },
};

export const LINKED_POST_AI_RESPONSES: Record<string, Record<number, string>> = {
  ravi: {
    0: "Haemoglobin of 11.2 g/dL is classified as mild anaemia (WHO: <13 g/dL for males, <12 g/dL for females). Oral ferrous sulfate with Vitamin C (500 mg) taken 30 minutes before meals significantly improves absorption. A 4-week follow-up CBC is appropriate to assess response.",
    1: "Iron supplementation adherence is critical — missing doses by even 2–3 days per week can reduce expected Hb gains by up to 50%. Liquid iron supplements are an alternative if tablets cause gastrointestinal discomfort.",
    2: "Thyroid function tests (TSH, Free T3, Free T4) should be interpreted alongside clinical symptoms. A TSH above 4.5 mIU/L typically indicates hypothyroidism; below 0.4 mIU/L suggests hyperthyroidism. Results should be reviewed with the treating physician before any medication changes.",
  },
  sharma: {
    0: "Post-operative antibiotic courses must be completed in full to prevent antibiotic resistance and wound infection recurrence. Signs to watch for include increased redness, warmth, discharge, or fever above 38°C — all warrant immediate clinical review.",
    1: "Uploading wound photos directly to ArogyaVault allows the clinical team to review healing progress remotely and reduces unnecessary clinic visits for straightforward post-operative monitoring.",
    2: "Discharge summaries contain critical medication changes, follow-up timelines, and red-flag symptoms. Sharing this with a caregiver ensures continuity of care and reduces the risk of missed follow-ups.",
  },
  priya: {
    0: "Medication adherence reminders from caregivers significantly improve chronic disease outcomes. Research shows caregiver-assisted medication logging reduces missed doses by up to 40% in elderly patients.",
    1: "New or worsening headaches in patients with hypertension warrant BP monitoring. A reading above 180/120 mmHg with headache is a hypertensive crisis requiring immediate medical attention. Keeping a symptom log in ArogyaVault is excellent practice.",
    2: "Iron deficiency is often under-treated due to inconsistent supplementation. Taking iron with Vitamin C enhances non-haem iron absorption by up to 67%. Avoid tea, coffee, or dairy within 2 hours of dosing.",
  },
};
