import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import campsiteImage from "@assets/generated_images/minimalist_abstract_app_interface_for_collaboration_tool.png";
import staffDesignImage from "@assets/generated_images/minimalist_book_cover_design_for_staff_design.png";
import detailsImage from "@assets/generated_images/abstract_minimal_geometric_shapes_for_design_inspiration.png";

export default function Projects() {
  const projects = [
    {
      title: "Campsite",
      description: "The all-in-one communication platform for remote teams. Combines posts, calls, docs, and chat.",
      tags: ["React", "Node.js", "Real-time"],
      link: "https://campsite.com",
      image: campsiteImage,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    },
    {
      title: "Staff Design",
      description: "A collection of interviews with staff-level product designers at top tech companies.",
      tags: ["Content", "Community"],
      link: "https://staff.design",
      image: staffDesignImage,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      title: "Details",
      description: "A curated collection of design details from the best products on the web.",
      tags: ["Design", "Inspiration"],
      link: "#",
      image: detailsImage,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      title: "Spectrum",
      description: "Community platform for the future. Acquired by GitHub in 2018.",
      tags: ["Community", "Open Source"],
      link: "#",
      image: null,
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
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

      <div className="space-y-8">
        {projects.map((project, i) => (
          <div key={i} className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-start p-4 -mx-4 rounded-2xl transition-colors hover:bg-muted/30">
            <div className="w-full md:w-64 flex-shrink-0 overflow-hidden rounded-xl border bg-muted aspect-video md:aspect-[4/3]">
              {project.image ? (
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                 <div className={`w-full h-full ${project.color} opacity-20`} />
              )}
            </div>
            
            <div className="flex-1 space-y-4 py-1">
              <div>
                <div className="flex items-center gap-2">
                   <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-lg">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <a href={project.link} className="absolute inset-0" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">View {project.title}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
