import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to "Month Year" format (e.g., "Sep 2020")
 * Handles various input formats: "YYYY-MM-DD", "YYYY-MM", "YYYY", or "Present"
 */
export function formatMonthYear(dateString: string): string {
  if (!dateString) return '';
  if (dateString.toLowerCase() === 'present') return 'Present';
  
  // Try to extract year and month
  const yearMatch = dateString.match(/^(\d{4})(?:-(\d{2}))?/);
  if (!yearMatch) return dateString; // Return as-is if can't parse
  
  const year = yearMatch[1];
  const month = yearMatch[2] || '01'; // Default to January
  
  const date = new Date(`${year}-${month}-01`);
  if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${year}`;
}

/**
 * Formats a date range for work experience display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = formatMonthYear(startDate);
  const end = formatMonthYear(endDate);
  
  if (!start && !end) return '';
  if (!start) return end || '';
  if (!end) return start;
  if (start === end) return start;
  
  return `${start} - ${end}`;
}
