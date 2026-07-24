export default function CompareLoading() {
  return (
    <div className="min-h-screen tf-aurora">
      <div className="border-b border-rule tf-glass">
        <div className="h-[56px] max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-4">
          <div className="tf-skeleton tf-skeleton--shimmer h-10 w-10 rounded-lg" />
          <div className="tf-skeleton tf-skeleton--shimmer h-4 w-48 rounded" />
          <div className="flex-1" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row" style={{ height: "calc(100vh - 56px)" }}>
        <div className="flex-1 p-4">
          <div className="tf-skeleton tf-skeleton--shimmer h-5 w-28 rounded mb-2" />
          <div className="w-full h-full rounded-xl tf-skeleton tf-skeleton--shimmer" />
        </div>
        <div className="w-px bg-gold/30 relative hidden md:block">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink-raised border-2 border-gold/40 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-gold rounded" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="tf-skeleton tf-skeleton--shimmer h-5 w-28 rounded mb-2" />
          <div className="w-full h-full rounded-xl tf-skeleton tf-skeleton--shimmer" />
        </div>
      </div>
    </div>
  );
}
