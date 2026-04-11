/**
 * @file utils.ts
 * @description Shared utility helpers for the ArogyaVault web app.
 *
 * @packageDocumentation
 * @category Utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names, resolving conflicts via `tailwind-merge`
 * and handling conditional / array / object class values via `clsx`.
 *
 * This is the canonical way to compose class strings in the codebase.
 *
 * @param inputs - Any number of class values accepted by `clsx`:
 *   strings, arrays, objects with boolean values, `undefined`, etc.
 * @returns A single deduplicated, conflict-resolved class string.
 *
 * @example
 * // Static merge
 * cn("px-4 py-2", "bg-primary text-white")
 * // → "px-4 py-2 bg-primary text-white"
 *
 * @example
 * // Conditional classes
 * cn("rounded", isActive && "bg-primary", isMuted && "text-muted-foreground")
 *
 * @example
 * // Tailwind conflict resolution
 * cn("px-4", "px-6")   // → "px-6"  (last wins)
 * cn("text-sm", "text-base") // → "text-base"
 *
 * @category Utils
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
