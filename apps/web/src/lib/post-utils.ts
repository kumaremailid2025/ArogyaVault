/**
 * @file post-utils.ts
 * @description Small utility helpers for posts, greetings, and time formatting.
 *
 * @packageDocumentation
 * @category Utils
 */

/**
 * Return a time-of-day greeting string.
 *
 * - Before 12:00 → `"Good morning"`
 * - 12:00–16:59 → `"Good afternoon"`
 * - 17:00 onward → `"Good evening"`
 *
 * @returns A greeting string based on the current local hour.
 *
 * @example
 * ```ts
 * getGreeting(); // "Good morning"
 * ```
 */
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};
