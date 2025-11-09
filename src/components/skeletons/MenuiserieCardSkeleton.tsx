import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading state for MenuiserieCard
 * Matches the structure of a real menuiserie card with badges and details
 */
export function MenuiserieCardSkeleton() {
  return (
    <Card className="border-2 border-gray-200 animate-pulse">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Ligne 1 : Repère + Statut */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Repère badge */}
              <div className="h-7 w-20 bg-gray-200 rounded" />
              {/* Icon */}
              <div className="h-5 w-5 bg-gray-200 rounded-full flex-shrink-0" />
            </div>
            {/* Status badge */}
            <div className="h-6 w-20 bg-gray-200 rounded flex-shrink-0" />
          </div>

          {/* Ligne 2 : Intitulé */}
          <div className="space-y-2">
            <div className="h-5 w-full bg-gray-200 rounded" />
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
          </div>

          {/* Ligne 3 : Badges technique */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-6 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dimensions */}
        <div className="space-y-1">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>

        {/* Pose */}
        <div className="space-y-1">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>

        {/* Couleurs */}
        <div className="space-y-1">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-28 bg-gray-200 rounded" />
            <div className="h-7 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
