export function AchievementsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-lg bg-neutral-800/50 animate-pulse"
        />
      ))}
    </div>
  );
}

