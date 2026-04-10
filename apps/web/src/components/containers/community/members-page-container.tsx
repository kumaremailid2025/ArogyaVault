"use client";

/**
 * MembersPageContainer
 * --------------------
 * Self-contained container for the members tab (/community/members or /community/[groupId]/members).
 * Owns all members-specific state: member list, selection, panel.
 *
 * Two-column layout: left (member list) | right (detail).
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2Icon } from "lucide-react";

import type { CommunityMember } from "@/models/community";
import type { CommunityVariant, PanelState } from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

import { MembersContainer } from "./members-container";

/* ── Mock data (invited variant) ─────────────────────────────────── */
import { useCommunityMembers } from "@/data/community-members-data";
import { useLinkedMembers } from "@/data/linked-member-data";

/* ── API hooks (community variant) ───────────────────────────────── */
import { useMembers } from "@/hooks/api";

/* ── Lazy: right panel ───────────────────────────────────────────── */

const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

const MembersRightPanel = dynamic(
  () => import("./members-right-panel").then((m) => ({ default: m.MembersRightPanel })),
  { ssr: false, loading: () => <PanelLoader /> },
);

/* ── Props ────────────────────────────────────────────────────────── */

interface MembersPageContainerProps {
  variant: CommunityVariant;
  group: string;
}

/* ── Component ────────────────────────────────────────────────────── */

export const MembersPageContainer = ({
  variant,
  group,
}: MembersPageContainerProps) => {
  const { INVITED_GROUP_MEMBERS } = useCommunityMembers();
  const { LINKED_MEMBER_DATA } = useLinkedMembers();
  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ── API hooks ── */
  const membersQuery = useMembers(groupId, {}, isCommunity);

  /* ── State ── */
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });

  /* ── Resolved data ── */
  const membersList: CommunityMember[] = isCommunity
    ? ((membersQuery.data?.items as unknown as CommunityMember[]) ?? [])
    : (INVITED_GROUP_MEMBERS[group] ?? []);

  /* ── Derived ── */
  const activeMember =
    panelState.view === "member-detail"
      ? membersList.find((m) => m.id === panelState.memberId) ?? null
      : selectedMemberId !== null
        ? membersList.find((m) => m.id === selectedMemberId) ?? null
        : null;

  /* ── Titles ── */
  const membersTitle = isCommunity ? "Community Members" : "Group Members";
  const memberCount = isCommunity ? "12,847" : membersList.length;

  /* ── Handlers ── */

  const handleSelectMember = React.useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    setPanelState({ view: "member-detail", memberId });
  }, []);

  /* ── Render ── */
  return (
    <>
      {/* LEFT — Members list with search/filter */}
      <MembersContainer
        title={membersTitle}
        memberCount={memberCount}
        members={membersList}
        selectedMemberId={selectedMemberId}
        onSelectMember={handleSelectMember}
      />

      {/* Vertical divider */}
      <div className="w-px bg-border shrink-0" />

      {/* RIGHT — Member detail / default */}
      <MembersRightPanel
        variant={variant}
        panelState={panelState}
        activeMember={activeMember}
        onClosePanel={() => {
          setPanelState({ view: "default" });
          setSelectedMemberId(null);
        }}
      />
    </>
  );
};
