"use client";

/**
 * @file multi-select.tsx
 * @description Composant multi-select avec badges pour la sélection multiple
 */

import * as React from "react";
import { X, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  allowCreate?: boolean;
  onCreate?: (value: string) => void;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionner...",
  emptyMessage = "Aucun résultat",
  allowCreate = false,
  onCreate,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const handleCreate = () => {
    if (inputValue.trim() && onCreate) {
      onCreate(inputValue.trim());
      setInputValue("");
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateOption =
    allowCreate &&
    inputValue.trim() &&
    !options.some(
      (option) => option.label.toLowerCase() === inputValue.toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[40px] h-auto",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 max-w-[calc(100%-24px)]">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="mr-1 cursor-pointer hover:bg-secondary/80"
                    onClick={(e) => handleRemove(value, e)}
                  >
                    {option?.label || value}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[250px] p-2" align="start">
        <div className="space-y-2">
          <Input
            placeholder="Rechercher..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8"
          />
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {showCreateOption && (
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-left"
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4 text-primary" />
                <span>Créer &quot;{inputValue}&quot;</span>
              </button>
            )}
            {filteredOptions.length === 0 && !showCreateOption ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
