import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, PenTool, FolderGit2, BookOpen, Settings, 
  LogOut, Image as ImageIcon, Save, Plus, Search, Globe,
  ChevronsLeft, ChevronsRight, Link as LinkIcon, Star,
  ChevronRight, Upload, Trash2, Edit2, ArrowLeft, Eye, CheckCircle,
  MoreHorizontal, Clock, Calendar as CalendarIcon, ArrowUpDown, Filter, Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/admin/editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useContent, Article, Project, WorkExperience } from "@/lib/content-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const visitorData = [
  { name: 'Mon', visits: 1240 },
  { name: 'Tue', visits: 1450 },
  { name: 'Wed', visits: 1800 },
  { name: 'Thu', visits: 1600 },
  { name: 'Fri', visits: 2100 },
  { name: 'Sat', visits: 1900 },
  { name: 'Sun', visits: 2300 },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    profile, articles, projects, workHistory,
    updateProfile, addArticle, updateArticle, deleteArticle,
    addProject, updateProject, deleteProject,
    addWork, updateWork, deleteWork
  } = useContent();
  
  const [formData, setFormData] = useState(profile);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [isWorkSheetOpen, setIsWorkSheetOpen] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Article | keyof Project | keyof WorkExperience; direction: 'asc' | 'desc' } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Reset states when changing tabs
  useEffect(() => {
    if (activeTab !== 'writing') {
      setIsWriting(false);
      setEditingArticle(null);
    }
    if (activeTab !== 'projects') {
      setIsProjectSheetOpen(false);
      setEditingProject(null);
    }
    if (activeTab !== 'work') {
      setIsWorkSheetOpen(false);
      setEditingWork(null);
    }
    // Reset sort and filter
    setSortConfig(null);
    setFilterQuery("");
  }, [activeTab]);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSignOut = () => {
    setLocation("/");
  };
  
  const handleSaveProfile = () => {
    updateProfile(formData);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleNewPost = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: "",
      slug: "",
      content: "",
      date: new Date().toISOString().split('T')[0],
      status: "Draft",
      views: "0",
      excerpt: "",
      tags: "",
      seoKeywords: "",
      author: profile.name
    };
    setEditingArticle(newArticle);
    setIsWriting(true);
  };

  const handleEditPost = (article: Article) => {
    setEditingArticle(article);
    setIsWriting(true);
  };

  const handleSaveArticle = () => {
    if (!editingArticle) return;

    if (articles.some(a => a.id === editingArticle.id)) {
      updateArticle(editingArticle.id, editingArticle);
    } else {
      addArticle(editingArticle);
    }

    toast({
      title: "Article Saved",
      description: `"${editingArticle.title || 'Untitled'}" has been saved successfully.`,
    });
    setIsWriting(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticle(id);
      toast({
        title: "Article Deleted",
        description: "The article has been permanently removed.",
        variant: "destructive"
      });
    }
  };

  const toggleArticleStatus = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = article.status === "Published" ? "Draft" : "Published";
    updateArticle(article.id, { status: newStatus });
    toast({
      title: `Article ${newStatus}`,
      description: `"${article.title}" is now ${newStatus.toLowerCase()}.`,
    });
  };

  const handleSaveProject = () => {
    if (!editingProject) return;

    if (projects.some(p => p.id === editingProject.id)) {
      updateProject(editingProject.id, editingProject);
    } else {
      addProject(editingProject);
    }

    toast({
      title: "Project Saved",
      description: `"${editingProject.title || 'Untitled'}" has been saved successfully.`,
    });
    setIsProjectSheetOpen(false);
    setEditingProject(null);
  };

  const handleNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "",
      description: "",
      link: "",
      tags: "",
      status: "Active",
      featured: false,
      date: new Date().toISOString().split('T')[0]
    };
    setEditingProject(newProject);
    setIsProjectSheetOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectSheetOpen(true);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      toast({
        title: "Project Deleted",
        description: "The project has been permanently removed.",
        variant: "destructive"
      });
    }
  };

  const handleNewWork = () => {
    const newWork: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
      logo: ""
    };
    setEditingWork(newWork);
    setIsWorkSheetOpen(true);
  };

  const handleEditWork = (work: WorkExperience) => {
    setEditingWork(work);
    setIsWorkSheetOpen(true);
  };

  const handleSaveWork = () => {
    if (!editingWork) return;

    if (workHistory.some(w => w.id === editingWork.id)) {
      updateWork(editingWork.id, editingWork);
    } else {
      addWork(editingWork);
    }

    toast({
      title: "Work Experience Saved",
      description: `"${editingWork.company}" has been saved successfully.`,
    });
    setIsWorkSheetOpen(false);
    setEditingWork(null);
  };

  const handleDeleteWork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this work experience?")) {
      deleteWork(id);
      toast({
        title: "Work Experience Deleted",
        description: "The entry has been permanently removed.",
        variant: "destructive"
      });
    }
  };

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredProjects = () => {
    let result = [...projects];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.toLowerCase().includes(query)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const filteredProjects = getSortedAndFilteredProjects();

  const getSortedAndFilteredArticles = () => {
    let result = [...articles];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        (article.tags && article.tags.toLowerCase().includes(query)) ||
        (article.seoKeywords && article.seoKeywords.toLowerCase().includes(query))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        // Special handling for numbers (views)
        if (sortConfig.key === 'views') {
             const aNum = parseInt(aValue.toString().replace(/[^0-9]/g, '')) || 0;
             const bNum = parseInt(bValue.toString().replace(/[^0-9]/g, '')) || 0;
             return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  };

  const filteredArticles = getSortedAndFilteredArticles();

  const getSortedAndFilteredWork = () => {
    let result = [...workHistory];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(work => 
        work.company.toLowerCase().includes(query) ||
        work.role.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  };

  const filteredWork = getSortedAndFilteredWork();

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => {
    if (!isSidebarExpanded) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveTab(id)}
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
        onClick={() => setActiveTab(id)}
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

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>?/gm, ''); 
    const noOfWords = text.split(/\s/g).length;
    const minutes = Math.ceil(noOfWords / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <aside className={cn(
        "border-r bg-muted/30 flex flex-col transition-all duration-300 ease-in-out group relative",
        isSidebarExpanded ? "w-64" : "w-[72px]"
      )}>
        <div className={cn(
          "bg-background/50 backdrop-blur transition-all flex flex-col",
          isSidebarExpanded ? "p-6 border-b" : "p-4 border-b-0 items-center"
        )}>
          <div className={cn(
            "flex items-center gap-3 overflow-hidden w-full",
            isSidebarExpanded ? "" : "justify-center"
          )}>
             <div className="h-8 w-8 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold">
               {profile.name.charAt(0)}
             </div>
             {isSidebarExpanded && (
               <div>
                 <div className="font-semibold text-sm truncate max-w-[100px]">{profile.name}</div>
                 <div className="text-xs text-muted-foreground truncate">Admin</div>
               </div>
             )}
          </div>
          
          <Button 
             variant="ghost" 
             size="icon" 
             className={cn(
               "h-6 w-6 text-muted-foreground hover:bg-secondary mt-4",
               isSidebarExpanded ? "self-end" : ""
             )}
             onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
           >
             {isSidebarExpanded ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
           </Button>
        </div>
        
        {/* Spacer for collapsed state toggle button */}
        {!isSidebarExpanded && <div className="h-8"></div>}

        <div className={cn(
          "flex-1 overflow-y-auto space-y-6",
          isSidebarExpanded ? "py-6 px-3" : "py-6 px-2"
        )}>
          <div className="space-y-1">
            {isSidebarExpanded && (
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h4>
            )}
            <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
            <SidebarItem icon={Settings} label="Home Page" id="settings" />
            <SidebarItem icon={PenTool} label="Writing" id="writing" />
            <SidebarItem icon={FolderGit2} label="Projects" id="projects" />
            <SidebarItem icon={Briefcase} label="Work History" id="work" />
            <SidebarItem icon={BookOpen} label="Reading List" id="reading" />
          </div>

          <div className="space-y-1">
             {isSidebarExpanded && (
               <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</h4>
             )}
             <SidebarItem icon={ImageIcon} label="Media Library" id="media" />
             <SidebarItem icon={Globe} label="SEO & Metadata" id="seo" />
          </div>
        </div>

        <div className={cn(
          "p-4 border-t bg-background/50 backdrop-blur flex items-center gap-2",
          isSidebarExpanded ? "justify-between" : "flex-col justify-center"
        )}>
          <Button 
            variant="ghost" 
            onClick={handleSignOut} 
            className={cn(
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              isSidebarExpanded ? "flex-1 justify-start gap-2" : "w-full justify-center px-0"
            )}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            {isSidebarExpanded && "Sign Out"}
          </Button>
          <div className={cn(isSidebarExpanded ? "flex-shrink-0" : "")}>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in-50 duration-500">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome, {profile.name.split(' ')[0]}!</h2>
                <p className="text-muted-foreground mt-1">Here's what's happening with your website today.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Daily Visitors</CardTitle>
                    <CardDescription>
                      Traffic trends for the past 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={visitorData}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            dx={-10}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              borderRadius: 'var(--radius)', 
                              border: '1px solid hsl(var(--border))', 
                              boxShadow: 'var(--shadow-sm)',
                              backgroundColor: 'hsl(var(--background))',
                              color: 'hsl(var(--foreground))'
                            }}
                            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tight">12,345</div>
                      <p className="text-xs text-green-500 flex items-center mt-1 font-medium">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Articles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tight">{articles.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {articles.filter(a => a.status === "Draft").length} drafts pending
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tight">{projects.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All active
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                   <Button onClick={() => { setActiveTab("writing"); handleNewPost(); }} className="gap-2 shadow-none">
                     <PenTool className="h-4 w-4" /> Write Article
                   </Button>
                   <Button onClick={() => setActiveTab("projects")} variant="outline" className="gap-2 shadow-none">
                     <FolderGit2 className="h-4 w-4" /> Add Project
                   </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter projects..." 
                            className="pl-8 h-9 text-sm" 
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                    <Sheet open={isProjectSheetOpen} onOpenChange={(open) => {
                        setIsProjectSheetOpen(open);
                        if (!open) setEditingProject(null);
                    }}>
                        <SheetTrigger asChild>
                            <Button onClick={handleNewProject} size="sm" className="gap-2 h-9"><Plus className="h-4 w-4" /> Add Project</Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editingProject?.title ? 'Edit Project' : 'New Project'}</SheetTitle>
                                <SheetDescription>
                                    Add or edit project details to showcase in your portfolio.
                                </SheetDescription>
                            </SheetHeader>
                            {editingProject && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Project Title</Label>
                                        <Input 
                                            id="title" 
                                            value={editingProject.title} 
                                            onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                                            placeholder="e.g. Campsite"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            value={editingProject.description} 
                                            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                                            placeholder="Brief description of the project..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="link">Project Link</Label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    id="link" 
                                                    className="pl-8"
                                                    value={editingProject.link} 
                                                    onChange={(e) => setEditingProject({...editingProject, link: e.target.value})}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input 
                                                id="date" 
                                                type="date"
                                                value={editingProject.date} 
                                                onChange={(e) => setEditingProject({...editingProject, date: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input 
                                            id="tags" 
                                            value={editingProject.tags} 
                                            onChange={(e) => setEditingProject({...editingProject, tags: e.target.value})}
                                            placeholder="e.g. Design, React, Mobile (comma separated)"
                                        />
                                        <p className="text-xs text-muted-foreground">Comma separated tags for filtering</p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Featured Project</Label>
                                                <p className="text-sm text-muted-foreground">Pin this project to the top of your list</p>
                                            </div>
                                            <Switch 
                                                checked={editingProject.featured}
                                                onCheckedChange={(checked) => setEditingProject({...editingProject, featured: checked})}
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">Show this project publicly</p>
                                            </div>
                                            <Switch 
                                                checked={editingProject.status === "Active"}
                                                onCheckedChange={(checked) => setEditingProject({...editingProject, status: checked ? "Active" : "Archived"})}
                                            />
                                        </div>
                                    </div>

                                    <SheetFooter className="pt-6">
                                        <SheetClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </SheetClose>
                                        <Button onClick={handleSaveProject}>Save Project</Button>
                                    </SheetFooter>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
              </div>

              <div className="border rounded-md bg-background overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Title {sortConfig?.key === 'title' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('description')}>
                                <div className="flex items-center gap-1">
                                    Description {sortConfig?.key === 'description' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tags')}>
                                <div className="flex items-center gap-1">
                                    Tags {sortConfig?.key === 'tags' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('featured')}>
                                <div className="flex items-center justify-center gap-1">
                                    Featured {sortConfig?.key === 'featured' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    Status {sortConfig?.key === 'status' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((project) => (
                                <TableRow 
                                    key={project.id} 
                                    className="group cursor-pointer hover:bg-muted/30"
                                    onClick={() => handleEditProject(project)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                <FolderGit2 className="h-4 w-4" />
                                            </div>
                                            <span className="truncate max-w-[200px] font-semibold">{project.title || "Untitled"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                                        {project.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {project.tags ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {project.tags.split(',').slice(0, 2).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-[10px] font-normal h-5">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                                {project.tags.split(',').length > 2 && (
                                                    <Badge variant="secondary" className="text-[10px] font-normal h-5">+{project.tags.split(',').length - 2}</Badge>
                                                )}
                                            </div>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {project.featured ? (
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                                        ) : (
                                            <Star className="h-4 w-4 text-muted-foreground/20 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Switch 
                                            checked={project.status === "Active"}
                                            onCheckedChange={(checked) => {
                                                updateProject(project.id, { status: checked ? "Active" : "Archived" });
                                                toast({
                                                    title: `Project ${checked ? 'Activated' : 'Archived'}`,
                                                    description: `"${project.title}" is now ${checked ? 'active' : 'archived'}.`,
                                                });
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                                                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteProject(project.id, e)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "writing" && !isWriting && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Writing</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter by tags or keywords..." 
                            className="pl-8 h-9 text-sm" 
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleNewPost} size="sm" className="gap-2 h-9"><Plus className="h-4 w-4" /> New</Button>
                </div>
              </div>

              <div className="border rounded-md bg-background overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px] cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                                <div className="flex items-center gap-1">
                                    Title {sortConfig?.key === 'title' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('seoKeywords')}>
                                <div className="flex items-center gap-1">
                                    SEO Keywords {sortConfig?.key === 'seoKeywords' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tags')}>
                                <div className="flex items-center gap-1">
                                    Tags {sortConfig?.key === 'tags' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="whitespace-nowrap">Read Time</TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground text-right" onClick={() => handleSort('views')}>
                                <div className="flex items-center justify-end gap-1">
                                    Views {sortConfig?.key === 'views' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-1">
                                    Published Date {sortConfig?.key === 'date' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[80px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                                <div className="flex items-center justify-center gap-1">
                                    Published {sortConfig?.key === 'status' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredArticles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredArticles.map((article) => (
                                <TableRow 
                                    key={article.id} 
                                    className="group cursor-pointer hover:bg-muted/30"
                                    onClick={() => handleEditPost(article)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-secondary/50 flex items-center justify-center text-[10px] text-muted-foreground">
                                                📄
                                            </div>
                                            <span className="truncate max-w-[250px]">{article.title || "Untitled"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                        {article.seoKeywords || "—"}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {article.tags ? (
                                            <Badge variant="secondary" className="text-[10px] font-normal h-5">
                                                {article.tags.split(',')[0]}
                                                {article.tags.split(',').length > 1 && ` +${article.tags.split(',').length - 1}`}
                                            </Badge>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {getReadingTime(article.content)}
                                    </TableCell>
                                    <TableCell className="text-xs text-right font-mono">
                                        {article.views}
                                    </TableCell>
                                    <TableCell className="text-xs whitespace-nowrap">
                                        {article.date}
                                    </TableCell>
                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox 
                                            checked={article.status === "Published"} 
                                            onCheckedChange={() => {
                                                const newStatus = article.status === "Published" ? "Draft" : "Published";
                                                updateArticle(article.id, { status: newStatus });
                                                toast({
                                                    title: `Article ${newStatus}`,
                                                    description: `"${article.title}" is now ${newStatus.toLowerCase()}.`,
                                                });
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "work" && (
            <div className="space-y-4 animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Work History</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter work history..." 
                            className="pl-8 h-9 text-sm" 
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                        />
                    </div>
                    <Sheet open={isWorkSheetOpen} onOpenChange={(open) => {
                        setIsWorkSheetOpen(open);
                        if (!open) setEditingWork(null);
                    }}>
                        <SheetTrigger asChild>
                            <Button onClick={handleNewWork} size="sm" className="gap-2 h-9 shadow-none"><Plus className="h-4 w-4" /> Add Experience</Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>{editingWork?.company ? 'Edit Experience' : 'New Experience'}</SheetTitle>
                                <SheetDescription>
                                    Add details about your professional background.
                                </SheetDescription>
                            </SheetHeader>
                            {editingWork && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input 
                                                id="company" 
                                                value={editingWork.company} 
                                                onChange={(e) => setEditingWork({...editingWork, company: e.target.value})}
                                                placeholder="e.g. Acme Corp"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logo">Company Initials/Logo</Label>
                                            <Input 
                                                id="logo" 
                                                value={editingWork.logo} 
                                                onChange={(e) => setEditingWork({...editingWork, logo: e.target.value})}
                                                placeholder="e.g. AC"
                                                maxLength={2}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role Title</Label>
                                        <Input 
                                            id="role" 
                                            value={editingWork.role} 
                                            onChange={(e) => setEditingWork({...editingWork, role: e.target.value})}
                                            placeholder="e.g. Senior Product Manager"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Start Date</Label>
                                            <Input 
                                                id="startDate" 
                                                type="date"
                                                value={editingWork.startDate} 
                                                onChange={(e) => setEditingWork({...editingWork, startDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">End Date</Label>
                                            <div className="flex gap-2">
                                              <Input 
                                                  id="endDate" 
                                                  type="date"
                                                  value={editingWork.endDate === "Present" ? "" : editingWork.endDate} 
                                                  onChange={(e) => setEditingWork({...editingWork, endDate: e.target.value})}
                                                  disabled={editingWork.endDate === "Present"}
                                              />
                                              <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                  id="present" 
                                                  checked={editingWork.endDate === "Present"}
                                                  onCheckedChange={(checked) => setEditingWork({...editingWork, endDate: checked ? "Present" : ""})}
                                                />
                                                <label
                                                  htmlFor="present"
                                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                  Present
                                                </label>
                                              </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            value={editingWork.description} 
                                            onChange={(e) => setEditingWork({...editingWork, description: e.target.value})}
                                            placeholder="Brief description of your responsibilities and achievements..."
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end gap-2 border-t mt-6">
                                        <Button variant="outline" onClick={() => setIsWorkSheetOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSaveWork}>Save Experience</Button>
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('company')}>
                        <div className="flex items-center gap-2">
                          Company
                          {sortConfig?.key === 'company' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('role')}>
                        <div className="flex items-center gap-2">
                          Role
                          {sortConfig?.key === 'role' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('startDate')}>
                        <div className="flex items-center gap-2">
                          Start Date
                          {sortConfig?.key === 'startDate' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('endDate')}>
                        <div className="flex items-center gap-2">
                          End Date
                          {sortConfig?.key === 'endDate' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWork.map((work) => (
                      <TableRow key={work.id} className="group cursor-pointer hover:bg-muted/50" onClick={() => handleEditWork(work)}>
                        <TableCell>
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                             {work.logo || work.company.substring(0, 2).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{work.company}</TableCell>
                        <TableCell>{work.role}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {work.startDate}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {work.endDate === "Present" ? <Badge variant="secondary" className="font-normal text-xs">Present</Badge> : work.endDate}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">
                          {work.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditWork(work); }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteWork(work.id, e)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWork.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No work experience found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "writing" && isWriting && editingArticle && (
            <div className="animate-in fade-in-50 slide-in-from-right-2 duration-300 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Button variant="ghost" size="sm" onClick={() => { setIsWriting(false); setEditingArticle(null); }} className="gap-2 pl-0 hover:pl-2 transition-all text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-3">
                   <Button size="sm" onClick={handleSaveArticle} className="h-7 text-xs">Save</Button>
                   <Separator orientation="vertical" className="h-4" />
                   <span className="text-xs text-muted-foreground">
                      {editingArticle.content.split(/\s/g).length} words
                   </span>
                   <Separator orientation="vertical" className="h-4" />
                   <span className="text-xs text-muted-foreground">
                      {editingArticle.status === "Published" ? "Published" : "Draft"}
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                  <Textarea 
                    className="text-3xl md:text-4xl font-bold tracking-tight h-auto min-h-[1.5em] border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 bg-transparent shadow-none rounded-none p-0 leading-tight resize-none overflow-hidden text-primary" 
                    placeholder="Untitled" 
                    value={editingArticle.title}
                    onChange={(e) => {
                      setEditingArticle({...editingArticle, title: e.target.value});
                      // Auto-resize height
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    rows={1}
                  />
                  
                  <Editor 
                    content={editingArticle.content} 
                    onChange={(html) => setEditingArticle({...editingArticle, content: html})}
                  />
              </div>

              {/* Settings Drawer/Panel */}
              <div className="mt-32 border-t pt-12 grid grid-cols-1 md:grid-cols-3 gap-16 opacity-40 hover:opacity-100 transition-all duration-500 ease-in-out group">
                  <div className="space-y-6">
                     <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                        <Settings className="h-4 w-4" />
                        Publishing
                     </div>
                     <div className="space-y-5">
                        <div className="flex items-center justify-between group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Status</Label>
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingArticle({...editingArticle, status: editingArticle.status === "Published" ? "Draft" : "Published"})}>
                            <Badge variant={editingArticle.status === "Published" ? "default" : "outline"} className="font-normal">
                              {editingArticle.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2 group/item p-2 -mx-2 rounded-md hover:bg-secondary/40 transition-colors">
                          <Label className="text-xs text-muted-foreground font-normal">Publish Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"ghost"}
                                className={cn(
                                  "h-8 w-full justify-start text-left font-normal text-xs p-0 shadow-none bg-transparent hover:bg-transparent hover:text-foreground",
                                  !editingArticle.date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
                                {editingArticle.date ? format(new Date(editingArticle.date), "MMMM do, yyyy") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 min-w-[300px]" align="start">
                              <Calendar
                                mode="single"
                                selected={editingArticle.date ? new Date(editingArticle.date) : undefined}
                                onSelect={(date) => date && setEditingArticle({...editingArticle, date: format(date, "yyyy-MM-dd")})}
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
                     <div className="grid grid-cols-2 gap-12">
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

          {/* Existing Tabs (Projects, Reading, Settings) - keeping them as is but ensuring they don't render when writing */}
          {!isWriting && activeTab === "reading" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Reading List</h2>
                  <p className="text-muted-foreground mt-1">Books and articles you're reading.</p>
                </div>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Book</Button>
              </div>
              <Card className="border-dashed shadow-none">
                 <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                   <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                   <h3 className="text-lg font-medium">Empty reading list</h3>
                   <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                     Keep track of books you've read or want to read.
                   </p>
                   <Button variant="outline">Add Book</Button>
                 </CardContent>
               </Card>
            </div>
          )}

          {!isWriting && activeTab === "media" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
                  <p className="text-muted-foreground mt-1">Manage your images and files.</p>
                </div>
                <Button className="gap-2"><Upload className="h-4 w-4" /> Upload</Button>
              </div>
              <Card className="border-dashed shadow-none">
                 <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                   <ImageIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                   <h3 className="text-lg font-medium">No media files</h3>
                   <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                     Upload images and files to use in your articles and projects.
                   </p>
                   <Button variant="outline">Upload Files</Button>
                 </CardContent>
               </Card>
            </div>
          )}

          {!isWriting && activeTab === "seo" && (
             <div className="space-y-6">
               <div>
                 <h2 className="text-2xl font-bold tracking-tight">SEO & Metadata</h2>
                 <p className="text-muted-foreground mt-1">Configure site-wide SEO settings.</p>
               </div>
               <Card>
                 <CardHeader>
                   <CardTitle>Global Settings</CardTitle>
                   <CardDescription>Default metadata for your entire site.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label>Site Title</Label>
                     <Input defaultValue={profile.name} />
                   </div>
                   <div className="space-y-2">
                     <Label>Site Description</Label>
                     <Textarea defaultValue={profile.bio} />
                   </div>
                   <div className="space-y-2">
                     <Label>Twitter Handle</Label>
                     <Input defaultValue="@username" />
                   </div>
                   <Button>Save SEO Settings</Button>
                 </CardContent>
               </Card>
             </div>
           )}

          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Home Page Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your profile and home page content.</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>This will be displayed on your home page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <Button variant="outline">Change Photo</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Job Title</Label>
                      <Input 
                        id="role" 
                        value={formData.jobTitle} 
                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={formData.bio} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                        className="h-24"
                      />
                    </div>

                    <div className="space-y-2">
                       <Label>Social Links</Label>
                       <div className="grid gap-3">
                         <Input 
                           placeholder="Email" 
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                         />
                         <Input 
                           placeholder="Twitter URL" 
                           value={formData.twitter}
                           onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                         />
                         <Input 
                           placeholder="GitHub URL" 
                           value={formData.github}
                           onChange={(e) => setFormData({...formData, github: e.target.value})}
                         />
                       </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}