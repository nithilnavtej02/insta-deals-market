import { Skeleton } from "@/components/ui/skeleton";

export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-card border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Received messages */}
        <div className="flex justify-start">
          <div className="max-w-[75%] space-y-1">
            <Skeleton className="h-12 w-48 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        
        {/* Sent messages */}
        <div className="flex justify-end">
          <div className="max-w-[75%] space-y-1">
            <Skeleton className="h-16 w-56 rounded-2xl rounded-br-sm bg-primary/20" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[75%] space-y-1">
            <Skeleton className="h-10 w-36 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[75%] space-y-1">
            <Skeleton className="h-20 w-64 rounded-2xl rounded-br-sm bg-primary/20" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[75%] space-y-1">
            <Skeleton className="h-32 w-48 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="bg-card border-t p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
