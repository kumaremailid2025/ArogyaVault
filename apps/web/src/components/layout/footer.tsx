import * as React from "react";
import Link from "next/link";
import { HeartPulseIcon, MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import { Container, Grid, Stack, Row, Divider } from "@/core/primitives";
import { Muted, Small, Text, H4 } from "@/core/primitives";

const PRODUCT_LINKS = [
  { label: "Features",     href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security",     href: "/security" },
  { label: "For Families", href: "/how-it-works#families" },
];

const COMPANY_LINKS = [
  { label: "About Us",  href: "/about" },
  { label: "FAQ",       href: "/faq" },
  { label: "Contact",   href: "/contact" },
  { label: "Careers",   href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",  href: "/contact" },
  { label: "Terms of Service", href: "/contact" },
  { label: "Data Policy",     href: "/security" },
  { label: "Cookie Settings", href: "/contact" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container>
        {/* Main footer grid */}
        <div className="py-14">
          <Grid cols={4} gap="lg">
            {/* Brand column */}
            <Stack gap="md" className="col-span-1 md:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 font-bold text-primary w-fit">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HeartPulseIcon className="size-4" />
                </div>
                <span className="text-lg tracking-tight">ArogyaVault</span>
              </Link>
              <Muted className="max-w-xs leading-relaxed">
                Your complete family health records platform. Secure, AI-powered, and always accessible.
              </Muted>
              <Stack gap="sm">
                <Row gap="sm" className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                  <MailIcon className="size-4 shrink-0" />
                  <Small>support@arogyavault.app</Small>
                </Row>
                <Row gap="sm" className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                  <PhoneIcon className="size-4 shrink-0" />
                  <Small>+91 98765 43210</Small>
                </Row>
                <Row gap="sm" className="text-muted-foreground cursor-default">
                  <MapPinIcon className="size-4 shrink-0" />
                  <Small>Hyderabad, Telangana, India</Small>
                </Row>
              </Stack>
            </Stack>

            {/* Product */}
            <Stack gap="md">
              <H4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product</H4>
              <Stack gap="sm">
                {PRODUCT_LINKS.map((l) => <FooterLink key={l.href + l.label} {...l} />)}
              </Stack>
            </Stack>

            {/* Company */}
            <Stack gap="md">
              <H4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</H4>
              <Stack gap="sm">
                {COMPANY_LINKS.map((l) => <FooterLink key={l.href + l.label} {...l} />)}
              </Stack>
            </Stack>

            {/* Legal */}
            <Stack gap="md">
              <H4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</H4>
              <Stack gap="sm">
                {LEGAL_LINKS.map((l) => <FooterLink key={l.href + l.label} {...l} />)}
              </Stack>
            </Stack>
          </Grid>
        </div>

        <Divider className="my-0" />

        {/* Bottom bar */}
        <Row className="justify-between py-5 flex-col sm:flex-row gap-3">
          <Muted className="text-xs">
            © {new Date().getFullYear()} ArogyaVault. All rights reserved.
          </Muted>
          <Muted className="text-xs">
            Built with ❤️ for Indian families · Made in Hyderabad
          </Muted>
        </Row>
      </Container>
    </footer>
  );
}
