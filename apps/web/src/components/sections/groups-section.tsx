import * as React from "react";
import Link from "next/link";
import {
  UsersIcon, ArrowRightIcon, ArrowLeftRightIcon,
  ShieldCheckIcon, CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Container, Section, Stack, Row, Grid } from "@/core/primitives";
import { H2, H4, Lead, Text, Eyebrow, Muted } from "@/core/primitives";
import Typography from "@/components/ui/typography";
import { Surface } from "@/core/primitives";

const GROUP_FEATURES = [
  "Invite family members with one OTP link",
  "Control exactly which documents are visible",
  "Doctors get read-only secure access",
  "All sharing activity is logged and audited",
  "Revoke access any time with one tap",
  "Direction indicators show who can see what",
];

export const GroupsSection = ({ compact = false }: { compact?: boolean }) => {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left — copy */}
          <Stack gap="lg">
            <Eyebrow>For Families & Caregivers</Eyebrow>
            <H2>One family. One vault. Everyone connected.</H2>
            <Lead>
              Link your ArogyaVault with family members and trusted doctors.
              Share exactly what you want — and revoke access in an instant.
            </Lead>
            <Stack gap="sm">
              {GROUP_FEATURES.map((feat) => (
                <Row key={feat} gap="sm">
                  <CheckCircleIcon className="size-5 shrink-0 text-primary mt-0.5" />
                  <Text className="text-sm">{feat}</Text>
                </Row>
              ))}
            </Stack>
            {!compact && (
              <Button asChild variant="outline" className="gap-2 w-fit">
                <Link href="/how-it-works#families">
                  Learn about Groups
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            )}
          </Stack>

          {/* Right — visual diagram */}
          <div className="relative flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 items-center w-full max-w-sm">
              {/* You */}
              <Surface variant="primary" padding="md" className="col-start-2 flex flex-col items-center gap-2 text-center">
                <div className="size-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <UsersIcon className="size-5 text-primary-foreground" />
                </div>
                <Muted className="text-primary-foreground/80 text-xs font-medium">You</Muted>
              </Surface>

              {/* Doctor — can read */}
              <Surface variant="bordered" padding="sm" className="col-start-1 row-start-2 flex flex-col items-center gap-1 text-center">
                <div className="size-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">Dr</span>
                </div>
                <Muted className="text-xs">Doctor</Muted>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">→ Read</Badge>
              </Surface>

              {/* Spouse — bidirectional */}
              <Surface variant="bordered" padding="sm" className="col-start-3 row-start-2 flex flex-col items-center gap-1 text-center">
                <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">SP</span>
                </div>
                <Muted className="text-xs">Spouse</Muted>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">↔ Both</Badge>
              </Surface>

              {/* Parent — you can read */}
              <Surface variant="bordered" padding="sm" className="col-start-2 row-start-3 flex flex-col items-center gap-1 text-center">
                <div className="size-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">Pa</span>
                </div>
                <Muted className="text-xs">Parent</Muted>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">← Read</Badge>
              </Surface>

              {/* Arrow legend */}
              <div className="col-span-3 mt-2 flex justify-center gap-4">
                <Row gap="xs"><Typography variant="caption" color="muted" as="span">→ you share</Typography></Row>
                <Row gap="xs"><Typography variant="caption" color="muted" as="span">← they share</Typography></Row>
                <Row gap="xs"><Typography variant="caption" color="muted" as="span">↔ mutual</Typography></Row>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
