import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="text-eyebrow mb-8">404 — Not Found</span>
      <h1 className="text-display text-4xl md:text-6xl text-paper mb-4">
        Page not found
      </h1>
      <div className="w-16 h-px bg-rule my-8" />
      <p className="max-w-sm text-sm text-paper-faint leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild variant="outline" className="mt-10">
        <Link href="/">Back to Timeframe</Link>
      </Button>
    </div>
  );
}
