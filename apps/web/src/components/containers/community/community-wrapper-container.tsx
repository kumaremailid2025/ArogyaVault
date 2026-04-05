"use client";

import * as React from "react";
import {
  MessageSquareIcon, GlobeIcon, UserPlusIcon, UsersIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

import type { SmartInputSubmitPayload } from "@/models/input";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";

/* ── Mock data — used for "invited" variant only ──────────────────── */
import { COMMUNITY_POSTS } from "@/data/community-data";
import {
  LINKED_MEMBER_DATA,
  LINKED_POST_SUMMARIES,
  LINKED_POST_AI_RESPONSES,
} from "@/data/linked-member-data";
import {
  COMMUNITY_FILES as MOCK_COMMUNITY_FILES,
  INVITED_FILES,
  RECENT_FILE_QA,
} from "@/data/community-files-data";
import {
  COMMUNITY_MEMBERS as MOCK_COMMUNITY_MEMBERS,
  INVITED_GROUP_MEMBERS,
} from "@/data/community-members-data";
import { generateRephrasings } from "@/lib/post-utils";

/* ── API hooks — used for "community" variant ─────────────────────── */
import {
  usePosts,
  useCreatePost,
  useSubmitReply,
  useToggleLike,
  usePostSummary,
  useRephrase,
  useFiles,
  useRecentFileQA,
  useAskFileQuestion,
  useMembers,
} from "@/hooks/api";

import type { CommunityPost, LinkedPost, CommunityFile, CommunityMember } from "@/models/community";

import type {
  CommunityTab,
  CommunityVariant,
  PanelState,
  BannerConfig,
} from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

import { CommunityBanner } from "@/components/community/community-banner";
import { ComposeArea } from "@/components/community/compose-area";
import { PostCard } from "@/components/community/post-card";
import { FilesContainer } from "./files-container";
import { MembersContainer } from "./members-container";

/* ── Lazy-loaded: right panels only fetched when their tab is active ── */
import { Loader2Icon } from "lucide-react";

const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

/* Feed panel: preloaded eagerly since "feed" is the default tab.
   The chunk starts downloading in parallel with the /api/auth/me check
   so it's ready by the time the container renders. */
const feedPanelImport = () =>
  import("./feed-right-panel").then((m) => ({ default: m.FeedRightPanel }));

const FeedRightPanel = dynamic(feedPanelImport, {
  ssr: false,
  loading: () => <PanelLoader />,
});

/* Preload the feed panel chunk immediately (fire-and-forget) */
if (typeof window !== "undefined") {
  feedPanelImport();
}

const FilesRightPanel = dynamic(
  () => import("./files-right-panel").then((m) => ({ default: m.FilesRightPanel })),
  { ssr: false, loading: () => <PanelLoader /> },
);

const MembersRightPanel = dynamic(
  () => import("./members-right-panel").then((m) => ({ default: m.MembersRightPanel })),
  { ssr: false, loading: () => <PanelLoader /> },
);

/* Lazy-loaded: modal only fetched when Invite link is clicked */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null },
);

/* ═══════════════════════════════════════════════════════════════════
   COMMUNITY WRAPPER CONTAINER
   Single orchestrator for /community and /community/[groupId].
   Owns: banner, state, center content (feed/files/members),
   right panel, and invite modal.

   "community" variant → data fetched from backend API
   "invited" variant   → data from local mock imports
═══════════════════════════════════════════════════════════════════ */

interface CommunityWrapperContainerProps {
  variant: CommunityVariant;
  group: string;
  tab?: CommunityTab;
}

/* ── Banner config builder ──────────────────────────────────────── */

