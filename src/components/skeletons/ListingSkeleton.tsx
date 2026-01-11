import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ListingSkeleton = () => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-card/50 border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="flex">
          <Skeleton className="w-28 h-28 rounded-l-xl" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ListingGridSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
};

export default ListingSkeleton;
