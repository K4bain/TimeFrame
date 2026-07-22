export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="tf-skeleton tf-skeleton--shimmer h-8 w-8 rounded-full"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
