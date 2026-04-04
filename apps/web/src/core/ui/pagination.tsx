import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/core/ui/button";
import type { VariantProps } from "class-variance-authority";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => {
  return <nav data-slot="pagination" role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
};

const PaginationContent = ({ className, ...props }: React.ComponentProps<"ul">) => {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
};

const PaginationItem = ({ ...props }: React.ComponentProps<"li">) => {
  return <li data-slot="pagination-item" {...props} />;
};

type PaginationLinkProps = { isActive?: boolean } & Pick<VariantProps<typeof buttonVariants>, "size"> & React.ComponentProps<"a">;

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => {
  return (
    <a
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size }), className)}
      {...props}
    />
  );
};

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink data-slot="pagination-previous" aria-label="Go to previous page" size="default" className={cn("gap-1 px-2.5 sm:pl-2.5", className)} {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
};

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink data-slot="pagination-next" aria-label="Go to next page" size="default" className={cn("gap-1 px-2.5 sm:pr-2.5", className)} {...props}>
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
};

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <span data-slot="pagination-ellipsis" aria-hidden className={cn("flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
};

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
