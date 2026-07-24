"use client";

export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-ink-void focus:rounded-lg focus:outline-none focus:font-medium focus:shadow-md"
    >
      Skip to main content
    </a>
  );
}
