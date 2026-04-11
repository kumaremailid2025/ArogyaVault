"use client";

/**
 * Modal for inviting people to ArogyaVault.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Self-contained, fully-client-side modal for inviting another person
 * to ArogyaVault. Handles the entire invite flow in a small state
 * machine:
 *
 * ```
 * phone   →  checking  →  existing        → (send app invite)
 *                     →  already-member  → (cancel)
 *                     →  new             →  otp → verifying → created
 *                                         ↘  sent (WhatsApp path)
 * ```
 *
 * Responsibilities:
 * - Collect an E.164-normalised phone number and look it up against
 *   the backend (`/invites/lookup`) to decide which branch to enter.
 * - For existing users: offer a lightweight app-level invite.
 * - For users who already belong to the current group: show a
 *   friendly no-op state.
 * - For new users: offer WhatsApp share OR register-with-OTP, the
 *   latter of which calls `/invites/register-user` and navigates the
 *   caller into the newly-created linked group.
 *
 * The modal is fully controlled (`open`/`onClose`) and resets its
 * internal state 200ms after being closed so the close animation can
 * complete without visual flicker.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  XIcon,
  SmartphoneIcon,
  SendIcon,
  MessageCircleIcon,
  UserCheckIcon,
  UserPlusIcon,
  CheckCircle2Icon,
  LoaderIcon,
  KeyRoundIcon,
  AlertCircleIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/core/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/core/ui/input-otp";
import { inviteApi } from "@/lib/api/invite";
import { useSidebar } from "@/data/sidebar-data";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

/** Minimum number of digits a phone must have before we attempt lookup. */
const MIN_PHONE_DIGITS = 10;

/** Exact OTP length required to enable the Verify button. */
const OTP_LENGTH = 6 as const;

/** Fixed array of slot indices used to render the 6 OTP cells. */
const OTP_SLOT_INDICES: readonly number[] = Array.from(
  { length: OTP_LENGTH },
  (_, i) => i,
);

/**
 * Delay (ms) applied when resetting internal state after `open` flips
 * to `false`. Matches the backdrop/panel exit animation so users don't
 * see the form revert to step 1 before the panel fully disappears.
 */
const RESET_DELAY_MS = 200;

/** Indian country code used by the normalisation helper. */
const IN_DIAL_CODE = "+91";

/** Length of a raw (no country code) Indian mobile number. */
const IN_LOCAL_LENGTH = 10;

/** Length of an Indian mobile number when already prefixed with "91". */
const IN_WITH_CC_LENGTH = 12;

/** Dev-only registration OTP — matches `INVITE_REGISTER_OTP` on the backend. */
const VALID_OTP = "123456";

/** URL the WhatsApp prefilled-message invite directs new users to. */
const APP_MARKETING_URL = "https://arogyavault.com";

/** Message used for the WhatsApp share sheet. */
const WHATSAPP_INVITE_MESSAGE =
  "Hi! I'm sharing my ArogyaVault health records with you. " +
  "Download the app and sign in with this number to get connected: " +
  APP_MARKETING_URL;

/**
 * Two fixed sentinel ids that live at the top of the "Invite for"
 * dropdown, followed by any existing linked-group ids owned by the
 * inviter.
 */
const LEVEL_NEW_GROUP = "group" as const;
const LEVEL_APP_ONLY = "app" as const;

/** Query key used to refetch the bootstrap bundle after account creation. */
const BOOTSTRAP_QUERY_KEY = ["app-data", "bootstrap"] as const;

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Every discrete UI state the modal can be in.
 *
 * A narrow discriminated union (not a TS enum) so it can be used as a React
 * state value without any numeric/string-value gymnastics.
 *
 * @category Types
 */
type Step =
  | "phone"           // initial — user is entering the number
  | "checking"        // /invites/lookup is in-flight
  | "existing"        // backend says: already a registered ArogyaVault user
  | "new"             // backend says: unknown phone — safe to register
  | "already-member"  // backend says: already in the scoped group
  | "otp"             // user is entering the registration OTP
  | "verifying"       // /invites/register-user is in-flight
  | "created"         // registration succeeded
  | "sent";           // WhatsApp / app-invite path completed

/**
 * Single row in the "Invite for" select dropdown.
 *
 * @category Types
 */
interface InviteLevel {
  /** `"group"` | `"app"` | existing linked-group UUID/slug. */
  id: string;
  /** Primary line shown in the option row. */
  label: string;
  /** Secondary, muted line shown after the em dash. */
  sub: string;
}

