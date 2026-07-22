/**
 * AuroraBackground — the living atmospheric layer behind all content.
 *
 * Renders two large, slow-drifting gradient blobs (amber + cyan) fixed
 * behind the page. Combined with the `.tf-grain` body overlay, this
 * creates the "digital archaeology" atmosphere: warm light bleeding
 * through archival darkness.
 *
 * Purely decorative — pointer-events disabled, aria-hidden, and disabled
 * under prefers-reduced-motion (the CSS keyframes short-circuit to ~0ms).
 */
export function AuroraBackground() {
  return <div className="tf-aurora" aria-hidden="true" />;
}
