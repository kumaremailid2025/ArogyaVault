"use client";

/**
 * Trust panel with security points and customer testimonial.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Left-side marketing / trust panel shown on the sign-in page alongside
 * the phone + OTP form. Renders three "trust points" (encryption,
 * passwordless, consent) and a customer testimonial.
 *
 * This container is purely presentational — it owns no state and makes
 * no network calls. Visibility is controlled by the parent page wrapper
 * (hidden on mobile, shown from the `lg` breakpoint upward).
 *
 * @see ARCHITECTURE.md
 */

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheckIcon,
  SmartphoneIcon,
  LockKeyholeIcon,
  StarIcon,
} from "lucide-react";
import { Stack, Row } from "@/core/primitives";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * A single trust point shown on the sign-in panel.
 *
 * @category Types
 */
interface TrustPoint {
  /** Lucide icon rendered in the circular badge on the left. */
  readonly icon: LucideIcon;
  /** One-line description of the guarantee (plain, no markup). */
  readonly text: string;
}

/**
 * Five-star testimonial block shown at the bottom of the panel.
 *
 * @category Types
 */
interface Testimonial {
  /** The quoted body — displayed in italics, may span multiple lines. */
  readonly quote: string;
  /** Attribution line, usually "— Name, City". */
  readonly attribution: string;
  /** Number of filled stars (0–5). */
  readonly starCount: number;
}

/* ══════════════════════════════════════════════════════════════════════
   STATIC CONTENT
   These live in-module because the trust-panel copy is part of the
   sign-in page design — not backend data. Changing them is a deploy.
   ══════════════════════════════════════════════════════════════════════ */

/** Three high-level guarantees shown in the middle of the panel. */
const TRUST_POINTS: readonly TrustPoint[] = [
  { icon: ShieldCheckIcon, text: "AES-256 encrypted at rest and in transit" },
  { icon: SmartphoneIcon, text: "OTP-only — no passwords, ever" },
  { icon: LockKeyholeIcon, text: "Your records are never shared without consent" },
] as const;

/** Anchor testimonial shown at the bottom of the trust panel. */
const TESTIMONIAL: Testimonial = {
  quote:
    "Finally I can walk into any hospital and show my complete history in seconds. " +
    "ArogyaVault changed how our entire family manages health.",
  attribution: "— Priya Sharma, Hyderabad",
  starCount: 5,
};

/* ══════════════════════════════════════════════════════════════════════
   CONTAINER
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the marketing/trust panel for the sign-in page.
 *
 * @returns The rendered container.
 *
 * @category Containers
 */
export const TrustPanelContainer = (): React.ReactElement => {
  return (
    <Stack
      className="h-full w-full justify-between bg-primary p-12 text-primary-foreground"
      gap="xl"
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Typography variant="body" color="inverse" className="opacity-60 text-sm font-medium uppercase tracking-widest">
            Welcome back
          </Typography>
          <Typography variant="hero" color="inverse">
            Your health records,
            <br />
            always with you.
          </Typography>
          <Typography variant="body" color="inverse" className="opacity-75 leading-relaxed">
            Sign in with your mobile number. No password needed — your phone is
            your key to a lifetime of secure medical records.
          </Typography>
        </Stack>

        <Stack gap="md">
          {TRUST_POINTS.map((tp) => (
            <Row key={tp.text} gap="sm" align="start">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <tp.icon className="size-4" />
              </div>
              <Typography variant="body" color="inverse" className="opacity-80 leading-snug pt-1">
                {tp.text}
              </Typography>
            </Row>
          ))}
        </Stack>
      </Stack>

      {/* ── Testimonial card ──────────────────────────────────────── */}
      <Stack gap="sm" className="rounded-xl bg-primary-foreground/10 p-5 border border-primary-foreground/20">
        <Row gap="xs">
          {Array.from({ length: TESTIMONIAL.starCount }, (_, i) => (
            <StarIcon
              key={i}
              className="size-3.5 fill-yellow-300 text-yellow-300"
              aria-hidden="true"
            />
          ))}
        </Row>
        <Typography variant="body" color="inverse" className="opacity-85 leading-relaxed italic">
          &ldquo;{TESTIMONIAL.quote}&rdquo;
        </Typography>
        <Typography variant="caption" color="inverse" weight="medium" className="opacity-60">
          {TESTIMONIAL.attribution}
        </Typography>
      </Stack>
    </Stack>
  );
};
