/**
 * Activity Recorder Store (Zustand) — In-Memory
 * -----------------------------------------------
 * Records every meaningful user action in the app.
 * Each record gets a UUID v4, a TypeCode (entity), an ActionCode (verb),
 * and a datetime. When the backend is ready these records will be synced
 * to the database; for now they live in memory.
 *
 * Usage:
 *   const { record } = useActivityStore();
 *   record({ typeCode: TypeCode.POST, actionCode: ActionCode.LIKE, entityId: 42, meta: { ... } });
 *
 *   const activities = useActivityStore((s) => s.activities);
 */

import { create } from "zustand";
import { TypeCode, ActionCode } from "@/models/type-codes";

/* ── Types ────────────────────────────────────────────────────────── */

export interface ActivityRecord {
  /** Unique identifier for this activity entry (UUID v4) */
  id: string;
  /** What kind of entity was acted upon */
  typeCode: TypeCode;
  /** What action was performed */
  actionCode: ActionCode;
  /** ID of the entity (post id, file id, member id, etc.) */
  entityId: string | number;
  /** ISO-8601 timestamp */
  datetime: string;
  /** ID of the user who performed the action */
  userId: string | null;
  /** Optional group / community context */
  groupId?: string;
  /** Optional human-readable description (auto-generated) */
  description?: string;
  /** Arbitrary extra data (post text snippet, file name, etc.) */
  meta?: Record<string, unknown>;
}

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
  activities: ActivityRecord[];
  /** Record a new activity. Returns the created record. */
  record: (payload: RecordPayload) => ActivityRecord;
  /** Get activities filtered by typeCode */
  getByType: (typeCode: TypeCode) => ActivityRecord[];
  /** Get activities filtered by actionCode */
  getByAction: (actionCode: ActionCode) => ActivityRecord[];
  /** Get activities for a specific entity */
  getByEntity: (entityId: string | number) => ActivityRecord[];
  /** Get the N most recent activities */
  getRecent: (limit?: number) => ActivityRecord[];
  /** Clear all activities (for testing / reset) */
  clearAll: () => void;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Generates a UUID v4 using the Web Crypto API (with fallback). */
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* ── Store ────────────────────────────────────────────────────────── */

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],

  record: (payload) => {
    const entry: ActivityRecord = {
      id: generateUUID(),
      typeCode: payload.typeCode,
      actionCode: payload.actionCode,
      entityId: payload.entityId,
      datetime: new Date().toISOString(),
      userId: null, // Will be populated from auth store by the caller or middleware
      groupId: payload.groupId,
      description: payload.description,
      meta: payload.meta,
    };

    set((state) => ({
      activities: [entry, ...state.activities],
    }));

    return entry;
  },

  getByType: (typeCode) =>
    get().activities.filter((a) => a.typeCode === typeCode),

  getByAction: (actionCode) =>
    get().activities.filter((a) => a.actionCode === actionCode),

  getByEntity: (entityId) =>
    get().activities.filter((a) => a.entityId === entityId),

  getRecent: (limit = 50) =>
    get().activities.slice(0, limit),

  clearAll: () => set({ activities: [] }),
}));

/* ── Convenience: standalone record function (non-hook) ──────────── */

/**
 * Record an activity from outside React components (e.g., in callbacks).
 * Same as useActivityStore.getState().record(payload).
 */
export const recordActivity = (payload: RecordPayload): ActivityRecord =>
  useActivityStore.getState().record(payload);
