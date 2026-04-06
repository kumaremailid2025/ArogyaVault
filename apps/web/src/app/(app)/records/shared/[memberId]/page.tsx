"use client";

import * as React from "react";
import { UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_COLOR,
  DocCard,
  GROUP_DOCS,
  GROUP_NAMES,
} from "../../_components/records-shared";
import { Button } from "@/core/ui/button";

export default function SharedMemberPage({
  params,
}: {
  params: { memberId: string };
}) {
  const { memberId } = params;
  const memberName = GROUP_NAMES[memberId] ?? memberId;
  const docs = GROUP_DOCS[memberId] ?? [];

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <UsersIcon className="size-4 text-primary shrink-0" />
        <p className="text-sm text-primary font-medium">
          Showing shared documents from <strong>{memberName}</strong>
        </p>
      </div>

      <div>
        <h1 className="text-xl font-bold">{memberName}'s Documents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Shared medical records in this group.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            variant={cat.key === "all" ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full h-auto px-3 py-1.5 text-sm font-medium whitespace-nowrap",
              cat.key !== "all" &&
                "text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <cat.icon className="size-3.5 shrink-0" />
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </>
  );
}
