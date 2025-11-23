import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  value: string; // ISO date string (yyyy-MM-dd), empty string, or invalid
  onChange: (value: string) => void; // Returns ISO date string (first of month) or empty string
  label?: string;
  placeholder?: string;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate years from 1990 to current year + 5
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1990 + 6 }, (_, i) => (currentYear + 5 - i).toString());

export function MonthYearPicker({ value, onChange, label }: MonthYearPickerProps) {
  // Normalize legacy work dates: handle "2020", "2020-09", full ISO, or invalid
  const parseValue = (val: string): { month: string; year: string } | null => {
    if (!val || val === "Present") return null;
    
    // Try to extract year and month from various formats
    // Format: "YYYY" or "YYYY-MM" or "YYYY-MM-DD"
    const yearMatch = val.match(/^(\d{4})(?:-(\d{2}))?/);
    if (yearMatch) {
      const year = yearMatch[1];
      const month = yearMatch[2] || "01"; // Default to January if month not specified
      return { month, year };
    }
    
    // Fallback: try parsing as full date
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      return {
        month: String(date.getMonth() + 1).padStart(2, "0"),
        year: String(date.getFullYear())
      };
    }
    
    return null; // Invalid format
  };

  const parsed = parseValue(value);
  const [selectedMonth, setSelectedMonth] = useState(parsed?.month || "");
  const [selectedYear, setSelectedYear] = useState(parsed?.year || "");

  // Sync with external value changes
  useEffect(() => {
    const newParsed = parseValue(value);
    setSelectedMonth(newParsed?.month || "");
    setSelectedYear(newParsed?.year || "");
  }, [value]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    // Defer emission until both are selected
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    // Defer emission until both are selected
  };

  // Commit when both values are selected
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      onChange(`${selectedYear}-${selectedMonth}-01`);
    }
  }, [selectedMonth, selectedYear, onChange]);

  const handleClear = () => {
    setSelectedMonth("");
    setSelectedYear("");
    onChange("");
  };

  const hasValue = selectedMonth && selectedYear;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className={cn("w-full", !selectedMonth && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className={cn("w-[120px] flex-shrink-0", !selectedYear && "text-muted-foreground")}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-10 w-10 flex-shrink-0"
            title="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
