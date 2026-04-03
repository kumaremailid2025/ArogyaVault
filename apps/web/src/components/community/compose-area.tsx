"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { SmartInput } from "@/components/shared/smart-input";
import type { SmartInputSubmitPayload } from "@/models/input";

interface ComposeAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (payload: SmartInputSubmitPayload) => void;
  placeholder?: string;
}

export const ComposeArea = React.memo(
  ({ value, onChange, onSubmit, placeholder = "Share a tip, ask the community, or start a discussion…" }: ComposeAreaProps) => {
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
