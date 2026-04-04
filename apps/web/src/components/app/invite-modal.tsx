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
import { Label } from "@/core/ui/label";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/core/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/core/ui/input-otp";

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
  /** When set, pre-selects this group in the invite-level dropdown.
   *  undefined = generic invite (defaults to "app" level). */
  groupContext?: string;
};

/* ── Invite level options ────────────────────────────────────────── */
type InviteLevel = { id: string; label: string; sub: string };

const INVITE_LEVELS: InviteLevel[] = [
  { id: "app",       label: "App Access",          sub: "Invite to join ArogyaVault" },
  { id: "community", label: "Community",            sub: "ArogyaCommunity feed" },
  { id: "ravi",      label: "Ravi Kumar",           sub: "Family Member group" },
  { id: "sharma",    label: "Dr. Sharma's Clinic",  sub: "Doctor group" },
  { id: "priya",     label: "Priya Singh",          sub: "Caregiver group" },
];

const inviteLevelLabel = (id: string): string => {
  return INVITE_LEVELS.find((l) => l.id === id)?.label ?? id;
};

/* ── Helpers ─────────────────────────────────────────────────────── */
const simulateLookup = (phone: string): "existing" | "new" => {
  const digits = phone.replace(/\D/g, "");
  const last = parseInt(digits[digits.length - 1] ?? "1", 10);
  return last % 2 === 0 ? "existing" : "new";
};

const VALID_OTP = "123456";

