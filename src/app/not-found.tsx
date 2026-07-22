import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated border border-border-subtle">
        <Compass className="h-8 w-8 text-text-muted" aria-hidden="true" />
      </div>
      <span className="text-2xs uppercase tracking-[0.2em] text-text-muted font-medium mb-3">
        404
      </span>
      <h1 className="text-display text-2xl md:text-3xl text-text-primary mb-3">
        Page not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild variant="secondary" className="mt-8">
        <Link href="/">Back to Timeframe</Link>
      </Button>
    </div>
  );
}
