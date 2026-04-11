"use client";

/**
 * Sign-in container for OTP verification.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Container that owns all business logic for the OTP verification step
 * of the sign-in flow: form state, Zod validation, auto-submit on
 * completion, terminal verify mutation, and the resend / change-number
 * interactions (including the resend cooldown timer).
 *
 * TanStack React Query is used for all network state:
 * - {@link useVerifyOtp} (mutation) — verify OTP → stores JWT + redirects
 * - {@link useResendOtp} (mutation) — resend a fresh OTP
 *
 * UX notes:
 * - The 6-digit code is auto-submitted as soon as the last digit is entered.
 *   On failure the slots are cleared and focus is returned to the first slot.
 * - Error and success banners are local state (not derived from the mutation
 *   lifecycle) so clearing the slots does not wipe the message.
 * - A countdown gate (30s) prevents resend spamming.
 *
 * @see ARCHITECTURE.md
 */

import * as React from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2Icon, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/core/ui/input-otp";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/core/ui/form";
import { useVerifyOtp, useResendOtp } from "@/hooks/api";
import type { ApiError } from "@/lib/api";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

/** Exact length of the OTP code required by the backend. */
const OTP_LENGTH = 6 as const;

/**
 * Number of seconds the "Resend OTP" action is disabled after each
 * successful resend. Protects the SMS gateway and prevents abuse.
 */
const RESEND_COOLDOWN_SECONDS = 30;

/** Delay before the initial autofocus of the hidden input-otp field. */
const INITIAL_FOCUS_DELAY_MS = 50;

/** Tick interval for the resend cooldown countdown. */
const COOLDOWN_TICK_MS = 1_000;

/** Fixed array of slot indices used to render the OTP cells. */
const OTP_SLOT_INDICES: readonly number[] = Array.from(
  { length: OTP_LENGTH },
  (_, i) => i,
);

/** Fallback error messages surfaced when the API returns no `detail`. */
const DEFAULT_VERIFY_ERROR = "Invalid OTP. Please try again.";
const DEFAULT_RESEND_ERROR = "Failed to resend OTP";

/** Feedback strings for the resend flow. */
const RESEND_SUCCESS_MESSAGE = "New OTP sent successfully";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Zod schema for the OTP form.
 *
 * Enforces an exact 6-digit numeric code. Using both `min(6)` and `max(6)`
 * gives us the friendlier "Enter the complete 6-digit OTP" error while the user
 * is still typing partial input, and still rejects anything non-numeric on
 * full-length entry.
 *
 * @category Types
 */