/* ── Component ───────────────────────────────────────────────────── */
export const InviteModal = ({ open, onClose, groupContext }: InviteModalProps) => {
  const [step,        setStep]        = React.useState<Step>("phone");
  const [phone,       setPhone]       = React.useState("");
  const [otp,         setOtp]         = React.useState("");
  const [otpError,    setOtpError]    = React.useState(false);
  const [inviteLevel, setInviteLevel] = React.useState<string>(groupContext ?? "app");

  /* Re-sync invite level whenever the modal opens with a new context */
  React.useEffect(() => {
    if (open) setInviteLevel(groupContext ?? "app");
  }, [open, groupContext]);

  /* Reset state when modal closes */
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

  /* ── Actions ─────────────────────────────────────────────────── */
  const handleContinue = () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setStep("checking");
    setTimeout(() => setStep(simulateLookup(phone)), 900);
  };

  const handleSendApp = () => { setStep("sent"); };
  const handleSendWhatsApp = () => { setStep("sent"); };

  const handleSendOtp = () => {
    setOtp("");
    setOtpError(false);
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    setStep("verifying");
    setTimeout(() => {
      if (otp === VALID_OTP) {
        setStep("created");
      } else {
        setOtpError(true);
        setStep("otp");
      }
    }, 900);
  };

  if (!open) return null;

  const levelLabel   = inviteLevelLabel(inviteLevel);
  const isAppLevel   = inviteLevel === "app";
  const phoneReady   = phone.replace(/\D/g, "").length >= 10;
  /* Footer is shown only while the user is entering phone + level */
  const showFooter   = step === "phone";

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
          className="w-full max-w-sm rounded-2xl bg-background border border-border shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
            <div className="space-y-0.5">
              <h2 className="font-semibold text-base leading-none">
                {isAppLevel ? "Invite to ArogyaVault" : `Invite to ${levelLabel}`}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isAppLevel
                  ? "Invite someone to join ArogyaVault"
                  : <>Adding someone to <span className="text-primary font-medium">{levelLabel}</span></>
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="rounded-full text-muted-foreground"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="px-5 py-5 space-y-4 flex-1">

            {/* Phone + invite level — shown during phone/lookup steps */}
            {(step === "phone" || step === "checking" || step === "existing" || step === "new") && (
              <>
                {/* Mobile number — Continue button removed from here */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Mobile Number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (step !== "phone") setStep("phone");
                    }}
                    placeholder="+91 98765 43210"
                    disabled={step === "checking"}
                    onKeyDown={(e) => e.key === "Enter" && step === "phone" && handleContinue()}
                  />
                </div>

                {/* Invite level */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Invite for</Label>
                  <Select
                    value={inviteLevel}
                    onValueChange={setInviteLevel}
                    disabled={step === "checking"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVITE_LEVELS.map((lvl) => (
                        <SelectItem key={lvl.id} value={lvl.id}>
                          {lvl.label} — {lvl.sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Checking */}
            {step === "checking" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-1">
                <LoaderIcon className="size-4 animate-spin" />
                Looking up on ArogyaVault…
              </div>
            )}

            {/* Existing user */}
            {step === "existing" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <UserCheckIcon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">ArogyaVault user found</p>
                    <p className="text-xs text-muted-foreground">
                      {isAppLevel
                        ? "Invitation will appear in their app & notifications"
                        : <>Sending invite to join <strong>{levelLabel}</strong></>
                      }
                    </p>
                  </div>
                </div>
                <Button className="w-full cursor-pointer" onClick={handleSendApp}>
                  <SendIcon className="size-3.5 mr-1.5" />
                  {isAppLevel ? "Send In-App Invitation" : `Add to ${levelLabel}`}
                </Button>
              </div>
            )}

            {/* New user */}
            {step === "new" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3.5 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <UserPlusIcon className="size-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Not on ArogyaVault yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAppLevel
                        ? "Invite them to join and link to your vault"
                        : <>Invite them to join and add to <strong>{levelLabel}</strong></>
                      }
                    </p>
                  </div>
                </div>
                <Button className="w-full cursor-pointer" onClick={handleSendWhatsApp}>
                  <MessageCircleIcon className="size-3.5 mr-1.5" />
                  Invite via WhatsApp
                </Button>
                <Button variant="outline" className="w-full cursor-pointer" onClick={handleSendOtp}>
                  <SmartphoneIcon className="size-3.5 mr-1.5" />
                  Send OTP to Register
                </Button>
              </div>
            )}

            {/* OTP entry */}
            {(step === "otp" || step === "verifying") && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRoundIcon className="size-3.5 text-primary shrink-0" />
                    <p className="text-xs font-semibold text-primary">OTP sent to {phone}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The invited person received a one-time password. Enter it below to complete
                    their registration and create the link.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground text-center block">
                    Enter 6-digit OTP
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(val) => { setOtp(val); setOtpError(false); }}
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="h-10 w-9 text-base font-bold rounded-lg" />
                        <InputOTPSlot index={1} className="h-10 w-9 text-base font-bold rounded-lg" />
                        <InputOTPSlot index={2} className="h-10 w-9 text-base font-bold rounded-lg" />
                        <InputOTPSlot index={3} className="h-10 w-9 text-base font-bold rounded-lg" />
                        <InputOTPSlot index={4} className="h-10 w-9 text-base font-bold rounded-lg" />
                        <InputOTPSlot index={5} className="h-10 w-9 text-base font-bold rounded-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {otpError && (
                    <div className="flex items-center gap-1.5 justify-center text-xs text-destructive">
                      <AlertCircleIcon className="size-3.5" />
                      Incorrect OTP. Please try again.
                    </div>
                  )}
                </div>
                <Button
                  className="w-full cursor-pointer"
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || step === "verifying"}
                >
                  {step === "verifying"
                    ? <><LoaderIcon className="size-3.5 mr-1.5 animate-spin" /> Verifying…</>
                    : "Verify & Create Account"
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("new")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </Button>
              </div>
            )}

            {/* Account created */}
            {step === "created" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <UsersIcon className="size-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Account created!</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A new ArogyaVault account has been created for <strong>{phone}</strong>.
                    {isAppLevel
                      ? " They can now sign in and view shared records."
                      : <> They've been added to <strong>{levelLabel}</strong> and can now sign in.</>
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" /> Account registered
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    {isAppLevel ? "App access granted" : `Added to ${levelLabel}`}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" /> Welcome notification sent
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-1 cursor-pointer" onClick={onClose}>Done</Button>
              </div>
            )}

            {/* Sent */}
            {step === "sent" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <CheckCircle2Icon className="size-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">Invitation sent!</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {phone} will receive the invitation.
                  {isAppLevel
                    ? " Once they accept, the link becomes active in your activity feed."
                    : <> Once they accept, they'll appear in <strong>{levelLabel}</strong>.</>
                  }
                </p>
                <Button size="sm" variant="outline" className="mt-1 cursor-pointer" onClick={onClose}>Done</Button>
              </div>
            )}
          </div>

          {/* ── Footer — Continue + Cancel (phone step only) ────── */}
          {showFooter && (
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleContinue}
                disabled={!phoneReady}
                className="cursor-pointer"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
