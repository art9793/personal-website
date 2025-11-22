import { Link } from "wouter";
import { ArrowRight, Github, Twitter, Mail } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import profileImage from "@assets/logo.jpg";
import campsiteImage from "@assets/generated_images/minimalist_abstract_app_interface_for_collaboration_tool.png";
import staffDesignImage from "@assets/generated_images/minimalist_book_cover_design_for_staff_design.png";

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            Hey, I'm Brian. I'm a software designer currently living in San Francisco.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm currently designing AI products at Notion. Before Notion, I was the co-founder of Campsite, an app that combined posts, docs, calls, and chat to enable thoughtful team collaboration.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I believe in quality, craft, and building software that feels like a tool you want to use, not one you have to use.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Button variant="outline" size="icon" asChild>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="mailto:hello@example.com">
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-2 border-border">
             <AvatarImage src={profileImage} alt="Profile" className="object-cover" />
            <AvatarFallback>BL</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Selected Projects</h2>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/projects" className="group block rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-1">
               <div className="h-48 bg-muted rounded-md mb-4 overflow-hidden">
                  <img 
                    src={campsiteImage} 
                    alt="Campsite Interface" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
               </div>
               <h3 className="font-semibold group-hover:text-primary transition-colors">Campsite</h3>
               <p className="text-sm text-muted-foreground mt-2">
                 A communication platform for remote teams.
               </p>
          </Link>
          <Link href="/projects" className="group block rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-1">
               <div className="h-48 bg-muted rounded-md mb-4 overflow-hidden">
                  <img 
                    src={staffDesignImage} 
                    alt="Staff Design Book" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
               </div>
               <h3 className="font-semibold group-hover:text-primary transition-colors">Staff Design</h3>
               <p className="text-sm text-muted-foreground mt-2">
                 Interviews with staff level product designers.
               </p>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Recent Writing</h2>
          <Link href="/writing" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              Read more <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {[
            { title: "Designing for AI", date: "Oct 2024", views: "2.4k views" },
            { title: "The craft of software", date: "Aug 2024", views: "1.8k views" },
            { title: "Building Campsite", date: "May 2024", views: "3.2k views" }
          ].map((post, i) => (
            <Link key={i} href="/article/sample" className="flex items-center justify-between group py-2">
                <span className="font-medium text-primary group-hover:text-blue-600 transition-colors">{post.title}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{post.date}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
