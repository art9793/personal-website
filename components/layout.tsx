"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, PenTool, FolderGit2, Briefcase, Menu, Lock, ChevronsLeft, ChevronsRight, Plane } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PrefetchLink } from "./PrefetchLink";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar-expanded");
    if (saved === "true") setIsExpanded(true);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/writing", label: "Writing", icon: PenTool },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    { href: "/travel", label: "Travel", icon: Plane },
    { href: "/work", label: "Work", icon: Briefcase },
  ];

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <nav className={cn("flex flex-col gap-2", collapsed ? "items-center" : "")}>
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <PrefetchLink href={item.href}
                  className={cn(
                    "group flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium transition-colors hover:bg-secondary/80",
                    isActive ? "bg-secondary text-gray-1100" : "text-muted-foreground hover:text-gray-1100"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-gray-1100" : "text-muted-foreground group-hover:text-gray-1100")} />
                  <span className="sr-only">{item.label}</span>
                </PrefetchLink>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <PrefetchLink key={item.href} href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80",
              isActive ? "bg-secondary text-gray-1100" : "text-muted-foreground hover:text-gray-1100"
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-gray-1100" : "text-muted-foreground group-hover:text-gray-1100")} />
            <span>{item.label}</span>
          </PrefetchLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row overflow-x-hidden selection:bg-primary/20">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-50">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Arshad Teli
        </Link>
        <div className="flex items-center gap-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-transparent">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-80 p-6 pt-12"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <div className="font-bold text-2xl tracking-tight mb-2">Arshad Teli</div>
                  <p className="text-muted-foreground">Product Manager</p>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <PrefetchLink key={item.href} href={item.href} onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium transition-colors",
                          isActive ? "bg-secondary text-gray-1100" : "text-muted-foreground hover:text-gray-1100 hover:bg-secondary/50"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-gray-1100" : "text-muted-foreground group-hover:text-gray-1100")} />
                        <span>{item.label}</span>
                      </PrefetchLink>
                    );
                  })}
                </nav>
                <div className="mt-auto pt-8 border-t flex justify-between text-muted-foreground">
                  <span className="text-sm">© {new Date().getFullYear()}</span>
                  <div className="flex gap-4">
                    <a href="https://x.com/art9793" target="_blank" rel="noopener noreferrer" className="hover:text-gray-1100 transition-colors">Twitter</a>
                    <a href="https://github.com/art9793" target="_blank" rel="noopener noreferrer" className="hover:text-gray-1100 transition-colors">GitHub</a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col fixed inset-y-0 left-0 border-r bg-card/30 backdrop-blur-sm p-6 transition-all duration-300 group z-40",
        isExpanded ? "w-64" : "w-[80px] items-center px-2"
      )}>
        <div className={cn("flex items-center mb-8 py-2 relative", isExpanded ? "justify-between px-3" : "justify-center flex-col gap-4")}>
          {isExpanded ? (
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Arshad Teli
            </Link>
          ) : (
            <Link href="/" className="font-bold text-xl tracking-tight">
              AT
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary",
              isExpanded ? "absolute -right-4" : ""
            )}
            onClick={() => {
              const next = !isExpanded;
              setIsExpanded(next);
              sessionStorage.setItem("sidebar-expanded", String(next));
            }}
          >
            {isExpanded ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 w-full">
          <NavContent collapsed={!isExpanded} />
        </div>

        <div className={cn("border-t mt-auto", isExpanded ? "pl-3 pt-4" : "pt-4 w-full flex flex-col items-center")}>
          <div className={cn("flex items-center", isExpanded ? "justify-between" : "flex-col gap-4")}>
            {isExpanded && <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>}
            <div className={cn("flex items-center", isExpanded ? "gap-2" : "flex-col gap-4")}>
              <Link href="/admin" className="text-muted-foreground hover:text-gray-1100 transition-colors" aria-label="Admin Access">
                <Lock className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", isExpanded ? "md:pl-64" : "md:pl-[80px]")}>
        <div className="mx-auto max-w-2xl w-full px-6 py-12 md:py-20 flex-1 flex flex-col">
          <div
            key={location}
            className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300 flex-1"
          >
            {children}
          </div>

          {/* Mobile Footer */}
          <footer className="md:hidden mt-16 border-t pt-8 text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <div>© {new Date().getFullYear()}</div>
              <div className="flex items-center gap-4">
                <a href="https://x.com/art9793" target="_blank" rel="noopener noreferrer" className="hover:text-gray-1100 transition-colors">Twitter</a>
                <a href="https://github.com/art9793" target="_blank" rel="noopener noreferrer" className="hover:text-gray-1100 transition-colors">GitHub</a>
                <Link href="/admin" className="hover:text-gray-1100 transition-colors" aria-label="Admin Access">
                  <Lock className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
