"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  FileTextIcon, FlaskConicalIcon, RadioIcon,
  ClipboardListIcon, ReceiptIcon, UploadCloudIcon,
  CalendarIcon, UserIcon, UsersIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import dynamic from "next/dynamic";

const ContentTabs = dynamic(
  () => import("@/components/app/content-tabs").then((m) => ({ default: m.ContentTabs })),
  {
    loading: () => (
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
      </div>
    ),
  }
);
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all",       label: "All",          icon: FileTextIcon      },
  { key: "rx",        label: "Prescription", icon: FileTextIcon      },
  { key: "lab",       label: "Lab Report",   icon: FlaskConicalIcon  },
  { key: "radiology", label: "Radiology",    icon: RadioIcon         },
  { key: "discharge", label: "Discharge",    icon: ClipboardListIcon },
  { key: "bill",      label: "Bill",         icon: ReceiptIcon       },
];

const CATEGORY_COLOR: Record<string, string> = {
  Prescription:   "bg-blue-100 text-blue-700",
  "Lab Report":   "bg-emerald-100 text-emerald-700",
  Radiology:      "bg-violet-100 text-violet-700",
  Discharge:      "bg-amber-100 text-amber-700",
  "Medical Bill": "bg-rose-100 text-rose-700",
};

type Doc = { id: string; type: string; title: string; date: string; doctor: string; summary: string; flag: boolean };

const MY_DOCS: Doc[] = [
  { id: "d1", type: "Lab Report",   title: "Complete Blood Count (CBC)",        date: "15 Mar 2026", doctor: "Dr. Priya Nair",      summary: "Haemoglobin 11.2 g/dL (low), WBC normal, platelets normal. Mild anaemia flagged.",       flag: true  },
  { id: "d2", type: "Prescription", title: "Metformin + Amlodipine",            date: "10 Mar 2026", doctor: "Dr. Suresh Reddy",    summary: "Metformin 500mg twice daily, Amlodipine 5mg once daily. Review in 4 weeks.",            flag: false },
  { id: "d3", type: "Lab Report",   title: "HbA1c & Lipid Profile",             date: "01 Mar 2026", doctor: "Dr. Priya Nair",      summary: "HbA1c 7.4% (controlled). LDL 118 mg/dL — borderline. Follow-up recommended.",          flag: true  },
  { id: "d4", type: "Radiology",    title: "Chest X-Ray — PA View",             date: "20 Feb 2026", doctor: "Dr. Arun Kapoor",     summary: "No acute cardiopulmonary abnormality. Lungs clear. Heart size normal.",                  flag: false },
  { id: "d5", type: "Discharge",    title: "Apollo Hospital Discharge Summary", date: "05 Feb 2026", doctor: "Dr. Suresh Reddy",    summary: "Admitted for pyrexia of unknown origin. Discharged after 3 days. Follow-up in 2 weeks.", flag: false },
  { id: "d6", type: "Medical Bill", title: "Apollo Diagnostics Invoice",        date: "01 Feb 2026", doctor: "Apollo Diagnostics",  summary: "CBC + HbA1c + Lipid Profile. Total: Rs.1,850. Insurance claim filed.",                  flag: false },
];

