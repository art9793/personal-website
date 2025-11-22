import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, PenTool, FolderGit2, BookOpen, Briefcase, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/writing", label: "Writing", icon: PenTool },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    { href: "/reading", label: "Reading", icon: BookOpen },
    { href: "/work", label: "Work", icon: Briefcase },
  ];

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary/80",
                isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <span>{item.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="font-semibold">Brian Lovin</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6">
              <div className="mb-8 font-semibold text-lg">Brian Lovin</div>
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r bg-card/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-8 pl-3">
           <div className="font-bold text-lg tracking-tight">Brian Lovin</div>
        </div>
        
        <div className="flex-1">
          <NavContent />
        </div>

        <div className="pl-3 pt-4 border-t mt-auto">
           <div className="flex items-center justify-between">
             <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
             <ThemeToggle />
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
          
          {/* Mobile Footer */}
          <footer className="md:hidden mt-24 border-t pt-8 text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>© {new Date().getFullYear()}</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
