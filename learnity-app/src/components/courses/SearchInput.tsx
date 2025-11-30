"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

/**
 * Custom hook for debounced value
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * SearchInput Component
 * Debounced search input with clear button
 * Requirements: 3.3 - Debounced search input, clear button
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search courses...",
  debounceMs = 300,
  isLoading = false,
  className,
  inputClassName,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger search on debounced value change
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, onChange, onSearch, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
    if (e.key === "Enter") {
      // Immediate search on Enter
      onChange(localValue);
      onSearch?.(localValue);
    }
  };

  const showClearButton = localValue.length > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>

      {/* Input Field */}
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "pl-10 pr-10",
          inputClassName
        )}
        aria-label="Search courses"
      />

      {/* Clear Button */}
      {showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * SearchInputWithButton - Search input with explicit search button
 */
export function SearchInputWithButton({
  value,
  onChange,
  onSearch,
  placeholder = "Search courses...",
  isLoading = false,
  className,
  buttonText = "Search",
}: Omit<SearchInputProps, "debounceMs"> & { buttonText?: string }) {
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSearch = () => {
    onSearch?.(localValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const showClearButton = localValue.length > 0;

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search className="h-4 w-4" />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search courses"
        />

        {/* Clear Button */}
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Button */}
      <Button
        type="button"
        onClick={handleSearch}
        disabled={isLoading}
        className="shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Search className="h-4 w-4 mr-2" />
        )}
        {buttonText}
      </Button>
    </div>
  );
}

export default SearchInput;
