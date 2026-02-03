"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SearchCommand } from "./SearchCommand";

interface SearchContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <SearchCommand />
    </SearchContext.Provider>
  );
}