/**
 * Props for the invite modal component.
 *
 * @category Types
 */
export interface InviteModalProps {
  /** Controlled visibility. `false` kicks off the reset timer. */
  open: boolean;
  /** Callback fired when the user dismisses or completes the flow. */
  onClose: () => void;
  /**
   * Display label used in the modal header copy (e.g. `"Ravi's group"`).
   * Undefined = generic invite (defaults to the new-group level).
   */
  groupContext?: string;
  /**
   * Actual group UUID this modal is scoped to — passed to the phone
   * lookup endpoint so the backend can report `already_member=true`
   * when the invitee is already a member of this group.
   */
  groupId?: string;
  /**
   * Pre-select a specific "Invite for" level when the modal opens.
   * Accepts any id from the `inviteLevels` list: `"group"`, `"app"`,
   * or a linked-group slug/UUID. If the caller also passes `groupId`,
   * `groupId` wins because it represents an actual scoped group.
   */
  initialLevel?: string;
}

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Normalise whatever the user typed into an E.164 Indian number so the
 * backend (`/invites/lookup`, `/invites/register-user`) can validate it:
 *
 *   `"98765 43210"`     → `"+919876543210"`
 *   `"+91 98765 43210"` → `"+919876543210"`
 *   `"919876543210"`    → `"+919876543210"`
 */
const normalizeIndianPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === IN_WITH_CC_LENGTH) {
    return `+${digits}`;
  }
  if (digits.length === IN_LOCAL_LENGTH) {
    return `${IN_DIAL_CODE}${digits}`;
  }
  return `+${digits}`;
};

/**
 * Return the dropdown id that should be used to scope the lookup /
 * registration API calls, or `undefined` if the level is one of the
 * two sentinels (new-group / app-only) which don't represent a real
 * group yet.
 */
const pickScopedGroupId = (inviteLevel: string): string | undefined => {
  if (inviteLevel === LEVEL_NEW_GROUP || inviteLevel === LEVEL_APP_ONLY) {
    return undefined;
  }
  return inviteLevel;
};

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render a modal for inviting people to ArogyaVault or a specific group.
 *
 * @param props - Component props.
 * @param props.open - Whether the modal is visible.
 * @param props.onClose - Callback when the modal is dismissed.
 * @param props.groupContext - Display label for the group context.
 * @param props.groupId - UUID of the group being invited to.
 * @param props.initialLevel - Pre-selected invite level.
 * @returns The rendered modal or null if not open.
 *
 * @category Components
 */
