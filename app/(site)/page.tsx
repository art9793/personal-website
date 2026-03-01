import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatArticleHref, getHomeData } from "../_lib/public-data";

export const revalidate = 3600;

export const metadata = {
  title: "Home",
};

export default async function Page() {
  const { profile, featuredProjects, recentPosts } = await getHomeData();

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {profile ? (
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-8">
            {profile.avatarUrl && (
              <div className="md:hidden flex justify-center">
                <Avatar className="h-24 w-24 border-2 border-border/40">
                  <Image src={profile.avatarUrl} alt={profile.name} width={96} height={96} className="aspect-square h-full w-full object-cover" />
                  <AvatarFallback>{profile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-1100 ">{profile.name}</h1>
              <p className="text-xl text-muted-foreground">{profile.title}</p>
            </div>
            <div className="space-y-6 max-w-xl">
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              {profile.twitter && (profile.showTwitter ?? true) && (
                <a
                  href={profile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid="link-twitter"
                >
                  <svg className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gray-1100 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {profile.linkedin && (profile.showLinkedin ?? true) && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid="link-linkedin"
                >
                  <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-gray-1100 transition-colors" />
                </a>
              )}
              {profile.github && (profile.showGithub ?? true) && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid="link-github"
                >
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-gray-1100 transition-colors" />
                </a>
              )}
              {profile.email && (profile.showEmail ?? true) && (
                <a
                  href={`mailto:${profile.email}`}
                  className="group flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary/50 transition-colors"
                  data-testid="link-email"
                >
                  <Mail className="h-4 w-4 text-muted-foreground group-hover:text-gray-1100 transition-colors" />
                </a>
              )}
            </div>
          </div>
          {profile.avatarUrl && (
            <div className="hidden md:block flex-shrink-0">
              <Avatar className="h-32 w-32 border-2 border-border/40">
                <Image src={profile.avatarUrl} alt={profile.name} width={128} height={128} className="aspect-square h-full w-full object-cover" priority />
                <AvatarFallback>{profile.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      ) : null}

      {featuredProjects.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-1100 tracking-tight">Selected Projects</h2>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-gray-1100 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {featuredProjects.map((project) => {
              const content = (
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 py-2 group-hover:opacity-70 transition-opacity">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-1100 transition-colors">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{project.description}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-0.5 hidden sm:block" />
                </div>
              );
              return project.link ? (
                <a key={project.id} href={project.link} target="_blank" rel="noopener noreferrer" className="block group">
                  {content}
                </a>
              ) : (
                <div key={project.id} className="block group">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {recentPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-1100 tracking-tight">Recent Writing</h2>
            <Link href="/writing" className="text-sm text-muted-foreground hover:text-gray-1100 flex items-center gap-1 transition-colors">
              Read more <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link key={post.id} href={formatArticleHref(post)} className="block group">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-0 py-2 group-hover:opacity-70 transition-opacity">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-1100 transition-colors">{post.title || "Untitled"}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                      {post.publishedAt ? format(new Date(post.publishedAt), "MMM yyyy") : "Draft"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
