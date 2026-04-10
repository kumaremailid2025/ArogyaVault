"use client";

/**
 * Default Feed Panel — Invited Group
 * -----------------------------------
 * When the group has no posts (fresh invite), show a welcome/engagement
 * state prompting the user to add their first shared record. When posts
 * exist, show the Group Pulse summary.
 *
 * For invitees the group's display name is the inviter's masked phone
 * (e.g. "+91****5592"), so the welcome copy addresses them directly by
 * that identifier until a real name is set.
 */

import {
  MessageSquareIcon,
  ZapIcon,
  SparklesIcon,
  UploadCloudIcon,
  FileTextIcon,
  HeartPulseIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { useFeedContext } from "@/app/(app)/community/_context/feed-context";
import { useLinkedMembers } from "@/data/linked-member-data";

const GroupFeedPage = () => {
  const { posts, group } = useFeedContext();
  const { LINKED_MEMBER_DATA } = useLinkedMembers();

  // `group` is the current group slug (UUID for dynamic invite groups).
  // For the invitee, the backend stores `name` as the inviter's masked
  // phone (e.g. "+91****5592"); for the inviter it's the invitee's
  // masked phone until they set a real name. Fall back to a neutral
  // phrase only when no record is available.
  const memberName = LINKED_MEMBER_DATA[group]?.name?.trim();
  const welcomeTarget = memberName || "your shared group";

  if (posts.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <SparklesIcon className="size-5 text-primary" />
          </div>
          <p className="text-sm font-semibold mb-1">
            Welcome {memberName ? `— say hi to ${welcomeTarget}` : "to your shared group"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            This is where you and {welcomeTarget} can share records, chat
            about health updates, and keep each other informed. Start by
            adding a report or a quick note.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <ZapIcon className="size-3 text-primary" /> Get started
          </p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs border-primary/30 text-primary"
            >
              <UploadCloudIcon className="size-3.5 mr-2" />
              Upload a medical report
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs border-primary/30 text-primary"
            >
              <FileTextIcon className="size-3.5 mr-2" />
              Add a prescription
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs border-primary/30 text-primary"
            >
              <HeartPulseIcon className="size-3.5 mr-2" />
              Log a vital reading
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-start gap-2">
            <MessageSquareIcon className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-snug">
              Use the compose box below to send your first message. {welcomeTarget}{" "}
              will see it as soon as they open ArogyaVault.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Group Pulse */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <ZapIcon className="size-3 text-primary" /> Group Pulse
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Members", value: "—" },
            { label: "Posts", value: `${posts.length}` },
            { label: "Active now", value: "—" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-background p-2 text-center"
            >
              <p className="text-sm font-bold text-primary leading-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
        <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground mb-2 leading-snug">
          Click any post to read replies or tap{" "}
          <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI
          Summary for a quick digest.
        </p>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
          Ask the Group
        </Button>
      </div>
    </div>
  );
};

export default GroupFeedPage;
