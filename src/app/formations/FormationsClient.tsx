"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Clock,
  ArrowRight,
  Shield,
  Baby,
  HeartPulse,
  CalendarDays,
  Users,
  ChevronRight,
  Tag,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { getFormationImage, groupFormationsByCategory } from "@/lib/formations-utils";

interface Formation {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pole: string;
  pole_name: string;
  duration: string;
  price: string;
  image_url: string | null;
  popular: boolean | null;
  active: boolean | null;
  category_id: string | null;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  pole_id: string | null;
}

interface SessionCount {
  formation_id: string;
  count: number;
  next_session_date: string | null;
  total_places: number;
}

interface FormationsClientProps {
  formations: Formation[];
  categories: Category[];
  sessionCounts: Record<string, SessionCount>;
  initialPole?: string;
}

const poles = [
  { id: "all", name: "Toutes", icon: null, color: null },
  { id: "securite-prevention", name: "Sécurité", icon: Shield, color: "pole-securite" },
  { id: "petite-enfance", name: "Petite Enfance", icon: Baby, color: "pole-petite-enfance" },
  { id: "sante", name: "Santé", icon: HeartPulse, color: "pole-sante" },
];

export default function FormationsClient({
  formations,
  categories,
  sessionCounts,
  initialPole = "all",
}: FormationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedPole, setSelectedPole] = useState(initialPole);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset category when pole changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedPole]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedPole !== "all") count++;
    if (selectedCategory) count++;
    return count;
  }, [selectedPole, selectedCategory]);

  // Categories for selected pole
  const poleCategories = useMemo(() => {
    if (selectedPole === "all") return [];
    return categories.filter((cat) => cat.pole_id === selectedPole);
  }, [selectedPole, categories]);

  // Selected category name
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((cat) => cat.id === selectedCategory)?.name || null;
  }, [selectedCategory, categories]);

  // Filtered formations
  const filteredFormations = useMemo(() => {
    return formations.filter((formation) => {
      const matchesSearch =
        formation.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (formation.subtitle || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesPole = selectedPole === "all" || formation.pole === selectedPole;
      const matchesCategory = !selectedCategory || formation.category_id === selectedCategory;
      return matchesSearch && matchesPole && matchesCategory;
    });
  }, [debouncedSearchQuery, selectedPole, selectedCategory, formations]);

  return (
    <>
      {/* Mobile Filter Drawer */}
      <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>Filtrer les formations</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Poles Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Pôle de formation
              </Label>
              <div className="space-y-2">
                {poles.map((pole) => {
                  const Icon = pole.icon;
                  const isActive = selectedPole === pole.id;
                  return (
                    <button
                      key={pole.id}
                      onClick={() => {
                        setSelectedPole(pole.id);
                        if (pole.id === "all") setSelectedCategory(null);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/30 bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {Icon ? <Icon className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                      </div>
                      <span className="flex-1 text-left font-medium">{pole.name}</span>
                      {isActive && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Section */}
            {selectedPole !== "all" && poleCategories.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Catégorie</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      !selectedCategory
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/30 bg-background hover:bg-muted/50"
                    }`}
                  >
                    <span className="flex-1 text-left font-medium">Toutes les catégories</span>
                    {!selectedCategory && <Check className="w-5 h-5 text-primary" />}
                  </button>
                  {poleCategories.map((category) => {
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isActive
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/30 bg-background hover:bg-muted/50"
                        }`}
                      >
                        <span className="flex-1 text-left font-medium">{category.name}</span>
                        {isActive && <Check className="w-5 h-5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="border-t">
            <Button onClick={() => setIsFilterOpen(false)} className="w-full">
              Voir {filteredFormations.length} résultat
              {filteredFormations.length !== 1 ? "s" : ""}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPole("all");
                  setSelectedCategory(null);
                }}
                className="w-full"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Filters Section */}
      <section className="py-3 md:py-6 border-b border-border/50 sticky top-16 bg-background/95 backdrop-blur-xl z-40 transition-all duration-300">
        <div className="container-custom">
          {/* Mobile: Compact bar */}
          <div className="flex md:hidden gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-full border border-border/30 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsFilterOpen(true)}
              className="shrink-0 gap-2 rounded-full"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Desktop: Inline filters */}
          <div className="hidden md:block space-y-4">
            {/* Row 1: Search + Pole filters */}
            <div className="flex gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full border border-border/30 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Pole filters */}
              <div className="flex gap-2 flex-wrap">
                {poles.map((pole) => {
                  const Icon = pole.icon;
                  const isActive = selectedPole === pole.id;
                  const colorClass = pole.color;
                  return (
                    <button
                      key={pole.id}
                      onClick={() => setSelectedPole(pole.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? ""
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      style={
                        isActive && colorClass
                          ? {
                              backgroundColor: `hsl(var(--${colorClass}))`,
                              color: `hsl(var(--${colorClass}-foreground))`,
                            }
                          : isActive
                          ? {
                              backgroundColor: "hsl(var(--primary))",
                              color: "hsl(var(--primary-foreground))",
                            }
                          : undefined
                      }
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {pole.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Category filters */}
            <AnimatePresence>
              {selectedPole !== "all" && poleCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                      <ChevronRight className="w-4 h-4" />
                      <Tag className="w-4 h-4" />
                      <span>Catégories :</span>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        !selectedCategory
                          ? "bg-foreground/10 text-foreground ring-1 ring-foreground/20"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      Toutes
                    </button>
                    {poleCategories.map((category) => {
                      const isActive = selectedCategory === category.id;
                      const pole = poles.find((p) => p.id === selectedPole);
                      const colorClass = pole?.color;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isActive
                              ? ""
                              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                          }`}
                          style={
                            isActive && colorClass
                              ? {
                                  backgroundColor: `hsl(var(--${colorClass}) / 0.15)`,
                                  color: `hsl(var(--${colorClass}))`,
                                  boxShadow: `inset 0 0 0 1px hsl(var(--${colorClass}) / 0.3)`,
                                }
                              : undefined
                          }
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active filters display */}
            {(selectedPole !== "all" || selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-muted-foreground">Filtres actifs :</span>
                {selectedPole !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    {poles.find((p) => p.id === selectedPole)?.name}
                    {!selectedCategory && (
                      <button
                        onClick={() => setSelectedPole("all")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                )}
                {selectedCategory && selectedCategoryName && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategoryName}
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPole("all");
                    setSelectedCategory(null);
                  }}
                  className="text-xs h-6 px-2"
                >
                  Réinitialiser
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding">
        <div className="container-custom">
          <p className="text-sm text-muted-foreground mb-8">
            {filteredFormations.length} formation
            {filteredFormations.length > 1 ? "s" : ""} trouvée
            {filteredFormations.length > 1 ? "s" : ""}
          </p>

          {filteredFormations.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Aucune formation ne correspond à votre recherche.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPole("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {poles
                .filter((p) => p.id !== "all")
                .map((pole) => {
                  const Icon = pole.icon;
                  const poleFormations = filteredFormations.filter((f) => f.pole === pole.id);

                  if (poleFormations.length === 0) return null;

                  const poleCats = categories.filter((cat) => cat.pole_id === pole.id);
                  const formationsByCategory = groupFormationsByCategory(poleFormations, poleCats);

                  return (
                    <motion.div
                      key={pole.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Pole Header */}
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `hsl(var(--${pole.color}) / 0.15)`,
                          }}
                        >
                          {Icon && (
                            <Icon
                              className="w-6 h-6"
                              style={{ color: `hsl(var(--${pole.color}))` }}
                            />
                          )}
                        </div>
                        <div>
                          <h2
                            className="text-xl font-semibold"
                            style={{ color: `hsl(var(--${pole.color}))` }}
                          >
                            {pole.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {poleFormations.length} formation
                            {poleFormations.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Formations grouped by category */}
                      <div className="space-y-10">
                        {formationsByCategory.map(({ category, formations: catFormations }) => (
                          <div key={category?.id || "uncategorized"}>
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <h3 className="text-base font-medium text-foreground">
                                {category?.name || "Autres formations"}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                ({catFormations.length})
                              </span>
                            </div>

                            {/* Formations Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                              {catFormations.map((formation, index) => {
                                const sessionInfo = sessionCounts[formation.id];
                                const hasActiveSessions = sessionInfo && sessionInfo.count > 0;

                                return (
                                  <motion.div
                                    key={formation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="h-full"
                                  >
                                    <Link
                                      href={`/formations/${formation.pole}/${formation.slug || formation.id}`}
                                      className="group block h-full"
                                    >
                                      <article className="relative h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
                                        {/* Image */}
                                        <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden relative bg-muted">
                                          <img
                                            src={getFormationImage(formation)}
                                            alt={formation.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                          />
                                          <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                            style={{
                                              backgroundColor: `hsl(var(--${pole.color}))`,
                                            }}
                                          />
                                          {/* Badges */}
                                          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start">
                                            {hasActiveSessions && (
                                              <Badge className="hidden sm:flex bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-sm text-[10px] sm:text-xs">
                                                <CalendarDays className="w-3 h-3 mr-1" />
                                                {sessionInfo.count} session
                                                {sessionInfo.count > 1 ? "s" : ""}
                                              </Badge>
                                            )}
                                            {!hasActiveSessions && <div />}

                                            {formation.popular && (
                                              <span
                                                className="text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                                                style={{
                                                  backgroundColor: `hsl(var(--${pole.color}))`,
                                                  color: `hsl(var(--${pole.color}-foreground))`,
                                                }}
                                              >
                                                <span className="hidden sm:inline">Populaire</span>
                                                <span className="sm:hidden">★</span>
                                              </span>
                                            )}
                                          </div>

                                          {hasActiveSessions && sessionInfo.total_places > 0 && (
                                            <div className="hidden sm:block absolute bottom-3 left-3">
                                              <Badge
                                                variant="secondary"
                                                className="bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-sm"
                                              >
                                                <Users className="w-3 h-3 mr-1" />
                                                {sessionInfo.total_places} place
                                                {sessionInfo.total_places > 1 ? "s" : ""} dispo.
                                              </Badge>
                                            </div>
                                          )}
                                        </div>

                                        {/* Progress bar */}
                                        <div
                                          className="h-1 w-0 group-hover:w-full transition-all duration-500"
                                          style={{
                                            backgroundColor: `hsl(var(--${pole.color}))`,
                                          }}
                                        />

                                        {/* Content */}
                                        <div className="p-3 sm:p-5 flex flex-col flex-grow">
                                          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1">
                                            <h3
                                              className="font-medium transition-colors text-sm sm:text-base line-clamp-2"
                                              style={{
                                                color: `hsl(var(--${pole.color}))`,
                                              }}
                                            >
                                              {formation.title}
                                            </h3>
                                            <ArrowRight
                                              className="hidden sm:block w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 mt-0.5"
                                              style={{
                                                color: `hsl(var(--${pole.color}))`,
                                              }}
                                            />
                                          </div>
                                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 flex-grow line-clamp-2 hidden sm:block">
                                            {formation.subtitle || ""}
                                          </p>

                                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mt-auto">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                              <span className="hidden sm:inline">
                                                {formation.duration}
                                              </span>
                                              <span className="sm:hidden">
                                                {formation.duration
                                                  .replace(" jours", "j")
                                                  .replace(" heures", "h")}
                                              </span>
                                            </div>
                                            <span className="font-medium text-foreground text-xs sm:text-sm">
                                              {formation.price}
                                            </span>
                                          </div>
                                        </div>
                                      </article>
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-sm border-t border-border/50">
        <div className="container-custom text-center">
          <p className="text-muted-foreground mb-4">
            Besoin d'aide pour choisir votre formation ?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            Contactez nos conseillers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
