"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Drawer = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
};

const DrawerTrigger = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) => {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
};

const DrawerPortal = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) => {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
};

const DrawerClose = ({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) => {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
};

const DrawerOverlay = ({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) => {
  return <DrawerPrimitive.Overlay data-slot="drawer-overlay" className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />;
};

const DrawerContent = ({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) => {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
};

const DrawerHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="drawer-header" className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
};

const DrawerFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
};

const DrawerTitle = ({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) => {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("text-foreground font-semibold leading-none tracking-tight", className)} {...props} />;
};

const DrawerDescription = ({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) => {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
};

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
