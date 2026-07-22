export default function SearchLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Chrome bar skeleton */}
      <div className="flex items-center gap-4 border-b border-border-subtle px-6 py-3">
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-24 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 max-w-md flex-1 rounded" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-24 rounded" />
      </div>

      {/* Results skeleton — MOT.6 */}
      <div className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="tf-skeleton tf-skeleton--shimmer mb-2 h-7 w-48 rounded" />
          <div className="tf-skeleton tf-skeleton--shimmer mb-8 h-4 w-72 rounded" />
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="tf-skeleton tf-skeleton--shimmer h-16 rounded-md border border-border-subtle"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
