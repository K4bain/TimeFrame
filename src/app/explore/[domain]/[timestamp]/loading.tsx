export default function ExploreLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-rule px-6 md:px-10 py-3.5">
        <div className="tf-skeleton tf-skeleton--shimmer h-5 w-28" />
        <div className="tf-skeleton tf-skeleton--shimmer h-4 max-w-xs flex-1" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-28" />
      </div>

      <div className="flex flex-1 px-6 md:px-10 py-8">
        <div className="mx-auto max-w-5xl w-full">
          <div className="tf-skeleton tf-skeleton--shimmer mb-6 h-6 w-48" />
          <div className="mb-8">
            <div className="flex items-end gap-px h-20">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1 tf-skeleton tf-skeleton--shimmer" style={{ height: `${30 + Math.random() * 70}%` }} />
              ))}
            </div>
          </div>
          <div className="tf-skeleton tf-skeleton--shimmer mb-2 h-0.5 w-full" />
          <div className="tf-skeleton tf-skeleton--shimmer aspect-video w-full" />
        </div>
      </div>
    </div>
  );
}
