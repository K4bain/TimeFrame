export default function CompareLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Chrome bar skeleton — ZONE.CHRO */}
      <div className="flex items-center gap-4 border-b border-glass-border px-6 py-3 tf-glass-strong">
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-24 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-32 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-28 rounded" />
      </div>

      {/* Two-panel viewer skeleton — ZONE.STGE — MOT.6 */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="border-r border-glass-border p-4 last:border-r-0"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-32 rounded" />
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-20 rounded" />
            </div>
            <div className="tf-skeleton tf-skeleton--shimmer aspect-video w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
