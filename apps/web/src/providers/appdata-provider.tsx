"use client";

/**
 * AppDataProvider
 * ---------------
 * Fetches the backend bootstrap bundle once on mount and provides it to every
 * component via React context. This is the SINGLE SOURCE for all mock/seed
 * data that used to live in `apps/web/src/data/*.ts`.
 *
 * For Kumar (usr_001) the bundle contains the full seeded dataset.
 * For every other (invited) user it contains empty collections so their
 * experience starts as a clean slate.
 *
 * Components should use the convenience hooks exposed by each
 * `apps/web/src/data/*.ts` module (e.g. `useVoiceLanguages`, `useDashboard`)
 * instead of talking to this context directly.
 */

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  appDataApi,
  type AppDataBootstrapResponse,
  type AppDataBundle,
} from "@/lib/api/appdata";
import { useAuthStore } from "@/stores";

const EMPTY_BUNDLE: AppDataBundle = {
  vaultHealth: {},
  dashboard: {},
  aiContext: {},
  aiConversations: {},
  community: {},
  communityFiles: {},
  communityMembers: {},
  linkedMembers: {},
  groups: {},
  records: {},
  profile: {},
  sidebar: {},
  pdfLibrary: {},
  learn: {},
  learnContext: {},
  medicalSystems: {},
  voiceLanguages: {},
  drugSuggestions: {},
};

interface AppDataContextValue {
  isLoading: boolean;
  isError: boolean;
  isSeedOwner: boolean;
  userId: string | null;
  data: AppDataBundle;
}

const AppDataContext = React.createContext<AppDataContextValue>({
  isLoading: true,
  isError: false,
  isSeedOwner: false,
  userId: null,
  data: EMPTY_BUNDLE,
});

interface AppDataProviderProps {
  children: React.ReactNode;
  /**
   * If true, the provider will attempt to fetch the bundle.
   * Use false for unauthenticated routes (e.g. the login page) so we don't
   * hit a protected endpoint unnecessarily.
   */
  enabled?: boolean;
}

export const AppDataProvider = ({
  children,
  enabled = true,
}: AppDataProviderProps) => {
  /* Wait for auth to be hydrated & confirmed before hitting the
     protected /app-data/bootstrap endpoint. Otherwise we'd 401 on
     first load (header/sidebar mount before AuthGuard resolves). */
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUserId = useAuthStore((s) => s.user?.id ?? null);

  /*
   * Scope the query key by the currently-signed-in user id. Without
   * this, when Kumar logs out and an invitee signs in, React Query
   * would serve Kumar's cached bundle under the same global key —
   * leaking the seeded demo groups (Ravi/Sharma/Priya) into the
   * invitee's sidebar and rendering the new invite group with
   * inviter-side labels. Keying by user id gives every account an
   * isolated cache slot.
   */
  const query = useQuery<AppDataBootstrapResponse>({
    queryKey: ["app-data", "bootstrap", authUserId],
    queryFn: () => appDataApi.getBootstrap(),
    enabled: enabled && isHydrated && isAuthenticated && Boolean(authUserId),
    staleTime: 5 * 60 * 1000, // 5 min — rarely changes during a session
    retry: 1,
  });

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      isLoading: query.isLoading,
      isError: query.isError,
      isSeedOwner: query.data?.is_seed_owner ?? false,
      userId: query.data?.user_id ?? null,
      data: query.data?.data ?? EMPTY_BUNDLE,
    }),
    [query.data, query.isLoading, query.isError],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

/** Low-level hook — prefer the convenience hooks exposed by `@/data/*`. */
export const useAppDataContext = () => React.useContext(AppDataContext);
