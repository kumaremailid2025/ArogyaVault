// ─────────────────────────────────────────────────────────────────────────────
// ArogyaVault — Shared Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Format a phone number for display — e.g. +91 98765 43210 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/** Format a date string to Indian locale — e.g. 28 Mar 2026 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Truncate text to maxLength with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Capitalise the first letter of each word */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Convert document category slug to display label */
export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    prescription: "Prescription",
    lab_report: "Lab Report",
    radiology: "Radiology",
    discharge_summary: "Discharge Summary",
    medical_bill: "Medical Bill",
  };
  return labels[category] ?? titleCase(category.replace(/_/g, " "));
}
