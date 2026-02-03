"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useSearch } from "./SearchProvider";
import {
  Search,
  Home,
  BookOpen,
  Info,
  Phone,
  FileText,
  HelpCircle,
  Shield,
  Baby,
  HeartPulse,
  Sparkles,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: "page" | "formation" | "article" | "faq";
  pole?: string;
}

const quickLinks: SearchResult[] = [
  { id: "home", title: "Accueil", subtitle: "Page d'accueil", href: "/", type: "page" },
  { id: "formations", title: "Formations", subtitle: "Notre catalogue", href: "/formations", type: "page" },
  { id: "about", title: "À propos", subtitle: "Notre histoire", href: "/a-propos", type: "page" },
  { id: "contact", title: "Contact", subtitle: "Nous joindre", href: "/contact", type: "page" },
  { id: "blog", title: "Blog", subtitle: "Nos articles", href: "/blog", type: "page" },
  { id: "faq", title: "FAQ", subtitle: "Questions fréquentes", href: "/faq", type: "page" },
];

const popularSearches = [
  { label: "Formation SST", query: "SST", icon: Shield },
  { label: "Prévention incendie", query: "incendie", icon: Shield },
  { label: "Petite enfance", query: "petite enfance", icon: Baby },
  { label: "Financement OPCO", query: "OPCO", icon: FileText },
];

const getIconForType = (type: string, pole?: string) => {
  if (type === "formation") {
    if (pole === "securite-prevention") return Shield;
    if (pole === "petite-enfance") return Baby;
    if (pole === "sante") return HeartPulse;
    return BookOpen;
  }
  if (type === "article") return FileText;
  if (type === "faq") return HelpCircle;
  return ArrowRight;
};

export function SearchCommand() {
  const { open, setOpen } = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Toggle search with keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const searchTerm = searchQuery.toLowerCase();

    try {
      // Search formations
      const { data: formations } = await supabase
        .from("formations")
        .select("id, title, subtitle, slug, pole")
        .eq("active", true)
        .or(`title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%`)
        .limit(5);

      // Search articles
      const { data: articles } = await supabase
        .from("blog_articles")
        .select("id, title, excerpt, slug")
        .eq("published", true)
        .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
        .limit(3);

      // Search FAQ
      const { data: faqs } = await supabase
        .from("faqs")
        .select("id, question, answer, slug")
        .eq("published", true)
        .or(`question.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`)
        .limit(3);

      const searchResults: SearchResult[] = [];

      // Add formations
      formations?.forEach((f: { id: string; title: string; subtitle: string | null; slug: string | null; pole: string }) => {
        searchResults.push({
          id: `formation-${f.id}`,
          title: f.title,
          subtitle: f.subtitle || undefined,
          href: `/formations/${f.pole}/${f.slug || f.id}`,
          type: "formation",
          pole: f.pole,
        });
      });

      // Add articles
      articles?.forEach((a: { id: string; title: string; excerpt: string | null; slug: string }) => {
        searchResults.push({
          id: `article-${a.id}`,
          title: a.title,
          subtitle: a.excerpt || undefined,
          href: `/blog/${a.slug}`,
          type: "article",
        });
      });

      // Add FAQs
      faqs?.forEach((f: { id: string; question: string; slug: string | null }) => {
        searchResults.push({
          id: `faq-${f.id}`,
          title: f.question,
          subtitle: "Question fréquente",
          href: `/faq#${f.slug || f.id}`,
          type: "faq",
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const handlePopularSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Dialog */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl px-4">
        <Command
          className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher..."
              className="flex-1 h-14 px-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-secondary px-2 font-mono text-xs text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {/* Loading State */}
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Recherche en cours...
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun résultat pour "{query}"
              </div>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <Command.Group
                heading={
                  <span className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Search className="w-3 h-3" />
                    Résultats
                  </span>
                }
              >
                {results.map((result) => {
                  const Icon = getIconForType(result.type, result.pole);
                  return (
                    <Command.Item
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(result.href)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary data-[selected=true]:bg-secondary transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          result.type === "formation" && "bg-primary/10",
                          result.type === "article" && "bg-blue-500/10",
                          result.type === "faq" && "bg-amber-500/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            result.type === "formation" && "text-primary",
                            result.type === "article" && "text-blue-500",
                            result.type === "faq" && "text-amber-500"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase",
                          result.type === "formation" && "bg-primary/10 text-primary",
                          result.type === "article" && "bg-blue-500/10 text-blue-500",
                          result.type === "faq" && "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {result.type === "formation" && "Formation"}
                        {result.type === "article" && "Article"}
                        {result.type === "faq" && "FAQ"}
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {/* Popular Searches - Show when no query */}
            {!query && (
              <>
                <Command.Group
                  heading={
                    <span className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Recherches populaires
                    </span>
                  }
                >
                  <div className="flex flex-wrap gap-2 px-2 py-2">
                    {popularSearches.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.query}
                          onClick={() => handlePopularSearch(item.query)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </Command.Group>

                <Command.Group
                  heading={
                    <span className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Zap className="w-3 h-3" />
                      Accès rapide
                    </span>
                  }
                >
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {quickLinks.slice(0, 4).map((link) => {
                      const icons: Record<string, typeof Home> = {
                        home: Home,
                        formations: BookOpen,
                        about: Info,
                        contact: Phone,
                      };
                      const Icon = icons[link.id] || ArrowRight;
                      return (
                        <Command.Item
                          key={link.id}
                          value={link.id}
                          onSelect={() => handleSelect(link.href)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary hover:border-border data-[selected=true]:bg-secondary transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{link.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {link.subtitle}
                            </p>
                          </div>
                        </Command.Item>
                      );
                    })}
                  </div>
                </Command.Group>
              </>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">↵</kbd>
                ouvrir
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">Esc</kbd>
              fermer
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
