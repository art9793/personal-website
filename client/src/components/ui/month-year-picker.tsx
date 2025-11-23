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
  // Parse the current value - handle invalid dates gracefully
  const parseValue = (val: string): { month: string; year: string } | null => {
    if (!val || val === "Present") return null;
    
    const date = new Date(val);
    if (isNaN(date.getTime())) return null; // Invalid date
    
    return {
      month: String(date.getMonth() + 1).padStart(2, "0"),
      year: String(date.getFullYear())
    };
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
    // Only emit onChange if both month and year are selected
    if (selectedYear) {
      onChange(`${selectedYear}-${month}-01`);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    // Only emit onChange if both month and year are selected
    if (selectedMonth) {
      onChange(`${year}-${selectedMonth}-01`);
    }
  };

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
