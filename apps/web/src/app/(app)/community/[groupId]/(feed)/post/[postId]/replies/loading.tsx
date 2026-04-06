import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
