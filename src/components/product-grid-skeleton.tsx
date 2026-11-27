export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[22px] bg-surface shadow-[0_6px_20px_rgba(24,21,17,0.1)]"
        >
          <div className="aspect-square w-full bg-primary-tint" />
          <div className="flex flex-col gap-2 p-3.5">
            <div className="h-3 w-1/3 rounded bg-background" />
            <div className="h-4 w-2/3 rounded bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}
