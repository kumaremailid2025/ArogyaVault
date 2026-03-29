"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileTextIcon, UsersIcon, ClockIcon, UploadCloudIcon,
  ArrowRightIcon, BrainCircuitIcon, ActivityIcon,
  UserPlusIcon, EyeIcon, SendIcon, SparklesIcon,
  HeartPulseIcon, ThumbsUpIcon, MessageSquareIcon,
  BookOpenIcon, TrendingUpIcon, ShieldCheckIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { ContentTabs } from "@/components/app/content-tabs";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   YOURS — personal vault content
═══════════════════════════════════════════════════════════════════ */
const QUICK_STATS = [
  { icon: FileTextIcon,     value: "0",  label: "Documents",    sub: "Upload your first",      color: "text-primary" },
  { icon: UsersIcon,        value: "3",  label: "Groups",        sub: "Family & doctors",       color: "text-emerald-500" },
  { icon: ClockIcon,        value: "—",  label: "Last Upload",   sub: "Nothing yet",            color: "text-amber-500" },
  { icon: BrainCircuitIcon, value: "0",  label: "AI Sessions",   sub: "Ask your first question",color: "text-violet-500" },
];

const ACTIVITY_FEED = [
  { icon: UserPlusIcon,  color: "bg-emerald-100 text-emerald-600", text: "You joined ArogyaVault",           time: "Just now"    },
  { icon: UsersIcon,     color: "bg-blue-100 text-blue-600",       text: "Group linked with Ravi Kumar",      time: "2 days ago"  },
  { icon: UsersIcon,     color: "bg-amber-100 text-amber-600",     text: "Dr. Sharma's Clinic connected",     time: "3 days ago"  },
  { icon: EyeIcon,       color: "bg-violet-100 text-violet-600",   text: "Dr. Sharma viewed your group",      time: "3 days ago"  },
];

