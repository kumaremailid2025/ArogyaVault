/**
 * Icon resolver — maps icon name strings (served from the backend seed bundle)
 * to actual lucide-react components.
 *
 * Seed data uses icon references like `"FileTextIcon"` so it can be serialized
 * as JSON. This module rehydrates those strings into React components.
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
 * Resolve an icon name string to a lucide-react component.
 * Falls back to `HelpCircleIcon` for unknown names.
 */
export const resolveIcon = (name: string | LucideIcon | undefined): LucideIcon => {
  if (!name) return HelpCircleIcon;
  if (typeof name !== "string") return name;
  return ICON_MAP[name] ?? HelpCircleIcon;
};
