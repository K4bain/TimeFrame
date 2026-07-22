export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="tf-skeleton tf-skeleton--shimmer h-1 w-32"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
