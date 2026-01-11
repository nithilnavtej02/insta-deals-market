import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const SellSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* Media Upload Section */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="aspect-square backdrop-blur-sm bg-card/50 border-dashed border-2">
              <CardContent className="flex items-center justify-center h-full p-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
};

export default SellSkeleton;
