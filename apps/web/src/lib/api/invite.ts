/**
 * Invite API
 * ----------
 * Typed wrappers for all /invites endpoints.
 * Mirrors the Pydantic schemas from apps/backend/app/api/schemas/invite.py.
 *
 * Phone numbers are always masked in responses (+91****5592).
 * The backend handles encryption/decryption — the frontend never sees raw phones.
 */

import { apiClient } from "./client";
import type { OffsetPageMeta } from "./community";
import { toQueryString } from "./utils";

/* ══════════════════════════════════════════════════════════════════════
   ENUMS
   ══════════════════════════════════════════════════════════════════════ */

export type InviteStatus = "pending" | "accepted" | "rejected" | "expired" | "revoked";

export type InviteRelation =
  | "Family Member"
  | "Doctor"
  | "Caregiver"
  | "Lab / Diagnostic"
  | "Pharmacy"
  | "Other";

export type InviteAccessScope = "App Access" | "Group Access";

export type InviteDirection = "sent" | "received";

/* ══════════════════════════════════════════════════════════════════════
   REQUEST TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface SendInviteData {
  phone: string;
  invitee_name?: string;
  relation: InviteRelation;
  access_scope?: InviteAccessScope;
  message?: string;
}

export interface RejectInviteData {
  reason?: string;
}

export interface InviteListParams {
  direction?: InviteDirection;
  status?: InviteStatus;
  page?: number;
  page_size?: number;
}

/* ══════════════════════════════════════════════════════════════════════
   RESPONSE TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface InviterOut {
  id: string;
  name: string;
  initials: string;
  phone_masked: string;
}

export interface InviteeOut {
  name: string | null;
  phone_masked: string;
}

export interface InviteOut {
  id: string;
  inviter: InviterOut;
  invitee: InviteeOut;
  relation: InviteRelation;
  access_scope: InviteAccessScope;
  status: InviteStatus;
  direction: InviteDirection;
  message: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  group_id: string | null;
}

export interface InviteDetailOut extends InviteOut {
  group_name: string | null;
  group_slug: string | null;
}

export interface SendInviteResponse {
  success: boolean;
  invite: InviteOut;
  message: string;
}

export interface InviteActionResponse {
  success: boolean;
  invite: InviteOut;
  message: string;
}

export interface InviteListResponse {
  items: InviteOut[];
  meta: OffsetPageMeta;
}

export interface InviteCountsOut {
  sent_pending: number;
  sent_total: number;
  received_pending: number;
  received_total: number;
}

/* ══════════════════════════════════════════════════════════════════════
   API CLIENT
   ══════════════════════════════════════════════════════════════════════ */

export const inviteApi = {
  /* ── Send invite ── */
  sendInvite: (data: SendInviteData) =>
    apiClient<SendInviteResponse>("/invites", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* ── List invites ── */
  listInvites: (params: InviteListParams = {}) =>
    apiClient<InviteListResponse>(`/invites${toQueryString(params)}`),

  /* ── Invite counts ── */
  getCounts: () =>
    apiClient<InviteCountsOut>("/invites/counts"),

  /* ── Get invite detail ── */
  getInvite: (inviteId: string) =>
    apiClient<InviteDetailOut>(`/invites/${inviteId}`),

  /* ── Accept invite ── */
  acceptInvite: (inviteId: string) =>
    apiClient<InviteActionResponse>(`/invites/${inviteId}/accept`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  /* ── Reject invite ── */
  rejectInvite: (inviteId: string, data: RejectInviteData = {}) =>
    apiClient<InviteActionResponse>(`/invites/${inviteId}/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* ── Resend invite ── */
  resendInvite: (inviteId: string) =>
    apiClient<InviteActionResponse>(`/invites/${inviteId}/resend`, {
      method: "POST",
    }),

  /* ── Revoke invite ── */
  revokeInvite: (inviteId: string) =>
    apiClient<InviteActionResponse>(`/invites/${inviteId}`, {
      method: "DELETE",
    }),
};
