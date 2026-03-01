import { ExternalLink, FolderGit2 } from "lucide-react";
import { getActiveProjects } from "../../_lib/public-data";

export const revalidate = 3600;

export const metadata = {
  title: "Projects",
};

export default async function Page() {
  const activeProjects = await getActiveProjects();

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-1100 ">Projects</h1>
        <p className="text-muted-foreground text-lg">
          Products I&apos;ve built, communities I&apos;ve founded, and open source work.
        </p>
      </div>

      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderGit2 className="h-8 w-8 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No projects yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activeProjects.map((project) => {
            const content = (
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6 py-4 group-hover:opacity-70 transition-opacity">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-medium text-gray-1100 transition-colors">
                      {project.title}
                    </h3>
                    {project.featured ? (
                      <span className="text-xs text-muted-foreground/60 font-medium">Featured</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  {project.tags ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.tags.split(",").map((tag, i) => (
                        <span key={i} className="text-xs text-muted-foreground/70">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {project.link ? (
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5" />
                ) : null}
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
              <div key={project.id} className="block" data-testid={`project-${project.id}`}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
