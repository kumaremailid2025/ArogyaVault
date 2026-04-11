"use client";

/**
 * Two-step sign-in page with phone and OTP entry.
 *
 * @packageDocumentation
 * @category Pages
 *
 * @remarks
 * Thin page wrapper that handles the two-step sign-in layout and the
 * tiny bit of step-routing state needed to swap between the phone-entry
 * and OTP-entry containers. All real business logic — validation,
 * network requests, cooldowns, error handling — lives inside the two
 * containers this page renders.
 *
 * Responsive layout:
 * - Mobile: full-width centered form, TrustPanelContainer hidden.
 * - Desktop (lg+): split layout — trust panel left, form right.
 *
 * Flow:
 * 1. {@link MobileNumberContainer} collects phone → calls `onOtpSent`
 *    with the confirmed (phone, dialCode) tuple once the backend has
 *    accepted the send-OTP request.
 * 2. {@link OtpContainer} verifies the 6-digit code. On success it
 *    redirects to the app; on "change number" it calls back here to
 *    reset to step 1.
 *
 * @see ARCHITECTURE.md
 */

import * as React from "react";
import { Row, Stack, Flex } from "@/core/primitives";
import { SignInStep } from "@/lib/auth";
import { TrustPanelContainer } from "@/components/containers/sign-in/trust-panel-container";
import { MobileNumberContainer } from "@/components/containers/sign-in/mobile-number-container";
import { OtpContainer } from "@/components/containers/sign-in/otp-container";
import { StepIndicator } from "@/components/shared/step-indicator";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Phone number payload captured from step 1 and passed to step 2.
 *
 * @category Types
 */
interface ConfirmedPhone {
  /** Local digits only, e.g. `"9876543210"`. Country code lives in `dialCode`. */
  phone: string;
  /** International dial code with the leading `+`, e.g. `"+91"`. */
  dialCode: string;
}

/** Total number of steps in the indicator at the top of the form. */
const TOTAL_SIGN_IN_STEPS = 2 as const;

/* ══════════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the sign-in flow page with two-step authentication.
 *
 * @returns The rendered sign-in page.
 *
 * @category Pages
 */
const SignInPage = (): React.ReactElement => {
  /** Current step the user is on — drives which container renders. */
  const [step, setStep] = React.useState<SignInStep>(SignInStep.PHONE);
  /** Phone captured from step 1 and re-displayed in step 2. */
  const [confirmed, setConfirmed] = React.useState<ConfirmedPhone>({
    phone: "",
    dialCode: "",
  });

  /**
   * Invoked by {@link MobileNumberContainer} once the send-OTP mutation
   * has resolved successfully. Locks in the phone/dialCode tuple and
   * advances the form to the OTP entry step.
   */
  const handleOtpSent = React.useCallback((phone: string, dialCode: string): void => {
    setConfirmed({ phone, dialCode });
    setStep(SignInStep.OTP);
  }, []);

  /**
   * Invoked by {@link OtpContainer} when the user taps "Change number".
   * Resets the step back to phone entry. The number itself stays in
   * state so the user doesn't have to retype it.
   */
  const handleChangeNumber = React.useCallback((): void => {
    setStep(SignInStep.PHONE);
  }, []);

  /** Index shown by the 1-based step indicator. */
  const currentStepIndex: 1 | 2 = step === SignInStep.PHONE ? 1 : 2;

  return (
    <Row className="h-full w-full flex-col lg:flex-row" gap="xs" align="stretch">
      {/* ── Left panel (hidden on mobile, visible lg+) ──────────── */}
      <div className="hidden lg:flex lg:w-[45%] shrink-0">
        <TrustPanelContainer />
      </div>

      {/* ── Right panel (full-width on mobile, centered) ───────── */}
      <Flex className="flex-1 items-center justify-center overflow-y-auto px-5 py-8 sm:px-8 lg:px-12 lg:py-0">
        <Stack gap="lg" className="w-full max-w-md">
          <StepIndicator
            totalSteps={TOTAL_SIGN_IN_STEPS}
            currentStep={currentStepIndex}
          />

          {step === SignInStep.PHONE && (
            <MobileNumberContainer onOtpSent={handleOtpSent} />
          )}

          {step === SignInStep.OTP && (
            <OtpContainer
              phone={confirmed.phone}
              dialCode={confirmed.dialCode}
              onChangeNumber={handleChangeNumber}
            />
          )}
        </Stack>
      </Flex>
    </Row>
  );
};

export default SignInPage;
