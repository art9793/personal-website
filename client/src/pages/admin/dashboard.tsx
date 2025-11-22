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
  ChevronRight, Upload, Trash2, Edit2, ArrowLeft, Eye, CheckCircle,
  MoreHorizontal, Clock, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/admin/editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useContent, Article } from "@/lib/content-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, articles, updateProfile, addArticle, updateArticle, deleteArticle } = useContent();
  
  const [formData, setFormData] = useState(profile);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  // Reset writing state when changing tabs
  useEffect(() => {
    if (activeTab !== 'writing') {
      setIsWriting(false);
      setEditingArticle(null);
    }
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
      views: "0"
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

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => (
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
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b bg-background/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm truncate max-w-[140px]">{profile.name}</div>
              <div className="text-xs text-muted-foreground">Admin Console</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div className="space-y-1">
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h4>
            <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
            <SidebarItem icon={Settings} label="Home Page" id="settings" />
            <SidebarItem icon={PenTool} label="Writing" id="writing" />
            <SidebarItem icon={FolderGit2} label="Projects" id="projects" />
            <SidebarItem icon={BookOpen} label="Reading List" id="reading" />
          </div>

          <div className="space-y-1">
             <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</h4>
             <SidebarItem icon={ImageIcon} label="Media Library" id="media" />
             <SidebarItem icon={Globe} label="SEO & Metadata" id="seo" />
          </div>
        </div>

        <div className="p-4 border-t bg-background/50 backdrop-blur">
          <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Header */}
        <header className="h-16 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground capitalize">{activeTab === 'settings' ? 'Home Page' : activeTab}</span>
            {isWriting && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Editor</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>View Site</Button>
            {activeTab === "settings" && <Button size="sm" onClick={handleSaveProfile}>Save Changes</Button>}
            {isWriting && <Button size="sm" onClick={handleSaveArticle}>Save Article</Button>}
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto space-y-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,345</div>
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articles.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {articles.filter(a => a.status === "Draft").length} drafts pending
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All active
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                   <Button onClick={() => { setActiveTab("writing"); handleNewPost(); }} className="gap-2">
                     <PenTool className="h-4 w-4" /> Write Article
                   </Button>
                   <Button onClick={() => setActiveTab("projects")} variant="outline" className="gap-2">
                     <FolderGit2 className="h-4 w-4" /> Add Project
                   </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "writing" && !isWriting && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Writing</h2>
                  <p className="text-muted-foreground mt-1">Manage your articles and thoughts.</p>
                </div>
                <Button onClick={handleNewPost} className="gap-2 shadow-sm"><Plus className="h-4 w-4" /> New Post</Button>
              </div>

              <Tabs defaultValue="all" className="w-full space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <TabsList className="grid w-[300px] grid-cols-3 bg-muted/50">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="draft">Drafts</TabsTrigger>
                  </TabsList>
                  
                  <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search articles..." className="pl-8 bg-background" />
                  </div>
                </div>

                <TabsContent value="all" className="space-y-4 mt-0">
                  {articles.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-xl bg-muted/10">
                       <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                         <PenTool className="h-6 w-6 text-primary" />
                       </div>
                       <h3 className="text-lg font-semibold">No articles yet</h3>
                       <p className="text-muted-foreground text-sm max-w-sm text-center mt-2 mb-6">
                         Start writing your first article to share your thoughts with the world.
                       </p>
                       <Button onClick={handleNewPost}>Create Article</Button>
                     </div>
                   ) : (
                     articles.map((article) => (
                       <div 
                         key={article.id} 
                         onClick={() => handleEditPost(article)}
                         className="group flex items-start justify-between p-6 border rounded-xl hover:border-primary/20 hover:shadow-sm hover:bg-secondary/10 transition-all cursor-pointer bg-card"
                       >
                          <div className="space-y-3 flex-1 pr-8">
                             <div className="flex items-center gap-3">
                                <Badge 
                                  variant={article.status === "Published" ? "default" : "secondary"} 
                                  className={cn(
                                    "text-[10px] h-5 px-2 font-medium uppercase tracking-wider",
                                    article.status === "Published" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                                  )}
                                >
                                  {article.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {article.date}
                                </span>
                             </div>
                             
                             <div>
                               <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
                                 {article.title || "Untitled Draft"}
                               </h3>
                               <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                 {article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) || "No content preview available..."}
                               </p>
                             </div>

                             <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1">
                               <span className="flex items-center gap-1.5">
                                 <Clock className="h-3.5 w-3.5" /> {getReadingTime(article.content)}
                               </span>
                               <span className="flex items-center gap-1.5">
                                 <Eye className="h-3.5 w-3.5" /> {article.views} views
                               </span>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                             <Button 
                               variant="ghost" 
                               size="sm"
                               className={cn("text-xs", article.status === "Published" ? "text-muted-foreground hover:text-destructive" : "text-primary hover:text-primary/80")}
                               onClick={(e) => toggleArticleStatus(article, e)}
                             >
                               {article.status === "Published" ? "Unpublish" : "Publish"}
                             </Button>
                             
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                   <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                   <Edit2 className="mr-2 h-4 w-4" /> Edit
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={(e) => toggleArticleStatus(article, e)}>
                                   {article.status === "Published" ? <><ArrowLeft className="mr-2 h-4 w-4" /> Unpublish</> : <><CheckCircle className="mr-2 h-4 w-4" /> Publish</>}
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                       </div>
                     ))
                   )}
                </TabsContent>
                
                <TabsContent value="published" className="space-y-4 mt-0">
                  {articles.filter(a => a.status === "Published").map((article) => (
                       <div 
                         key={article.id} 
                         onClick={() => handleEditPost(article)}
                         className="group flex items-start justify-between p-6 border rounded-xl hover:border-primary/20 hover:shadow-sm hover:bg-secondary/10 transition-all cursor-pointer bg-card"
                       >
                          <div className="space-y-3 flex-1 pr-8">
                             <div className="flex items-center gap-3">
                                <Badge 
                                  variant="default" 
                                  className="text-[10px] h-5 px-2 font-medium uppercase tracking-wider bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                >
                                  {article.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {article.date}
                                </span>
                             </div>
                             
                             <div>
                               <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
                                 {article.title || "Untitled Draft"}
                               </h3>
                               <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                 {article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) || "No content preview available..."}
                               </p>
                             </div>

                             <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1">
                               <span className="flex items-center gap-1.5">
                                 <Clock className="h-3.5 w-3.5" /> {getReadingTime(article.content)}
                               </span>
                               <span className="flex items-center gap-1.5">
                                 <Eye className="h-3.5 w-3.5" /> {article.views} views
                               </span>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                   <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                   <Edit2 className="mr-2 h-4 w-4" /> Edit
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={(e) => toggleArticleStatus(article, e)}>
                                   <ArrowLeft className="mr-2 h-4 w-4" /> Unpublish
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                       </div>
                   ))}
                   {articles.filter(a => a.status === "Published").length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No published articles yet.</div>
                   )}
                </TabsContent>

                <TabsContent value="draft" className="space-y-4 mt-0">
                  {articles.filter(a => a.status === "Draft").map((article) => (
                       <div 
                         key={article.id} 
                         onClick={() => handleEditPost(article)}
                         className="group flex items-start justify-between p-6 border rounded-xl hover:border-primary/20 hover:shadow-sm hover:bg-secondary/10 transition-all cursor-pointer bg-card"
                       >
                          <div className="space-y-3 flex-1 pr-8">
                             <div className="flex items-center gap-3">
                                <Badge 
                                  variant="secondary" 
                                  className="text-[10px] h-5 px-2 font-medium uppercase tracking-wider bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                                >
                                  {article.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {article.date}
                                </span>
                             </div>
                             
                             <div>
                               <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
                                 {article.title || "Untitled Draft"}
                               </h3>
                               <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                 {article.content.replace(/<[^>]*>?/gm, '').substring(0, 160) || "No content preview available..."}
                               </p>
                             </div>

                             <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1">
                               <span className="flex items-center gap-1.5">
                                 <Clock className="h-3.5 w-3.5" /> {getReadingTime(article.content)}
                               </span>
                               <span className="flex items-center gap-1.5">
                                 <Eye className="h-3.5 w-3.5" /> {article.views} views
                               </span>
                             </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                             <Button 
                               variant="ghost" 
                               size="sm"
                               className="text-xs text-primary hover:text-primary/80"
                               onClick={(e) => toggleArticleStatus(article, e)}
                             >
                               Publish
                             </Button>
                             
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                   <MoreHorizontal className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                   <Edit2 className="mr-2 h-4 w-4" /> Edit
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={(e) => toggleArticleStatus(article, e)}>
                                   <CheckCircle className="mr-2 h-4 w-4" /> Publish
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                       </div>
                   ))}
                   {articles.filter(a => a.status === "Draft").length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No drafts.</div>
                   )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "writing" && isWriting && editingArticle && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-2 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => { setIsWriting(false); setEditingArticle(null); }} className="gap-2 pl-0 hover:pl-2 transition-all">
                  <ArrowLeft className="h-4 w-4" /> Back to Articles
                </Button>
              </div>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-6">
                   <Card className="border-none shadow-sm">
                     <CardContent className="p-0 space-y-6">
                       <div className="space-y-2">
                         <Input 
                           className="text-4xl font-bold h-auto border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50" 
                           placeholder="Article Title..." 
                           value={editingArticle.title}
                           onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                         />
                       </div>
                       <Editor 
                         content={editingArticle.content} 
                         onChange={(html) => setEditingArticle({...editingArticle, content: html})}
                       />
                     </CardContent>
                   </Card>
                </div>

                <div className="col-span-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Publishing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Status</Label>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={editingArticle.status === "Published" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => setEditingArticle({...editingArticle, status: editingArticle.status === "Published" ? "Draft" : "Published"})}
                          >
                            {editingArticle.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Publish Date</Label>
                        <Input 
                          type="date" 
                          value={editingArticle.date}
                          onChange={(e) => setEditingArticle({...editingArticle, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Slug</Label>
                        <Input 
                          placeholder="url-slug" 
                          value={editingArticle.slug}
                          onChange={(e) => setEditingArticle({...editingArticle, slug: e.target.value})}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">SEO & Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <Label className="text-xs">Description</Label>
                         <Textarea className="h-20 text-xs" placeholder="Meta description for SEO..." />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs">Tags</Label>
                         <Input placeholder="Design, AI, Future" />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs">Cover Image</Label>
                         <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer">
                            <Upload className="h-6 w-6 mb-2" />
                            <span className="text-xs">Upload Image</span>
                         </div>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Existing Tabs (Projects, Reading, Settings) - keeping them as is but ensuring they don't render when writing */}
          {!isWriting && activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                    { title: "Campsite", desc: "Communication platform for teams", tags: ["React", "Node"] },
                    { title: "Staff Design", desc: "Interviews with designers", tags: ["Content"] },
                    { title: "Details", desc: "Design details collection", tags: ["Design"] },
                    { title: "Spectrum", desc: "Community platform", tags: ["Open Source"] }
                 ].map((project, i) => (
                   <Card key={i} className="group relative overflow-hidden">
                     <CardHeader>
                       <CardTitle>{project.title}</CardTitle>
                       <CardDescription>{project.desc}</CardDescription>
                     </CardHeader>
                     <CardContent>
                       <div className="flex gap-2">
                         {project.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                       </div>
                     </CardContent>
                     <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                     </div>
                   </Card>
                 ))}
              </div>
            </div>
          )}

          {!isWriting && activeTab === "reading" && (
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Reading List</h2>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Book</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bookshelf</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {[
                      { title: "The Design of Everyday Things", author: "Don Norman", year: "2024", rating: "5/5" },
                      { title: "Shape Up", author: "Ryan Singer", year: "2024", rating: "4/5" },
                      { title: "Build", author: "Tony Fadell", year: "2023", rating: "5/5" },
                    ].map((book, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-secondary/20 rounded-lg transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-8 bg-neutral-200 rounded shadow-sm flex-shrink-0" />
                          <div>
                            <div className="font-medium">{book.title}</div>
                            <div className="text-sm text-muted-foreground">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-sm text-muted-foreground">{book.year}</div>
                           <Badge variant="outline">{book.rating}</Badge>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!isWriting && activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">Home Page Content</h2>
                 <p className="text-muted-foreground">Manage your profile information displayed on the home page.</p>
               </div>
               
               <Card>
                 <CardHeader>
                   <CardTitle>Profile Information</CardTitle>
                   <CardDescription>This information is displayed on your home page.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                   <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/attached_assets/logo.jpg" />
                        <AvatarFallback>AT</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">Change Photo</Button>
                   </div>
                   
                   <div className="grid gap-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <Label>Full Name</Label>
                         <Input 
                           value={formData.name} 
                           onChange={(e) => setFormData({...formData, name: e.target.value})} 
                         />
                       </div>
                       <div className="space-y-2">
                         <Label>Job Title</Label>
                         <Input 
                           value={formData.jobTitle} 
                           onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} 
                         />
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <Label>Bio</Label>
                       <Textarea 
                         className="h-32" 
                         value={formData.bio} 
                         onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                       />
                       <p className="text-xs text-muted-foreground">Markdown supported</p>
                     </div>

                     <div className="space-y-2">
                       <Label>Email</Label>
                       <Input 
                         value={formData.email} 
                         onChange={(e) => setFormData({...formData, email: e.target.value})} 
                       />
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Social Links</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label>Twitter URL</Label>
                     <Input 
                       value={formData.twitter} 
                       onChange={(e) => setFormData({...formData, twitter: e.target.value})} 
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>GitHub URL</Label>
                     <Input 
                       value={formData.github} 
                       onChange={(e) => setFormData({...formData, github: e.target.value})} 
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>LinkedIn URL</Label>
                     <Input 
                       value={formData.linkedin} 
                       onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                       placeholder="https://linkedin.com/in/..." 
                     />
                   </div>
                 </CardContent>
               </Card>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {!isWriting && (activeTab === "media" || activeTab === "seo") && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground border-2 border-dashed rounded-xl">
              <Settings className="h-10 w-10 mb-4 opacity-20" />
              <p>This section is under construction in this prototype.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}