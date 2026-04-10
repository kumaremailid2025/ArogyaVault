/**
 * Medical Systems Data — hook-only (data lives in backend store).
 *
 * Icon fields are stored as strings in the seed JSON and must be resolved
 * via `resolveIcon()` from `@/lib/icon-resolver` at render time.
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { MedSystem, Department, BodyRegionDef } from "@/models/learn";

export type RawMedSystem = Omit<MedSystem, "icon"> & { icon: string };
export type RawDepartment = Omit<Department, "icon"> & { icon: string };

interface MedicalSystemsBundle {
  MEDICAL_SYSTEMS: RawMedSystem[];
  DEPARTMENTS: RawDepartment[];
  BODY_REGIONS: BodyRegionDef[];
}

export const useMedicalSystems = (): MedicalSystemsBundle => {
  const { data } = useAppDataContext();
  const src = (data.medicalSystems || {}) as Record<string, unknown>;
  return {
    MEDICAL_SYSTEMS: (src.MEDICAL_SYSTEMS as RawMedSystem[]) ?? [],
    DEPARTMENTS: (src.DEPARTMENTS as RawDepartment[]) ?? [],
    BODY_REGIONS: (src.BODY_REGIONS as BodyRegionDef[]) ?? [],
  };
};
