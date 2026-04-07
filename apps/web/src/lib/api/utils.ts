/**
 * Shared API utilities
 * --------------------
 * Common helpers used across all API modules (community, vault, invite).
 */

/**
 * Convert a params object to a URL query string.
 *
 * Skips undefined, null, and empty-string values.
 * Returns "" (empty) if no valid params remain, or "?key=val&..." otherwise.
 */
export function toQueryString(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
