import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading state for ProjectCard
 * Matches the structure of a real project card
 */
export function ProjectCardSkeleton() {
  return (
    <Card className="h-full min-h-[120px] animate-pulse">
      <CardHeader className="pb-3">
        {/* Client name skeleton */}
        <div className="h-6 sm:h-7 w-3/4 bg-gray-200 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Address skeleton */}
        <div className="h-5 w-full bg-gray-200 rounded" />
        {/* Date skeleton */}
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
}
