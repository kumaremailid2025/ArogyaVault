/* ─────────────────────────────────────────────────────────────────
   TypeCode & ActionCode — Canonical enums for entity + action tracking
   ─────────────────────────────────────────────────────────────────
   Every entity and user action across the app has a unique code.
   These power the favorites store, activity recorder, and future
   analytics / audit-log tables.
   ───────────────────────────────────────────────────────────────── */

/**
 * TypeCode identifies the KIND of entity.
 * Used in favorites, activity records, and anywhere an entity needs
 * to be referenced in a type-safe, backend-friendly way.
 */
export enum TypeCode {
  /* ── Community ─────────────────────────────────────── */
  COMMUNITY        = "COMMUNITY",        // the main community space
  GROUP            = "GROUP",            // an invited / linked group

  /* ── Feed ──────────────────────────────────────────── */
  POST             = "POST",             // community or linked post
  REPLY            = "REPLY",            // reply to a post
  POST_SUMMARY     = "POST_SUMMARY",     // AI-generated post summary
  AI_RESPONSE      = "AI_RESPONSE",      // AI response on a linked post

  /* ── Files ─────────────────────────────────────────── */
  FILE             = "FILE",             // uploaded community file
  FILE_QA          = "FILE_QA",          // Q&A entry on a file

  /* ── Members ───────────────────────────────────────── */
  MEMBER           = "MEMBER",           // community member
  LINKED_MEMBER    = "LINKED_MEMBER",    // linked member (family / doctor)

  /* ── Vault / Records ───────────────────────────────── */
  HEALTH_RECORD    = "HEALTH_RECORD",    // medical file in vault
  VITAL_METRIC     = "VITAL_METRIC",     // single health vital reading
  MEDICATION       = "MEDICATION",       // medication entry
  HEALTH_ALERT     = "HEALTH_ALERT",     // health alert notification

  /* ── AI ────────────────────────────────────────────── */
  AI_CONVERSATION  = "AI_CONVERSATION",  // ArogyaAI chat session
  AI_MESSAGE       = "AI_MESSAGE",       // single AI chat message
  AI_CONTEXT_CARD  = "AI_CONTEXT_CARD",  // smart suggestion card

  /* ── Learn ─────────────────────────────────────────── */
  LEARN_TOPIC      = "LEARN_TOPIC",      // educational topic
  LEARN_CATEGORY   = "LEARN_CATEGORY",   // learning category
  DRUG_INTERACTION = "DRUG_INTERACTION", // drug interaction check
  MED_SYSTEM       = "MED_SYSTEM",       // medical system (Ayurveda etc.)
  DEPARTMENT       = "DEPARTMENT",       // medical department
  PDF_QA           = "PDF_QA",           // PDF Q&A session

  /* ── User / Auth ───────────────────────────────────── */
  USER             = "USER",             // user account
  PROFILE          = "PROFILE",          // user profile

  /* ── Notifications ─────────────────────────────────── */
  NOTIFICATION     = "NOTIFICATION",     // notification item

  /* ── Favorites ─────────────────────────────────────── */
  FAVORITE         = "FAVORITE",         // a favorite record itself
}

/**
 * ActionCode identifies WHAT the user did.
 * Every activity record carries exactly one ActionCode.
 */
export enum ActionCode {
  /* ── CRUD ──────────────────────────────────────────── */
  CREATE           = "CREATE",
  READ             = "READ",
  UPDATE           = "UPDATE",
  DELETE           = "DELETE",

  /* ── Feed actions ──────────────────────────────────── */
  LIKE             = "LIKE",
  UNLIKE           = "UNLIKE",
  FAVORITE         = "FAVORITE",
  UNFAVORITE       = "UNFAVORITE",
  REPLY_SUBMIT     = "REPLY_SUBMIT",
  REPLY_REPHRASE   = "REPLY_REPHRASE",
  POST_CREATE      = "POST_CREATE",
  POST_VIEW        = "POST_VIEW",

  /* ── AI actions ────────────────────────────────────── */
  AI_SUMMARY_VIEW  = "AI_SUMMARY_VIEW",
  AI_CHAT_SEND     = "AI_CHAT_SEND",
  AI_SUGGESTION_CLICK = "AI_SUGGESTION_CLICK",

  /* ── File actions ──────────────────────────────────── */
  FILE_VIEW        = "FILE_VIEW",
  FILE_UPLOAD      = "FILE_UPLOAD",
  FILE_QA_ASK      = "FILE_QA_ASK",

  /* ── Member actions ────────────────────────────────── */
  MEMBER_VIEW      = "MEMBER_VIEW",

  /* ── Navigation ────────────────────────────────────── */
  NAV_TAB_SWITCH   = "NAV_TAB_SWITCH",
  NAV_GROUP_ENTER  = "NAV_GROUP_ENTER",
  NAV_PAGE_VIEW    = "NAV_PAGE_VIEW",

  /* ── Learn actions ─────────────────────────────────── */
  TOPIC_VIEW       = "TOPIC_VIEW",
  TOPIC_LEVEL_SWITCH = "TOPIC_LEVEL_SWITCH",
  DRUG_CHECK       = "DRUG_CHECK",
  PDF_UPLOAD       = "PDF_UPLOAD",
  PDF_QA_ASK       = "PDF_QA_ASK",

