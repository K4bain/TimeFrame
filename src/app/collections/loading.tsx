export default function CollectionsLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border-subtle px-6 py-4">
        <div className="tf-skeleton tf-skeleton--shimmer h-6 w-32 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-border-subtle bg-bg-surface p-6"
          >
            <div className="tf-skeleton tf-skeleton--shimmer mb-4 h-10 w-10 rounded" />
            <div className="tf-skeleton tf-skeleton--shimmer mb-2 h-5 w-2/3 rounded" />
            <div className="tf-skeleton tf-skeleton--shimmer h-4 w-full rounded" />
            <div className="tf-skeleton tf-skeleton--shimmer mt-2 h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