const otpSchema = z.object({
  otp: z
    .string()
    .min(OTP_LENGTH, "Enter the complete 6-digit OTP")
    .max(OTP_LENGTH)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

/**
 * Strongly-typed form values inferred from the Zod schema.
 *
 * @category Types
 */
type OtpFormValues = z.infer<typeof otpSchema>;

/**
 * Props for the OTP verification container.
 *
 * @category Types
 */
export interface OtpContainerProps {
  /** The phone number the OTP was sent to (local digits only). */
  phone: string;
  /** The dial code displayed alongside the phone (e.g. `"+91"`). */
  dialCode: string;
  /** Called when the user taps "Change" to go back to the phone step. */
  onChangeNumber: () => void;
}

/* ══════════════════════════════════════════════════════════════════════
   CONTAINER
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the OTP verification form for sign-in.
 *
 * @param props - Component props.
 * @param props.phone - Phone number OTP was sent to.
 * @param props.dialCode - International dial code.
 * @param props.onChangeNumber - Callback to return to phone entry step.
 * @returns The rendered container.
 *
 * @category Containers
 */
export const OtpContainer = ({
  phone,
  dialCode,
  onChangeNumber,
}: OtpContainerProps): React.ReactElement => {
  /* ── TanStack Mutations ───────────────────────────────────────── */
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  /* ── Resend cooldown timer ────────────────────────────────────── */
  const [resendCooldown, setResendCooldown] = React.useState<number>(0);

  /**
   * Local feedback state — decoupled from the mutation lifecycle so
   * that programmatically clearing the OTP field (after an error) does
   * not also wipe the error message the user just read.
   */
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = React.useState<string | undefined>(undefined);

  /** Ref to the hidden `<input>` inside InputOTP for programmatic focus. */
  const otpRef = React.useRef<HTMLInputElement>(null);

  /* ── Form ─────────────────────────────────────────────────────── */
  const form: UseFormReturn<OtpFormValues> = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  /* ── Focus on mount (robust fallback for autoFocus) ──────────── */
  React.useEffect(() => {
    // Small delay ensures the input-otp hidden input is rendered and ready
    const timer = setTimeout(() => {
      otpRef.current?.focus();
    }, INITIAL_FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  /* ── Cooldown countdown ──────────────────────────────────────── */
  React.useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, COOLDOWN_TICK_MS);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* ── Clear feedback when the user resumes typing ─────────────── */
  const otpValue: string = form.watch("otp");
  React.useEffect(() => {
    if (otpValue.length > 0) {
      setErrorMessage(undefined);
      setSuccessMessage(undefined);
    }
  }, [otpValue]);

  /* ── Helpers ─────────────────────────────────────────────────── */

  /**
   * Clear all OTP slots and move focus back to the first slot.
   * Called after any verify-error or successful resend so the user
   * can immediately start typing the next attempt.
   */
  const clearAndRefocus = React.useCallback((): void => {
    form.setValue("otp", "", { shouldValidate: false });
    // Allow the controlled value to propagate before refocusing
    requestAnimationFrame(() => {
      otpRef.current?.focus();
    });
  }, [form]);

  /* ── Submit handler ──────────────────────────────────────────── */

  /**
   * Verify the OTP against the backend. On success the useVerifyOtp
   * hook itself handles JWT storage and navigation; we only need to
   * clean up feedback state here on error.
   */
  const onSubmit = React.useCallback(
    (data: OtpFormValues): void => {
      const fullPhone = `${dialCode}${phone}`;
      verifyOtpMutation.mutate(
        { phone: fullPhone, code: data.otp },
        {
          onError: (err) => {
            const message =
              (err as ApiError).detail ?? DEFAULT_VERIFY_ERROR;
            setErrorMessage(message);
            setSuccessMessage(undefined);
            clearAndRefocus();
          },
        },
      );
    },
    [clearAndRefocus, dialCode, phone, verifyOtpMutation],
  );

  /* ── Auto-submit when all 6 digits are entered ───────────────── */
  React.useEffect(() => {
    if (otpValue.length === OTP_LENGTH && !verifyOtpMutation.isPending) {
      form.handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  /* ── Resend handler ──────────────────────────────────────────── */

  /**
   * Resend the OTP. Gated by the cooldown and in-flight state so the
   * button can't be spammed. Starts a fresh 30s cooldown on success.
   */
  const handleResendOtp = React.useCallback((): void => {
    if (resendCooldown > 0 || resendOtpMutation.isPending) return;

    const fullPhone = `${dialCode}${phone}`;
    resendOtpMutation.mutate(
      { phone: fullPhone },
      {
        onSuccess: () => {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
          setSuccessMessage(RESEND_SUCCESS_MESSAGE);
          setErrorMessage(undefined);
          clearAndRefocus();
        },
        onError: (err) => {
          const message =
            (err as ApiError).detail ?? DEFAULT_RESEND_ERROR;
          setErrorMessage(message);
          setSuccessMessage(undefined);
        },
      },
    );
  }, [clearAndRefocus, dialCode, phone, resendCooldown, resendOtpMutation]);

  /* ── Derived render state ────────────────────────────────────── */

  const isVerifying: boolean = verifyOtpMutation.isPending;
  const isResending: boolean = resendOtpMutation.isPending;
  const canSubmit: boolean = otpValue.length === OTP_LENGTH && !isVerifying;

  // ── Render ──

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Typography variant="h1" as="h2">
            Enter the OTP
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Sent to{" "}
            <span className="font-semibold text-foreground">
              {dialCode} {phone}
            </span>
            .{" "}
            <Button
              variant="link"
              size="sm"
              type="button"
              onClick={onChangeNumber}
              className="h-auto p-0 text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Change
            </Button>
          </Typography>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {OTP_LENGTH}-digit OTP
              </FormLabel>
              <FormControl>
                {/* Wrapper ensures click-to-focus works reliably.
                    input-otp sets pointer-events:none on its container;
                    this outer div intercepts clicks and forwards focus. */}
                <div
                  className="cursor-text"
                  onClick={() => otpRef.current?.focus()}
                  onMouseDown={(e) => {
                    // Prevent the mousedown from stealing focus from the
                    // input if the hidden input is already focused
                    if (document.activeElement === otpRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  <InputOTP
                    ref={otpRef}
                    maxLength={OTP_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    autoFocus
                  >
                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                      {OTP_SLOT_INDICES.map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="size-10 text-base rounded-md border border-border sm:h-12 sm:w-12 sm:text-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage />

              {/* Error feedback */}
              {errorMessage && (
                <Typography variant="body" color="destructive" className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-3" />
                  {errorMessage}
                </Typography>
              )}

              {/* Resend success feedback */}
              {successMessage && !errorMessage && (
                <Typography variant="caption" color="success" className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3" />
                  {successMessage}
                </Typography>
              )}

              <Typography variant="caption" color="muted">
                Didn&apos;t receive it?{" "}
                {resendCooldown > 0 ? (
                  <Typography color="muted" as="span">
                    Resend in {resendCooldown}s
                  </Typography>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="h-auto p-0 text-primary underline underline-offset-4"
                  >
                    {isResending ? "Resending..." : "Resend OTP"}
                  </Button>
                )}
              </Typography>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11"
          disabled={!canSubmit}
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              Verifying... <Loader2Icon className="size-4 animate-spin" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Verify &amp; Sign In <CheckCircle2Icon className="size-4" />
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
};
