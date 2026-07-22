export default function ExploreLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Chrome bar skeleton — ZONE.CHRO */}
      <div className="flex items-center gap-4 border-b border-glass-border px-6 py-3 tf-glass-strong">
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-24 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 max-w-md flex-1 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-28 rounded" />
      </div>

      {/* Stage (viewer) skeleton — ZONE.STGE — MOT.6 */}
      <div className="flex flex-1 items-center justify-center bg-bg-surface">
        <div className="tf-skeleton tf-skeleton--shimmer aspect-video w-full max-w-4xl rounded-xl" />
      </div>

      {/* Timeline track skeleton — ZONE.TIME — MOT.6 */}
      <div className="border-t border-glass-border px-6 py-6">
        {/* Progress indicator at zone top */}
        <div className="mb-3 h-0.5 w-full overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full w-1/3 rounded-full bg-amber-400/60" />
        </div>
        {/* Track skeleton */}
        <div className="tf-skeleton tf-skeleton--shimmer h-2 w-full rounded-full" />
        <div className="mt-3 flex justify-between">
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-16 rounded" />
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
