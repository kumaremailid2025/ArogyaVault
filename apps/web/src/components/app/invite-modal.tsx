"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { useSidebar } from "@/data/sidebar-data";

/* ── Types ───────────────────────────────────────────────────────── */
type Step =
  | "phone"
  | "checking"
  | "existing"
  | "new"
  | "already-member"
  | "otp"
  | "verifying"
  | "created"
  | "sent";

export type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  /** Display label used in the modal header copy (e.g. "Ravi's group").
   *  Undefined = generic invite (defaults to new-group level). */
  groupContext?: string;
  /** Actual group UUID this modal is scoped to — passed to the phone
   *  lookup endpoint so the backend can report already_member=true when
   *  the invitee is already a member of this group. */
  groupId?: string;
};

/* ── Invite level options ─────────────────────────────────────────
   Two fixed choices live at the top of the dropdown:
     - "group" — create a brand-new linked group between inviter + invitee
     - "app"   — vault-only invite, no group is created
   followed by any existing linked groups owned by the inviter.
────────────────────────────────────────────────────────────────── */
const LEVEL_NEW_GROUP = "group";
const LEVEL_APP_ONLY  = "app";

interface InviteLevel {
  id: string;          // "group" | "app" | group UUID/slug
  label: string;
  sub: string;
}

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
export const InviteModal = ({
  open,
  onClose,
  groupContext,
  groupId,
}: InviteModalProps) => {
  const { LINKED_GROUPS } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();
  /** Group id returned by /invites/register-user — used to jump the user
   *  straight into the freshly-created group once they close the modal. */
  const [createdGroupId, setCreatedGroupId] = React.useState<string | null>(null);

  /* Build the level list: new-group first, vault second, then existing. */
  const inviteLevels: InviteLevel[] = React.useMemo(() => {
    const base: InviteLevel[] = [
      { id: LEVEL_NEW_GROUP, label: "Invite",               sub: "Create a new shared group" },
      { id: LEVEL_APP_ONLY,  label: "Invite to ArogyaVault", sub: "App access only — no group created" },
    ];
    const existing = LINKED_GROUPS.map<InviteLevel>((g) => ({
      id: g.slug,
      label: g.name,
      sub: `${g.rel} · ${g.sub}`,
    }));
    return [...base, ...existing];
  }, [LINKED_GROUPS]);

  /* Default level: if the modal is opened from inside a group, pre-select
   * that group's id; otherwise fall back to LEVEL_NEW_GROUP. The legacy
   * `groupContext` prop is now just a display label and no longer used
   * to drive level selection. */
  const defaultLevel = groupId ?? LEVEL_NEW_GROUP;

  const [step,        setStep]        = React.useState<Step>("phone");
  const [phone,       setPhone]       = React.useState("");
  const [otp,         setOtp]         = React.useState("");
  const [otpError,    setOtpError]    = React.useState(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [existingName, setExistingName] = React.useState<string | null>(null);
  const [inviteLevel, setInviteLevel] = React.useState<string>(defaultLevel);

  /* Re-sync invite level whenever the modal opens with a new context */
  React.useEffect(() => {
    if (open) setInviteLevel(defaultLevel);
  }, [open, defaultLevel]);

  /* Reset state when modal closes */
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setOtpError(false);
        setLookupError(null);
        setExistingName(null);
        setCreatedGroupId(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const currentLevel = inviteLevels.find((l) => l.id === inviteLevel) ?? inviteLevels[0];
  const levelLabel   = currentLevel?.label ?? "ArogyaVault";
  const isAppLevel   = inviteLevel === LEVEL_APP_ONLY;
  const isNewGroup   = inviteLevel === LEVEL_NEW_GROUP;

  /* ── Actions ─────────────────────────────────────────────────── */
  /**
   * Verify the entered number against the store:
   *   - Found → "existing" (can only add them to an existing section)
   *   - Not found → "new"  (offer WhatsApp or Send OTP to Register)
   */
  const handleContinue = async () => {
    if (phone.replace(/\D/g, "").length < 10) return;
    setLookupError(null);
    setExistingName(null);
    setStep("checking");
    try {
      const normalized = normalizeIndianPhone(phone);
      // If the modal was opened from inside a group, scope the lookup
      // to that group so the backend can tell us when the phone is
      // already a member. Fall back to the currently-selected invite
      // level if it's an existing group id from the dropdown.
      const scopeGroupId =
        groupId
        ?? (inviteLevel !== LEVEL_NEW_GROUP && inviteLevel !== LEVEL_APP_ONLY
          ? inviteLevel
          : undefined);
      const result = await inviteApi.lookupPhone({
        phone: normalized,
        ...(scopeGroupId ? { group_id: scopeGroupId } : {}),
      });
      if (result.already_member) {
        setExistingName(result.name);
        setStep("already-member");
        return;
      }
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
   * and will see a welcome empty-state dashboard.
   */
  const handleVerifyOtp = async () => {
    if (otp !== VALID_OTP) {
      setOtpError(true);
      return;
    }
    setStep("verifying");
    try {
      const res = await inviteApi.registerInvitee({
        phone: normalizeIndianPhone(phone),
        code: otp,
        invite_level: inviteLevel,
      });
      // Remember the newly created group so the "Done" button can jump
      // into it — either a freshly created linked group (LEVEL_NEW_GROUP)
      // or the existing group id the caller chose from the dropdown.
      const targetGroupId =
        res.group_id
        ?? (inviteLevel !== LEVEL_NEW_GROUP && inviteLevel !== LEVEL_APP_ONLY
          ? inviteLevel
          : null);
      setCreatedGroupId(targetGroupId);
      // Refetch the bootstrap bundle so the sidebar picks up the new
      // linked group at the top of the Community menu.
      await queryClient.invalidateQueries({ queryKey: ["app-data", "bootstrap"] });
      setStep("created");
    } catch (err) {
      console.error("[InviteModal] register failed", err);
      setOtpError(true);
      setStep("otp");
    }
  };

  /**
   * Close the modal and navigate into the freshly-created group so the
   * user lands directly on the new invitee's community page.
   */
  const handleDone = () => {
    const gid = createdGroupId;
    onClose();
    if (gid) {
      router.push(`/community/${gid}`);
    }
  };

  if (!open) return null;

  const phoneReady   = phone.replace(/\D/g, "").length >= 10;
  /* Footer is shown only while the user is entering phone + level */
  const showFooter   = step === "phone";

  const headerTitle = isAppLevel
    ? "Invite to ArogyaVault"
    : isNewGroup
      ? "Invite — create a new group"
      : `Invite to ${levelLabel}`;
  const headerSub = isAppLevel
    ? "Give them access to ArogyaVault without sharing a group"
    : isNewGroup
      ? "A new shared group will be created between you and the invitee"
      : `Adding someone to ${levelLabel}`;

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
            <div className="space-y-0.5 pr-3">
              <h2 className="font-semibold text-base leading-none">{headerTitle}</h2>
              <p className="text-xs text-muted-foreground">{headerSub}</p>
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
            {(step === "phone" || step === "checking" || step === "existing" || step === "new" || step === "already-member") && (
              <>
                {/* Mobile number — Continue button lives in footer */}
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
                      {inviteLevels.map((lvl) => (
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
                      {existingName ? `${existingName} is already on ArogyaVault` : "ArogyaVault user found"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Only an app-level invitation is possible for existing users.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full cursor-pointer"
                  onClick={() => {
                    // Existing users can only receive an "already exists" app invite.
                    setInviteLevel(LEVEL_APP_ONLY);
                    handleSendApp();
                  }}
                >
                  <SendIcon className="size-3.5 mr-1.5" />
                  Send ArogyaVault Invite
                </Button>
              </div>
            )}

            {/* Already a member of the current group */}
            {step === "already-member" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3.5 flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <AlertCircleIcon className="size-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      {existingName ? `${existingName} is already in this group` : "Already existing in the same group"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This phone number is already a member of this group. No new invite is needed.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={onClose}
                >
                  Cancel
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
                        ? "Invite them to join ArogyaVault"
                        : isNewGroup
                          ? "Invite them and create a new shared group"
                          : <>Invite them and add to <strong>{levelLabel}</strong></>
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
                    their registration and create the link. (Dev OTP: <code>123456</code>)
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
                      : isNewGroup
                        ? " A new shared group has been created — they'll see it in Community."
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
                    {isAppLevel
                      ? "App access granted"
                      : isNewGroup
                        ? "Shared group created"
                        : `Added to ${levelLabel}`}
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" /> Welcome notification sent
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-1 cursor-pointer" onClick={handleDone}>Done</Button>
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
