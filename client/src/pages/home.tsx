import { Link } from "wouter";
import { ArrowRight, Github, Twitter, Mail, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import profileImage from "@assets/logo.jpg";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-primary">
              Arshad Teli
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Product Manager
            </p>
          </div>
          <div className="space-y-6 max-w-xl">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Hey there! I’m a Product Manager & Designer currently working at a UK based fintech!
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Outside of work, I like to read, write and build!
            </p>
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <Button variant="outline" size="icon" asChild>
              <a href="https://x.com/art9793" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://github.com/art9793" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="mailto:art9793@gmail.com">
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary tracking-tight">Selected Projects</h2>
          <Link href="/projects">
            <a className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 -mr-2 rounded-md hover:bg-secondary/50">
              View all <ArrowRight className="h-3 w-3" />
            </a>
          </Link>
        </div>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[
            { title: "Campsite", desc: "The all-in-one communication platform for remote teams.", color: "bg-orange-500 text-orange-50" },
            { title: "Staff Design", desc: "Interviews with staff-level product designers.", color: "bg-purple-500 text-purple-50" }
          ].map((project, i) => (
            <Link key={i} href="/projects" className="block min-w-0">
              <div className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/40 hover:border-secondary-foreground/10 transition-all active:scale-[0.98] cursor-pointer min-w-0">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${project.color} flex-shrink-0`}>
                  <div className="font-bold text-lg">{project.title[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-primary group-hover:text-primary transition-colors">{project.title}</h3>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground truncate leading-relaxed">{project.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary tracking-tight">Recent Writing</h2>
          <Link href="/writing">
            <a className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors px-2 py-1 -mr-2 rounded-md hover:bg-secondary/50">
              Read more <ArrowRight className="h-3 w-3" />
            </a>
          </Link>
        </div>

        <div className="space-y-2">
          {[
            { title: "Designing for AI", date: "Oct 2024", views: "2.4k views" },
            { title: "The craft of software", date: "Aug 2024", views: "1.8k views" },
            { title: "Building Campsite", date: "May 2024", views: "3.2k views" }
          ].map((post, i) => (
            <Link key={i} href="/article/sample">
              <a className="block group">
                <div className="flex items-baseline justify-between py-3 border-b border-border/50 group-hover:border-border transition-colors">
                  <span className="text-base font-medium text-primary group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums ml-4 font-mono">
                    {post.date}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
