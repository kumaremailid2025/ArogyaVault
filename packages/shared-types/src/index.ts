// ─────────────────────────────────────────────────────────────────────────────
// ArogyaVault — Shared TypeScript Types
// Consumed by apps/web and packages/api-client
// ─────────────────────────────────────────────────────────────────────────────

// ── User ─────────────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  phone: string;
  name?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  role: UserRole;
  createdAt: string;
}

// ── Documents ────────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "prescription"
  | "lab_report"
  | "radiology"
  | "discharge_summary"
  | "medical_bill";

export type DocumentStatus =
  | "pending_processing"
  | "processing"
  | "processed"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "failed";

export interface MedicalDocument {
  id: string;
  userId: string;
  fileUrl: string;
  category: DocumentCategory;
  aiSummary?: string;
  extractedJson?: Record<string, unknown>;
  status: DocumentStatus;
  uploadedBy: string;
  createdAt: string;
  processedAt?: string;
}

// ── Groups & Permissions ──────────────────────────────────────────────────────

export type PermissionScope = "app" | "group";
export type MemberStatus = "pending" | "accepted" | "declined";
export type RelationshipType =
  | "family_member"
  | "caregiver"
  | "friend"
  | "patient"
  | "custom";

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  viewerUserId: string;
  dataOwnerUserId: string;
  invitedBy: string;
  relationshipType: RelationshipType;
  permissionScope: PermissionScope;
  canRead: boolean;
  canUpload: boolean;
  uploadRequiresApproval: boolean;
  status: MemberStatus;
  joinedAt?: string;
}

export interface LinkRequest {
  id: string;
  fromUserId: string;
  toPhone: string;
  groupId?: string;
  relationshipType: RelationshipType;
  token: string;
  expiresAt: string;
  status: "pending" | "accepted" | "declined" | "expired";
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OtpRequest {
  phone: string;
}

export interface OtpVerify {
  phone: string;
  code: string;
  inviteToken?: string;
  clinicRef?: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
