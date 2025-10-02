import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  nomClient: string;
  adresse: string;
  createdAt: Date;
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-8 text-center"
        data-testid="empty-state"
      >
        <p className="text-muted-foreground text-lg">
          Aucun projet pour le moment
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Commencez par uploader un PDF
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="project-list"
      className="
        w-full
        grid grid-cols-1 gap-4 p-4
        sm:grid-cols-2 sm:gap-6
        lg:grid-cols-3
      "
    >
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projet/${project.id}`}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Card className="h-full min-h-[120px] cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                {project.nomClient}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm line-clamp-1">
                {project.adresse}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDate(project.createdAt)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
