import { Link } from "wouter";
import { ArrowRight, Github, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content-context";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Home() {
  const { profile, projects, articles, isLoading } = useContent();

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const featuredProjects = projects
    .filter(p => p.status === "Active" && p.featured)
    .slice(0, 4);

  const recentPosts = articles
    .filter(a => a.status === "Published")
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

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
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-8">
          {profile.avatarUrl && (
            <div className="md:hidden flex justify-center">
              <Avatar className="h-24 w-24 border-2 border-border/40">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} loading="lazy" />
                <AvatarFallback>{profile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-primary">
              {profile.name}
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {profile.title}
            </p>
          </div>
          <div className="space-y-6 max-w-xl">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 pt-2">
            {profile.twitter && (profile.showTwitter ?? true) && (
              <a 
                href={profile.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background hover:bg-black hover:border-black transition-all duration-200 hover:scale-105 hover:shadow-md"
                data-testid="link-twitter"
              >
                <svg className="h-3.5 w-3.5 text-foreground group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {profile.linkedin && (profile.showLinkedin ?? true) && (
              <a 
                href={profile.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all duration-200 hover:scale-105 hover:shadow-md"
                data-testid="link-linkedin"
              >
                <Linkedin className="h-4 w-4 text-foreground group-hover:text-white transition-colors" />
              </a>
            )}
            {profile.github && (profile.showGithub ?? true) && (
              <a 
                href={profile.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background hover:bg-[#24292e] dark:hover:bg-white hover:border-[#24292e] dark:hover:border-white transition-all duration-200 hover:scale-105 hover:shadow-md"
                data-testid="link-github"
              >
                <Github className="h-4 w-4 text-foreground group-hover:text-white dark:group-hover:text-[#24292e] transition-colors" />
              </a>
            )}
            {profile.email && (profile.showEmail ?? true) && (
              <a 
                href={`mailto:${profile.email}`}
                className="group flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background hover:bg-primary hover:border-primary transition-all duration-200 hover:scale-105 hover:shadow-md"
                data-testid="link-email"
              >
                <Mail className="h-4 w-4 text-foreground group-hover:text-primary-foreground transition-colors" />
              </a>
            )}
          </div>
        </div>
        {profile.avatarUrl && (
          <div className="hidden md:block flex-shrink-0">
            <Avatar className="h-32 w-32 border-2 border-border/40">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} loading="lazy" />
              <AvatarFallback>{profile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {featuredProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary tracking-tight">Selected Projects</h2>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 -mr-2 rounded-md hover:bg-secondary/50">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <a 
                key={project.id} 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block min-w-0 group"
              >
                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/40 hover:border-secondary-foreground/10 transition-all active:scale-[0.98] cursor-pointer min-w-0 h-full">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0",
                    getProjectColor(project.title)
                  )}>
                    <div className="font-bold text-lg">{project.title[0]}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-primary group-hover:text-primary transition-colors truncate pr-2">
                        {project.title}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {recentPosts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary tracking-tight">Recent Writing</h2>
            <Link href="/writing" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 -mr-2 rounded-md hover:bg-secondary/50">
              Read more <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/article/${post.slug || post.id}`} className="block group">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 py-3 border-b border-border/50 group-hover:border-border transition-colors">
                  <span className="text-base font-medium text-primary group-hover:text-blue-600 transition-colors">
                    {post.title || "Untitled"}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums font-mono flex-shrink-0">
                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM yyyy") : "Draft"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
