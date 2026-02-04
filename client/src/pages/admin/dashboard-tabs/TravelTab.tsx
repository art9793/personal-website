import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, Plus, Edit2, Trash2, ArrowUpDown, Loader2,
  Plane, Globe, Calendar as CalendarIcon, Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMonthYear } from "@/lib/utils";
import { useTravelHistory, TravelHistoryEntry } from "@/lib/content-hooks";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { getCountryByCode } from "@/lib/countries";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

export function TravelTab() {
  const { toast } = useToast();
  const {
    travelHistory,
    isLoading: isTravelLoading,
    addTravelHistory,
    updateTravelHistory,
    deleteTravelHistory
  } = useTravelHistory();

  const [isTravelSheetOpen, setIsTravelSheetOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<{
    id?: number;
    countryCode: string;
    countryName: string;
    continent: string;
    visitDate: string;
    notes: string;
    isHomeCountry: boolean;
  } | null>(null);
  const [isSavingTravel, setIsSavingTravel] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredTravel = useMemo(() => {
    let result = [...travelHistory];

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(entry =>
        entry.countryName.toLowerCase().includes(query) ||
        entry.countryCode.toLowerCase().includes(query) ||
        (entry.notes && entry.notes.toLowerCase().includes(query))
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

    if (!sortConfig) {
      result.sort((a, b) => {
        if (a.isHomeCountry && !b.isHomeCountry) return -1;
        if (!a.isHomeCountry && b.isHomeCountry) return 1;
        const aDate = a.visitDate || "";
        const bDate = b.visitDate || "";
        return bDate.localeCompare(aDate);
      });
    }

    return result;
  }, [travelHistory, filterQuery, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNewTravel = () => {
    setEditingTravel({
      countryCode: "",
      countryName: "",
      continent: "",
      visitDate: "",
      notes: "",
      isHomeCountry: false
    });
    setIsTravelSheetOpen(true);
  };

  const handleEditTravel = (entry: TravelHistoryEntry) => {
    const country = getCountryByCode(entry.countryCode);
    setEditingTravel({
      id: entry.id,
      countryCode: entry.countryCode,
      countryName: entry.countryName,
      continent: country?.continent || "",
      visitDate: entry.visitDate || "",
      notes: entry.notes || "",
      isHomeCountry: entry.isHomeCountry || false
    });
    setIsTravelSheetOpen(true);
  };

  const handleSaveTravel = async () => {
    if (!editingTravel || isSavingTravel) return;

    if (!editingTravel.countryCode) {
      toast({ title: "Validation Error", description: "Please select a country.", variant: "destructive" });
      return;
    }

    if (!editingTravel.isHomeCountry && !editingTravel.visitDate) {
      toast({ title: "Validation Error", description: "Please select a visit date or mark as home country.", variant: "destructive" });
      return;
    }

    const visitDateFormatted = editingTravel.visitDate
      ? editingTravel.visitDate.substring(0, 7)
      : undefined;

    const data = {
      countryCode: editingTravel.countryCode,
      countryName: editingTravel.countryName,
      visitDate: editingTravel.isHomeCountry ? undefined : visitDateFormatted,
      notes: editingTravel.notes || undefined,
      isHomeCountry: editingTravel.isHomeCountry
    };

    setIsSavingTravel(true);
    try {
      if (editingTravel.id) {
        await updateTravelHistory(editingTravel.id, data);
      } else {
        await addTravelHistory(data);
      }

      toast({
        title: editingTravel.id ? "Visit Updated" : "Visit Added",
        description: `${editingTravel.countryName} has been saved successfully.`,
      });
      setIsTravelSheetOpen(false);
      setEditingTravel(null);
    } catch (error) {
      console.error("Error saving travel entry:", error);
      toast({ title: "Error", description: "Failed to save travel entry. Please try again.", variant: "destructive" });
    } finally {
      setIsSavingTravel(false);
    }
  };

  const handleDeleteTravel = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this travel entry?")) {
      try {
        await deleteTravelHistory(id);
        toast({ title: "Travel Entry Deleted", description: "The entry has been permanently removed.", variant: "destructive" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete travel entry.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-500">
      <div className="hidden md:block mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Travel History</h2>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Filter countries..."
                className="pl-8 h-9 text-sm"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
            />
        </div>
        <Sheet open={isTravelSheetOpen} onOpenChange={(open) => {
            setIsTravelSheetOpen(open);
            if (!open) setEditingTravel(null);
        }}>
            <SheetTrigger asChild>
                <Button onClick={handleNewTravel} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> Add Visit</Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>{editingTravel?.id ? 'Edit Visit' : 'Add New Visit'}</SheetTitle>
                        <SheetDescription>
                            Record a country you've visited or mark your home country.
                        </SheetDescription>
                    </SheetHeader>
                    {editingTravel && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Country <span className="text-destructive">*</span></Label>
                                <CountryCombobox
                                    value={editingTravel.countryCode}
                                    onSelect={(country) => {
                                        setEditingTravel({
                                            ...editingTravel,
                                            countryCode: country.code,
                                            countryName: country.name,
                                            continent: country.continent
                                        });
                                    }}
                                />
                                {!editingTravel.countryCode && (
                                    <p className="text-xs text-muted-foreground">Please select a country</p>
                                )}
                            </div>

                            {editingTravel.continent && (
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Continent</Label>
                                    <div>
                                        <Badge variant="secondary" className="text-sm">
                                            {editingTravel.continent}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 p-4 bg-muted/30 border border-border/50 rounded-lg">
                                <Checkbox
                                    id="homeCountry"
                                    checked={editingTravel.isHomeCountry}
                                    onCheckedChange={(checked) => setEditingTravel({
                                        ...editingTravel,
                                        isHomeCountry: checked === true,
                                        visitDate: checked ? "" : editingTravel.visitDate
                                    })}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="homeCountry"
                                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                                    >
                                        <Home className="h-4 w-4" />
                                        This is my home country
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Home country won't have a visit date
                                    </p>
                                </div>
                            </div>

                            {!editingTravel.isHomeCountry && (
                                <div className="space-y-2">
                                    <Label>Visit Date <span className="text-destructive">*</span></Label>
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                        <MonthYearPicker
                                            label=""
                                            value={editingTravel.visitDate}
                                            onChange={(date) => setEditingTravel({...editingTravel, visitDate: date})}
                                        />
                                    </div>
                                    {!editingTravel.visitDate && (
                                        <p className="text-xs text-muted-foreground">Please select a visit date or mark as home country</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={editingTravel.notes}
                                    onChange={(e) => setEditingTravel({...editingTravel, notes: e.target.value})}
                                    placeholder="Any memorable experiences or details..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <Button variant="outline" onClick={() => setIsTravelSheetOpen(false)} disabled={isSavingTravel}>Cancel</Button>
                                <Button
                                    onClick={handleSaveTravel}
                                    disabled={isSavingTravel || !editingTravel.countryCode || (!editingTravel.isHomeCountry && !editingTravel.visitDate)}
                                >
                                    {isSavingTravel ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingTravel.id ? 'Save Changes' : 'Add Visit'
                                    )}
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
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('countryName')}>
                <div className="flex items-center gap-2">
                  Country
                  {(sortConfig?.key as string) === 'countryName' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead>Continent</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('visitDate')}>
                <div className="flex items-center gap-2">
                  Visit Date
                  {(sortConfig?.key as string) === 'visitDate' && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTravelLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading travel history...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTravel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No travel history found. Add your first visit!
                </TableCell>
              </TableRow>
            ) : (
              filteredTravel.map((entry) => {
                const country = getCountryByCode(entry.countryCode);
                return (
                  <TableRow
                    key={entry.id}
                    className="group cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditTravel(entry)}
                  >
                    <TableCell>
                      <span className="text-2xl">{country?.flag || "🏳️"}</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {entry.countryName}
                        {entry.isHomeCountry && (
                          <Badge variant="outline" className="text-xs font-normal">
                            <Home className="h-3 w-3 mr-1" />
                            Home
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs">
                        {country?.continent || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.isHomeCountry ? (
                        <span className="text-muted-foreground/60">—</span>
                      ) : (
                        formatMonthYear(entry.visitDate || "") || "—"
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                      {entry.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleEditTravel(entry); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteTravel(entry.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isTravelLoading && travelHistory.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            <span>{new Set(travelHistory.filter(t => !t.isHomeCountry).map(t => t.countryCode)).size} countries visited</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{new Set(travelHistory.map(t => getCountryByCode(t.countryCode)?.continent).filter(Boolean)).size} continents</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{travelHistory.filter(t => !t.isHomeCountry).length} total visits</span>
          </div>
        </div>
      )}
    </div>
  );
}
