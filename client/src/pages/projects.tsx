import { ExternalLink, Search, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/lib/content-context";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Projects() {
  const { projects } = useContent();
  const [searchQuery, setSearchQuery] = useState("");

  const activeProjects = projects
    .filter(p => p.status === "Active")
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
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
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 h-10 bg-secondary/30 border-transparent focus:bg-background focus:border-input transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderGit2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {activeProjects.map((project) => (
            <a 
              key={project.id} 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/40 hover:border-secondary-foreground/10 transition-all active:scale-[0.98] min-w-0"
            >
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0",
                getProjectColor(project.title)
              )}>
                 <div className="font-bold text-lg">{project.title[0]}</div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-base truncate text-primary group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground truncate leading-relaxed">
                  {project.description}
                </p>
                {project.tags && (
                  <div className="flex gap-1.5 mt-2 overflow-hidden">
                    {project.tags.split(',').slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] h-5 font-normal px-1.5 text-muted-foreground bg-secondary/50">
                        {tag.trim()}
                      </Badge>
                    ))}
                    {project.tags.split(',').length > 2 && (
                      <Badge variant="secondary" className="text-[10px] h-5 font-normal px-1.5 text-muted-foreground bg-secondary/50">
                        +{project.tags.split(',').length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
