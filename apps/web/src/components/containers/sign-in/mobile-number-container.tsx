"use client";

/**
 * Sign-in container for phone number entry and validation.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Container that owns all business logic for the phone-number step of
 * the sign-in flow: form state, country-aware Zod validation, a
 * debounced background "is this number registered?" lookup, and the
 * terminal Send-OTP / Invite mutation that advances the flow.
 *
 * TanStack React Query is used for all network state:
 * - {@link useCheckRegistration} (query) — debounced background phone lookup
 * - {@link useSendOtp} (mutation) — send OTP to a registered number
 * - {@link useSendInvite} (mutation) — send invite to an unregistered number
 *
 * Validation UX (custom — does not rely on react-hook-form messages):
 * - Invalid → error is surfaced only after blur (not while typing).
 * - Valid → error is cleared instantly on change (no re-blur needed).
 *
 * @see ARCHITECTURE.md
 */

import * as React from "react";
import Link from "next/link";
import { useForm, type UseFormReturn } from "react-hook-form";
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
import { useCheckRegistration, useSendOtp, useSendInvite } from "@/hooks/api";
import type { ApiError } from "@/lib/api";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Debounce delay before a valid phone number is considered "settled"
 * and sent to the background registration-check query. Chosen to be
 * below the ~500 ms perception threshold while still suppressing noisy
 * lookups while the user is actively typing.
 */
const REGISTRATION_LOOKUP_DEBOUNCE_MS = 400;

/** Generic fallback shown when the API error payload has no `detail`. */
const GENERIC_ERROR_MESSAGE = "Something went wrong";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props for the mobile number sign-in container.
 *
 * @category Types
 */
export interface MobileNumberContainerProps {
  /**
   * Called after the send-OTP mutation resolves successfully.
   * Receives the local digits and the dial code separately so the OTP
   * step can render them and use them for resend calls.
   */
  onOtpSent: (phone: string, dialCode: string) => void;
}

/**
 * Tri-state view of the registration lookup.
 *
 * Used to drive which status message / CTA label the user sees below the phone input.
 *
 * @category Types
 */
type RegistrationState =
  | "unknown"          // no valid number yet
  | "checking"         // lookup in flight
  | "registered"       // number exists → flow sends OTP
  | "not-registered";  // number is new → flow sends invite

/**
 * Discriminator for the primary submit button label + icon.
 *
 * Allows the render section to stay free of inline IIFEs.
 *
 * @category Types
 */
type SubmitAction = "check" | "send-otp" | "invite" | "pending";

/* ══════════════════════════════════════════════════════════════════════
   CONTAINER
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the phone number entry form for sign-in.
 *
 * @param props - Component props.
 * @param props.onOtpSent - Callback when OTP is sent.
 * @returns The rendered container.
 *
 * @category Containers
 */
