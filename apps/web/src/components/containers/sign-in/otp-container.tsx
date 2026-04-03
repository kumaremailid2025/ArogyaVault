"use client";

/**
 * OtpContainer
 * ------------
 * Container that owns all business logic for the OTP verification step
 * of the sign-in flow: form state, Zod validation, verify action, and
 * the resend / change-number interactions.
 *
 * Uses TanStack React Query:
 *   - useVerifyOtp (mutation)  — verify OTP → stores JWT + redirects
 *   - useResendOtp (mutation)  — resend with a new OTP code
 *
 * Architecture ref: ARCHITECTURE.md — Page → **Container** → Component → Core UI
 */

import * as React from "react";
import { useForm } from "react-hook-form";
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

/* ── Zod schema ───────────────────────────────────────────────────── */

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "Enter the complete 6-digit OTP")
    .max(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

/* ── Types ────────────────────────────────────────────────────────── */

export interface OtpContainerProps {
  /** The phone number the OTP was sent to (local digits only). */
  phone: string;
  /** The dial code displayed alongside the phone (e.g. "+91"). */
  dialCode: string;
  /** Called when the user wants to go back and change the number. */
  onChangeNumber: () => void;
}

/* ── Constants ────────────────────────────────────────────────────── */

const RESEND_COOLDOWN_SECONDS = 30;

/* ── Container ────────────────────────────────────────────────────── */

export const OtpContainer = ({
  phone,
  dialCode,
  onChangeNumber,
}: OtpContainerProps) => {
  // ── TanStack mutations ──
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Local error & success state — decoupled from mutation lifecycle
  // so clearing OTP programmatically doesn't wipe the error message
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [successMessage, setSuccessMessage] = React.useState<
    string | undefined
  >();

  // Ref for InputOTP to manage focus programmatically
  const otpRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  // ── Focus on mount (robust fallback for autoFocus) ──
  React.useEffect(() => {
    // Small delay ensures the input-otp hidden input is rendered and ready
    const timer = setTimeout(() => {
      otpRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ── Cooldown timer ──
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
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clear error & success messages when user starts typing again
  const otpValue = form.watch("otp");
  React.useEffect(() => {
    if (otpValue.length > 0) {
      setErrorMessage(undefined);
      setSuccessMessage(undefined);
    }
  }, [otpValue]);

  // ── Helpers ──

  /** Clear all OTP slots and move focus back to the first slot. */
  const clearAndRefocus = React.useCallback(() => {
    form.setValue("otp", "", { shouldValidate: false });
    // Allow the controlled value to propagate before refocusing
    requestAnimationFrame(() => {
      otpRef.current?.focus();
    });
  }, [form]);

  // ── Auto-submit when all 6 digits are entered ──
  React.useEffect(() => {
    if (otpValue.length === 6 && !verifyOtpMutation.isPending) {
      form.handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  // ── Handlers ──

  const onSubmit = (data: OtpFormValues) => {
    const fullPhone = `${dialCode}${phone}`;
    verifyOtpMutation.mutate(
      { phone: fullPhone, code: data.otp },
      {
        onError: (err) => {
          const message =
            (err as ApiError).detail ?? "Invalid OTP. Please try again.";
          setErrorMessage(message);
          setSuccessMessage(undefined);
          clearAndRefocus();
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0 || resendOtpMutation.isPending) return;

    const fullPhone = `${dialCode}${phone}`;
    resendOtpMutation.mutate(
      { phone: fullPhone },
      {
        onSuccess: () => {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
          setSuccessMessage("New OTP sent successfully");
          setErrorMessage(undefined);
          clearAndRefocus();
        },
        onError: (err) => {
          const message =
            (err as ApiError).detail ?? "Failed to resend OTP";
          setErrorMessage(message);
          setSuccessMessage(undefined);
        },
      },
    );
  };

  // ── Render ──

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Enter the OTP
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
          </p>
        </div>

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">6-digit OTP</FormLabel>
              <FormControl>
                {/* Wrapper ensures click-to-focus works reliably.
                    input-otp sets pointer-events:none on its container;
                    this outer div intercepts clicks and forwards focus. */}
                <div
                  className="cursor-text"
                  onClick={() => otpRef.current?.focus()}
                  onMouseDown={(e) => {
                    // Prevent the mousedown from stealing focus from the input
                    // if the hidden input is already focused
                    if (document.activeElement === otpRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  <InputOTP
                    ref={otpRef}
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    autoFocus
                  >
                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
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
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircleIcon className="size-3" />
                  {errorMessage}
                </p>
              )}

              {/* Resend success feedback */}
              {successMessage && !errorMessage && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-3" />
                  {successMessage}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendOtpMutation.isPending}
                    className="h-auto p-0 text-primary underline underline-offset-4"
                  >
                    {resendOtpMutation.isPending ? "Resending..." : "Resend OTP"}
                  </Button>
                )}
              </p>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11"
          disabled={verifyOtpMutation.isPending || otpValue.length < 6}
        >
          {verifyOtpMutation.isPending ? (
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
