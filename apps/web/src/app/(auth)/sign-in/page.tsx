"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  SmartphoneIcon,
  LockKeyholeIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Separator } from "@/core/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/core/ui/input-otp";
import { cn } from "@/lib/utils";

/* ── Trust points shown on the left panel ───────────────────────── */
const TRUST_POINTS = [
  { icon: ShieldCheckIcon, text: "AES-256 encrypted at rest and in transit" },
  { icon: SmartphoneIcon,  text: "OTP-only — no passwords, ever" },
  { icon: LockKeyholeIcon, text: "Your records are never shared without consent" },
];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const router = useRouter();
  const [step, setStep]       = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone]     = React.useState("+91 98765 43210");
  const [otp, setOtp]         = React.useState("123456");
  const [loading, setLoading] = React.useState(false);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 900);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { router.push("/liveboard"); }, 1000);
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div className="space-y-8">
          <div>
            <p className="text-primary-foreground/60 text-sm font-medium uppercase tracking-widest mb-3">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Your health records,<br />always with you.
            </h1>
            <p className="mt-4 text-primary-foreground/75 leading-relaxed">
              Sign in with your mobile number. No password needed —
              your phone is your key to a lifetime of secure medical records.
            </p>
          </div>

          <div className="space-y-4">
            {TRUST_POINTS.map((tp) => (
              <div key={tp.text} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                  <tp.icon className="size-4" />
                </div>
                <p className="text-sm text-primary-foreground/80 leading-snug pt-1">{tp.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial quote */}
        <div className="rounded-xl bg-primary-foreground/10 p-5 border border-primary-foreground/20">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="size-3.5 fill-yellow-300 text-yellow-300" />
            ))}
          </div>
          <p className="text-sm text-primary-foreground/85 leading-relaxed italic">
            "Finally I can walk into any hospital and show my complete history in seconds.
            ArogyaVault changed how our entire family manages health."
          </p>
          <p className="mt-3 text-xs text-primary-foreground/60 font-medium">
            — Priya Sharma, Hyderabad
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <StepDot active={true}  done={step === "otp"} label="1" />
            <Separator
              className={cn("transition-colors", step === "otp" ? "bg-primary" : "bg-border")}
              style={{ flex: 1, flexShrink: 1 }}
            />
            <StepDot active={step === "otp"} done={false} label="2" />
          </div>

          {/* ── Step 1: Phone ─────────────────────────────────── */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Enter your mobile number</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll send a 6-digit OTP to verify it's you.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="h-11 text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Indian numbers only. OTP via SMS.
                </p>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Sending OTP…" : (
                  <span className="flex items-center gap-2">
                    Send OTP <ChevronRightIcon className="size-4" />
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our{" "}
                <Link href="/contact" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/security" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
              </p>
            </form>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────── */}
          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Enter the OTP</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sent to <span className="font-semibold text-foreground">{phone}</span>.{" "}
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    onClick={() => setStep("phone")}
                    className="h-auto p-0 text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Change
                  </Button>
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">6-digit OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(val) => setOtp(val)}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-12 w-12 text-lg rounded-md border-border" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-lg rounded-md border-border" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-lg rounded-md border-border" />
                    <InputOTPSlot index={3} className="h-12 w-12 text-lg rounded-md border-border" />
                    <InputOTPSlot index={4} className="h-12 w-12 text-lg rounded-md border-border" />
                    <InputOTPSlot index={5} className="h-12 w-12 text-lg rounded-md border-border" />
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it?{" "}
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    className="h-auto p-0 text-primary underline underline-offset-4"
                  >
                    Resend OTP
                  </Button>
                </p>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading || otp.length < 6}>
                {loading ? "Verifying…" : (
                  <span className="flex items-center gap-2">
                    Verify &amp; Sign In <CheckCircle2Icon className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper: step dot ─────────────────────────────────────────────── */
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={cn(
      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors",
      done  ? "bg-primary border-primary text-primary-foreground" :
      active ? "border-primary text-primary" :
               "border-border text-muted-foreground"
    )}>
      {done ? <CheckCircle2Icon className="size-4" /> : label}
    </div>
  );
}
