"use client";

/**
 * OtpContainer
 * ------------
 * Container that owns all business logic for the OTP verification step
 * of the sign-in flow: form state, Zod validation, verify action, and
 * the resend / change-number interactions.
 *
 * Architecture ref: ARCHITECTURE.md — Page → **Container** → Component → Core UI
 */

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { authApi, type ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores";

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

export const OtpContainer = ({ phone, dialCode, onChangeNumber }: OtpContainerProps) => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [verifying, setVerifying] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | undefined>(undefined);

  // Resend state
  const [resending, setResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [resendMessage, setResendMessage] = React.useState<string | undefined>(undefined);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

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

  // Clear API error when OTP changes
  const otpValue = form.watch("otp");
  React.useEffect(() => {
    setApiError(undefined);
    setResendMessage(undefined);
  }, [otpValue]);

  // ── Handlers ──

  const onSubmit = async (data: OtpFormValues) => {
    const fullPhone = `${dialCode}${phone}`;
    setApiError(undefined);

    try {
      setVerifying(true);
      const res = await authApi.verifyOtp({
        phone: fullPhone,
        code: data.otp,
      });

      // Store user & tokens in zustand (persisted to sessionStorage)
      setAuth(res.user, res.tokens);

      router.push("/liveboard");
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.detail ?? "Verification failed");
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    const fullPhone = `${dialCode}${phone}`;
    setApiError(undefined);
    setResendMessage(undefined);

    try {
      setResending(true);
      await authApi.resendOtp({ phone: fullPhone });
      setResendMessage("New OTP sent successfully");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      // Clear the OTP input so user enters the new code
      form.setValue("otp", "");
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.detail ?? "Failed to resend OTP");
    } finally {
      setResending(false);
    }
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
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup className="gap-1.5 sm:gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-10 text-base rounded-md border-border sm:h-12 sm:w-12 sm:text-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />

              {/* API error feedback */}
              {apiError && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircleIcon className="size-3" />
                  {apiError}
                </p>
              )}

              {/* Resend success feedback */}
              {resendMessage && !apiError && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-3" />
                  {resendMessage}
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
                    disabled={resending}
                    className="h-auto p-0 text-primary underline underline-offset-4"
                  >
                    {resending ? "Resending…" : "Resend OTP"}
                  </Button>
                )}
              </p>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11"
          disabled={verifying || form.watch("otp").length < 6}
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              Verifying… <Loader2Icon className="size-4 animate-spin" />
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
