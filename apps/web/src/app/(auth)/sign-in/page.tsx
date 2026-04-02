"use client";

/**
 * Sign-In Page
 * ------------
 * Thin wrapper that handles layout and step routing.
 * All business logic lives in the containers.
 *
 * Mobile: Full-width centered form, TrustPanelContainer hidden.
 * Desktop (lg+): Split layout — trust panel left, form right.
 *
 * Architecture ref: ARCHITECTURE.md — **Page** → Container → Component → Core UI
 */

import * as React from "react";
import { Row, Stack, Flex } from "@/core/primitives";
import { SignInStep } from "@/lib/auth";
import { TrustPanelContainer } from "@/components/containers/sign-in/trust-panel-container";
import { MobileNumberContainer } from "@/components/containers/sign-in/mobile-number-container";
import { OtpContainer } from "@/components/containers/sign-in/otp-container";
import { StepIndicator } from "@/components/shared/step-indicator";

/* ── Page ─────────────────────────────────────────────────────────── */

const SignInPage = () => {
  const [step, setStep] = React.useState<SignInStep>(SignInStep.PHONE);
  const [confirmedPhone, setConfirmedPhone] = React.useState("");
  const [confirmedDialCode, setConfirmedDialCode] = React.useState("");

  const handleOtpSent = (phone: string, dialCode: string) => {
    setConfirmedPhone(phone);
    setConfirmedDialCode(dialCode);
    setStep(SignInStep.OTP);
  };

  const handleChangeNumber = () => {
    setStep(SignInStep.PHONE);
  };

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
            totalSteps={2}
            currentStep={step === SignInStep.PHONE ? 1 : 2}
          />

          {step === SignInStep.PHONE && (
            <MobileNumberContainer onOtpSent={handleOtpSent} />
          )}

          {step === SignInStep.OTP && (
            <OtpContainer
              phone={confirmedPhone}
              dialCode={confirmedDialCode}
              onChangeNumber={handleChangeNumber}
            />
          )}
        </Stack>
      </Flex>
    </Row>
  );
};

export default SignInPage;
