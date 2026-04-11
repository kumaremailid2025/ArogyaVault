"use client";

/**
 * Compact compose box for posting in the feed.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Compact compose box for posting in the feed. Includes avatar and supports
 * text, voice, image, and attachment modes. Component is memoized for performance.
 */

import * as React from "react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { SmartInput } from "@/components/shared/smart-input";
import type { SmartInputSubmitPayload } from "@/models/input";

/**
 * Props for {@link ComposeArea}.
 *
 * @category Types
 */
interface ComposeAreaProps {
  /** Current text value. */
  value: string;
  /** Handler when text changes. */
  onChange: (value: string) => void;
  /** Handler when submission is requested. */
  onSubmit: (payload: SmartInputSubmitPayload) => void;
  /** Placeholder text for the input. */
  placeholder?: string;
}

/**
 * Render a compose area for posting to the feed.
 *
 * @param props - Component props.
 * @returns The rendered compose area.
 *
 * @category Components
 */
export const ComposeArea = React.memo(
  ({ value, onChange, onSubmit, placeholder = "Share a tip, ask the community, or start a discussion…" }: ComposeAreaProps): React.ReactElement => {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex gap-2 items-start">
          <Avatar className="size-7 shrink-0 mt-1">
            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
              KU
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <SmartInput
              value={value}
              onChange={onChange}
              onSubmit={onSubmit}
              placeholder={placeholder}
              submitLabel="Post"
              modes={["text", "voice", "image", "attach"]}
              maxRows={4}
              layout="chat"
            />
          </div>
        </div>
      </div>
    );
  }
);

ComposeArea.displayName = "ComposeArea";
