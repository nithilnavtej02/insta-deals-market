import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center pt-8">
        <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" />
        <Skeleton className="h-7 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto mb-4" />
        <div className="flex items-center justify-center gap-4 mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-64 mx-auto mb-6" />
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Skeleton className="h-10 w-full rounded-xl mb-4" />
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden backdrop-blur-sm bg-card/50 border-0">
              <CardContent className="p-0">
                <Skeleton className="w-full h-32 rounded-t-lg" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