  /* ── Vault actions ─────────────────────────────────── */
  RECORD_VIEW      = "RECORD_VIEW",
  VITAL_DRILL      = "VITAL_DRILL",

  /* ── Auth actions ──────────────────────────────────── */
  SIGN_IN          = "SIGN_IN",
  SIGN_OUT         = "SIGN_OUT",

  /* ── Profile actions ───────────────────────────────── */
  PROFILE_VIEW     = "PROFILE_VIEW",
  SETTINGS_VIEW    = "SETTINGS_VIEW",

  /* ── Notification actions ──────────────────────────── */
  NOTIFICATION_VIEW = "NOTIFICATION_VIEW",
  NOTIFICATION_CLICK = "NOTIFICATION_CLICK",

  /* ── Invite ────────────────────────────────────────── */
  INVITE_SEND      = "INVITE_SEND",
}

/**
 * Human-readable labels for TypeCodes (for UI display if needed).
 */
export const TYPE_CODE_LABELS: Record<TypeCode, string> = {
  [TypeCode.COMMUNITY]:       "Community",
  [TypeCode.GROUP]:           "Group",
  [TypeCode.POST]:            "Post",
  [TypeCode.REPLY]:           "Reply",
  [TypeCode.POST_SUMMARY]:    "Post Summary",
  [TypeCode.AI_RESPONSE]:     "AI Response",
  [TypeCode.FILE]:            "File",
  [TypeCode.FILE_QA]:         "File Q&A",
  [TypeCode.MEMBER]:          "Member",
  [TypeCode.LINKED_MEMBER]:   "Linked Member",
  [TypeCode.HEALTH_RECORD]:   "Health Record",
  [TypeCode.VITAL_METRIC]:    "Vital Metric",
  [TypeCode.MEDICATION]:      "Medication",
  [TypeCode.HEALTH_ALERT]:    "Health Alert",
  [TypeCode.AI_CONVERSATION]: "AI Conversation",
  [TypeCode.AI_MESSAGE]:      "AI Message",
  [TypeCode.AI_CONTEXT_CARD]: "AI Context Card",
  [TypeCode.LEARN_TOPIC]:     "Learn Topic",
  [TypeCode.LEARN_CATEGORY]:  "Learn Category",
  [TypeCode.DRUG_INTERACTION]:"Drug Interaction",
  [TypeCode.MED_SYSTEM]:      "Medical System",
  [TypeCode.DEPARTMENT]:      "Department",
  [TypeCode.PDF_QA]:          "PDF Q&A",
  [TypeCode.USER]:            "User",
  [TypeCode.PROFILE]:         "Profile",
  [TypeCode.NOTIFICATION]:    "Notification",
  [TypeCode.FAVORITE]:        "Favorite",
};

/**
 * Human-readable labels for ActionCodes (for activity display).
 */
export const ACTION_CODE_LABELS: Record<ActionCode, string> = {
  [ActionCode.CREATE]:              "Created",
  [ActionCode.READ]:                "Viewed",
  [ActionCode.UPDATE]:              "Updated",
  [ActionCode.DELETE]:              "Deleted",
  [ActionCode.LIKE]:                "Liked",
  [ActionCode.UNLIKE]:              "Unliked",
  [ActionCode.FAVORITE]:            "Favorited",
  [ActionCode.UNFAVORITE]:          "Unfavorited",
  [ActionCode.REPLY_SUBMIT]:        "Replied",
  [ActionCode.REPLY_REPHRASE]:      "Rephrased reply",
  [ActionCode.POST_CREATE]:         "Posted",
  [ActionCode.POST_VIEW]:           "Viewed post",
  [ActionCode.AI_SUMMARY_VIEW]:     "Viewed AI summary",
  [ActionCode.AI_CHAT_SEND]:        "Sent AI message",
  [ActionCode.AI_SUGGESTION_CLICK]: "Clicked AI suggestion",
  [ActionCode.FILE_VIEW]:           "Viewed file",
  [ActionCode.FILE_UPLOAD]:         "Uploaded file",
  [ActionCode.FILE_QA_ASK]:         "Asked file question",
  [ActionCode.MEMBER_VIEW]:         "Viewed member",
  [ActionCode.NAV_TAB_SWITCH]:      "Switched tab",
  [ActionCode.NAV_GROUP_ENTER]:     "Entered group",
  [ActionCode.NAV_PAGE_VIEW]:       "Viewed page",
  [ActionCode.TOPIC_VIEW]:          "Viewed topic",
  [ActionCode.TOPIC_LEVEL_SWITCH]:  "Switched level",
  [ActionCode.DRUG_CHECK]:          "Checked drug interaction",
  [ActionCode.PDF_UPLOAD]:          "Uploaded PDF",
  [ActionCode.PDF_QA_ASK]:          "Asked PDF question",
  [ActionCode.RECORD_VIEW]:         "Viewed record",
  [ActionCode.VITAL_DRILL]:         "Drilled into vital",
  [ActionCode.SIGN_IN]:             "Signed in",
  [ActionCode.SIGN_OUT]:            "Signed out",
  [ActionCode.PROFILE_VIEW]:        "Viewed profile",
  [ActionCode.SETTINGS_VIEW]:       "Viewed settings",
  [ActionCode.NOTIFICATION_VIEW]:   "Viewed notifications",
  [ActionCode.NOTIFICATION_CLICK]:  "Clicked notification",
  [ActionCode.INVITE_SEND]:         "Sent invite",
};
