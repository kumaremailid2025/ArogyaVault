/**
 * @file icon-resolver.ts
 * @description Maps icon-name strings (served from the backend seed bundle)
 * to actual `lucide-react` components.
 *
 * Seed data stores icon references as strings like `"FileTextIcon"` so they
 * can be serialised as JSON. This module rehydrates those strings back into
 * React component references at runtime.
 *
 * @packageDocumentation
 * @category Utils
 */

import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  BellIcon,
  BoneIcon,
  BookOpenIcon,
  BrainCircuitIcon,
  BrainIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  DropletIcon,
  EyeIcon,
  FileTextIcon,
  FlameIcon,
  FlaskConicalIcon,
  HeartIcon,
  HeartPulseIcon,
  InfoIcon,
  LayersIcon,
  LeafIcon,
  MessageCircleIcon,
  MicroscopeIcon,
  PillIcon,
  RadioIcon,
  ReceiptIcon,
  ScanLineIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
  TrendingUpIcon,
  UploadCloudIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  WindIcon,
  HelpCircleIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  BellIcon,
  BoneIcon,
  BookOpenIcon,
  BrainCircuitIcon,
  BrainIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  ClockIcon,
  DropletIcon,
  EyeIcon,
  FileTextIcon,
  FlameIcon,
  FlaskConicalIcon,
  HeartIcon,
  HeartPulseIcon,
  InfoIcon,
  LayersIcon,
  LeafIcon,
  MessageCircleIcon,
  MicroscopeIcon,
  PillIcon,
  RadioIcon,
  ReceiptIcon,
  ScanLineIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
  TrendingUpIcon,
  UploadCloudIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  WindIcon,
};

/**
 * Resolve an icon-name string to a `lucide-react` component.
 *
 * Accepts a string key (e.g. `"HeartPulseIcon"`), a component reference
 * that is passed through unchanged, or `undefined`. Falls back to
 * `HelpCircleIcon` when the name is unknown or omitted.
 *
 * @param name - Icon name string, direct `LucideIcon` reference, or `undefined`.
 * @returns The resolved `LucideIcon` component.
 *
 * @example
 * ```tsx
 * const Icon = resolveIcon("HeartPulseIcon");
 * return <Icon className="size-4" />;
 * ```
 *
 * @category Utils
 */
export const resolveIcon = (name: string | LucideIcon | undefined): LucideIcon => {
  if (!name) return HelpCircleIcon;
  if (typeof name !== "string") return name;
  return ICON_MAP[name] ?? HelpCircleIcon;
};
