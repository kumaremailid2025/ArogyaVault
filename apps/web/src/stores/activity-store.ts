/**
 * Activity Recorder Store (Zustand) — API-Backed
 * ------------------------------------------------
 * Records every meaningful user action in the app.
 * Each record gets a UUID v4, a TypeCode (entity), an ActionCode (verb),
 * and a datetime. Records are synced to /vault/activities API.
 *
 * The local store acts as an optimistic write-through cache:
 * - record() adds to local state instantly for UI feedback
 * - Fires POST /vault/activities in background
 * - hydrate() loads full history from API
 */

import { create } from "zustand";
import { TypeCode, ActionCode } from "@/models/type-codes";
import type { ActivityOut, ActivityCreateRequest } from "@/models/vault";
import { vaultApi } from "@/lib/api/vault";

/* ── Types ────────────────────────────────────────────────────────── */

/** Re-export for backward compat — now mirrors API shape */
export type ActivityRecord = ActivityOut;

/** Payload the caller passes — id, datetime, userId are auto-filled. */
export interface RecordPayload {
  typeCode: TypeCode;
  actionCode: ActionCode;
  entityId: string | number;
  groupId?: string;
  description?: string;
  meta?: Record<string, unknown>;
}

interface ActivityState {
  activities: ActivityOut[];
  hydrated: boolean;

  /** Hydrate the store from API response */
  hydrate: (items: ActivityOut[]) => void;
  /** Record a new activity (optimistic + API call). Returns the created record. */
  record: (payload: RecordPayload) => ActivityOut;
  /** Get activities filtered by typeCode */
  getByType: (typeCode: TypeCode) => ActivityOut[];
  /** Get activities filtered by actionCode */
  getByAction: (actionCode: ActionCode) => ActivityOut[];
  /** Get activities for a specific entity */
  getByEntity: (entityId: string | number) => ActivityOut[];
  /** Get the N most recent activities */
  getRecent: (limit?: number) => ActivityOut[];
  /** Clear all activities (for testing / reset) */
  clearAll: () => void;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* ── Store ────────────────────────────────────────────────────────── */

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  hydrated: false,

  hydrate: (items) => {
    set({ activities: items, hydrated: true });
  },

  record: (payload) => {
    // Build local entry matching API shape
    const entry: ActivityOut = {
      id: generateUUID(),
      type_code: payload.typeCode,
      action_code: payload.actionCode,
      entity_id: payload.entityId,
      datetime: new Date().toISOString(),
      user_id: null,
      group_id: payload.groupId,
      description: payload.description,
      meta: payload.meta,
    };

    // Optimistic: prepend to local state
    set((state) => ({
      activities: [entry, ...state.activities],
    }));

    // Fire API in background
    const apiPayload: ActivityCreateRequest = {
      type_code: payload.typeCode,
      action_code: payload.actionCode,
      entity_id: payload.entityId,
      group_id: payload.groupId,
      description: payload.description,
      meta: payload.meta,
    };
    vaultApi.recordActivity(apiPayload).then((serverEntry) => {
      // Replace optimistic entry with server-generated one
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === entry.id ? serverEntry : a,
        ),
      }));
    }).catch(() => {
      // Activity recording is fire-and-forget; keep the optimistic entry
    });

    return entry;
  },

  getByType: (typeCode) =>
    get().activities.filter((a) => a.type_code === typeCode),

  getByAction: (actionCode) =>
    get().activities.filter((a) => a.action_code === actionCode),

  getByEntity: (entityId) =>
    get().activities.filter((a) => a.entity_id === entityId),

  getRecent: (limit = 50) =>
    get().activities.slice(0, limit),

  clearAll: () => set({ activities: [] }),
}));

/* ── Convenience: standalone record function (non-hook) ──────────── */

/**
 * Record an activity from outside React components (e.g., in callbacks).
 * Same as useActivityStore.getState().record(payload).
 */
export const recordActivity = (payload: RecordPayload): ActivityOut =>
  useActivityStore.getState().record(payload);
