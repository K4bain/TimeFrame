export default function SearchLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-rule px-6 md:px-10 py-3.5">
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-24" />
        <div className="tf-skeleton tf-skeleton--shimmer h-4 max-w-md flex-1" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-24" />
      </div>

      <div className="flex-1 px-6 md:px-10 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="tf-skeleton tf-skeleton--shimmer mb-3 h-10 w-56" />
          <div className="tf-skeleton tf-skeleton--shimmer mb-10 h-4 w-80" />
          <div className="border-t border-rule">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-rule py-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="tf-skeleton tf-skeleton--shimmer h-4 w-28" />
                  <div className="tf-skeleton tf-skeleton--shimmer h-4 w-20" />
                </div>
                <div className="tf-skeleton tf-skeleton--shimmer h-3 w-full max-w-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
