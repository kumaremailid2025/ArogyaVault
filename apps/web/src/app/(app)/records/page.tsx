"use client";

import * as React from "react";
import { UploadCloudIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_COLOR,
  DocCard,
  MY_DOCS,
} from "./_components/records-shared";

const RecordsPage = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All your documents, organised and searchable.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5">
          <UploadCloudIcon className="size-4" /> Upload
        </Button>
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
        {MY_DOCS.map((doc) => (
          <DocCard key={doc.id} doc={doc} />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <UploadCloudIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Use the <strong>Upload</strong> button above or the toolbar below to
          add more documents.
        </p>
      </div>
    </>
  );
};

export default RecordsPage;
