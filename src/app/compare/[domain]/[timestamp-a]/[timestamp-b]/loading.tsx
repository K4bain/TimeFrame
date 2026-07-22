export default function CompareLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-rule px-6 md:px-10 py-3.5">
        <div className="tf-skeleton tf-skeleton--shimmer h-5 w-28" />
        <div className="tf-skeleton tf-skeleton--shimmer h-4 w-40" />
        <div className="tf-skeleton tf-skeleton--shimmer h-9 w-28 ml-auto" />
      </div>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4 p-6 md:px-10">
        {[0, 1].map((i) => (
          <div key={i} className="border border-rule">
            <div className="flex items-center justify-between px-4 py-3 border-b border-rule">
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-20" />
              <div className="tf-skeleton tf-skeleton--shimmer h-4 w-28" />
            </div>
            <div className="tf-skeleton tf-skeleton--shimmer aspect-video" />
          </div>
        ))}
      </div>
    </div>
  );
}
