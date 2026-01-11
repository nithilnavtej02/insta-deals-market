import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CheckoutSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Contact Info Card */}
      <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="border-t pt-4 flex justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
};

export default CheckoutSkeleton;
