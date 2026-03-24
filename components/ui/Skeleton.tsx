function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ── Base pulse block ──────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      aria-hidden="true"
    />
  );
}

// ── Card skeleton (generic white card with shimmer rows) ──────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

// ── Template card skeleton (image + text rows) ────────────────────────────────
export function SkeletonTemplateCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-4/3 rounded-none" />
      {/* Body */}
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-2.5 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────────────────
export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-3.5 ${i === 0 ? 'w-28' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Stat card skeleton ────────────────────────────────────────────────────────
export function SkeletonStatCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
