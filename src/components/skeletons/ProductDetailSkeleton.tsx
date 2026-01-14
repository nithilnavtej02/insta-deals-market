import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background pb-24 animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
        {/* Left Column - Images */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Main Image */}
          <Skeleton className="w-full aspect-square rounded-xl" />
          
          {/* Thumbnails */}
          <div className="flex gap-2 p-4 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="p-4 lg:p-0 space-y-6">
          {/* Category */}
          <Skeleton className="h-4 w-24" />

          {/* Title */}
          <Skeleton className="h-10 w-3/4" />

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Key Features Card */}
          <div className="border rounded-xl p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Product Details Card */}
          <div className="border rounded-xl p-6 space-y-3">
            <Skeleton className="h-6 w-36" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          {/* Seller Info Card */}
          <div className="border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-12 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
