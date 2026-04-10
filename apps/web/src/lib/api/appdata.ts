/**
 * App Data API — fetches the user-scoped bootstrap bundle from the backend.
 *
 * The backend `/app-data/bootstrap` endpoint returns:
 *   - Kumar (usr_001) → full seeded mock data for every module.
 *   - Any other user → empty collections (clean-slate experience for invitees).
 *
 * This replaces the former `apps/web/src/data/*.ts` mock files. No mock data
 * should live in the frontend anymore.
 */

import { apiClient } from "./client";

/* ── Raw bundle shape (mirrors backend DATASETS registry) ─────────────── */

export interface AppDataBundle {
  vaultHealth: Record<string, unknown>;
  dashboard: Record<string, unknown>;
  aiContext: Record<string, unknown>;
  aiConversations: Record<string, unknown>;
  community: Record<string, unknown>;
  communityFiles: Record<string, unknown>;
  communityMembers: Record<string, unknown>;
  linkedMembers: Record<string, unknown>;
  groups: Record<string, unknown>;
  records: Record<string, unknown>;
  profile: Record<string, unknown>;
  sidebar: Record<string, unknown>;
  pdfLibrary: Record<string, unknown>;
  learn: Record<string, unknown>;
  learnContext: Record<string, unknown>;
  medicalSystems: Record<string, unknown>;
  voiceLanguages: Record<string, unknown>;
  drugSuggestions: Record<string, unknown>;
}

export interface AppDataBootstrapResponse {
  user_id: string;
  is_seed_owner: boolean;
  data: AppDataBundle;
}

export const appDataApi = {
  /** Fetch the full per-user bootstrap bundle. */
  getBootstrap: () => apiClient<AppDataBootstrapResponse>("/app-data/bootstrap"),
};
