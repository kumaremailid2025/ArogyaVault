"use client";

import * as React from "react";
import {
  XIcon, SmartphoneIcon, SendIcon,
  MessageCircleIcon, UserCheckIcon, UserPlusIcon,
  CheckCircle2Icon, LoaderIcon, KeyRoundIcon,
  AlertCircleIcon, UsersIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────────────── */
type Step =
  | "phone"
  | "checking"
  | "existing"
  | "new"
  | "otp"
  | "verifying"
  | "created"
  | "sent";

export type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  /** When set, frames the invite as adding to this specific group */
  groupContext?: string;
};

/* ── Helpers ─────────────────────────────────────────────────────── */
/** Simulate: last digit even = existing ArogyaVault user */
function simulateLookup(phone: string): "existing" | "new" {
  const digits = phone.replace(/\D/g, "");
  const last = parseInt(digits[digits.length - 1] ?? "1", 10);
  return last % 2 === 0 ? "existing" : "new";
}

const VALID_OTP = "123456";

/* ── OTP input — 6 individual boxes ─────────────────────────────── */
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[idx] = char;
    const next = arr.join("").slice(0, 6);
    onChange(next);
    if (char && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          className={cn(
            "w-9 h-10 text-center text-base font-bold rounded-lg border-2 bg-background transition-colors outline-none",
            "focus:border-primary",
            value[i] ? "border-primary/60" : "border-border"
          )}
        />
      ))}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────── */
export function InviteModal({ open, onClose, groupContext }: InviteModalProps) {
  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setOtpError(false);
      }, 200);
    }
  }, [open]);

  function handleContinue() {
    if (phone.replace(/\D/g, "").length < 10) return;
    setStep("checking");
    setTimeout(() => setStep(simulateLookup(phone)), 900);
  }

  function handleSendApp() {
    setStep("sent");
  }

  function handleSendWhatsApp() {
    setStep("sent");
  }

  function handleSendOtp() {
    /* Move to OTP entry step */
    setOtp("");
    setOtpError(false);
    setStep("otp");
  }

  function handleVerifyOtp() {
    setStep("verifying");
    setTimeout(() => {
      if (otp === VALID_OTP) {
        setStep("created");
      } else {
        setOtpError(true);
        setStep("otp");
      }
    }, 900);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Invite person"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
            <div className="space-y-0.5">
              <h2 className="font-semibold text-base leading-none">
                {groupContext ? "Invite to Group" : "Invite & Link"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {groupContext ? (
                  <>Adding someone to <span className="text-primary font-medium">{groupContext}</span></>
                ) : (
                  "Link a family member or doctor to your vault"
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">

            {/* ── Phone input (steps: phone, checking, existing, new) ── */}
            {(step === "phone" || step === "checking" || step === "existing" || step === "new") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Mobile Number</label>
                <div className="flex gap-2">
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (step !== "phone") setStep("phone");
                    }}
                    placeholder="+91 98765 43210"
                    className="flex-1"
                    disabled={step === "checking"}
                    onKeyDown={(e) => e.key === "Enter" && step === "phone" && handleContinue()}
                  />
                  {step === "phone" && (
                    <Button
                      size="sm"
                      onClick={handleContinue}
                      disabled={phone.replace(/\D/g, "").length < 10}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ── Checking ── */}
            {step === "checking" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-1">
                <LoaderIcon className="size-4 animate-spin" />
                Looking up on ArogyaVault…
              </div>
            )}

            {/* ── Existing user ── */}
            {step === "existing" && (
              <div className="space-y-3">
                <div className={cn(
                  "rounded-xl border p-3.5 flex items-center gap-3",
                  "border-primary/20 bg-primary/5"
                )}>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <UserCheckIcon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">ArogyaVault user found</p>
                    <p className="text-xs text-muted-foreground">
                      Invitation will appear in their app & notifications
                    </p>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSendApp}>
                  <SendIcon className="size-3.5 mr-1.5" />
                  Send In-App Invitation
                </Button>
              </div>
            )}

            {/* ── New user ── */}
            {step === "new" && (
              <div className="space-y-3">
                <div className={cn(
                  "rounded-xl border p-3.5 flex items-center gap-3",
                  "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                )}>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <UserPlusIcon className="size-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Not on ArogyaVault yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invite them to join and link to your vault
                    </p>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSendWhatsApp}>
                  <MessageCircleIcon className="size-3.5 mr-1.5" />
                  Invite via WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSendOtp}>
                  <SmartphoneIcon className="size-3.5 mr-1.5" />
                  Send OTP to Register
                </Button>
              </div>
            )}

            {/* ── OTP entry ── */}
            {(step === "otp" || step === "verifying") && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRoundIcon className="size-3.5 text-primary shrink-0" />
                    <p className="text-xs font-semibold text-primary">OTP sent to {phone}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The invited person received a one-time password. Enter it below to complete
                    their registration and create the group link.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground text-center block">
                    Enter 6-digit OTP
                  </label>
                  <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(false); }} />
                  {otpError && (
                    <div className="flex items-center gap-1.5 justify-center text-xs text-destructive">
                      <AlertCircleIcon className="size-3.5" />
                      Incorrect OTP. Please try again.
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || step === "verifying"}
                >
                  {step === "verifying" ? (
                    <><LoaderIcon className="size-3.5 mr-1.5 animate-spin" /> Verifying…</>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>

                <button
                  onClick={() => setStep("new")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* ── Account created ── */}
            {step === "created" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <UsersIcon className="size-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Account created!</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A new ArogyaVault account has been created for <strong>{phone}</strong>.
                    The group link is now active — they can sign in and view shared records.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    Account registered
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    {groupContext ? groupContext + " created" : "Invite group created"}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    Welcome notification sent
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-1" onClick={onClose}>
                  Done
                </Button>
              </div>
            )}

            {/* ── Sent (WhatsApp / In-App) ── */}
            {step === "sent" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <CheckCircle2Icon className="size-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">Invitation sent!</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {phone} will receive the invitation. Once they accept, the group link
                  becomes active and will appear in your activity feed.
                </p>
                <Button size="sm" variant="outline" className="mt-1" onClick={onClose}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
