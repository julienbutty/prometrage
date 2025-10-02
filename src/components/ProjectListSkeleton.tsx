import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProjectListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="
        w-full
        grid grid-cols-1 gap-4 p-4
        sm:grid-cols-2 sm:gap-6
        lg:grid-cols-3
      "
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-full min-h-[120px]">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
