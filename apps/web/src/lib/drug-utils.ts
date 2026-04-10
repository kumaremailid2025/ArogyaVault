import type { DrugInteraction } from "@/models/learn";

/** Normalise a drug name for consistent lookup key generation */
export const normDrug = (s: string): string => {
  return s.trim().toLowerCase().replace(/[^a-z]/g, "");
};

/**
 * Look up a drug-drug interaction.
 * Checks both orderings (a+b and b+a) so callers don't need to worry about order.
 * Returns null when no known interaction exists in the database.
 *
 * @param a First drug name
 * @param b Second drug name
 * @param interactions Drug interactions map from useLearn() hook
 * @returns The interaction data if found, null otherwise
 */
export const lookupInteraction = (
  a: string,
  b: string,
  interactions: Record<string, DrugInteraction>
): DrugInteraction | null => {
  const key  = `${normDrug(a)}+${normDrug(b)}`;
  const key2 = `${normDrug(b)}+${normDrug(a)}`;
  return interactions[key] ?? interactions[key2] ?? null;
};
