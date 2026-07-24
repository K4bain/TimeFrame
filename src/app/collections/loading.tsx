export default function CollectionsLoading() {
  return (
    <div className="min-h-screen tf-aurora">
      <div className="border-b border-rule px-6 md:px-10 py-3.5 tf-glass">
        <div className="tf-skeleton tf-skeleton--shimmer h-6 w-32 rounded" />
      </div>
      <div className="px-6 md:px-10 py-10">
        <div className="tf-skeleton tf-skeleton--shimmer mb-3 h-10 w-64 rounded-lg" />
        <div className="tf-skeleton tf-skeleton--shimmer mb-10 h-4 w-96 rounded" />
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-ink-panel border border-rule rounded-xl p-8">
              <div className="tf-skeleton tf-skeleton--shimmer mb-6 h-3 w-24 rounded" />
              <div className="tf-skeleton tf-skeleton--shimmer mb-3 h-6 w-3/4 rounded" />
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-full mb-2 rounded" />
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