export const MobileNumberContainer = ({
  onOtpSent,
}: MobileNumberContainerProps): React.ReactElement => {
  /* ── Country (currently only IN; ready for a future selector) ──── */
  const [countryCode] = React.useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const country = getCountry(countryCode);

  /* ── Form (always validates on change so we know the true state) ─ */
  const phoneSchema = React.useMemo(
    () => buildPhoneSchema(countryCode),
    [countryCode],
  );

  const form: UseFormReturn<PhoneFormValues> = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
    mode: "onChange",
  });

  const phoneValue: string = form.watch("phone");
  const isPhoneValid: boolean = country.phoneRule.pattern.test(phoneValue);

  /* ── Debounced phone for TanStack query ───────────────────────── */
  const [debouncedPhone, setDebouncedPhone] = React.useState<string>("");

  React.useEffect(() => {
    if (!isPhoneValid) {
      setDebouncedPhone("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedPhone(`${country.dialCode}${phoneValue}`);
    }, REGISTRATION_LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [phoneValue, isPhoneValid, country.dialCode]);

  /* ── TanStack Query: registration check ───────────────────────── */
  const { data: regData, isFetching: isChecking } = useCheckRegistration(
    debouncedPhone,
    !!debouncedPhone,
  );

  const isRegistered: boolean = regData?.registered === true;
  const isNotRegistered: boolean = regData?.registered === false;

  /** Derived registration state — single source of truth for status UI. */
  const registrationState: RegistrationState = (() => {
    if (!isPhoneValid) return "unknown";
    if (isChecking) return "checking";
    if (isRegistered) return "registered";
    if (isNotRegistered) return "not-registered";
    return "unknown";
  })();

  /* ── TanStack Mutations ───────────────────────────────────────── */
  const sendOtpMutation = useSendOtp();
  const sendInviteMutation = useSendInvite();

  const isMutating: boolean =
    sendOtpMutation.isPending || sendInviteMutation.isPending;

  /** Last error surfaced from either mutation, or undefined if none. */
  const apiError: string | undefined = (() => {
    const err = sendOtpMutation.error ?? sendInviteMutation.error;
    if (!err) return undefined;
    return (err as ApiError).detail ?? GENERIC_ERROR_MESSAGE;
  })();

  /* Reset mutations when the phone changes so stale errors disappear. */
  React.useEffect(() => {
    sendOtpMutation.reset();
    sendInviteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneValue]);

  /* ── Custom blur-based error visibility ──────────────────────── */
  const [blurError, setBlurError] = React.useState<string | undefined>(undefined);

  /** Valid on change → clear the blur error instantly. */
  React.useEffect(() => {
    if (isPhoneValid) setBlurError(undefined);
  }, [isPhoneValid]);

  /** Invalid on blur → surface the Zod message (skipped for empty field). */
  const handleBlur = React.useCallback((): void => {
    if (!phoneValue) return;
    const result = phoneSchema.safeParse({ phone: phoneValue });
    if (!result.success) {
      const msg = result.error.errors[0]?.message;
      setBlurError(msg);
    }
  }, [phoneSchema, phoneValue]);

  /* Re-validate the whole form if the country changes at runtime. */
  React.useEffect(() => {
    if (phoneValue) form.trigger("phone");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  /* ── Submit handler ───────────────────────────────────────────── */

  /**
   * Branches on the registration state:
   *   - not-registered → fire `useSendInvite` and show a toast on success
   *   - otherwise      → fire `useSendOtp` and advance to the OTP step
   */
  const onSubmit = React.useCallback(
    (data: PhoneFormValues): void => {
      const fullPhone = `${country.dialCode}${data.phone}`;

      if (isNotRegistered) {
        sendInviteMutation.mutate(
          { phone: fullPhone },
          {
            onSuccess: () => {
              // TODO: replace with a proper toast; alert() is dev-only.
              alert(`Invitation sent to ${fullPhone}`);
            },
          },
        );
        return;
      }

      sendOtpMutation.mutate(
        { phone: fullPhone },
        {
          onSuccess: () => {
            onOtpSent(data.phone, country.dialCode);
          },
        },
      );
    },
    [
      country.dialCode,
      isNotRegistered,
      onOtpSent,
      sendInviteMutation,
      sendOtpMutation,
    ],
  );

  /* ── Derived submit-button label + icon ──────────────────────── */

  /** Current submit-button state — drives both label and icon. */
  const submitAction: SubmitAction = (() => {
    if (isMutating) return "pending";
    if (isChecking) return "check";
    if (isNotRegistered) return "invite";
    return "send-otp";
  })();

  const buttonLabel: string = (() => {
    switch (submitAction) {
      case "pending": return "Sending OTP\u2026";
      case "check":   return "Checking\u2026";
      case "invite":  return "Invite to ArogyaVault";
      case "send-otp":
      default:        return "Send OTP";
    }
  })();

  const ButtonIcon: React.ReactElement = (() => {
    switch (submitAction) {
      case "pending":
      case "check":
        return <Loader2Icon className="size-4 animate-spin" />;
      case "invite":
        return <SendIcon className="size-4" />;
      case "send-otp":
      default:
        return <ChevronRightIcon className="size-4" />;
    }
  })();

  // ── Render ──

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Typography variant="h1" as="h2">
            Enter your mobile number
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            We&apos;ll send a 6-digit OTP to verify it&apos;s you.
          </Typography>
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
                    disabled={isMutating}
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
                <Typography variant="body" color="destructive">{blurError}</Typography>
              )}

              {/* API error feedback */}
              {apiError && !blurError && (
                <Typography variant="body" color="destructive" className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-3" />
                  {apiError}
                </Typography>
              )}

              {/* Registration status feedback */}
              {!blurError && !apiError && isPhoneValid && isChecking && (
                <Typography variant="caption" color="muted" className="flex items-center gap-1.5">
                  <Loader2Icon className="size-3 animate-spin" />
                  Verifying number…
                </Typography>
              )}

              {!blurError && !apiError && isNotRegistered && (
                <Typography variant="caption" color="muted" className="flex items-center gap-1.5">
                  <AlertCircleIcon className="size-3" />
                  This number is not registered on ArogyaVault. You can send an
                  invite instead.
                </Typography>
              )}

              {!blurError && !apiError && isRegistered && (
                <Typography variant="caption" color="success" className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3" />
                  Number verified
                </Typography>
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
          disabled={isMutating || isChecking || !isPhoneValid}
        >
          <span className="flex items-center gap-2">
            {buttonLabel} {ButtonIcon}
          </span>
        </Button>

        <Typography variant="caption" color="muted" className="text-center">
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
        </Typography>
      </form>
    </Form>
  );
};
