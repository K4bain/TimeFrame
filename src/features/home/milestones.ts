/**
 * Curated web-history milestones for the homepage hero timeline.
 *
 * Each milestone surfaces as a dot on the 1991→today scrubber. Clicking
 * jumps to a search for the associated site, so the timeline doubles as
 * a discovery surface — not just decoration.
 *
 * Spec reference: ROAD.1 ("ship the core, then iterate"), MOT.1.1
 * ("every animation serves a function").
 */
export interface Milestone {
  year: number;
  label: string;
  /** Site to search when the milestone is clicked. */
  site: string;
}

export const MILESTONE_RANGE_START = 1991;
export const MILESTONE_RANGE_END = 2026;

export const milestones: Milestone[] = [
  { year: 1991, label: "First website", site: "info.cern.ch" },
  { year: 1993, label: "Mosaic browser", site: "netscape.com" },
  { year: 1998, label: "Google founded", site: "google.com" },
  { year: 2001, label: "Wikipedia", site: "wikipedia.org" },
  { year: 2004, label: "Facebook", site: "facebook.com" },
  { year: 2005, label: "YouTube", site: "youtube.com" },
  { year: 2007, label: "iPhone", site: "apple.com" },
  { year: 2012, label: "Facebook IPO", site: "facebook.com" },
  { year: 2022, label: "ChatGPT", site: "openai.com" },
];

/**
 * Era segments for the hero scrubber. Boundaries intentionally match
 * `getEra()` in src/utils/index.ts so the hero and the per-domain
 * explore view agree on era definitions.
 *
 * Each segment maps to a `--color-era-*` token defined in globals.css.
 */
export interface EraSegment {
  slug: string;
  name: string;
  start: number;
  end: number;
}

export const eraSegments: EraSegment[] = [
  { slug: "early-web", name: "Early Web", start: 1991, end: 1996 },
  { slug: "browser-wars", name: "Browser Wars", start: 1996, end: 2001 },
  { slug: "post-crash", name: "Post-Crash", start: 2001, end: 2004 },
  { slug: "web-20", name: "Web 2.0", start: 2004, end: 2009 },
  { slug: "mobile-transition", name: "Mobile", start: 2009, end: 2013 },
  { slug: "flat-design", name: "Flat Design", start: 2013, end: 2017 },
  { slug: "platform-web", name: "Platform", start: 2017, end: 2022 },
  { slug: "ai-transition", name: "AI Era", start: 2022, end: 2026 },
];

/** CSS variable for each era's warm tint. */
export const eraColorVar: Record<string, string> = {
  "early-web": "var(--color-era-early-web)",
  "browser-wars": "var(--color-era-browser-wars)",
  "post-crash": "var(--color-era-post-crash)",
  "web-20": "var(--color-era-web-20)",
  "mobile-transition": "var(--color-era-mobile-transition)",
  "flat-design": "var(--color-era-flat-design)",
  "platform-web": "var(--color-era-platform-web)",
  "ai-transition": "var(--color-era-ai-transition)",
};
