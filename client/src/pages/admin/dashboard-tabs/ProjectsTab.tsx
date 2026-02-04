import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Search, Plus, FolderGit2, Star, Edit2, Trash2,
  MoreHorizontal, ArrowUpDown, Loader2, Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent, Project } from "@/lib/content-context";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
  SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet";

export function ProjectsTab() {
  const { toast } = useToast();
  const { projects, addProject, updateProject, deleteProject } = useContent();

  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.tags && project.tags.toLowerCase().includes(query))
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
  }, [projects, filterQuery, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNewProject = () => {
    const newProject: Partial<Project> = {
      title: "",
      description: "",
      link: "",
      tags: "",
      status: "Active",
      featured: false
    };
    setEditingProject(newProject as Project);
    setIsProjectSheetOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectSheetOpen(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject || isSavingProject) return;

    setIsSavingProject(true);
    try {
      if (editingProject.id && projects.some(p => p.id === editingProject.id)) {
        await updateProject(editingProject.id, editingProject);
      } else {
        await addProject(editingProject);
      }

      toast({
        title: "Project Saved",
        description: `"${editingProject.title || 'Untitled'}" has been saved successfully.`,
      });
      setIsProjectSheetOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        toast({
          title: "Project Deleted",
          description: "The project has been permanently removed.",
          variant: "destructive"
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        toast({
          title: "Error",
          description: "Failed to delete project. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-500">
      <div className="hidden md:block mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="relative w-full md:w-64">
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
                <Button onClick={handleNewProject} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Project</Button>
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
                                <Button onClick={handleSaveProject} disabled={isSavingProject || !editingProject?.title?.trim()}>
                                    {isSavingProject ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Project'}
                                </Button>
                            </SheetFooter>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
      </div>

      <div className="border rounded-md bg-background overflow-hidden min-w-0">
        <div className="overflow-x-auto">
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
                                    onCheckedChange={async (checked) => {
                                        try {
                                            await updateProject(project.id, { status: checked ? "Active" : "Archived" });
                                            toast({
                                                title: `Project ${checked ? 'Activated' : 'Archived'}`,
                                                description: `"${project.title}" is now ${checked ? 'active' : 'archived'}.`,
                                            });
                                        } catch (error) {
                                            console.error("Error updating project status:", error);
                                            toast({
                                                title: "Error",
                                                description: "Failed to update project status.",
                                                variant: "destructive"
                                            });
                                        }
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
    </div>
  );
}
