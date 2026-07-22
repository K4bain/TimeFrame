import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/aurora-background";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center">
      <AuroraBackground />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="tf-glass-strong rounded-2xl p-10 md:p-14 max-w-md">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full tf-glass">
            <Compass className="h-8 w-8 text-amber-400" aria-hidden="true" />
          </div>
          <span className="text-2xs uppercase tracking-[0.2em] text-amber-400 font-medium mb-3 block">
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
      </div>
    </main>
  );
}
