"use client";
import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/core/ui/input";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable search input with magnifier icon and one-click clear button.
 * Used in ArogyaLearn Browse, Systems, and Departments tabs.
 */
export const SearchBar = ({ value, onChange, placeholder = "Search…", className }: SearchBarProps) => {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-2 text-sm focus:border-primary placeholder:text-muted-foreground/70"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
