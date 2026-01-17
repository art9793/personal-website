"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries, continents, getCountryByCode, type Country } from "@/lib/countries";

interface CountryComboboxProps {
  value: string; // country code
  onSelect: (country: { code: string; name: string; continent: string; flag: string }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CountryCombobox({
  value,
  onSelect,
  placeholder = "Select country...",
  disabled = false,
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCountry = value ? getCountryByCode(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-base">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {continents.map((continent) => (
              <CommandGroup key={continent} heading={continent}>
                {countries
                  .filter((country) => country.continent === continent)
                  .map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => {
                        onSelect({
                          code: country.code,
                          name: country.name,
                          continent: country.continent,
                          flag: country.flag,
                        });
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === country.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="mr-2 text-base">{country.flag}</span>
                      <span>{country.name}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
