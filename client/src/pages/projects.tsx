import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const projects = [
    {
      title: "Campsite",
      description: "The all-in-one communication platform for remote teams.",
      tags: ["React", "Node.js", "Real-time"],
      link: "https://campsite.com",
      color: "bg-orange-500 text-orange-50"
    },
    {
      title: "Staff Design",
      description: "Interviews with staff-level product designers at top tech companies.",
      tags: ["Content", "Community"],
      link: "https://staff.design",
      color: "bg-purple-500 text-purple-50"
    },
    {
      title: "Details",
      description: "A curated collection of design details from the best products on the web.",
      tags: ["Design", "Inspiration"],
      link: "#",
      color: "bg-blue-500 text-blue-50"
    },
    {
      title: "Spectrum",
      description: "Community platform for the future. Acquired by GitHub in 2018.",
      tags: ["Community", "Open Source"],
      link: "#",
      color: "bg-indigo-500 text-indigo-50"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-lg">
          Products I've built, communities I've founded, and open source work.
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project, i) => (
          <a 
            key={i} 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-muted/40 transition-all"
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${project.color} flex-shrink-0`}>
               <div className="font-bold text-lg">{project.title[0]}</div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {project.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
