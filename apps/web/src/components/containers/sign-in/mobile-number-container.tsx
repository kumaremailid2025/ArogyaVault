"use client";

/**
 * MobileNumberContainer
 * ---------------------
 * Container that owns all business logic for the phone-number step of
 * the sign-in flow: form state, Zod validation, country-aware schema,
 * background registration check, and the Send OTP / Invite action.
 *
 * Validation UX:
 *   - Invalid → error shown only after blur (not while typing)
 *   - Valid   → error cleared instantly on change (no need to blur again)
 *
 * Architecture ref: ARCHITECTURE.md — Page → **Container** → Component → Core UI
 */

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  SendIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/core/ui/form";
import { cn } from "@/lib/utils";
import {
  type CountryCode,
  type PhoneFormValues,
  DEFAULT_COUNTRY_CODE,
  getCountry,
  buildPhoneSchema,
} from "@/lib/countries";
import { InputGroup } from "@/components/shared/input-group";
import { authApi, type ApiError } from "@/lib/api";

/* ── Types ────────────────────────────────────────────────────────── */

type RegistrationStatus = "idle" | "checking" | "registered" | "not_registered";

export interface MobileNumberContainerProps {
  /** Called when OTP is successfully sent. Receives the confirmed phone and dial code. */
  onOtpSent: (phone: string, dialCode: string) => void;
}

/* ── Container ────────────────────────────────────────────────────── */

export const MobileNumberContainer = ({ onOtpSent }: MobileNumberContainerProps) => {
  // Country (currently only IN; ready for a future selector)
  const [countryCode, _setCountryCode] = React.useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const country = getCountry(countryCode);

  // Loading
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | undefined>(undefined);

  // Registration check
  const [regStatus, setRegStatus] = React.useState<RegistrationStatus>("idle");
  const checkTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Form (always validates on change so we know the true state) ──
  const phoneSchema = React.useMemo(() => buildPhoneSchema(countryCode), [countryCode]);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
    mode: "onChange",
  });

  const phoneValue = form.watch("phone");
  const isPhoneValid = country.phoneRule.pattern.test(phoneValue);

  // ── Custom error visibility ──
  //
  // Rules:
  //   1. While typing (onChange)  — NEVER show a new error
  //   2. While typing (onChange)  — if value becomes VALID, clear any visible error
  //   3. On blur                  — if value is INVALID, show the error
  //
  // We do our own Zod check for display purposes so we don't depend
  // on react-hook-form's async error timing at all.

  const [blurError, setBlurError] = React.useState<string | undefined>(undefined);

  // Rule 2: valid on change → clear error instantly
  React.useEffect(() => {
    if (isPhoneValid) {
      setBlurError(undefined);
    }
  }, [isPhoneValid]);

  // Rule 3: invalid on blur → show error (skip if empty)
  const handleBlur = () => {
    if (!phoneValue) return;
    const result = phoneSchema.safeParse({ phone: phoneValue });
    if (!result.success) {
      const msg = result.error.errors[0]?.message;
      setBlurError(msg);
    }
  };

  // Re-validate when country changes
  React.useEffect(() => {
    if (phoneValue) form.trigger("phone");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // Debounced background registration check via API
  React.useEffect(() => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    if (!isPhoneValid) {
      setRegStatus("idle");
      return;
    }

    setRegStatus("checking");

    checkTimerRef.current = setTimeout(() => {
      const fullPhone = `${country.dialCode}${phoneValue}`;
      authApi
        .checkRegistration({ phone: fullPhone })
        .then((res) => {
          setRegStatus(res.registered ? "registered" : "not_registered");
        })
        .catch(() => {
          // Silently fall back — don't block the user
          setRegStatus("idle");
        });
    }, 400);

    return () => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    };
  }, [phoneValue, isPhoneValid, country.dialCode]);

  // Clear API error when phone changes
  React.useEffect(() => {
    setApiError(undefined);
  }, [phoneValue]);

  // ── Handlers ──

  const onSubmit = async (data: PhoneFormValues) => {
    const fullPhone = `${country.dialCode}${data.phone}`;
    setApiError(undefined);

    if (regStatus === "not_registered") {
      // Send invite
      try {
        setSendingOtp(true);
        await authApi.sendInvite({ phone: fullPhone });
        setApiError(undefined);
        // Show success feedback — keep on same page
        alert(`Invitation sent to ${fullPhone}`);
      } catch (err) {
        const apiErr = err as ApiError;
        setApiError(apiErr.detail ?? "Failed to send invite");
      } finally {
        setSendingOtp(false);
      }
      return;
    }

    // Send OTP
    try {
      setSendingOtp(true);
      await authApi.sendOtp({ phone: fullPhone });
      onOtpSent(data.phone, country.dialCode);
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.detail ?? "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Derived UI ──

  const isNotRegistered = regStatus === "not_registered";
  const isChecking = regStatus === "checking";

  const buttonLabel = (() => {
    if (sendingOtp) return "Sending OTP\u2026";
    if (isChecking) return "Checking\u2026";
    if (isNotRegistered) return "Invite to ArogyaVault";
    return "Send OTP";
  })();

  const ButtonIcon = (() => {
    if (sendingOtp || isChecking) return <Loader2Icon className="size-4 animate-spin" />;
    if (isNotRegistered) return <SendIcon className="size-4" />;
    return <ChevronRightIcon className="size-4" />;
  })();

  // ── Render ──

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Enter your mobile number
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll send a 6-digit OTP to verify it&apos;s you.
          </p>
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Mobile Number{" "}
                <span className="text-muted-foreground font-normal">
                  ({country.dialCode})
                </span>
              </FormLabel>

              <InputGroup
                left={
                  <span className="flex items-center gap-1.5">
                    <span>{country.flag}</span>
                    <span>{country.dialCode}</span>
                  </span>
                }
              >
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    maxLength={country.phoneRule.maxLength}
                    placeholder={country.phoneRule.placeholder}
                    className="h-11 text-base"
                    autoFocus
                    disabled={sendingOtp}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, country.phoneRule.maxLength);
                      field.onChange(digits);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      handleBlur();
                    }}
                  />
                </FormControl>
              </InputGroup>

              {/* Custom error display — blur to show, change to clear */}
              {blurError && (
                <p className="text-destructive text-sm">{blurError}</p>
              )}

              {/* API error feedback */}
              {apiError && !blurError && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircleIcon className="size-3" />
                  {apiError}
                </p>
              )}

              {/* Registration status feedback */}
              {!blurError && !apiError && isPhoneValid && isChecking && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2Icon className="size-3 animate-spin" />
                  Verifying number…
                </p>
              )}

              {!blurError && !apiError && isNotRegistered && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertCircleIcon className="size-3" />
                  This number is not registered on ArogyaVault. You can send an
                  invite instead.
                </p>
              )}

              {!blurError && !apiError && regStatus === "registered" && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-3" />
                  Number verified
                </p>
              )}

              {!isPhoneValid && !blurError && !apiError && (
                <FormDescription>
                  {country.name} numbers only. OTP via SMS.
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={cn(
            "w-full h-11",
            isNotRegistered &&
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
          disabled={sendingOtp || isChecking || !isPhoneValid}
        >
          <span className="flex items-center gap-2">
            {buttonLabel} {ButtonIcon}
          </span>
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/security"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </Form>
  );
};
