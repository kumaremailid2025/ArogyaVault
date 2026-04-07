/**
 * Invite Hooks (TanStack React Query)
 * ------------------------------------
 * Custom hooks wrapping all /invites API calls.
 *
 * Queries:
 *   useInvites      — paginated invite list (sent/received, filterable)
 *   useInviteCounts — dashboard badge counts
 *   useInviteDetail — single invite with group info
 *
 * Mutations:
 *   useSendInviteMut   — send a new invite
 *   useAcceptInvite    — accept a received invite
 *   useRejectInvite    — reject a received invite
 *   useResendInvite    — resend a pending invite
 *   useRevokeInvite    — revoke/cancel a sent invite
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inviteApi,
  type InviteListParams,
  type SendInviteData,
  type RejectInviteData,
} from "@/lib/api/invite";
import { inviteKeys } from "./query-keys";

/* ══════════════════════════════════════════════════════════════════════
   QUERIES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Fetch paginated invite list with optional direction/status filters.
 */
export const useInvites = (params: InviteListParams = {}, enabled = true) =>
  useQuery({
    queryKey: inviteKeys.list(params),
    queryFn: () => inviteApi.listInvites(params),
    enabled,
    staleTime: 30_000,
  });

/**
 * Quick counts for invite dashboard badges (sent pending, received pending, etc.).
 */
export const useInviteCounts = (enabled = true) =>
  useQuery({
    queryKey: inviteKeys.counts(),
    queryFn: () => inviteApi.getCounts(),
    enabled,
    staleTime: 30_000,
  });

/**
 * Fetch a single invite with extended detail (linked group info if accepted).
 */
export const useInviteDetail = (inviteId: string | null, enabled = true) =>
  useQuery({
    queryKey: inviteKeys.detail(inviteId ?? ""),
    queryFn: () => inviteApi.getInvite(inviteId!),
    enabled: !!inviteId && enabled,
    staleTime: 30_000,
  });

/* ══════════════════════════════════════════════════════════════════════
   MUTATIONS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Send a new invite. Invalidates the invite list + counts on success.
 */
export const useSendInviteMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendInviteData) => inviteApi.sendInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
};

/**
 * Accept a received invite. Invalidates invites + groups (new group created).
 */
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => inviteApi.acceptInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all });
      // A new linked group is created — invalidate groups too
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

/**
 * Reject a received invite.
 */
export const useRejectInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteId, data }: { inviteId: string; data?: RejectInviteData }) =>
      inviteApi.rejectInvite(inviteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
};

/**
 * Resend a pending or expired invite (resets expiry).
 */
export const useResendInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => inviteApi.resendInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
};

/**
 * Revoke (cancel) a sent invite.
 */
export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => inviteApi.revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
};
