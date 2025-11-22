import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, PenTool, FolderGit2, BookOpen, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Content Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your website content from one place.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-muted-foreground mr-2">Logged in as art9793@gmail.com</span>
           <Button variant="outline" size="sm">Sign out</Button>
        </div>
      </div>

      <Tabs defaultValue="writing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-lg p-1 bg-secondary/50">
          <TabsTrigger value="writing" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex gap-2 items-center">
            <PenTool className="h-4 w-4" /> Writing
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex gap-2 items-center">
            <FolderGit2 className="h-4 w-4" /> Projects
          </TabsTrigger>
          <TabsTrigger value="reading" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex gap-2 items-center">
             <BookOpen className="h-4 w-4" /> Reading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="writing" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>New Article</CardTitle>
                <CardDescription>Write and publish a new blog post.</CardDescription>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Publish
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter article title..." className="text-lg font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="my-article-slug" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea id="content" placeholder="Start writing..." className="min-h-[400px] font-mono text-sm leading-relaxed" />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Articles</h3>
            <div className="rounded-md border bg-card">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-secondary/20 transition-colors">
                    <div>
                       <div className="font-medium">Designing for AI</div>
                       <div className="text-sm text-muted-foreground">Published Oct 2024 • 2.4k views</div>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm">Edit</Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Project</CardTitle>
                <CardDescription>Showcase a new project.</CardDescription>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-title">Project Name</Label>
                  <Input id="p-title" placeholder="e.g. Campsite" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-link">Link</Label>
                  <Input id="p-link" placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-desc">Description</Label>
                <Input id="p-desc" placeholder="Short description of the project..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-tags">Tags</Label>
                <Input id="p-tags" placeholder="React, Node.js, Design (comma separated)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-color">Color Class</Label>
                <Input id="p-color" placeholder="bg-orange-500 text-orange-50" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reading" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Book</CardTitle>
                <CardDescription>Track what you're reading.</CardDescription>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Plus className="h-4 w-4" /> Add to List
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="b-title">Book Title</Label>
                  <Input id="b-title" placeholder="e.g. The Design of Everyday Things" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-author">Author</Label>
                  <Input id="b-author" placeholder="Don Norman" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="b-year">Year Read</Label>
                  <Input id="b-year" placeholder="2024" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="b-rating">Rating</Label>
                  <Input id="b-rating" placeholder="5/5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-link">Link</Label>
                  <Input id="b-link" placeholder="Amazon/Goodreads link" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
