import { ExternalLink, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/content-context";
import { cn } from "@/lib/utils";

export default function Projects() {
  const { projects } = useContent();

  const activeProjects = projects
    .filter(p => p.status === "Active")
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const getProjectColor = (title: string) => {
    const colors = [
      "bg-orange-500 text-orange-50",
      "bg-purple-500 text-purple-50",
      "bg-blue-500 text-blue-50",
      "bg-indigo-500 text-indigo-50",
      "bg-pink-500 text-pink-50",
      "bg-green-500 text-green-50",
      "bg-teal-500 text-teal-50",
    ];
    const index = title.length % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-500">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-lg">
            Products I've built, communities I've founded, and open source work.
          </p>
        </div>
      </div>

      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <FolderGit2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {activeProjects.map((project) => {
            const baseClassName = cn(
              "group relative block rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden",
              project.featured && "ring-2 ring-primary/10",
              project.link && "cursor-pointer"
            );
            
            const content = (
              <>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-105",
                    getProjectColor(project.title)
                  )}>
                    <div className="font-bold text-xl">{project.title[0]}</div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg leading-tight text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      {project.link && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    {project.featured && (
                      <Badge variant="secondary" className="text-[10px] h-5 font-medium px-2 bg-primary/10 text-primary border-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                
                {project.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.split(',').slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs h-6 font-normal px-2.5 text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
                        {tag.trim()}
                      </Badge>
                    ))}
                    {project.tags.split(',').length > 3 && (
                      <Badge variant="secondary" className="text-xs h-6 font-normal px-2.5 text-muted-foreground bg-secondary/60">
                        +{project.tags.split(',').length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-2xl transition-colors pointer-events-none" />
              </>
            );
            
            return project.link ? (
              <a
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={baseClassName}
                data-testid={`project-${project.id}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={project.id}
                className={baseClassName}
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
