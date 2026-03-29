"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulseIcon,
  BellIcon,
  ChevronDownIcon,
  SettingsIcon,
  LogOutIcon,
  UserCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";

export function AppHeader() {
  const router = useRouter();

  function handleSignOut() {
    router.push("/sign-in");
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 lg:px-6">
      {/* Logo */}
      <Link href="/liveboard" className="flex items-center gap-2 font-bold text-primary">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeartPulseIcon className="size-3.5" />
        </div>
        <span className="text-base tracking-tight">ArogyaVault</span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative size-9">
          <BellIcon className="size-4" />
          <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[10px]">
            2
          </Badge>
        </Button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                  KU
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">Kumar</span>
              <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">Kumar</span>
                <span className="text-xs font-normal text-muted-foreground">+91 98765 43210</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <UserCircleIcon className="size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <SettingsIcon className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOutIcon className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
