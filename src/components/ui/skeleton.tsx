import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-card border bg-card p-8 space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

function SkeletonMedia() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-80 h-64 rounded-xl" />
      <Skeleton className="h-4 w-48" />
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonMedia }
