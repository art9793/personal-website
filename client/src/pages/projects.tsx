import { ExternalLink } from "lucide-react";
import { useContent } from "@/lib/content-context";

export default function Projects() {
  const { projects } = useContent();

  const activeProjects = projects
    .filter(p => p.status === "Active")
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-500">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-lg">
          Products I've built, communities I've founded, and open source work.
        </p>
      </div>

      {activeProjects.length === 0 ? (
        <div className="text-muted-foreground italic">No projects yet.</div>
      ) : (
        <div className="space-y-1">
          {activeProjects.map((project) => {
            const content = (
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6 py-4 border-b border-border/40 group-hover:border-border transition-colors">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-medium text-primary group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <span className="text-xs text-muted-foreground/60 font-medium">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  {project.tags && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.tags.split(',').map((tag, i) => (
                        <span key={i} className="text-xs text-muted-foreground/70">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {project.link && (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5" />
                )}
              </div>
            );

            return project.link ? (
              <a
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                data-testid={`project-${project.id}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={project.id}
                className="block"
                data-testid={`project-${project.id}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
