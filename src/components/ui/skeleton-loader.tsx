import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * Skeleton loader for apartment cards
 */
export const ApartmentCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <Skeleton className="h-6 w-12 mb-1" /> {/* Number badge */}
        <Skeleton className="h-5 w-32" /> {/* Title */}
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8" /> {/* Edit button */}
        <Skeleton className="h-8 w-8" /> {/* Delete button */}
      </div>
    </div>
    <div className="mt-4">
      <Skeleton className="h-8 w-full" /> {/* Action button */}
    </div>
  </Card>
);

/**
 * Skeleton loader for booking list items
 */
export const BookingItemSkeleton = () => (
  <Card className="p-3">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" /> {/* Guest name */}
        <Skeleton className="h-3 w-40" /> {/* Dates */}
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8" /> {/* Edit button */}
        <Skeleton className="h-8 w-8" /> {/* Delete button */}
      </div>
    </div>
  </Card>
);

/**
 * Skeleton loader for form fields
 */
export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-20" /> {/* Label */}
    <Skeleton className="h-10 w-full" /> {/* Input */}
  </div>
);

/**
 * Skeleton loader for media gallery
 */
export const MediaGallerySkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-6 w-32 mb-6" /> {/* Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-video rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Skeleton loader for content sections
 */
export const ContentSectionSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-6 w-40 mb-4" /> {/* Title */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </Card>
);

/**
 * Full page skeleton loader
 */
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-wave p-4">
    <div className="max-w-6xl mx-auto">
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-64" /> {/* Page title */}
          <Skeleton className="h-10 w-32" /> {/* Action button */}
        </div>
        
        <div className="space-y-6">
          <ContentSectionSkeleton />
          <ContentSectionSkeleton />
          <ContentSectionSkeleton />
        </div>
      </Card>
    </div>
  </div>
);