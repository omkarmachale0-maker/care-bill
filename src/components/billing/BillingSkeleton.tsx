export function BillingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-base p-5">
          <div className="h-4 rounded bg-surface-2 w-1/3 mb-3" />
          <div className="h-3 rounded bg-surface-2 w-2/3" />
        </div>
      ))}
    </div>
  );
}
