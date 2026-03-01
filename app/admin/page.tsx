"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  PenTool,
  Plane,
  Plus,
  Settings,
  Briefcase,
  Command as CommandIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useContent } from "@/lib/content-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { AdminTabContent } from "./_components/admin-tab-content";

type TabId = "overview" | "settings" | "writing" | "projects" | "work" | "travel" | "reading" | "media" | "seo";
const validTabs: TabId[] = ["overview", "settings", "writing", "projects", "work", "travel", "reading", "media", "seo"];
const tabTitles: Record<TabId, string> = {
  overview: "Overview",
  settings: "Home Page",
  writing: "Writing",
  projects: "Projects",
  work: "Work History",
  travel: "Travel",
  reading: "Reading List",
  media: "Media Library",
  seo: "SEO & Metadata",
};

const navItems: Array<{ id: TabId; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "settings", label: "Home Page", icon: Settings },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "work", label: "Work History", icon: Briefcase },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "reading", label: "Reading List", icon: BookOpen },
  { id: "media", label: "Media Library", icon: ImageIcon },
  { id: "seo", label: "SEO & Metadata", icon: Globe },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const { profile, articles, projects } = useContent();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const draftArticlesCount = useMemo(() => articles.filter((article) => article.status === "Draft").length, [articles]);

  const changeTab = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      router.push(`/admin?tab=${tab}`);
      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    },
    [isMobile, router],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const handleNewPost = useCallback(() => {
    router.push("/admin/article/new");
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && validTabs.includes(tab as TabId)) {
      setActiveTab(tab as TabId);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/auth/user", { credentials: "include" });
        if (!res.ok && !cancelled) {
          await signOut({ redirect: false });
          router.push("/admin/login");
        }
      } catch {
        if (!cancelled) {
          router.push("/admin/login");
        }
      }
    };

    void verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [router, status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable ||
        false;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((open) => !open);
        return;
      }

      if (isTypingTarget) return;

      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        handleNewPost();
        return;
      }

      if (event.altKey && /^[1-9]$/.test(event.key)) {
        const idx = Number(event.key) - 1;
        const item = navItems[idx];
        if (item) {
          event.preventDefault();
          changeTab(item.id);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeTab, handleNewPost]);

  const SidebarItem = ({
    id,
    label,
    icon: Icon,
  }: {
    id: TabId;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }) => {
    const commonClasses = cn(
      "w-full rounded-md transition-colors",
      activeTab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
    );

    if (!isSidebarExpanded && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button onClick={() => changeTab(id)} className={cn(commonClasses, "flex items-center justify-center p-2")}>
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <button onClick={() => changeTab(id)} className={cn(commonClasses, "flex items-center gap-3 px-3 py-2 text-sm font-medium")}>
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const SidebarContent = () => (
    <>
      <div
        className={cn(
          "bg-background/50 backdrop-blur transition-all",
          isSidebarExpanded && !isMobile ? "border-b p-6" : isMobile ? "border-b p-6" : "border-b-0 p-4",
        )}
      >
        {isSidebarExpanded || isMobile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                {profile?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{profile?.name || "Admin"}</div>
                <div className="truncate text-xs text-muted-foreground">Admin</div>
              </div>
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:bg-secondary"
                onClick={() => setIsSidebarExpanded((expanded) => !expanded)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              {profile?.name?.charAt(0) || "A"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-secondary"
              onClick={() => setIsSidebarExpanded((expanded) => !expanded)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className={cn("flex-1 space-y-6 overflow-y-auto", isSidebarExpanded || isMobile ? "px-3 py-6" : "px-2 py-6")}>
        <div className="space-y-1">
          {(isSidebarExpanded || isMobile) && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content</h4>
          )}
          {navItems.slice(0, 7).map((item) => (
            <SidebarItem key={item.id} id={item.id} label={item.label} icon={item.icon} />
          ))}
        </div>
        <div className="space-y-1">
          {(isSidebarExpanded || isMobile) && (
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</h4>
          )}
          {navItems.slice(7).map((item) => (
            <SidebarItem key={item.id} id={item.id} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 border-t bg-background/50 p-4 backdrop-blur",
          isSidebarExpanded || isMobile ? "justify-between" : "flex-col justify-center",
        )}
      >
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            isSidebarExpanded || isMobile ? "flex-1 justify-start gap-2" : "w-full justify-center px-0",
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          {(isSidebarExpanded || isMobile) && "Sign Out"}
        </Button>
        <div className={cn(isSidebarExpanded || isMobile ? "flex-shrink-0" : "")}>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)} className="h-8 w-8">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-semibold">{tabTitles[activeTab]}</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          {profile?.name?.charAt(0) || "A"}
        </div>
      </div>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col bg-muted/30">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "group relative hidden flex-col border-r bg-muted/30 transition-all duration-300 ease-in-out md:flex",
          isSidebarExpanded ? "w-64" : "w-[72px]",
        )}
      >
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background pt-14 md:pt-0">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-2 p-4 pb-0 md:p-8 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCommandOpen(true)}>
            <CommandIcon className="h-4 w-4" />
            Commands
            <span className="hidden text-xs text-muted-foreground md:inline">⌘K</span>
          </Button>
          <Button size="sm" className="gap-2" onClick={handleNewPost}>
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </div>
        <div className="mx-auto max-w-[1600px] space-y-4 p-4 md:space-y-8 md:p-8">
          <AdminTabContent
            activeTab={activeTab}
            profileName={profile?.name}
            articlesCount={articles.length}
            draftArticlesCount={draftArticlesCount}
            projectsCount={projects.length}
            onChangeTab={(tab) => changeTab(tab as TabId)}
            onNewPost={handleNewPost}
          />
        </div>
      </main>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Search actions..." />
        <CommandList>
          <CommandEmpty>No matching actions.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                setIsCommandOpen(false);
                handleNewPost();
              }}
            >
              <Plus className="h-4 w-4" />
              New Article
              <CommandShortcut>Alt+N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigate Tabs">
            {navItems.map((item, index) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  setIsCommandOpen(false);
                  changeTab(item.id);
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                <CommandShortcut>{`Alt+${index + 1}`}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => {
                setIsCommandOpen(false);
                void handleSignOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
