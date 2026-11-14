export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <div className="aspect-square w-full bg-background" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-4 w-2/3 rounded bg-background" />
            <div className="h-3 w-full rounded bg-background" />
            <div className="h-3 w-5/6 rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
