import type { Metadata } from "next";
import {
  FileTextIcon, FlaskConicalIcon, RadioIcon,
  ClipboardListIcon, ReceiptIcon, UploadCloudIcon,
  CalendarIcon, UserIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ContentTabs } from "@/components/app/content-tabs";

export const metadata: Metadata = { title: "Records | ArogyaVault" };

const CATEGORIES = [
  { key: "all",        label: "All",              icon: FileTextIcon },
  { key: "rx",         label: "Prescription",     icon: FileTextIcon },
  { key: "lab",        label: "Lab Report",       icon: FlaskConicalIcon },
  { key: "radiology",  label: "Radiology",        icon: RadioIcon },
  { key: "discharge",  label: "Discharge",        icon: ClipboardListIcon },
  { key: "bill",       label: "Bill",             icon: ReceiptIcon },
];

const CATEGORY_COLOR: Record<string, string> = {
  Prescription:    "bg-blue-100 text-blue-700",
  "Lab Report":    "bg-emerald-100 text-emerald-700",
  Radiology:       "bg-violet-100 text-violet-700",
  "Discharge":     "bg-amber-100 text-amber-700",
  "Medical Bill":  "bg-rose-100 text-rose-700",
};

const DUMMY_DOCS = [
  { id: "d1", type: "Lab Report",      title: "Complete Blood Count (CBC)",              date: "15 Mar 2026", doctor: "Dr. Priya Nair",     summary: "Haemoglobin 11.2 g/dL (low), WBC normal, platelets normal. Mild anaemia flagged.",   flag: true },
  { id: "d2", type: "Prescription",    title: "Metformin + Amlodipine",                  date: "10 Mar 2026", doctor: "Dr. Suresh Reddy",   summary: "Metformin 500mg twice daily, Amlodipine 5mg once daily. Review in 4 weeks.",          flag: false },
  { id: "d3", type: "Lab Report",      title: "HbA1c & Lipid Profile",                   date: "01 Mar 2026", doctor: "Dr. Priya Nair",     summary: "HbA1c 7.4% (controlled). LDL 118 mg/dL — borderline. Follow-up recommended.",        flag: true },
  { id: "d4", type: "Radiology",       title: "Chest X-Ray — PA View",                   date: "20 Feb 2026", doctor: "Dr. Arun Kapoor",    summary: "No acute cardiopulmonary abnormality. Lungs clear. Heart size normal.",                flag: false },
  { id: "d5", type: "Discharge",       title: "Apollo Hospital Discharge Summary",        date: "05 Feb 2026", doctor: "Dr. Suresh Reddy",   summary: "Admitted for pyrexia of unknown origin. Discharged after 3 days. Follow-up in 2 weeks.", flag: false },
  { id: "d6", type: "Medical Bill",    title: "Apollo Diagnostics Invoice",               date: "01 Feb 2026", doctor: "Apollo Diagnostics", summary: "CBC + HbA1c + Lipid Profile. Total: ₹1,850. Insurance claim filed.",                  flag: false },
];

export default function RecordsPage() {
  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-4xl">

      {/* Content tabs */}
      <ContentTabs active="records" />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Medical Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your documents, organised and searchable.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5">
          <UploadCloudIcon className="size-4" /> Upload
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              cat.key === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <cat.icon className="size-3.5 shrink-0" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document cards */}
      <div className="space-y-3">
        {DUMMY_DOCS.map((doc) => (
          <div
            key={doc.id}
            className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                CATEGORY_COLOR[doc.type] ?? "bg-muted text-muted-foreground")}>
                <FileTextIcon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{doc.title}</span>
                  <Badge variant="outline" className={cn("text-[10px]", CATEGORY_COLOR[doc.type])}>
                    {doc.type}
                  </Badge>
                  {doc.flag && (
                    <Badge className="text-[10px] bg-rose-100 text-rose-700 border-0">⚠ Flagged</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{doc.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarIcon className="size-3" />{doc.date}</span>
                  <span className="flex items-center gap-1"><UserIcon className="size-3" />{doc.doctor}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload CTA */}
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <UploadCloudIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Use the <strong>Upload</strong> button above or the toolbar below to add more documents.
        </p>
      </div>
    </div>
  );
}
