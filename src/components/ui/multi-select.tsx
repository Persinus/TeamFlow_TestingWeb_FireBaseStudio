
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  onCreate?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Chọn các tùy chọn...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  
  const selectedValues = new Set(value);

  const handleUnselect = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue) {
        if (onCreate) {
            onCreate(inputValue);
        }
        setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto"
                onClick={() => setOpen(!open)}
            >
                <div className="flex gap-1 flex-wrap">
                {value.length > 0 ? (
                    value.map((val) => {
                        const option = options.find(o => o.value === val);
                        return (
                            <Badge
                            variant="secondary"
                            key={val}
                            className="mr-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUnselect(val);
                            }}
                            >
                            {option ? option.label : val}
                            <X className="h-3 w-3 ml-1" />
                            </Badge>
                        );
                    })
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command onKeyDown={handleKeyDown}>
          <CommandInput 
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                {onCreate ? `Không tìm thấy kết quả. Nhấn "Enter" để tạo mới.` : "Không tìm thấy kết quả."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (selectedValues.has(option.value)) {
                      handleUnselect(option.value);
                    } else {
                      onChange([...value, option.value]);
                    }
                    setOpen(true);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.has(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
