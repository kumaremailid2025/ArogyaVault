"use client";

/**
 * TrustPanelContainer
 * -------------------
 * Left-side panel shown on the sign-in page with trust points and a
 * testimonial. Visibility is controlled by the parent page wrapper.
 *
 * Architecture ref: ARCHITECTURE.md — Page → **Container** → Component → Core UI
 */

import {
  ShieldCheckIcon,
  SmartphoneIcon,
  LockKeyholeIcon,
  StarIcon,
} from "lucide-react";
import { Stack, Row } from "@/core/primitives";

/* ── Trust points data ────────────────────────────────────────────── */

const TRUST_POINTS = [
  { icon: ShieldCheckIcon, text: "AES-256 encrypted at rest and in transit" },
  { icon: SmartphoneIcon, text: "OTP-only — no passwords, ever" },
  { icon: LockKeyholeIcon, text: "Your records are never shared without consent" },
] as const;

/* ── Container ────────────────────────────────────────────────────── */

export const TrustPanelContainer = () => {
  return (
    <Stack
      className="h-full w-full justify-between bg-primary p-12 text-primary-foreground"
      gap="xl"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <p className="text-primary-foreground/60 text-sm font-medium uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            Your health records,
            <br />
            always with you.
          </h1>
          <p className="text-primary-foreground/75 leading-relaxed">
            Sign in with your mobile number. No password needed — your phone is
            your key to a lifetime of secure medical records.
          </p>
        </Stack>

        <Stack gap="md">
          {TRUST_POINTS.map((tp) => (
            <Row key={tp.text} gap="sm" align="start">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <tp.icon className="size-4" />
              </div>
              <p className="text-sm text-primary-foreground/80 leading-snug pt-1">
                {tp.text}
              </p>
            </Row>
          ))}
        </Stack>
      </Stack>

      {/* Testimonial */}
      <Stack gap="sm" className="rounded-xl bg-primary-foreground/10 p-5 border border-primary-foreground/20">
        <Row gap="xs">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className="size-3.5 fill-yellow-300 text-yellow-300"
            />
          ))}
        </Row>
        <p className="text-sm text-primary-foreground/85 leading-relaxed italic">
          &ldquo;Finally I can walk into any hospital and show my complete
          history in seconds. ArogyaVault changed how our entire family manages
          health.&rdquo;
        </p>
        <p className="text-xs text-primary-foreground/60 font-medium">
          — Priya Sharma, Hyderabad
        </p>
      </Stack>
    </Stack>
  );
};
