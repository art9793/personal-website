import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, Plus, Briefcase, Edit2, Trash2, Upload,
  ArrowUpDown, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMonthYear } from "@/lib/utils";
import { useContent, WorkExperience } from "@/lib/content-context";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

export function WorkTab() {
  const { toast } = useToast();
  const { workHistory, addWork, updateWork, deleteWork } = useContent();

  const [isWorkSheetOpen, setIsWorkSheetOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [isSavingWork, setIsSavingWork] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredWork = useMemo(() => {
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
  }, [workHistory, filterQuery, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNewWork = () => {
    const newWork: Partial<WorkExperience> = {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
      logo: ""
    };
    setEditingWork(newWork as WorkExperience);
    setIsWorkSheetOpen(true);
  };

  const handleEditWork = (work: WorkExperience) => {
    setEditingWork(work);
    setIsWorkSheetOpen(true);
  };

  const handleSaveWork = async () => {
    if (!editingWork || isSavingWork) return;

    if (!editingWork.company?.trim()) {
      toast({ title: "Validation Error", description: "Please enter a company name.", variant: "destructive" });
      return;
    }
    if (!editingWork.role?.trim()) {
      toast({ title: "Validation Error", description: "Please enter a role title.", variant: "destructive" });
      return;
    }
    if (!editingWork.startDate) {
      toast({ title: "Validation Error", description: "Please select a start date.", variant: "destructive" });
      return;
    }
    if (!editingWork.endDate || (editingWork.endDate !== "Present" && !editingWork.endDate.trim())) {
      toast({ title: "Validation Error", description: "Please either check 'I currently work here' or select an end date.", variant: "destructive" });
      return;
    }

    setIsSavingWork(true);
    try {
      if (editingWork.id && workHistory.some(w => w.id === editingWork.id)) {
        await updateWork(editingWork.id, editingWork);
      } else {
        await addWork(editingWork);
      }

      toast({
        title: "Work Experience Saved",
        description: `"${editingWork.company}" has been saved successfully.`,
      });
      setIsWorkSheetOpen(false);
      setEditingWork(null);
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast({ title: "Error", description: "Failed to save work experience. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingWork(false);
    }
  };

  const handleDeleteWork = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this work experience?")) {
      try {
        await deleteWork(id);
        toast({ title: "Work Experience Deleted", description: "The entry has been permanently removed.", variant: "destructive" });
      } catch (error) {
        console.error("Error deleting work experience:", error);
        toast({ title: "Error", description: "Failed to delete work experience. Please try again.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="hidden md:block mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Work History</h2>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="relative w-full md:w-64">
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
                <Button onClick={handleNewWork} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Experience</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>{editingWork?.company ? 'Edit Experience' : 'New Experience'}</SheetTitle>
                        <SheetDescription>
                            Add details about your professional background.
                        </SheetDescription>
                    </SheetHeader>
                    {editingWork && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        value={editingWork.company}
                                        onChange={(e) => setEditingWork({...editingWork, company: e.target.value})}
                                        placeholder="e.g. Acme Corp"
                                        className="text-base"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role Title</Label>
                                    <Input
                                        id="role"
                                        value={editingWork.role}
                                        onChange={(e) => setEditingWork({...editingWork, role: e.target.value})}
                                        placeholder="e.g. Senior Product Manager"
                                        className="text-base"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Company Logo</h3>
                                    <p className="text-xs text-muted-foreground">Optional - appears in your work history</p>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                    <div className="h-16 w-16 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden flex-shrink-0">
                                        {editingWork.logo ? (
                                            <img
                                                src={editingWork.logo}
                                                alt="Company logo"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <Input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditingWork({...editingWork, logo: reader.result as string});
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="logo-upload"
                                            className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {editingWork.logo ? 'Change' : 'Upload'}
                                        </Label>
                                        {editingWork.logo && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="default"
                                                onClick={() => setEditingWork({...editingWork, logo: ""})}
                                                className="gap-2 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Employment Period</h3>
                                    <p className="text-xs text-muted-foreground">When did you work here?</p>
                                </div>
                                <div className="space-y-4 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                    <MonthYearPicker
                                        label="Start Date"
                                        value={editingWork.startDate}
                                        onChange={(date) => setEditingWork({...editingWork, startDate: date})}
                                    />

                                    {editingWork.endDate !== "Present" && (
                                        <MonthYearPicker
                                            label="End Date"
                                            value={editingWork.endDate === "Present" ? "" : editingWork.endDate}
                                            onChange={(date) => setEditingWork({...editingWork, endDate: date})}
                                        />
                                    )}

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="present"
                                            checked={editingWork.endDate === "Present"}
                                            onCheckedChange={(checked) => setEditingWork({...editingWork, endDate: checked ? "Present" : ""})}
                                        />
                                        <label
                                            htmlFor="present"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            I currently work here
                                        </label>
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
                                    className="min-h-[140px] text-base"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <Button variant="outline" onClick={() => setIsWorkSheetOpen(false)} disabled={isSavingWork}>Cancel</Button>
                                <Button onClick={handleSaveWork} disabled={isSavingWork || !editingWork?.company?.trim() || !editingWork?.role?.trim()}>
                                    {isSavingWork ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Experience'}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
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
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                     <Briefcase className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{work.company}</TableCell>
                <TableCell>{work.role}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatMonthYear(work.startDate) || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {work.endDate === "Present"
                    ? <Badge variant="secondary" className="font-normal text-xs">Present</Badge>
                    : formatMonthYear(work.endDate) || '—'}
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
  );
}