export const InviteModal = ({
  open,
  onClose,
  groupContext: _groupContext,
  groupId,
  initialLevel,
}: InviteModalProps): React.ReactElement | null => {
  const { LINKED_GROUPS } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Group id returned by `/invites/register-user` — used to jump the
   * user straight into the freshly-created group once they tap "Done".
   */
  const [createdGroupId, setCreatedGroupId] = React.useState<string | null>(null);

  /* ── Invite level list (new-group first, vault second, then existing) ── */
  const inviteLevels: InviteLevel[] = React.useMemo(() => {
    const base: InviteLevel[] = [
      {
        id: LEVEL_NEW_GROUP,
        label: "Invite",
        sub: "Create a new shared group",
      },
      {
        id: LEVEL_APP_ONLY,
        label: "Invite to ArogyaVault",
        sub: "App access only — no group created",
      },
    ];
    const existing = LINKED_GROUPS.map<InviteLevel>((g) => ({
      id: g.slug,
      label: g.name,
      sub: `${g.rel} · ${g.sub}`,
    }));
    return [...base, ...existing];
  }, [LINKED_GROUPS]);

  /**
   * Default level resolution order:
   *   1. `groupId` — caller opened the modal scoped to an actual group UUID
   *      (e.g. from the community page header "Invite" button).
   *   2. `initialLevel` — caller explicitly pre-selected a level from the
   *      app-header invite dropdown (`"group"`, `"app"`, or a linked-group id).
   *   3. `LEVEL_NEW_GROUP` — generic fallback for the plain "Invite" action.
   *
   * The legacy `groupContext` prop is now just a display label and is no
   * longer used to drive level selection.
   */
  const defaultLevel: string = groupId ?? initialLevel ?? LEVEL_NEW_GROUP;

  /* ── State ──────────────────────────────────────────────────── */
  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState<string>("");
  const [otp, setOtp] = React.useState<string>("");
  const [otpError, setOtpError] = React.useState<boolean>(false);
  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const [existingName, setExistingName] = React.useState<string | null>(null);
  const [inviteLevel, setInviteLevel] = React.useState<string>(defaultLevel);

  /* Re-sync invite level whenever the modal opens with a new context */
  React.useEffect(() => {
    if (open) setInviteLevel(defaultLevel);
  }, [open, defaultLevel]);

  /* Reset internal state when modal closes (after the exit animation) */
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
      }, RESET_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ── Derived render values ────────────────────────────────── */
  const currentLevel: InviteLevel | undefined =
    inviteLevels.find((l) => l.id === inviteLevel) ?? inviteLevels[0];
  const levelLabel: string = currentLevel?.label ?? "ArogyaVault";
  const isAppLevel: boolean = inviteLevel === LEVEL_APP_ONLY;
  const isNewGroup: boolean = inviteLevel === LEVEL_NEW_GROUP;

  /* ── Actions ──────────────────────────────────────────────── */

  /**
   * Look the entered number up against the store:
   *   - already in the scoped group → `already-member`
   *   - registered elsewhere        → `existing`  (app-level invite only)
   *   - unknown                     → `new`       (WhatsApp or OTP register)
   */
  const handleContinue = React.useCallback(async (): Promise<void> => {
    if (phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS) return;
    setLookupError(null);
    setExistingName(null);
    setStep("checking");
    try {
      const normalized = normalizeIndianPhone(phone);
      // Scope the lookup to a group if we have one, so the backend can
      // return `already_member=true`. Prefer the prop; otherwise fall
      // back to the currently-selected invite level when it refers to
      // an existing group (i.e. not one of the two sentinels).
      const scopeGroupId: string | undefined =
        groupId ?? pickScopedGroupId(inviteLevel);

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
  }, [phone, groupId, inviteLevel]);

  /** Terminal app-invite step (used by the `existing` branch). */
  const handleSendApp = React.useCallback((): void => {
    setStep("sent");
  }, []);

  /**
   * Open WhatsApp with a prefilled invite message. The backend will
   * wire up a proper click-to-chat flow once Twilio/WhatsApp is enabled;
   * until then this is a best-effort deep link from the browser.
   */
  const handleSendWhatsApp = React.useCallback((): void => {
    const normalized = normalizeIndianPhone(phone);
    const waNumber = normalized.replace(/\D/g, "");
    const text = encodeURIComponent(WHATSAPP_INVITE_MESSAGE);
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener");
    }
    setStep("sent");
  }, [phone]);

  /** Advance the new-user branch into OTP entry. */
  const handleSendOtp = React.useCallback((): void => {
    setOtp("");
    setOtpError(false);
    setStep("otp");
  }, []);

  /**
   * Verify the registration OTP and actually create the user on the
   * backend. After success the new user can sign in via the normal
   * `/sign-in` flow and will see a welcome empty-state dashboard.
   */
  const handleVerifyOtp = React.useCallback(async (): Promise<void> => {
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
      // Remember the newly-created group so the "Done" button can jump
      // into it — either a freshly-created linked group (LEVEL_NEW_GROUP)
      // or the existing group id the caller chose from the dropdown.
      const targetGroupId: string | null =
        res.group_id ?? pickScopedGroupId(inviteLevel) ?? null;
      setCreatedGroupId(targetGroupId);
      // Refetch the bootstrap bundle so the sidebar picks up the new
      // linked group at the top of the Community menu.
      await queryClient.invalidateQueries({ queryKey: BOOTSTRAP_QUERY_KEY });
      setStep("created");
    } catch (err) {
      console.error("[InviteModal] register failed", err);
      setOtpError(true);
      setStep("otp");
    }
  }, [otp, phone, inviteLevel, queryClient]);

  /**
   * Close the modal and navigate into the freshly-created group so the
   * user lands directly on the new invitee's community page.
   */
  const handleDone = React.useCallback((): void => {
    const gid = createdGroupId;
    onClose();
    if (gid) {
      router.push(`/community/${gid}`);
    }
  }, [createdGroupId, onClose, router]);

  /* ── Early return while closed (after reset has completed) ── */
  if (!open) return null;

  /* ── Derived render flags ─────────────────────────────────── */
  const phoneReady: boolean = phone.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
  /** Footer is shown only while the user is entering phone + level. */
  const showFooter: boolean = step === "phone";

  const headerTitle: string = isAppLevel
    ? "Invite to ArogyaVault"
    : isNewGroup
      ? "Invite — create a new group"
      : `Invite to ${levelLabel}`;
  const headerSub: string = isAppLevel
    ? "Give them access to ArogyaVault without sharing a group"
    : isNewGroup
      ? "A new shared group will be created between you and the invitee"
      : `Adding someone to ${levelLabel}`;

  /** Steps during which the phone/level form fields are visible. */
  const isFormStep: boolean =
    step === "phone" ||
    step === "checking" ||
    step === "existing" ||
    step === "new" ||
    step === "already-member";

  // ── Render ──

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
              <Typography variant="h3" as="h2">{headerTitle}</Typography>
              <Typography variant="caption" color="muted">{headerSub}</Typography>
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
            {isFormStep && (
              <>
                {/* Mobile number — Continue button lives in footer */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Mobile Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setLookupError(null);
                      if (step !== "phone") setStep("phone");
                    }}
                    placeholder="+91 98765 43210"
                    disabled={step === "checking"}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && step === "phone") {
                        void handleContinue();
                      }
                    }}
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
                  <Label className="text-xs font-medium text-muted-foreground">
                    Invite for
                  </Label>
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
                    <Typography variant="h4" as="p" className="text-primary">
                      {existingName
                        ? `${existingName} is already on ArogyaVault`
                        : "ArogyaVault user found"}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      Only an app-level invitation is possible for existing users.
                    </Typography>
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
                    <Typography variant="h4" as="p" className="text-amber-700 dark:text-amber-300">
                      {existingName
                        ? `${existingName} is already in this group`
                        : "Already existing in the same group"}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      This phone number is already a member of this group. No new
                      invite is needed.
                    </Typography>
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
                    <Typography variant="h4" as="p" className="text-amber-700 dark:text-amber-300">
                      Not on ArogyaVault yet
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {isAppLevel ? (
                        "Invite them to join ArogyaVault"
                      ) : isNewGroup ? (
                        "Invite them and create a new shared group"
                      ) : (
                        <>
                          Invite them and add to <strong>{levelLabel}</strong>
                        </>
                      )}
                    </Typography>
                  </div>
                </div>
                <Button className="w-full cursor-pointer" onClick={handleSendWhatsApp}>
                  <MessageCircleIcon className="size-3.5 mr-1.5" />
                  Invite via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleSendOtp}
                >
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
                    <Typography variant="h5" as="p" className="text-primary">
                      OTP sent to {phone}
                    </Typography>
                  </div>
                  <Typography variant="caption" color="muted">
                    The invited person received a one-time password. Enter it
                    below to complete their registration and create the link.
                    (Dev OTP: <code>{VALID_OTP}</code>)
                  </Typography>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground text-center block">
                    Enter {OTP_LENGTH}-digit OTP
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={OTP_LENGTH}
                      value={otp}
                      onChange={(val) => {
                        setOtp(val);
                        setOtpError(false);
                      }}
                    >
                      <InputOTPGroup className="gap-2">
                        {OTP_SLOT_INDICES.map((i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className="h-10 w-9 text-base font-bold rounded-lg"
                          />
                        ))}
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
                  disabled={otp.length < OTP_LENGTH || step === "verifying"}
                >
                  {step === "verifying" ? (
                    <>
                      <LoaderIcon className="size-3.5 mr-1.5 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
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
                  <Typography variant="h4" as="p">Account created!</Typography>
                  <Typography variant="caption" color="muted">
                    A new ArogyaVault account has been created for{" "}
                    <strong>{phone}</strong>.
                    {isAppLevel ? (
                      " They can now sign in and view shared records."
                    ) : isNewGroup ? (
                      " A new shared group has been created — they'll see it in Community."
                    ) : (
                      <>
                        {" "}They&apos;ve been added to <strong>{levelLabel}</strong> and
                        can now sign in.
                      </>
                    )}
                  </Typography>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    Account registered
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
                    <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
                    Welcome notification sent
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 cursor-pointer"
                  onClick={handleDone}
                >
                  Done
                </Button>
              </div>
            )}

            {/* Sent */}
            {step === "sent" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <CheckCircle2Icon className="size-5 text-primary" />
                </div>
                <Typography variant="h4" as="p">Invitation sent!</Typography>
                <Typography variant="caption" color="muted">
                  {phone} will receive the invitation.
                  {isAppLevel ? (
                    " Once they accept, the link becomes active in your activity feed."
                  ) : (
                    <>
                      {" "}Once they accept, they&apos;ll appear in{" "}
                      <strong>{levelLabel}</strong>.
                    </>
                  )}
                </Typography>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 cursor-pointer"
                  onClick={onClose}
                >
                  Done
                </Button>
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
