"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileTextIcon, UsersIcon, ClockIcon, UploadCloudIcon,
  ArrowRightIcon, BrainCircuitIcon, ActivityIcon,
  UserPlusIcon, EyeIcon, SparklesIcon,
  HeartPulseIcon, ThumbsUpIcon, MessageSquareIcon,
  BookOpenIcon, TrendingUpIcon, ShieldCheckIcon,
  ArrowRightLeftIcon,
  GlobeIcon, FlameIcon, MapPinIcon, TrophyIcon, ZapIcon, XIcon,
  MicIcon, ArrowLeftIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import dynamic from "next/dynamic";

/* Lazy-loaded: tab nav skeleton keeps height so layout doesn't shift */
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

/* Lazy-loaded: modal only fetched when Invite button is clicked */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null }
);
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function YoursContent() {
  const greeting = getGreeting();
  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="text-xs text-primary-foreground/70 font-medium mb-0.5">{greeting} 👋</p>
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
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <BrainCircuitIcon className="size-4" />
          </div>
          <span className="font-bold text-lg">ArogyaAI</span>
          <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">GPT-4o · RAG</Badge>
        </div>
        <p className="text-sm text-primary-foreground/80 leading-relaxed mt-1">
          Your personal AI health assistant. Answers are drawn exclusively from your uploaded documents.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {AI_FEATURES.map((f) => (
          <button key={f.label} className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-left hover:border-primary/40 hover:bg-primary/10 transition-colors">
            <f.icon className="size-4 text-primary mb-1.5" />
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
              <div className="size-6 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                <BrainCircuitIcon className="size-3" />
              </div>
            )}
            <div className={cn(
              "rounded-xl px-3 py-2 text-sm max-w-[85%]",
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
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
          <SparklesIcon className="size-3 text-primary" /> Try asking…
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:border-primary hover:bg-primary/5 transition-colors"
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
type CommunityPost = {
  id: number; author: string; initials: string; location: string; time: string;
  text: string; likes: number; replyCount: number; tag: string;
  replies: { initials: string; author: string; time: string; text: string }[];
};

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 0, author: "Meena R.", initials: "MR", location: "Chennai", time: "2 hours ago",
    text: "My father's HbA1c just came down to 6.8% from 8.1% in 3 months — Metformin + diet changes. Anyone else seen similar results?",
    likes: 14, replyCount: 3, tag: "Diabetes",
    replies: [
      { initials: "SK", author: "Suresh K.", time: "1 hr ago",    text: "Excellent! Low GI foods + regular walks made a similar difference for my wife. Keep it consistent." },
      { initials: "AP", author: "Ananya P.", time: "1.5 hrs ago", text: "Metformin + portion control — 7.2% to 6.5% in 4 months for my mother. It works!" },
      { initials: "RV", author: "Rahul V.",  time: "45 min ago",  text: "Is he exercising too? 30-min daily walks combined with meds made a huge difference for us." },
    ],
  },
  {
    id: 1, author: "Suresh K.", initials: "SK", location: "Mumbai", time: "5 hours ago",
    text: "Has anyone shared records with a cardiologist abroad using ArogyaVault? How does group sharing work for international remote consultations?",
    likes: 8, replyCount: 2, tag: "Groups",
    replies: [
      { initials: "MR", author: "Meena R.", time: "4 hrs ago", text: "Yes! Shared a group with a Singapore cardiologist — read-only access, works perfectly." },
      { initials: "AP", author: "Ananya P.", time: "3 hrs ago", text: "The AI Summary PDF is especially useful for international consultants needing a quick overview." },
    ],
  },
  {
    id: 2, author: "Ananya P.", initials: "AP", location: "Hyderabad", time: "Yesterday",
    text: "Reminder: the AI Health Summary is incredibly useful for new specialists. My oncologist was impressed with the structured format. Hit 'Export' in ArogyaAI.",
    likes: 31, replyCount: 2, tag: "Tip",
    replies: [
      { initials: "SK", author: "Suresh K.", time: "Yesterday", text: "Seconded! Saved 20 minutes of explanation at my last cardiology appointment." },
      { initials: "PR", author: "Prabhav R.", time: "Yesterday", text: "Does it include imaging reports? My MRI is uploaded but not sure AI reads those." },
    ],
  },
  {
    id: 3, author: "Divya M.", initials: "DM", location: "Bangalore", time: "2 days ago",
    text: "Iron deficiency tip: if CBC shows low Hb, ask your doctor about liquid iron vs. tablets. Liquid absorbs much faster for moderate anaemia cases.",
    likes: 22, replyCount: 4, tag: "Nutrition",
    replies: [
      { initials: "MR", author: "Meena R.",  time: "2 days ago", text: "My mother switched to liquid iron — Hb went from 9.1 to 11.3 g/dL in 6 weeks." },
      { initials: "SK", author: "Suresh K.", time: "2 days ago", text: "IV iron is even faster for severe deficiency. ArogyaVault's trend tracking is great for this." },
      { initials: "AP", author: "Ananya P.", time: "2 days ago", text: "Liquid iron + Vitamin C together boosts absorption. Always confirm with your doctor." },
      { initials: "RV", author: "Rahul V.",  time: "2 days ago", text: "Bookmarked. My sister's Hb is 9.8 — will share this with her doctor." },
    ],
  },
];

const TRENDING_TOPICS = [
  { topic: "Diabetes Management", count: 342, pct: 100 },
  { topic: "Blood Pressure",      count: 289, pct: 84  },
  { topic: "Lab Reports & CBC",   count: 231, pct: 67  },
  { topic: "Medications",         count: 198, pct: 58  },
  { topic: "Heart Health",        count: 156, pct: 46  },
  { topic: "Women's Health",      count: 134, pct: 39  },
];
const TOP_CONTRIBUTORS = [
  { initials: "AP", name: "Ananya P.",  helpful: 203 },
  { initials: "SK", name: "Suresh K.",  helpful: 187 },
  { initials: "MR", name: "Meena R.",   helpful: 142 },
];
const REGION_ACTIVITY = [
  { region: "Mumbai",    count: 2341, pct: 100 },
  { region: "Chennai",   count: 1987, pct: 85  },
  { region: "Delhi",     count: 1756, pct: 75  },
  { region: "Bangalore", count: 1543, pct: 66  },
  { region: "Hyderabad", count: 1234, pct: 53  },
];

const POST_SUMMARIES: Record<number, string> = {
  0: "Community strongly agrees: Metformin + low-GI diet + daily 30-minute walks produces meaningful HbA1c drops within 3–4 months. Multiple members reported drops from the 7–8% range to 6.5–6.8%. Consistency with both medication and lifestyle is the critical factor.",
  1: "International group sharing works seamlessly with read-only access for specialists. The AI Summary PDF is particularly valued — it gives unfamiliar doctors structured context quickly, reducing lengthy verbal explanations at appointments.",
  2: "Strong consensus that the AI Health Summary export saves 15–20 minutes per specialist visit. One open community question: whether uploaded MRI/imaging reports are fully parsed and included in the AI-generated summary.",
  3: "Liquid iron absorbs significantly faster than tablets for moderate anaemia — one member reported Hb rising from 9.1 to 11.3 g/dL in just 6 weeks. Combining liquid iron with Vitamin C boosts absorption further. IV iron is preferred for severe deficiency.",
};

const POST_AI_RESPONSES: Record<number, string> = {
  0: "Metformin + lifestyle changes (low-GI diet + 150 min/week moderate exercise) reduces HbA1c by 1–2% on average per clinical data. A 1.3% drop in 3 months is excellent. Sustaining daily walks alongside medication adherence is the key to long-term results.",
  1: "ArogyaVault supports read-only group access for international specialists. The AI Summary PDF export is strongly recommended — it condenses medications, diagnoses, and recent lab trends into a single structured document any doctor can quickly review.",
  2: "The AI Export includes all uploaded documents. Imaging reports (MRIs, X-rays) are processed if uploaded as PDFs with embedded text — the AI extracts and summarises key findings. Pure image-only scans without accompanying report text may not be fully analysed.",
  3: "Liquid ferrous sulfate has ~40% higher bioavailability than tablets due to faster dissolution. Taking it alongside 500mg Vitamin C significantly enhances non-haem iron absorption. Avoid tea, coffee, or dairy within 2 hours of dosing as tannins and calcium inhibit absorption.",
};

function generateRephrasings(text: string): [string, string] {
  const trimmed = text.trim();
  const sentence = trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?")
    ? trimmed : trimmed + ".";
  const r1 = `Thank you for raising this. ${sentence} I hope this perspective is helpful — feel free to follow up with any questions.`;
  const words = trimmed.split(" ");
  const shortText = words.length > 18 ? words.slice(0, 18).join(" ") + "…" : trimmed;
  const endsWithPunct = [".", "!", "?", "…"].some((p) => shortText.endsWith(p));
  const r2 = `${shortText}${endsWithPunct ? "" : "."} Hope this helps the community!`;
  return [r1, r2];
}

const VOICE_LANGUAGES = [
  { code: "en-IN", label: "English (India)",      native: "English"      },
  { code: "hi-IN", label: "Hindi",                native: "हिन्दी"        },
  { code: "te-IN", label: "Telugu",               native: "తెలుగు"       },
  { code: "ta-IN", label: "Tamil",                native: "தமிழ்"        },
  { code: "kn-IN", label: "Kannada",              native: "ಕನ್ನಡ"        },
  { code: "ml-IN", label: "Malayalam",            native: "മലയാളം"       },
  { code: "mr-IN", label: "Marathi",              native: "मराठी"        },
  { code: "bn-IN", label: "Bengali",              native: "বাংলা"        },
  { code: "gu-IN", label: "Gujarati",             native: "ગુજરાતી"      },
  { code: "pa-IN", label: "Punjabi",              native: "ਪੰਜਾਬੀ"       },
  { code: "ur-IN", label: "Urdu",                 native: "اردو"         },
];

function ArogyaTalkContent() {
  type PanelState =
    | { view: "analytics" }
    | { view: "summary"; postId: number }
    | { view: "replies"; postId: number }
    | { view: "reply-preview"; postId: number; original: string; rephrasings: [string, string] };

  const [panel, setPanel] = React.useState<PanelState>({ view: "analytics" });
  const [replyText, setReplyText] = React.useState("");
  const [replyTab, setReplyTab] = React.useState<"text" | "voice">("text");
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [voiceState, setVoiceState] = React.useState<"idle" | "recording" | "translating" | "done">("idle");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");
  const [liveTranscript, setLiveTranscript] = React.useState("");
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  /** Stores the native-language transcript + lang code after voice recording */
  const [voiceRecording, setVoiceRecording] = React.useState<{ lang: string; original: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null);
  const finalTranscriptRef = React.useRef("");
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const activePostId = panel.view !== "analytics" ? panel.postId : null;
  const activePost = activePostId !== null
    ? COMMUNITY_POSTS.find((p) => p.id === activePostId) ?? null
    : null;
  /** True when we have a non-English voice recording to display alongside the translation */
  const hasNativeTranscript = voiceRecording !== null && !voiceRecording.lang.startsWith("en");
  const voiceLangInfo = hasNativeTranscript
    ? (VOICE_LANGUAGES.find((l) => l.code === voiceRecording!.lang) ?? null)
    : null;

  function openReplies(postId: number) {
    setPanel({ view: "replies", postId });
    setReplyText("");
    setReplyTab("text");
    setVoiceRecording(null);
  }

  function openSummary(postId: number) {
    setPanel({ view: "summary", postId });
  }

  function closePanel() {
    setPanel({ view: "analytics" });
    setReplyText("");
    setVoiceRecording(null);
  }

  function handlePreviewSend() {
    if (panel.view !== "replies") return;
    const rephrasings = generateRephrasings(replyText);
    setSelectedVersion(1);
    setPanel({ view: "reply-preview", postId: panel.postId, original: replyText, rephrasings });
  }

  function handleBackToCompose() {
    if (panel.view !== "reply-preview") return;
    const { postId, original } = panel;
    setReplyText(original);
    setPanel({ view: "replies", postId });
  }

  /* ── Voice recording ── */
  function stopVoiceTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function stopVoiceRecording() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    stopVoiceTimer();
  }

  function formatSeconds(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function startVoiceRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice recording requires Chrome or Edge. Please type your reply instead.");
      return;
    }
    finalTranscriptRef.current = "";
    setLiveTranscript("");
    setRecordingSeconds(0);
    setVoiceState("recording");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveTranscript((finalTranscriptRef.current + interim).trim());
    };

    recognition.onend = () => {
      stopVoiceTimer();
      const text = finalTranscriptRef.current.trim();
      if (!text) { setVoiceState("idle"); return; }

      const isEnglish = voiceLang === "en-IN" || voiceLang.startsWith("en");

      if (isEnglish) {
        // No translation needed — go straight to done
        setVoiceRecording(null);
        setReplyText(text);
        setVoiceState("done");
        setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
      } else {
        // Store original native-language transcript so we can show it alongside the translation
        setVoiceRecording({ lang: voiceLang, original: text });
        setVoiceState("translating");
        (async () => {
          try {
            const res = await fetch(
              `/api/translate?text=${encodeURIComponent(text)}&from=${encodeURIComponent(voiceLang)}`
            );
            const data = await res.json() as { translated: string; original: string };
            setReplyText(data.translated || text);
          } catch {
            setReplyText(text); // graceful fallback: use original transcript
          }
          setVoiceState("done");
          setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
        })();
      }
    };

    recognition.onerror = () => { stopVoiceTimer(); setVoiceState("idle"); };

    recognitionRef.current = recognition;
    recognition.start();
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  }

  /* Stop recording on unmount */
  React.useEffect(() => {
    return () => { stopVoiceRecording(); }; // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  /* Stop recording when user navigates away from the replies panel */
  React.useEffect(() => {
    if (panel.view !== "replies") { stopVoiceRecording(); setVoiceState("idle"); }
  }, [panel.view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header banner ── */}
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <MessageSquareIcon className="size-4" />
            </div>
            <span className="font-bold text-lg">ArogyaTalk</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">Community</Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              <GlobeIcon className="size-2.5" /> Public
            </Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              <UsersIcon className="size-2.5" /> 12,847 members
            </Badge>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed mt-2">
            Connect with other ArogyaVault members. Ask questions, share experiences, support each other.{" "}
            <a
              href="/arogyatalk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
            >
              Learn more →
            </a>
          </p>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* LEFT — Compose + Posts (no max-w-xl so posts fill the column) */}
        <div className="flex-1 min-w-0 overflow-y-auto px-5 pb-5 lg:px-6">
          <div className="space-y-3 pt-1">

            {/* Compose box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex gap-2 items-start">
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">KU</AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Share a tip, ask the community, or start a discussion…
                </div>
                <Button size="sm" className="shrink-0">Post</Button>
              </div>
            </div>

            {/* Post cards */}
            {COMMUNITY_POSTS.map((p) => (
              <div
                key={p.id}
                onClick={() => openReplies(p.id)}
                className={cn(
                  "rounded-xl border bg-background p-4 cursor-pointer transition-colors",
                  activePostId === p.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/20 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{p.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{p.author}</span>
                      <span className="text-xs text-muted-foreground">{p.location} · {p.time}</span>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{p.tag}</Badge>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed">{p.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {/* Like */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUpIcon className="size-3.5" /> {p.likes}
                      </button>
                      {/* Replies */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openReplies(p.id); }}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          panel.view === "replies" && activePostId === p.id
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <MessageSquareIcon className="size-3.5" />
                        {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}
                      </button>
                      {/* AI Summary */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openSummary(p.id); }}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          panel.view === "summary" && activePostId === p.id
                            ? "text-violet-600 font-medium"
                            : "text-muted-foreground hover:text-violet-600"
                        )}
                      >
                        <SparklesIcon className="size-3.5" /> AI Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — State-machine panel */}
        <div className="w-72 shrink-0 overflow-y-auto">

          {/* ── ANALYTICS ── */}
          {panel.view === "analytics" && (
            <div className="p-4 space-y-5">
              {/* Community Pulse */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ZapIcon className="size-3 text-primary" /> Community Pulse
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Members",    value: "12,847" },
                    { label: "Today",      value: "23 posts" },
                    { label: "Active now", value: "156" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-background p-2 text-center">
                      <p className="text-sm font-bold text-primary leading-tight">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FlameIcon className="size-3 text-orange-500" /> Trending Topics
                </p>
                <div className="space-y-2">
                  {TRENDING_TOPICS.map((t) => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs truncate flex-1">{t.topic}</span>
                        <span className="text-[10px] text-muted-foreground ml-1 shrink-0">{t.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Regions */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPinIcon className="size-3 text-primary" /> Active Regions
                </p>
                <div className="space-y-2">
                  {REGION_ACTIVITY.map((r) => (
                    <div key={r.region}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs">{r.region}</span>
                        <span className="text-[10px] text-muted-foreground">{r.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TrophyIcon className="size-3 text-amber-500" /> Top Contributors
                </p>
                <div className="space-y-2.5">
                  {TOP_CONTRIBUTORS.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-3 shrink-0">{i + 1}</span>
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{c.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.helpful} helpful votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  Click any post to read replies or tap <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI Summary for a quick digest.
                </p>
                <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
                  Ask the Community
                </Button>
              </div>
            </div>
          )}

          {/* ── AI SUMMARY ── */}
          {panel.view === "summary" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="size-4 text-violet-600" />
                  <span className="text-sm font-semibold">AI Summary</span>
                </div>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Original question */}
              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">
                  {activePost.author} · {activePost.location}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{activePost.text}</p>
              </div>

              {/* AI-synthesised summary */}
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
                    <SparklesIcon className="size-3 text-violet-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-violet-700">ArogyaAI Summary</span>
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[9px] ml-auto">
                    {activePost.replyCount} replies analysed
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {POST_SUMMARIES[activePost.id]}
                </p>
              </div>

              {/* View replies CTA */}
              <button
                onClick={() => openReplies(activePost.id)}
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquareIcon className="size-3.5" /> View all {activePost.replyCount} replies
              </button>
            </div>
          )}

          {/* ── REPLIES + COMPOSE ── */}
          {panel.view === "replies" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{activePost.replyCount} Replies</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Post preview */}
              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">
                  {activePost.author} · {activePost.location}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {activePost.text}
                </p>
              </div>

              {/* Reply list */}
              <div className="space-y-3">
                {activePost.replies.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <Avatar className="size-6 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{r.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-xl rounded-tl-sm bg-muted border border-border/60 px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold">{r.author}</span>
                        <span className="text-[10px] text-muted-foreground">{r.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compose area */}
              <div className="space-y-2.5 pt-1 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground pt-2">Add your reply</p>

                {/* Voice / Text tabs */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setReplyTab("text")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors",
                      replyTab === "text"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquareIcon className="size-3" /> Text
                  </button>
                  <button
                    onClick={() => setReplyTab("voice")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors",
                      replyTab === "voice"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MicIcon className="size-3" /> Voice
                  </button>
                </div>

                {replyTab === "text" ? (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a helpful reply…"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />

                    {/* Original native-language transcript reference */}
                    {hasNativeTranscript && voiceRecording && (
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MicIcon className="size-3 text-muted-foreground/60" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {voiceLangInfo?.native ?? voiceRecording.lang} · Original
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                          {voiceRecording.original}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!replyText.trim()}
                      onClick={handlePreviewSend}
                    >
                      Preview &amp; Send
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2.5">

                    {/* ── IDLE ── */}
                    {voiceState === "idle" && (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                          <MicIcon className="size-5 text-primary" />
                        </div>

                        {/* Language picker */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Speak in
                          </label>
                          <select
                            value={voiceLang}
                            onChange={(e) => setVoiceLang(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                          >
                            {VOICE_LANGUAGES.map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.native}  —  {l.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-snug text-center">
                          ArogyaAI will transcribe your speech live as you speak.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-primary/30 text-primary"
                          onClick={startVoiceRecording}
                        >
                          Start Recording
                        </Button>
                      </div>
                    )}

                    {/* ── RECORDING ── */}
                    {voiceState === "recording" && (
                      <div className="space-y-2.5">
                        {/* Pulsing mic + timer */}
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            <div className="relative flex size-12 items-center justify-center rounded-full bg-red-500 shadow-md">
                              <MicIcon className="size-5 text-white" />
                            </div>
                          </div>
                          <span className="text-sm font-mono font-bold text-red-500 tabular-nums">
                            {formatSeconds(recordingSeconds)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Listening in</span>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}
                            </span>
                          </div>
                        </div>
                        {/* Live transcript preview */}
                        <div className="rounded-lg border border-border bg-background px-3 py-2.5 min-h-[60px] flex items-start">
                          {liveTranscript ? (
                            <p className="text-xs leading-relaxed text-foreground/70 italic">{liveTranscript}</p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/50 italic m-auto self-center w-full text-center">
                              Start speaking…
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={stopVoiceRecording}
                        >
                          Stop Recording
                        </Button>
                      </div>
                    )}

                    {/* ── TRANSLATING ── */}
                    {voiceState === "translating" && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                        {/* Spinning sparkles icon */}
                        <div
                          className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto animate-spin"
                          style={{ animationDuration: "1.8s" }}
                        >
                          <SparklesIcon className="size-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-primary">Translating to English…</p>
                        {/* Show source → target */}
                        <p className="text-[11px] text-muted-foreground">
                          {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}
                          {" → "}
                          <span className="font-medium text-foreground/70">English</span>
                        </p>
                        {/* Original transcript preview */}
                        {liveTranscript && (
                          <p className="text-[11px] text-muted-foreground/60 italic leading-snug line-clamp-3 pt-1 border-t border-border/50">
                            {liveTranscript}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── DONE — briefly shown before auto-switch to text tab ── */}
                    {voiceState === "done" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-2">
                          <span className="text-emerald-600 text-lg font-bold leading-none">✓</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">Transcribed successfully!</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Opening text editor…</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REPLY PREVIEW ── */}
          {panel.view === "reply-preview" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToCompose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="size-4" />
                </button>
                <span className="text-sm font-semibold flex-1">Review Your Reply</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Your reply — English (translated if voice was in another language) */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {hasNativeTranscript ? "Your reply · English (Translated)" : "Your reply"}
                </p>
                <button
                  onClick={() => setSelectedVersion(0)}
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                    selectedVersion === 0
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <p className="text-xs leading-relaxed">{panel.original}</p>
                  {selectedVersion === 0 && (
                    <span className="text-[10px] text-primary font-medium mt-1 block">✓ Selected</span>
                  )}
                </button>
              </div>

              {/* Original native-language recording — shown only when voice was non-English */}
              {hasNativeTranscript && voiceRecording && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MicIcon className="size-3" />
                    {voiceLangInfo?.native ?? voiceRecording.lang} · Recorded
                  </p>
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {voiceLangInfo?.label ?? voiceRecording.lang}
                      </span>
                      <span className="text-[10px] text-muted-foreground">→ Translated to English above</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {voiceRecording.original}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Rephrasings */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <SparklesIcon className="size-3 text-violet-500" /> AI Rephrasings
                </p>
                <div className="space-y-2">
                  {panel.rephrasings.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVersion((i + 1) as 1 | 2)}
                      className={cn(
                        "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                        selectedVersion === i + 1
                          ? "border-violet-400 bg-violet-50/50"
                          : "border-border bg-background hover:border-violet-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-violet-600">Version {i + 1}</span>
                        {selectedVersion === i + 1 && (
                          <span className="text-[10px] text-violet-600 font-medium">✓ Selected</span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed">{r}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ArogyaAI perspective */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                    <ZapIcon className="size-3 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">ArogyaAI's perspective</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {POST_AI_RESPONSES[activePost.id]}
                </p>
              </div>

              {/* Submit */}
              <Button size="sm" className="w-full" onClick={closePanel}>
                Submit Reply
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LINKED MEMBER — info card + post feed (like ArogyaTalk)
═══════════════════════════════════════════════════════════════════ */
const LINKED_MEMBER_DATA: Record<string, {
  name: string; relation: string; direction: string; scope: string;
  badgeLabel: string; initials: string;
  posts: { initials: string; author: string; time: string; text: string; likes: number; replies: number; tag: string }[];
}> = {
  ravi: {
    name: "Ravi Kumar", relation: "Family Member", direction: "You invited them",
    scope: "App Access — you can view all their records",
    badgeLabel: "Family", initials: "RK",
    posts: [
      { initials: "RK", author: "Ravi Kumar",   time: "1 hour ago",  text: "Just uploaded my latest CBC report. Let me know if anything looks off — flagging it here so you can check too.",                    likes: 2,  replies: 1, tag: "Lab Report" },
      { initials: "KU", author: "You",           time: "Yesterday",   text: "Ravi, your Haemoglobin was 11.2 g/dL last time — mildly low. Please make sure you're taking the iron supplements daily.",          likes: 0,  replies: 0, tag: "Reminder" },
      { initials: "RK", author: "Ravi Kumar",   time: "3 days ago",  text: "Doctor suggested we get a thyroid panel done this month. Will upload once the report comes in.",                                      likes: 1,  replies: 1, tag: "Follow-up" },
    ],
  },
  sharma: {
    name: "Dr. Sharma's Clinic", relation: "Doctor", direction: "They invited you",
    scope: "Group Access — they can see documents you share",
    badgeLabel: "Clinic", initials: "DS",
    posts: [
      { initials: "DS", author: "Dr. Sharma's Clinic", time: "2 hours ago",  text: "Your post-operative report has been reviewed. Healing is on track. Please continue the prescribed antibiotics for the full course.",  likes: 0,  replies: 1, tag: "Post-op" },
      { initials: "KU", author: "You",                 time: "Yesterday",    text: "Doctor, I've uploaded the wound photos as requested. Please review at your earliest convenience.",                                       likes: 0,  replies: 0, tag: "Update" },
      { initials: "DS", author: "Dr. Sharma's Clinic", time: "4 days ago",   text: "Discharge summary has been added to your group. Please review the follow-up schedule — next visit in 2 weeks.",                        likes: 0,  replies: 1, tag: "Discharge" },
    ],
  },
  priya: {
    name: "Priya Singh", relation: "Caregiver", direction: "Mutual access",
    scope: "App Access — both directions active",
    badgeLabel: "Caregiver", initials: "PS",
    posts: [
      { initials: "PS", author: "Priya Singh", time: "30 min ago",  text: "Kumar took his morning medications on time. Also reminded him about the follow-up with Dr. Suresh on 7 April.",                likes: 1,  replies: 0, tag: "Medication" },
      { initials: "KU", author: "You",         time: "This morning", text: "Priya, please note I had a mild headache last night — could be BP-related. Will monitor today and update here.",               likes: 0,  replies: 1, tag: "Symptom" },
      { initials: "PS", author: "Priya Singh", time: "2 days ago",  text: "Haemogram results uploaded. Iron levels are still low — have asked the pharmacy to refill the Iron supplement prescription.", likes: 2,  replies: 1, tag: "Lab Report" },
    ],
  },
};

function LinkedMemberContent({ id }: { id: string }) {
  const member = LINKED_MEMBER_DATA[id];
  const [inviteOpen, setInviteOpen] = React.useState(false);
  if (!member) return null;

  return (
    <div className="space-y-5">

      {/* ── Info header card (like ArogyaTalk header) ── */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {member.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base leading-tight">{member.name}</span>
              <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">{member.badgeLabel}</Badge>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-0.5">{member.relation}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-white/30 text-primary-foreground hover:bg-white/10 text-xs gap-1.5"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlusIcon className="size-3.5" />
            Invite
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <ArrowRightLeftIcon className="size-3 text-primary-foreground/60 shrink-0" />
          <span className="text-xs text-primary-foreground/70">{member.direction}</span>
        </div>
        <p className="text-xs text-primary-foreground/80 mt-1">{member.scope}</p>
      </div>

      {/* ── Compose / post card (like ArogyaTalk compose) ── */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex gap-2 items-start">
          <Avatar className="size-7 shrink-0 mt-0.5">
            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">KU</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            Share an update, note, or question with {member.name.split(" ")[0]}…
          </div>
          <Button size="sm" className="shrink-0">Post</Button>
        </div>
      </div>

      {/* ── Shared posts feed ── */}
      <div className="space-y-3">
        {member.posts.map((p, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{p.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{p.author}</span>
                  <span className="text-xs text-muted-foreground">{p.time}</span>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{p.tag}</Badge>
                </div>
                <p className="text-sm mt-1.5 leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUpIcon className="size-3.5" /> {p.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquareIcon className="size-3.5" /> {p.replies} {p.replies === 1 ? "reply" : "replies"}
                  </button>
                  <Link
                    href={`/groups?g=${id}`}
                    className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Manage group <ArrowRightIcon className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite to group modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        groupContext={`${member.name}'s group`}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LiveboardPage() {
  const searchParams = useSearchParams();
  const group = searchParams.get("g") ?? "yours";

  const isLinked = group === "ravi" || group === "sharma" || group === "priya";

  const isSystem = !isLinked; // yours, arogyaai, community

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sticky ContentTabs — never scrolls away */}
      <div className="shrink-0 px-5 pt-5 lg:px-6 lg:pt-6">
        {isSystem && <ContentTabs active="home" showGroupSettings={false} />}
        {isLinked && <ContentTabs active="home" showGroupSettings={true} />}
      </div>

      {/* ArogyaTalk: full-height two-column layout — manages its own scroll */}
      {group === "community" && (
        <div className="flex-1 overflow-hidden min-h-0">
          <ArogyaTalkContent />
        </div>
      )}

      {/* All other groups: standard single-column scroll */}
      {group !== "community" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6 max-w-4xl space-y-4">
            {group === "yours"    && <YoursContent />}
            {group === "arogyaai" && <ArogyaAIContent />}
            {isLinked             && <LinkedMemberContent id={group} />}
          </div>
        </div>
      )}
    </div>
  );
}
