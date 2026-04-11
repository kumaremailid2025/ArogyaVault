import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import Typography from "@/components/ui/typography";

const AppNotFound = () => (
  <div className="flex h-full items-center justify-center p-6">
    <div className="max-w-md text-center space-y-4">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-6 text-muted-foreground" />
      </div>

      <div className="space-y-1.5">
        <Typography variant="h2">Page not found</Typography>
        <Typography variant="body" color="muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
      </div>

      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Home className="size-3.5" />
        Go home
      </Link>
    </div>
  </div>
);

export default AppNotFound;
