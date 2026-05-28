export function Skeleton({ className = "", width, height }: { className?: string; width?: string | number; height?: string | number }) {
  return <div className={`skeleton ${className}`} style={{ width, height, minHeight: height || 16 }} />;
}

export function SignalCardSkeleton() {
  return (
    <div className="flex gap-4 border-b border-[var(--glass-border)] p-5">
      <div className="flex flex-col gap-2">
        <Skeleton width={20} height={14} />
        <Skeleton width={60} height={24} />
        <Skeleton width={80} height={12} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <Skeleton width={64} height={22} className="rounded-full" />
          <Skeleton width={48} height={22} className="rounded-full" />
        </div>
        <Skeleton width="90%" height={16} />
        <Skeleton width="60%" height={14} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton width={14} height={10} />
        <Skeleton width={48} height={36} />
      </div>
    </div>
  );
}
