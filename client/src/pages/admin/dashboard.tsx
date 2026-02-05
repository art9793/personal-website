import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard, PenTool, FolderGit2, BookOpen, Settings,
  LogOut, Image as ImageIcon, Globe,
  ChevronsLeft, ChevronsRight, Upload,
  ArrowLeft,
  Calendar as CalendarIcon, Briefcase,
  AlertCircle, Menu, Plane
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/admin/editor";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useContent, Article } from "@/lib/content-context";
import { queryClient } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";

// Error boundary for dashboard tabs — catches render errors without crashing the whole dashboard
class TabErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard tab error:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Something went wrong loading this tab.</p>
          <button
            className="text-sm text-primary underline underline-offset-4"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load dashboard tabs for code splitting
const OverviewTab = lazy(() => import("./dashboard-tabs/OverviewTab").then(m => ({ default: m.OverviewTab })));
const ReadingTab = lazy(() => import("./dashboard-tabs/ReadingTab").then(m => ({ default: m.ReadingTab })));
const MediaTab = lazy(() => import("./dashboard-tabs/MediaTab").then(m => ({ default: m.MediaTab })));
const SEOTab = lazy(() => import("./dashboard-tabs/SEOTab").then(m => ({ default: m.SEOTab })));
const ProjectsTab = lazy(() => import("./dashboard-tabs/ProjectsTab").then(m => ({ default: m.ProjectsTab })));
const WorkTab = lazy(() => import("./dashboard-tabs/WorkTab").then(m => ({ default: m.WorkTab })));
const TravelTab = lazy(() => import("./dashboard-tabs/TravelTab").then(m => ({ default: m.TravelTab })));
const WritingTab = lazy(() => import("./dashboard-tabs/WritingTab").then(m => ({ default: m.WritingTab })));
const SettingsTab = lazy(() => import("./dashboard-tabs/SettingsTab").then(m => ({ default: m.SettingsTab })));

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Read initial tab from URL search params
  const initialTab = (() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && ["overview", "writing", "projects", "work", "travel", "reading", "media", "seo", "settings"].includes(tab)
      ? tab
      : "overview";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Helper to change tab and update URL (preserves browser history)
  const changeTab = useCallback((tab: string) => {
    setActiveTab(tab);
    const newUrl = `/admin?tab=${tab}`;
    window.history.pushState({}, '', newUrl);
  }, []);

  // Sync activeTab with URL when browser back/forward buttons are used
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["overview", "writing", "projects", "work", "travel", "reading", "media", "seo", "settings"].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab("overview");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const {
    profile, articles, projects,
    updateArticle, addArticle
  } = useContent();

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Memoize article counts for overview
  const draftArticlesCount = useMemo(() =>
    articles.filter(a => a.status === "Draft").length,
    [articles]
  );

  // Reset writing state when leaving writing tab
  useEffect(() => {
    if (activeTab !== 'writing') {
      setIsWriting(false);
      setEditingArticle(null);
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewPost = () => {
    setLocation("/admin/article/new");
  };

  const autoSaveArticle = useCallback(async (article: Article) => {
    if (!article) return;

    try {
      setSaveStatus("saving");
      if (article.id) {
        await updateArticle(article.id, article);
      } else {
        const createdArticle = await addArticle(article);
        if (createdArticle && createdArticle.id) {
          setEditingArticle(prev => prev ? { ...prev, id: createdArticle.id } : null);
        }
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error auto-saving article:", error);
      setSaveStatus("idle");
      toast({
        title: "Auto-save Failed",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
    }
  }, [updateArticle, addArticle, toast]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!editingArticle || !isWriting) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSaveArticle(editingArticle);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editingArticle, isWriting, autoSaveArticle]);

  const handleSaveArticle = async () => {
    if (!editingArticle) return;

    try {
      setSaveStatus("saving");
      if (editingArticle.id) {
        await updateArticle(editingArticle.id, editingArticle);
      } else {
        await addArticle(editingArticle);
      }

      toast({
        title: "Article Saved",
        description: `"${editingArticle.title || 'Untitled'}" has been saved successfully.`,
      });
      setSaveStatus("saved");
      setIsWriting(false);
      setEditingArticle(null);
    } catch (error) {
      console.error("Error saving article:", error);
      setSaveStatus("idle");
    }
  };

  const canPublishArticle = (article: Article | null) => {
    if (!article) return false;
    return article.slug?.trim() !== '' && article.title?.trim() !== '';
  };

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
    const handleClick = () => {
      changeTab(id);
      if (isMobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (!isSidebarExpanded && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                "w-full flex items-center justify-center p-2 rounded-md transition-colors",
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          activeTab === id
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  // Sidebar content component (reusable for desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className={cn(
        "bg-background/50 backdrop-blur transition-all",
        isSidebarExpanded && !isMobile ? "p-6 border-b" : isMobile ? "p-6 border-b" : "p-4 border-b-0"
      )}>
        {isSidebarExpanded || isMobile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div className="h-8 w-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold">
                {profile?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{profile?.name || 'Admin'}</div>
                <div className="text-xs text-muted-foreground truncate">Admin</div>
              </div>
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:bg-secondary flex-shrink-0"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-secondary"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "flex-1 overflow-y-auto space-y-6",
        (isSidebarExpanded || isMobile) ? "py-6 px-3" : "py-6 px-2"
      )}>
        <div className="space-y-1">
          {(isSidebarExpanded || isMobile) && (
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h4>
          )}
          <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
          <SidebarItem icon={Settings} label="Home Page" id="settings" />
          <SidebarItem icon={PenTool} label="Writing" id="writing" />
          <SidebarItem icon={FolderGit2} label="Projects" id="projects" />
          <SidebarItem icon={Briefcase} label="Work History" id="work" />
          <SidebarItem icon={Plane} label="Travel" id="travel" />
          <SidebarItem icon={BookOpen} label="Reading List" id="reading" />
        </div>

        <div className="space-y-1">
           {(isSidebarExpanded || isMobile) && (
             <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</h4>
           )}
           <SidebarItem icon={ImageIcon} label="Media Library" id="media" />
           <SidebarItem icon={Globe} label="SEO & Metadata" id="seo" />
        </div>
      </div>

      <div className={cn(
        "p-4 border-t bg-background/50 backdrop-blur flex items-center gap-2",
        (isSidebarExpanded || isMobile) ? "justify-between" : "flex-col justify-center"
      )}>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            (isSidebarExpanded || isMobile) ? "flex-1 justify-start gap-2" : "w-full justify-center px-0"
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          {(isSidebarExpanded || isMobile) && "Sign Out"}
        </Button>
        <div className={cn((isSidebarExpanded || isMobile) ? "flex-shrink-0" : "")}>
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  // Get tab title for mobile header
  const getTabTitle = () => {
    const titles: Record<string, string> = {
      overview: "Overview",
      settings: "Home Page",
      writing: "Writing",
      projects: "Projects",
      work: "Work History",
      travel: "Travel",
      reading: "Reading List",
      media: "Media Library",
      seo: "SEO & Metadata"
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="h-8 w-8"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-semibold">{getTabTitle()}</h1>
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
          {profile?.name?.charAt(0) || 'A'}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full bg-muted/30">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex border-r bg-muted/30 flex-col transition-all duration-300 ease-in-out group relative",
        isSidebarExpanded ? "w-64" : "w-[72px]"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-4 md:space-y-8">
          {activeTab === "overview" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <OverviewTab
                  profileName={profile?.name}
                  articlesCount={articles.length}
                  draftArticlesCount={draftArticlesCount}
                  projectsCount={projects.length}
                  onChangeTab={changeTab}
                  onNewPost={handleNewPost}
                />
              </Suspense>
            </TabErrorBoundary>
          )}

          {activeTab === "projects" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <ProjectsTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {activeTab === "writing" && !isWriting && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <WritingTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {activeTab === "work" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <WorkTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {activeTab === "writing" && isWriting && editingArticle && (
            <div className="animate-in fade-in-50 slide-in-from-right-2 duration-300 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={() => {
                  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                  setIsWriting(false);
                  setEditingArticle(null);
                  setSaveStatus("idle");
                }} className="gap-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-3">
                   <span className="text-xs text-muted-foreground">
                      {editingArticle.content.split(/\s/g).length} words
                   </span>
                   <Separator orientation="vertical" className="h-4" />
                   <Badge variant={editingArticle.status === "Published" ? "default" : "outline"} className="text-xs font-normal">
                      {editingArticle.status === "Published" ? "Published" : "Draft"}
                   </Badge>
                </div>
              </div>

              <div className="space-y-4">
                  <Textarea
                    className="text-3xl md:text-4xl font-bold tracking-tight h-auto min-h-[1.5em] border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 bg-transparent shadow-none rounded-none p-0 leading-tight resize-none overflow-hidden text-primary"
                    placeholder="Untitled"
                    value={editingArticle.title}
                    onChange={(e) => {
                      setEditingArticle({...editingArticle, title: e.target.value});
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    rows={1}
                    data-testid="input-article-title"
                  />

                  <Editor
                    content={editingArticle.content}
                    onChange={(html) => setEditingArticle({...editingArticle, content: html})}
                  />
              </div>

              {/* Settings Drawer/Panel */}
              <div className="mt-8 md:mt-32 border-t pt-6 md:pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-all duration-500 ease-in-out group">
                  <div className="space-y-6">
                     <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                        <Settings className="h-4 w-4" />
                        Publishing
                     </div>
                     <div className="space-y-5">
                        <div className="flex items-center justify-between group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Status</Label>
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                            const newStatus = editingArticle.status === "Published" ? "Draft" : "Published";
                            if (newStatus === "Published" && !canPublishArticle(editingArticle)) {
                              toast({
                                title: "Cannot Publish",
                                description: "Article must have a title and slug before publishing.",
                                variant: "destructive"
                              });
                              return;
                            }
                            setEditingArticle({...editingArticle, status: newStatus});
                          }}>
                            <Badge variant={editingArticle.status === "Published" ? "default" : "outline"} className="font-normal" data-testid="badge-article-status">
                              {editingArticle.status}
                            </Badge>
                            {editingArticle.status === "Draft" && !canPublishArticle(editingArticle) && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Title and slug required to publish</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Publish Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-9 w-full justify-start text-left font-normal text-xs",
                                  !editingArticle.publishedAt && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editingArticle.publishedAt ? format(new Date(editingArticle.publishedAt), "MMM d, yyyy") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={editingArticle.publishedAt ? new Date(editingArticle.publishedAt) : undefined}
                                onSelect={(date) => date && setEditingArticle({...editingArticle, publishedAt: date})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">URL Slug</Label>
                          <Input
                            placeholder="url-slug"
                            className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
                            value={editingArticle.slug}
                            onChange={(e) => setEditingArticle({...editingArticle, slug: e.target.value})}
                          />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 md:col-span-2">
                     <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                        <Globe className="h-4 w-4" />
                        SEO & Metadata
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                       <div className="space-y-5">
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">Excerpt</Label>
                           <Textarea
                             className="min-h-[60px] text-xs resize-none border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
                             placeholder="Short summary..."
                             value={editingArticle.excerpt || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, excerpt: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">SEO Keywords</Label>
                           <Input
                             placeholder="ai, design, future..."
                             className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
                             value={editingArticle.seoKeywords || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, seoKeywords: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                           <Label className="text-xs text-muted-foreground font-normal">Tags</Label>
                           <Input
                             placeholder="Design, Tech..."
                             className="h-8 text-xs border-none bg-transparent shadow-none p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
                             value={editingArticle.tags || ""}
                             onChange={(e) => setEditingArticle({...editingArticle, tags: e.target.value})}
                           />
                         </div>
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs text-muted-foreground font-normal px-2">Cover Image</Label>
                         <div className="aspect-video border border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border hover:bg-secondary/20 transition-all cursor-pointer">
                            <Upload className="h-4 w-4 mb-2" />
                            <span className="text-[10px]">Upload Cover</span>
                         </div>
                       </div>
                     </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === "travel" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <TravelTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {!isWriting && activeTab === "reading" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <ReadingTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {!isWriting && activeTab === "media" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <MediaTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {!isWriting && activeTab === "seo" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <SEOTab />
              </Suspense>
            </TabErrorBoundary>
          )}

          {activeTab === "settings" && (
            <TabErrorBoundary>
              <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
                <SettingsTab />
              </Suspense>
            </TabErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}