const buildBannerConfig = (
  variant: CommunityVariant,
  group: string,
  tab: CommunityTab,
  onInvite: () => void,
): BannerConfig => {
  if (variant === "invited") {
    const member = LINKED_MEMBER_DATA[group];
    if (!member) {
      return {
        icon: null,
        title: "Unknown Group",
        badges: [],
        description: null,
        tabs: [],
        activeTab: tab,
      };
    }

    const tabs = [
      { key: "feed" as const, label: "Feed", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}` },
      { key: "files" as const, label: "Files", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}/files` },
      { key: "members" as const, label: "Members", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}/members` },
    ] as const;

    return {
      icon: (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          {member.initials}
        </div>
      ),
      title: member.name,
      badges: [{ label: member.badgeLabel }],
      description: (
        <div className="flex items-center gap-1.5 flex-wrap">
          <ArrowRightLeftIcon className="size-3 text-primary-foreground/60 shrink-0" />
          <span className="text-xs text-primary-foreground/70">{member.direction}</span>
          <span className="text-xs text-primary-foreground/50 mx-1">·</span>
          <span className="text-xs text-primary-foreground/70">{member.scope}</span>
          <span className="text-xs text-primary-foreground/50 mx-1">·</span>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onInvite(); }}
            className="inline-flex items-center gap-1 text-xs underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
          >
            <UserPlusIcon className="size-3" /> Invite to this group
          </a>
        </div>
      ),
      tabs,
      activeTab: tab,
    };
  }

  /* variant === "community" */
  return {
    icon: (
      <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
        <MessageSquareIcon className="size-4" />
      </div>
    ),
    title: "ArogyaTalk",
    badges: [
      { label: "Community" },
      { label: "Public", icon: <GlobeIcon className="size-2.5" /> },
      { label: "12,847 members", icon: <UsersIcon className="size-2.5" /> },
    ],
    description: (
      <p className="text-sm text-primary-foreground/80 leading-relaxed">
        Connect with other ArogyaVault members. Ask questions, share experiences, support each other.{" "}
        <span className="text-primary-foreground/50 mx-1">·</span>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onInvite(); }}
          className="inline-flex items-center gap-1 underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
        >
          <UserPlusIcon className="size-3" /> Invite someone to community
        </a>
      </p>
    ),
    tabs: [
      { key: "feed" as const, label: "Feed", href: "/community" },
      { key: "files" as const, label: "Files", href: "/community/files" },
      { key: "members" as const, label: "Members", href: "/community/members" },
    ] as const,
    activeTab: tab,
  };
};

/* ── Wrapper component ──────────────────────────────────────────── */

export const CommunityWrapperContainer = ({
  variant,
  group,
  tab = "feed",
}: CommunityWrapperContainerProps) => {
  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;

  /* ── Resolve invited data source (mock) ── */
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ══════════════════════════════════════════════════════════════════
     API HOOKS — always called (React rules of hooks), but enabled
     ONLY for the active tab to avoid unnecessary network requests.
     ══════════════════════════════════════════════════════════════════ */

  const postsQuery = usePosts(groupId, isCommunity && tab === "feed");
  const filesQuery = useFiles(groupId, isCommunity && (tab === "files"));
  const membersQuery = useMembers(groupId, isCommunity && (tab === "members"));
  const recentQAQuery = useRecentFileQA(groupId, isCommunity && (tab === "files"));

  const createPostMut = useCreatePost(groupId);
  const submitReplyMut = useSubmitReply(groupId);
  const toggleLikeMut = useToggleLike(groupId);
  const rephraseMut = useRephrase();
  const askFileQuestionMut = useAskFileQuestion(groupId);

  /* ── State ── */
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [pendingReply, setPendingReply] = React.useState<ComposeSubmitPayload | null>(null);

  /* ── Local state for invited variant only ── */
  const [invitedPosts, setInvitedPosts] = React.useState<(CommunityPost | LinkedPost)[]>(
    member?.posts ?? [],
  );
  const [invitedFiles, setInvitedFiles] = React.useState<CommunityFile[]>(
    INVITED_FILES[group] ?? [],
  );
  const nextPostIdRef = React.useRef(
    isCommunity
      ? 100
      : (member?.posts.length ?? 0) + 100,
  );

  const [selectedFileId, setSelectedFileId] = React.useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = React.useState<number | null>(null);

  /* ══════════════════════════════════════════════════════════════════
     RESOLVED DATA — community from API, invited from mock
     ══════════════════════════════════════════════════════════════════ */

  const posts: (CommunityPost | LinkedPost)[] = isCommunity
    ? (postsQuery.data ?? [])
    : invitedPosts;

  const communityFiles: CommunityFile[] = isCommunity
    ? (filesQuery.data as CommunityFile[] ?? [])
    : invitedFiles;

  const membersList: CommunityMember[] = isCommunity
    ? (membersQuery.data as CommunityMember[] ?? [])
    : (INVITED_GROUP_MEMBERS[group] ?? []);

  /* ── Summary panel query (on-demand, fires when panel is open) ── */
  const summaryPostId = panelState.view === "summary" ? panelState.postId : null;
  const summaryQuery = usePostSummary(groupId, summaryPostId, isCommunity && summaryPostId !== null);

  /* ── Derived ── */
  const activePostId = (panelState.view === "summary" || panelState.view === "replies" || panelState.view === "reply-preview")
    ? panelState.postId
    : null;
  const activePost = activePostId !== null
    ? posts.find((p) => p.id === activePostId) ?? null
    : null;

  const linkedSummary =
    !isCommunity && activePostId !== null
      ? LINKED_POST_SUMMARIES[group]?.[activePostId] ??
        (activePost && activePost.replyCount === 0
          ? "No replies yet on this post."
          : `${activePost?.replyCount ?? 0} ${activePost?.replyCount === 1 ? "reply" : "replies"} received.`)
      : (isCommunity && summaryQuery.data?.summary) || "";

  const linkedAiResponse =
    !isCommunity && activePostId !== null
      ? LINKED_POST_AI_RESPONSES[group]?.[activePostId] ?? ""
      : (isCommunity && summaryQuery.data?.ai_response) || "";

  /* ── File derived ── */
  const activeFileId = (panelState.view === "file-detail" || panelState.view === "file-qa")
    ? panelState.fileId
    : selectedFileId;
  const activeFile = activeFileId !== null
    ? communityFiles.find((f) => f.id === activeFileId) ?? null
    : null;

  /* ── Member derived ── */
  const activeMember = (panelState.view === "member-detail")
    ? membersList.find((m) => m.id === panelState.memberId) ?? null
    : selectedMemberId !== null
      ? membersList.find((m) => m.id === selectedMemberId) ?? null
      : null;

  /* Filtered recent Q&A for current file set */
  const currentRecentQA = React.useMemo(() => {
    if (!isCommunity) {
      const invFiles = INVITED_FILES[group] ?? [];
      return invFiles.flatMap((f) =>
        f.questions.map((qa) => ({
          fileId: f.id,
          fileName: f.name,
          fileCategory: f.category,
          question: qa.question,
          askedBy: qa.askedBy,
          askedByInitials: qa.askedByInitials,
          askedAt: qa.askedAt,
          answer: qa.answer,
        })),
      ).slice(0, 5);
    }
    // Community: use API data or fallback to mock
    return recentQAQuery.data ?? RECENT_FILE_QA;
  }, [isCommunity, group, recentQAQuery.data]);

  /* ── Banner config ── */
  const bannerConfig = React.useMemo(
    () => buildBannerConfig(variant, group, tab, () => setInviteOpen(true)),
    [variant, group, tab],
  );

  /* ══════════════════════════════════════════════════════════════════
     HANDLERS
     ══════════════════════════════════════════════════════════════════ */

  const openReplies = React.useCallback((postId: number) => {
    setPanelState({ view: "replies", postId });
    setPendingReply(null);
  }, []);

  const openSummary = React.useCallback((postId: number) => {
    setPanelState({ view: "summary", postId });
  }, []);

  const closePanel = React.useCallback(() => {
    setPanelState({ view: "default" });
    setPendingReply(null);
  }, []);

  /* ── Rephrase / preview ── */
  const handlePreviewSend = React.useCallback((payload: ComposeSubmitPayload) => {
    const text = payload.text.trim();
    if (!text) return;

    setPanelState((prev) => {
      if (prev.view !== "replies") return prev;
      setPendingReply(payload);
      setSelectedVersion(1);

      if (isCommunity) {
        // Call API for rephrasings — optimistic: set panel with placeholder, update on success
        rephraseMut.mutate(text, {
          onSuccess: (data) => {
            setPanelState((cur) => {
              if (cur.view !== "reply-preview") return cur;
              return {
                ...cur,
                rephrasings: data.rephrasings as [string, string],
              };
            });
          },
        });
        // Show panel immediately with local fallback rephrasings
        return {
          view: "reply-preview" as const,
          postId: prev.postId,
          original: text,
          rephrasings: generateRephrasings(text),
        };
      }

      // Invited: local rephrasings
      return {
        view: "reply-preview" as const,
        postId: prev.postId,
        original: text,
        rephrasings: generateRephrasings(text),
      };
    });
  }, [isCommunity, rephraseMut]);

  const handleBackToCompose = React.useCallback(() => {
    setPanelState((prev) =>
      prev.view === "reply-preview" ? { view: "replies", postId: prev.postId } : prev,
    );
  }, []);

  /* ── Like ── */
  const toggleLike = React.useCallback((postId: number) => {
    if (isCommunity) {
      // Optimistic local update + API call
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      toggleLikeMut.mutate(postId);
      return;
    }

    // Invited: local only
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    setInvitedPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const delta = likedPosts.has(postId) ? -1 : 1;
        return { ...p, likes: p.likes + delta };
      }),
    );
  }, [isCommunity, likedPosts, toggleLikeMut]);

  /* ── Submit reply ── */
  const handleSubmitReply = React.useCallback(() => {
    setPanelState((prev) => {
      if (prev.view !== "reply-preview") return prev;
      const { postId, original, rephrasings } = prev;
      const versions: string[] = [original, ...rephrasings];
      const text = versions[selectedVersion];

      if (isCommunity) {
        submitReplyMut.mutate({ postId, text });
      } else {
        const author = "You";
        setInvitedPosts((ps) =>
          ps.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  replyCount: p.replyCount + 1,
                  replies: [
                    ...p.replies,
                    { initials: "KU", author, time: "Just now", text },
                  ],
                }
              : p,
          ),
        );
      }

      setPendingReply(null);
      setSelectedVersion(0);
      return { view: "replies", postId };
    });
  }, [selectedVersion, isCommunity, submitReplyMut]);

  /* ── Create post ── */
  const handlePost = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      const trimmed = payload.text.trim();
      if (!trimmed) return;

      if (isCommunity) {
        createPostMut.mutate({ text: trimmed, tag: "Discussion" });
        setComposeText("");
        return;
      }

      // Invited: local
      const newPost = {
        id: nextPostIdRef.current++,
        initials: "KU",
        author: "You",
        time: "Just now",
        text: trimmed,
        likes: 0,
        replyCount: 0,
        tag: "Update",
        replies: [],
      } as LinkedPost;
      setInvitedPosts((prev) => [newPost, ...prev]);
      setComposeText("");
    },
    [isCommunity, createPostMut],
  );

  /* ── File handlers ── */
  const handleSelectFile = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  const handleFileAiSummary = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  const handleFileQA = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-qa", fileId });
  }, []);

  const handleAskFileQuestion = React.useCallback((payload: ComposeSubmitPayload) => {
    const text = payload.text.trim();
    if (!text) return;
    const fId = (panelState.view === "file-detail" || panelState.view === "file-qa")
      ? panelState.fileId
      : selectedFileId;
    if (fId === null) return;

    if (isCommunity) {
      askFileQuestionMut.mutate({ fileId: fId, question: text });
      return;
    }

    // Invited: local update
    setInvitedFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fId) return f;
        const newQA = {
          id: f.questions.length + 1,
          question: text,
          askedBy: "Kumar",
          askedByInitials: "KU",
          askedAt: "Just now",
          answer: "ArogyaAI is analysing the document to answer your question. This typically takes a few moments for thorough analysis of the uploaded file content.",
        };
        return {
          ...f,
          qaCount: f.qaCount + 1,
          questions: [...f.questions, newQA],
        };
      }),
    );
  }, [panelState, selectedFileId, isCommunity, askFileQuestionMut]);

  const handleSelectFileFromQA = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  /* ── Member handlers ── */
  const handleSelectMember = React.useCallback((memberId: number) => {
    setSelectedMemberId(memberId);
    setPanelState({ view: "member-detail", memberId });
  }, []);

  /* ── Early return for missing invited member ── */
  if (!isCommunity && !member) return null;

  /* ── Compose placeholder ── */
  const composePlaceholder =
    !isCommunity && member
      ? `Share an update, note, or question with ${member.name.split(" ")[0]}…`
      : undefined;

  /* ── Files / Members titles ── */
  const filesTitle =
    isCommunity ? "Community Files" : `${member?.name ?? ""}'s Shared Files`;
  const membersTitle = isCommunity ? "Community Members" : "Group Members";
  const memberCount = isCommunity ? "12,847" : (member?.memberCount ?? membersList.length);

  /* ── Render ── */
  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── BANNER ── */}
      <CommunityBanner config={bannerConfig} />

      {/* ── FILES tab (two-column layout) ── */}
      {tab === "files" && (
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* LEFT — Files list with search/filter */}
          <FilesContainer
            title={filesTitle}
            files={communityFiles}
            selectedFileId={selectedFileId}
            onSelectFile={handleSelectFile}
            onAiSummary={handleFileAiSummary}
            onQA={handleFileQA}
          />

          {/* Vertical divider */}
          <div className="w-px bg-border shrink-0" />

          {/* RIGHT — File detail / Q&A / Recent Q&A */}
          <FilesRightPanel
            panelState={panelState}
            activeFile={activeFile}
            recentFileQA={currentRecentQA}
            onClosePanel={() => { setPanelState({ view: "default" }); setSelectedFileId(null); }}
            onAskFileQuestion={handleAskFileQuestion}
            onSelectFileFromQA={handleSelectFileFromQA}
          />
        </div>
      )}

      {/* ── MEMBERS tab (two-column layout) ── */}
      {tab === "members" && (
        <div className="flex-1 overflow-hidden flex min-h-0">

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
            onClosePanel={() => { setPanelState({ view: "default" }); setSelectedMemberId(null); }}
          />
        </div>
      )}

      {/* ── FEED tab (two-column layout) ── */}
      {tab === "feed" && (
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* LEFT — Compose (pinned) + Posts (scrollable) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Compose — pinned above scroll */}
            <div className="shrink-0 px-5 pt-2 pb-1 lg:px-6">
              <ComposeArea
                value={composeText}
                onChange={setComposeText}
                onSubmit={handlePost}
                placeholder={composePlaceholder}
              />
            </div>

            {/* Post cards — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6">
              <div className="space-y-3 pt-1">
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    isActive={activePostId === p.id}
                    isLiked={likedPosts.has(p.id)}
                    onLike={toggleLike}
                    onReplies={openReplies}
                    onSummary={openSummary}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-border shrink-0" />

          {/* RIGHT — State-driven panel */}
          <FeedRightPanel
            variant={variant}
            panelState={panelState}
            activePost={activePost}
            posts={posts}
            pendingReply={pendingReply}
            selectedVersion={selectedVersion}
            onClosePanel={closePanel}
            onOpenReplies={openReplies}
            onPreviewSend={handlePreviewSend}
            onBackToCompose={handleBackToCompose}
            onSetSelectedVersion={setSelectedVersion}
            onSubmitReply={handleSubmitReply}
            linkedSummary={linkedSummary}
            linkedAiResponse={linkedAiResponse}
            memberId={group}
          />
        </div>
      )}

      {/* Invite modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        {...(!isCommunity && member ? { groupContext: `${member.name}'s group` } : {})}
      />
    </div>
  );
};
