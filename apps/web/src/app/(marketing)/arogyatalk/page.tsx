import type { Metadata } from "next";
import {
  MessageSquareIcon, UsersIcon, ShieldCheckIcon, HeartPulseIcon,
  GlobeIcon, SparklesIcon, BookOpenIcon, CheckCircle2Icon,
  TrendingUpIcon, BrainCircuitIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ArogyaTalk — Community | ArogyaVault",
  description:
    "ArogyaTalk is ArogyaVault's public health community — a safe space to ask questions, share tips, and support fellow members. No personal data shared.",
};

const STATS = [
  { value: "12,847", label: "Community members" },
  { value: "4,200+", label: "Discussions started" },
  { value: "98%",    label: "Positive responses" },
  { value: "6",      label: "Health topic categories" },
];

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: "Completely Anonymous",
    desc: "Your medical records, diagnoses, and personal data are never shared in ArogyaTalk. Only your display name and location (optional) are visible.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: UsersIcon,
    title: "Peer Support",
    desc: "Connect with people managing similar conditions. Learn from lived experiences and share what has worked for you.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI-Verified Tips",
    desc: "ArogyaAI flags posts that contain potentially incorrect medical information, so you always get reliable community guidance.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: TrendingUpIcon,
    title: "Topic-Based Discovery",
    desc: "Browse by Diabetes, Heart Health, Nutrition, Women's Health, and more. Find exactly the conversations that matter to you.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: BookOpenIcon,
    title: "Curated Resources",
    desc: "Each topic category links to trusted health resources from ICMR, WHO, and top Indian medical institutions.",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: SparklesIcon,
    title: "Top Contributor Badges",
    desc: "Earn recognition for helpful, accurate posts. Community-voted badges highlight the most trusted voices in each topic.",
    color: "text-cyan-600 bg-cyan-50",
  },
];

const GUIDELINES = [
  "Never share personal medical data — no names, phone numbers, or lab report attachments",
  "Be respectful, supportive, and constructive in every reply",
  "Do not provide specific medical diagnoses or prescribe medications",
  "Mention your source when citing statistics or clinical studies",
  "Report posts that violate community guidelines using the flag button",
  "Use topic tags so others can find your post easily",
];

const TOPICS = [
  { label: "Diabetes Management", count: 342, color: "bg-primary/10 text-primary" },
  { label: "Blood Pressure",      count: 289, color: "bg-rose-100 text-rose-700" },
  { label: "Lab Reports & CBC",   count: 231, color: "bg-emerald-100 text-emerald-700" },
  { label: "Medications",         count: 198, color: "bg-amber-100 text-amber-700" },
  { label: "Heart Health",        count: 156, color: "bg-violet-100 text-violet-700" },
  { label: "Women's Health",      count: 134, color: "bg-pink-100 text-pink-700" },
  { label: "Nutrition",           count: 112, color: "bg-lime-100 text-lime-700" },
  { label: "Mental Wellness",     count: 98,  color: "bg-cyan-100 text-cyan-700" },
];

export default function ArogyaTalkPage() {
  return (
    <main className="flex-1">

      {/* ── Hero ── */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium mb-5">
            <GlobeIcon className="size-3.5" />
            Public Community · 12,847 members
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            ArogyaTalk
          </h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto mb-6">
            A safe, anonymous space where ArogyaVault members ask questions, share health experiences,
            and support each other — without ever sharing personal medical data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/liveboard?g=community"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-semibold px-5 py-2.5 text-sm hover:bg-white/90 transition-colors"
            >
              <MessageSquareIcon className="size-4" />
              Join the Discussion
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-border bg-muted/30 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is ArogyaTalk ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquareIcon className="size-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">What is ArogyaTalk?</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mb-6">
            ArogyaTalk is the community layer of ArogyaVault — a moderated, public forum where members
            share practical health tips, ask questions about managing conditions, and support each other
            through health journeys. Think of it as a trusted neighbourhood health group, scaled nationally.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border p-4 bg-background">
                <div className={`inline-flex size-9 items-center justify-center rounded-xl mb-3 ${f.color}`}>
                  <f.icon className="size-4" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active Topics ── */}
      <section className="py-14 px-4 bg-muted/20 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Active Topics</h2>
          <p className="text-muted-foreground mb-6">Browse conversations by health category</p>
          <div className="flex flex-wrap gap-3">
            {TOPICS.map((t) => (
              <a
                key={t.label}
                href="/liveboard?g=community"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${t.color} hover:opacity-80 transition-opacity`}
              >
                {t.label}
                <span className="text-xs opacity-70">({t.count})</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Guidelines ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100">
              <ShieldCheckIcon className="size-5 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">Community Guidelines</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            ArogyaTalk works because every member respects these simple rules. Violations are reviewed
            and may result in post removal or account suspension.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {GUIDELINES.map((g, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{g}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-xl mx-auto">
          <HeartPulseIcon className="size-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Join 12,847 members on ArogyaTalk</h2>
          <p className="text-primary-foreground/80 mb-6 leading-relaxed">
            Your experience managing a health condition is valuable. Share it anonymously and help
            someone else on their journey.
          </p>
          <a
            href="/liveboard?g=community"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-primary font-semibold px-6 py-3 text-sm hover:bg-white/90 transition-colors"
          >
            <MessageSquareIcon className="size-4" />
            Go to ArogyaTalk
          </a>
        </div>
      </section>

    </main>
  );
}
