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
import { inviteApi } from "@/lib/api/invite";

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
/**
 * Normalise whatever the user typed into an E.164 Indian number so the
 * backend (/invites/lookup, /invites/register-user) can validate it.
 *
 *   "98765 43210"    → "+919876543210"
 *   "+91 98765 43210"→ "+919876543210"
 *   "919876543210"   → "+919876543210"
 */
const normalizeIndianPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

/** Dev-only registration OTP — matches INVITE_REGISTER_OTP in the backend. */
const VALID_OTP = "123456";

/* ── Component ───────────────────────────────────────────────────── */
export const InviteModal = ({ open, onClose, groupContext }: InviteModalProps) => {
  const [step,        setStep]        = React.useState<Step>("phone");
  const [phone,       setPhone]       = React.useState("");
  const [otp,         setOtp]         = React.useState("");
  const [otpError,    setOtpError]    = React.useState(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [existingName, setExistingName] = React.useState<string | null>(null);
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
        setLookupError(null);
        setExistingName(null);
      }, 200);
    }
  }, [open]);

  /* ── Actions ─────────────────────────────────────────────────── */
  /**
   * Verify the entered number against the store:
   *   - Found → "existing" (offer in-app invitation)
   *   - Not found → "new"  (offer WhatsApp or Send OTP to Register)
   */
  const handleContinue = async () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setLookupError(null);
    setExistingName(null);
    setStep("checking");
    try {
      const normalized = normalizeIndianPhone(phone);
      const result = await inviteApi.lookupPhone({ phone: normalized });
      if (result.registered) {
        setExistingName(result.name);
        setStep("existing");
      } else {
        setStep("new");
      }
    } catch (err) {
      console.error("[InviteModal] lookup failed", err);
      setLookupError("Could not verify this number. Please try again.");
      setStep("phone");
    }
  };

  const handleSendApp = () => { setStep("sent"); };
  const handleSendWhatsApp = () => {
    // Open WhatsApp with a prefilled invite message. The backend will
    // wire up a proper click-to-chat flow once Twilio/WhatsApp is enabled.
    const normalized = normalizeIndianPhone(phone);
    const waNumber = normalized.replace(/\D/g, "");
    const text = encodeURIComponent(
      "Hi! I'm sharing my ArogyaVault health records with you. " +
      "Download the app and sign in with this number to get connected: " +
      "https://arogyavault.com",
    );
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener");
    }
    setStep("sent");
  };

  const handleSendOtp = () => {
    setOtp("");
    setOtpError(false);
    setStep("otp");
  };

  /**
   * Verify the 123456 OTP and actually create the user on the backend.
   * After success the new user can sign in via the normal /sign-in flow
   * and will see empty-state dashboards (no seeded data).
   */
  const handleVerifyOtp = async () => {
    if (otp !== VALID_OTP) {
      setOtpError(true);
      return;
    }
    setStep("verifying");
    try {
      await inviteApi.registerInvitee({
        phone: normalizeIndianPhone(phone),
        code: otp,
      });
      setStep("created");
    } catch (err) {
      console.error("[InviteModal] register failed", err);
      setOtpError(true);
      setStep("otp");
    }
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
                      setLookupError(null);
                      if (step !== "phone") setStep("phone");
                    }}
                    placeholder="+91 98765 43210"
                    disabled={step === "checking"}
                    onKeyDown={(e) => { if (e.key === "Enter" && step === "phone") void handleContinue(); }}
                  />
                  {lookupError && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircleIcon className="size-3.5 shrink-0" />
                      {lookupError}
                    </div>
                  )}
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
                    <p className="text-sm font-semibold text-primary">
                      {existingName ? `${existingName} is on ArogyaVault` : "ArogyaVault user found"}
                    </p>
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
                  onClick={() => void handleVerifyOtp()}
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
                onClick={() => void handleContinue()}
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
