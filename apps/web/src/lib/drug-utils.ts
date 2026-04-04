import { DRUG_INTERACTIONS } from "@/data/learn-data";
import type { DrugInteraction } from "@/models/learn";

/** Normalise a drug name for consistent lookup key generation */
export const normDrug = (s: string): string => {
  return s.trim().toLowerCase().replace(/[^a-z]/g, "");
};

/**
 * Look up a drug-drug interaction.
 * Checks both orderings (a+b and b+a) so callers don't need to worry about order.
 * Returns null when no known interaction exists in the database.
 */
export const lookupInteraction = (a: string, b: string): DrugInteraction | null => {
  const key  = `${normDrug(a)}+${normDrug(b)}`;
  const key2 = `${normDrug(b)}+${normDrug(a)}`;
  return DRUG_INTERACTIONS[key] ?? DRUG_INTERACTIONS[key2] ?? null;
};
