export default function ExploreLoading() {
  return (
    <div className="min-h-screen tf-aurora">
      <div className="border-b border-rule tf-glass">
        <div className="h-[56px] max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-4">
          <div className="tf-skeleton tf-skeleton--shimmer h-10 w-10 rounded-lg" />
          <div className="tf-skeleton tf-skeleton--shimmer h-4 w-32 rounded" />
          <div className="flex-1" />
          <div className="tf-skeleton tf-skeleton--shimmer h-9 w-20 rounded-lg" />
        </div>
      </div>

      <div className="border-b border-rule px-4 md:px-6 py-3">
        <div className="flex items-center gap-1 max-w-4xl">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full tf-skeleton tf-skeleton--shimmer"
              style={{ opacity: 0.3 + Math.random() * 0.7 }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: "calc(100vh - 120px)" }}>
        <div className="flex-1 p-6">
          <div className="w-full h-full rounded-xl tf-skeleton tf-skeleton--shimmer" />
        </div>
        <div className="w-80 border-l border-rule p-6 hidden lg:block">
          <div className="tf-skeleton tf-skeleton--shimmer h-5 w-3/4 rounded mb-4" />
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-full rounded mb-2" />
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-2/3 rounded mb-6" />
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-full rounded mb-2" />
          <div className="tf-skeleton tf-skeleton--shimmer h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
