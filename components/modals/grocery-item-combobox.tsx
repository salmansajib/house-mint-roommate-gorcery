"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GroceryCatalogItem } from "@/types";
import { useGroceryCatalog } from "@/hooks/use-grocery-catalog";
import { Sparkles, Check } from "lucide-react";

export interface GroceryItemComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (item: GroceryCatalogItem) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  autoFocus?: boolean;
}

export function GroceryItemCombobox({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Item name (e.g. chal, rice, peyaj, dim)",
  className,
  containerClassName,
  required,
  autoFocus,
}: GroceryItemComboboxProps) {
  const { search } = useGroceryCatalog();
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Compute suggestions based on current input
  const suggestions = React.useMemo(() => {
    if (!value || value.trim().length === 0) return [];
    return search(value, 6);
  }, [value, search]);

  // Automatically close if suggestions become empty
  React.useEffect(() => {
    if (suggestions.length === 0) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [suggestions]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: GroceryCatalogItem) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(item.name_bn);
    onSelectSuggestion?.(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1", containerClassName)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={cn(
          "w-full h-8 px-2.5 text-xs bg-card text-foreground rounded-lg font-medium border border-border focus:ring-2 focus:ring-primary/40 focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground",
          className
        )}
      />

      {/* Suggestion Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[260px] z-[100] bg-popover border border-border rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-border/40 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="size-2.5 text-primary" />
              <span>Bangla Suggestions</span>
            </span>
            <span className="text-[9px] lowercase opacity-60">↑↓ to pick</span>
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {suggestions.map((item, idx) => {
              const isSelected = idx === highlightedIndex;
              const isExactName = item.name_bn === value.trim();

              return (
                <button
                  key={item.id || item.name_bn}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary/15 text-foreground font-medium"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-semibold text-foreground truncate text-[13px]">
                      {item.name_bn}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      ({item.name_en})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.default_unit && (
                      <span className="text-[10px] font-medium bg-accent/70 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                        {item.default_unit}
                      </span>
                    )}
                    {isExactName && <Check className="size-3 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
