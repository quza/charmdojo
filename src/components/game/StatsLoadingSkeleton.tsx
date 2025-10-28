export function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 rounded-lg bg-neutral-800/50 animate-pulse"
        />
      ))}
    </div>
  );
}