const GROUP_DOCS: Record<string, Doc[]> = {
  ravi: [
    { id: "r1", type: "Lab Report",   title: "Thyroid Function Test (TFT)", date: "20 Mar 2026", doctor: "Dr. Meena Iyer",     summary: "TSH 5.2 mIU/L (slightly elevated). T3/T4 normal. Repeat in 3 months.",          flag: true  },
    { id: "r2", type: "Prescription", title: "Levothyroxine 50mcg",         date: "20 Mar 2026", doctor: "Dr. Meena Iyer",     summary: "Levothyroxine 50mcg once daily on empty stomach. Review after 6 weeks.",       flag: false },
    { id: "r3", type: "Radiology",    title: "Ultrasound Abdomen",           date: "10 Mar 2026", doctor: "Dr. Arun Kapoor",    summary: "Liver, spleen, kidneys normal. No focal lesions. Mild hepatomegaly noted.",    flag: false },
  ],
  sharma: [
    { id: "s1", type: "Discharge",    title: "Discharge Summary — KIMS",    date: "28 Feb 2026", doctor: "Dr. Sharma",         summary: "Procedure: Right knee arthroscopy. Discharged Day 2. Physiotherapy advised.", flag: false },
    { id: "s2", type: "Prescription", title: "Post-op Medications",          date: "28 Feb 2026", doctor: "Dr. Sharma",         summary: "Cefixime 200mg BD 5 days, Pantop 40mg OD, Aceclofenac SOS.",                 flag: false },
  ],
  priya: [
    { id: "p1", type: "Lab Report",   title: "Haemogram + Iron Studies",    date: "18 Mar 2026", doctor: "Dr. Lakshmi Rao",    summary: "Iron 42 mcg/dL (low), Ferritin 6 ng/mL (low). Iron deficiency anaemia confirmed.", flag: true  },
    { id: "p2", type: "Prescription", title: "Iron Sucrose + Folic Acid",    date: "18 Mar 2026", doctor: "Dr. Lakshmi Rao",    summary: "Ferrous sulphate 325mg TDS, Folic acid 5mg OD. Dietary guidance given.",      flag: false },
    { id: "p3", type: "Medical Bill", title: "Vijaya Diagnostics Invoice",   date: "18 Mar 2026", doctor: "Vijaya Diagnostics", summary: "Haemogram + Iron studies + Ferritin. Total: Rs.1,200.",                        flag: false },
  ],
};

const GROUP_NAMES: Record<string, string> = {
  ravi:   "Ravi Kumar",
  sharma: "Dr. Sharma's Clinic",
  priya:  "Priya Singh",
};

function DocCard({ doc }: { doc: Doc }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg",
          CATEGORY_COLOR[doc.type] ?? "bg-muted text-muted-foreground")}>
          <FileTextIcon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{doc.title}</span>
            <Badge variant="outline" className={cn("text-[10px]", CATEGORY_COLOR[doc.type])}>
              {doc.type}
            </Badge>
            {doc.flag && <Badge className="text-[10px] bg-rose-100 text-rose-700 border-0">Warning Flagged</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{doc.summary}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CalendarIcon className="size-3" />{doc.date}</span>
            <span className="flex items-center gap-1"><UserIcon className="size-3" />{doc.doctor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const searchParams = useSearchParams();
  const g = searchParams.get("g") ?? "";
  const isLinked = g === "ravi" || g === "sharma" || g === "priya";
  const isSystem  = !isLinked; // yours, arogyaai, community, or no g
  const memberName = GROUP_NAMES[g] ?? "";
  const docs = isLinked ? (GROUP_DOCS[g] ?? []) : MY_DOCS;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Sticky ContentTabs — never scrolls away */}
      <div className="shrink-0 px-5 pt-5 lg:px-7 lg:pt-7">
        {isSystem && <ContentTabs active="records" showGroupSettings={false} />}
        {isLinked && <ContentTabs active="records" showGroupSettings={true} />}
      </div>

      {/* Full-width scroll container — scrollbar at right edge of column */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pb-5 pt-4 lg:px-7 lg:pb-7 space-y-5 max-w-4xl">

          {isLinked && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
              <UsersIcon className="size-4 text-primary shrink-0" />
              <p className="text-sm text-primary font-medium">
                Showing shared documents from <strong>{memberName}</strong>
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {isLinked ? memberName + "'s Documents" : "My Documents"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLinked ? "Shared medical records in this group." : "All your documents, organised and searchable."}
              </p>
            </div>
            {!isLinked && (
              <Button size="sm" className="flex items-center gap-1.5">
                <UploadCloudIcon className="size-4" /> Upload
              </Button>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.key}
                variant={cat.key === "all" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full h-auto px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                  cat.key !== "all" && "text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <cat.icon className="size-3.5 shrink-0" />
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {docs.map((doc) => <DocCard key={doc.id} doc={doc} />)}
          </div>

          {!isLinked && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <UploadCloudIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Use the <strong>Upload</strong> button above or the toolbar below to add more documents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