function YoursContent() {
  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="text-xs text-primary-foreground/70 font-medium mb-0.5">Good morning 👋</p>
        <h1 className="text-xl font-bold">Welcome to ArogyaVault, Kumar</h1>
        <p className="mt-1.5 text-primary-foreground/80 text-sm leading-relaxed">
          Your personal health vault is ready. Upload your first medical document to get started.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/records" className="flex items-center gap-1.5">
              <UploadCloudIcon className="size-3.5" /> Upload Document
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/ask-ai" className="flex items-center gap-1.5">
              <BrainCircuitIcon className="size-3.5" /> Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {/* AI Health Summary */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="size-4 text-primary" />
            <span className="text-sm font-semibold">AI Health Summary</span>
            <Badge variant="outline" className="text-xs">GPT-4o</Badge>
          </div>
          <Link href="/records" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            More <ArrowRightIcon className="size-3" />
          </Link>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Upload your medical documents to generate your personalised AI Health Summary.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-3 bg-background">
            <s.icon className={cn("size-4 mb-1.5", s.color)} />
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs font-medium">{s.label}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-7 text-center">
        <UploadCloudIcon className="size-9 text-muted-foreground/40 mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">No documents yet</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
          Upload a prescription, lab report, or any medical document to get started.
        </p>
        <Button asChild size="sm">
          <Link href="/records" className="flex items-center gap-1.5">
            <UploadCloudIcon className="size-3.5" /> Upload your first document
          </Link>
        </Button>
      </div>

      {/* Activity feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ActivityIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Recent Activity</span>
        </div>
        <div className="space-y-2">
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background">
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", a.color)}>
                <a.icon className="size-3" />
              </div>
              <span className="flex-1 text-sm">{a.text}</span>
              <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AROGYAAI — AI assistant content
═══════════════════════════════════════════════════════════════════ */
const AI_MESSAGES = [
  { role: "ai" as const, text: "Hello Kumar 👋 I'm ArogyaAI, your personal health assistant. I can answer questions about your records, explain lab values, summarise medications, and spot health trends. What would you like to know?" },
  { role: "user" as const, text: "What medications am I currently on?" },
  { role: "ai" as const, text: "Based on your records: Metformin 500mg twice daily and Amlodipine 5mg once daily. Both were prescribed by Dr. Suresh Reddy on 10 Mar 2026.", citation: "Prescription · Dr. Suresh Reddy · 10 Mar 2026" },
];

const AI_FEATURES = [
  { icon: HeartPulseIcon,   label: "Health Summary",     desc: "Get a plain-English summary of your current health status" },
  { icon: TrendingUpIcon,   label: "Lab Trends",         desc: "See how your blood sugar, cholesterol, and HbA1c change over time" },
  { icon: BookOpenIcon,     label: "Explain a Report",   desc: "Upload any report and ask ArogyaAI to explain it" },
  { icon: ShieldCheckIcon,  label: "Medication Check",   desc: "Ask about drug interactions, missed doses, or side effects" },
];

const AI_SUGGESTIONS = [
  "Explain my latest CBC report",
  "Is my HbA1c improving?",
  "What are the side effects of Metformin?",
  "Summarise my health for a new doctor",
  "Do I have any flagged lab values?",
  "When is my next follow-up?",
];

function ArogyaAIContent() {
  const [query, setQuery] = React.useState("");
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <BrainCircuitIcon className="size-4" />
          </div>
          <span className="font-bold text-lg">ArogyaAI</span>
          <Badge className="bg-white/20 text-white border-0 text-[10px]">GPT-4o · RAG</Badge>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mt-1">
          Your personal AI health assistant. Answers are drawn exclusively from your uploaded documents.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {AI_FEATURES.map((f) => (
          <button key={f.label} className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 text-left hover:border-violet-400 hover:bg-violet-50 transition-colors dark:border-violet-900 dark:bg-violet-950/30">
            <f.icon className="size-4 text-violet-600 mb-1.5" />
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Sample conversation */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample conversation</p>
        {AI_MESSAGES.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "ai" && (
              <div className="size-6 shrink-0 flex items-center justify-center rounded-full bg-violet-100 text-violet-600 mt-0.5">
                <BrainCircuitIcon className="size-3" />
              </div>
            )}
            <div className={cn(
              "rounded-xl px-3 py-2 text-sm max-w-[85%]",
              m.role === "user"
                ? "bg-violet-600 text-white rounded-tr-sm"
                : "bg-muted border border-border rounded-tl-sm"
            )}>
              <p className="leading-relaxed">{m.text}</p>
              {m.citation && (
                <span className="inline-flex items-center gap-1 mt-1.5 rounded bg-background border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <FileTextIcon className="size-2.5" />{m.citation}
                </span>
              )}
            </div>
            {m.role === "user" && (
              <div className="size-6 shrink-0 flex items-center justify-center rounded-full bg-muted border text-[10px] font-bold mt-0.5">KU</div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <SparklesIcon className="size-3 text-violet-500" /> Try asking…
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-full border border-violet-200 px-3 py-1 text-xs text-violet-700 hover:border-violet-400 hover:bg-violet-50 transition-colors dark:border-violet-800 dark:text-violet-300"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Type your question in the bar at the bottom ↓
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AROGYATALK — community content
═══════════════════════════════════════════════════════════════════ */
const COMMUNITY_POSTS = [
  {
    author: "Meena R.",    initials: "MR", location: "Chennai",
    time: "2 hours ago",
    text: "My father's HbA1c just came down to 6.8% from 8.1% in 3 months — Metformin + diet changes. Anyone else seen similar results?",
    likes: 14, replies: 6, tag: "Diabetes",
  },
  {
    author: "Suresh K.",   initials: "SK", location: "Mumbai",
    time: "5 hours ago",
    text: "Has anyone used ArogyaVault to share records with a cardiologist abroad? Wondering how the group sharing works for remote consultations.",
    likes: 8, replies: 12, tag: "Groups",
  },
  {
    author: "Ananya P.",   initials: "AP", location: "Hyderabad",
    time: "Yesterday",
    text: "Reminder to everyone: the AI Summary is incredibly useful to print and carry to a new specialist. My oncologist was impressed with the structured format.",
    likes: 31, replies: 4, tag: "Tip",
  },
];

function ArogyaTalkContent() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <MessageSquareIcon className="size-4" />
          </div>
          <span className="font-bold text-lg">ArogyaTalk</span>
          <Badge className="bg-white/20 text-white border-0 text-[10px]">Community</Badge>
        </div>
        <p className="text-sm text-white/80 leading-relaxed mt-1">
          Connect with other ArogyaVault members. Ask questions, share experiences, support each other.
          No personal medical data is shared here.
        </p>
      </div>

      {/* Compose */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
        <div className="flex gap-2 items-start">
          <Avatar className="size-7 shrink-0 mt-0.5">
            <AvatarFallback className="text-[10px] font-bold bg-emerald-100 text-emerald-700">KU</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            Share a tip, ask the community, or start a discussion…
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shrink-0">Post</Button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {COMMUNITY_POSTS.map((p, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-emerald-100 text-emerald-700">{p.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{p.author}</span>
                  <span className="text-xs text-muted-foreground">{p.location} · {p.time}</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200">{p.tag}</Badge>
                </div>
                <p className="text-sm mt-1.5 leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                    <ThumbsUpIcon className="size-3.5" /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors">
                    <MessageSquareIcon className="size-3.5" /> {p.replies} replies
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LINKED MEMBER — placeholder (details coming from user)
═══════════════════════════════════════════════════════════════════ */
const LINKED_MEMBER_DATA: Record<string, { name: string; relation: string; direction: string; scope: string }> = {
  ravi:   { name: "Ravi Kumar",          relation: "Family Member",  direction: "You invited them",   scope: "App Access — you can view all their records" },
  sharma: { name: "Dr. Sharma's Clinic", relation: "Doctor",         direction: "They invited you",   scope: "Group Access — they can see documents you share" },
  priya:  { name: "Priya Singh",          relation: "Caregiver",      direction: "Mutual access",      scope: "App Access — both directions active" },
};

function LinkedMemberContent({ id }: { id: string }) {
  const member = LINKED_MEMBER_DATA[id];
  if (!member) return null;
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border p-5 flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback className="text-base font-bold bg-muted">
            {member.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-base">{member.name}</h2>
          <p className="text-sm text-muted-foreground">{member.relation}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <ArrowRightLeftIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{member.direction}</span>
          </div>
          <p className="text-xs text-primary mt-1">{member.scope}</p>
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <UsersIcon className="size-9 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Linked member view</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Shared records, upload activity, and permission controls for <strong>{member.name}</strong> will appear here.
          Full detail coming soon.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/groups">Manage in Groups →</Link>
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LiveboardPage() {
  const searchParams = useSearchParams();
  const group = searchParams.get("g") ?? "yours";

  return (
    <div className="p-5 lg:p-6 space-y-4 max-w-4xl">
      {/* Content top tabs — only shown for Yours group */}
      {group === "yours" && <ContentTabs active="home" />}

      {/* Group-specific content */}
      {group === "yours"      && <YoursContent />}
      {group === "arogyaai"   && <ArogyaAIContent />}
      {group === "community"  && <ArogyaTalkContent />}
      {(group === "ravi" || group === "sharma" || group === "priya") && (
        <LinkedMemberContent id={group} />
      )}
    </div>
  );
}
