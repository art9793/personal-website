import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, PenTool, FolderGit2, BookOpen, Settings, 
  LogOut, Image as ImageIcon, Save, Plus, Search, Globe,
  ChevronRight, Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/admin/editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleSave = () => {
    toast({
      title: "Changes Saved",
      description: "Your content has been updated successfully.",
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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b bg-background/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <div>
              <div className="font-semibold text-sm">Arshad Teli</div>
              <div className="text-xs text-muted-foreground">Admin Console</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          <div className="space-y-1">
            <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content</h4>
            <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
            <SidebarItem icon={PenTool} label="Writing" id="writing" />
            <SidebarItem icon={FolderGit2} label="Projects" id="projects" />
            <SidebarItem icon={BookOpen} label="Reading List" id="reading" />
          </div>

          <div className="space-y-1">
             <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">System</h4>
             <SidebarItem icon={ImageIcon} label="Media Library" id="media" />
             <SidebarItem icon={Globe} label="SEO & Metadata" id="seo" />
             <SidebarItem icon={Settings} label="Settings" id="settings" />
          </div>
        </div>

        <div className="p-4 border-t bg-background/50 backdrop-blur">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
            <span className="font-medium text-foreground capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">View Site</Button>
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
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
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 drafts pending
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
                   <Button onClick={() => setActiveTab("writing")} className="gap-2">
                     <PenTool className="h-4 w-4" /> Write Article
                   </Button>
                   <Button onClick={() => setActiveTab("projects")} variant="outline" className="gap-2">
                     <FolderGit2 className="h-4 w-4" /> Add Project
                   </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "writing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Writing</h2>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>
              </div>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-6">
                   <Card>
                     <CardHeader>
                       <CardTitle>Editor</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       <div className="space-y-2">
                         <Label>Title</Label>
                         <Input className="text-xl font-semibold h-12" placeholder="Article Title" defaultValue="Designing for AI" />
                       </div>
                       <Editor content="<h2>Introduction</h2><p>Start writing your amazing content here...</p>" />
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
                          <Badge variant="secondary">Draft</Badge>
                          <Badge>Published</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Publish Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Slug</Label>
                        <Input placeholder="url-slug" />
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

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                 <p className="text-muted-foreground">Manage global site settings and profile.</p>
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
                         <Input defaultValue="Arshad Teli" />
                       </div>
                       <div className="space-y-2">
                         <Label>Job Title</Label>
                         <Input defaultValue="Product Manager" />
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <Label>Bio</Label>
                       <Textarea className="h-24" defaultValue="Hey there! I’m a Product Manager & Designer currently working at a UK based fintech!" />
                     </div>

                     <div className="space-y-2">
                       <Label>Email</Label>
                       <Input defaultValue="art9793@gmail.com" />
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
                     <Input defaultValue="https://x.com/art9793" />
                   </div>
                   <div className="space-y-2">
                     <Label>GitHub URL</Label>
                     <Input defaultValue="https://github.com/art9793" />
                   </div>
                   <div className="space-y-2">
                     <Label>LinkedIn URL</Label>
                     <Input placeholder="https://linkedin.com/in/..." />
                   </div>
                 </CardContent>
               </Card>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {(activeTab === "projects" || activeTab === "reading" || activeTab === "media" || activeTab === "seo") && (
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
