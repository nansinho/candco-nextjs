"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  { id: "all", name: "Toutes", icon: null, color: null, hex: null },
  { id: "securite-prevention", name: "Sécurité", icon: Shield, color: "pole-securite", hex: "#e74c3c" },
  { id: "petite-enfance", name: "Petite Enfance", icon: Baby, color: "pole-petite-enfance", hex: "#1abc9c" },
  { id: "sante", name: "Santé", icon: HeartPulse, color: "pole-sante", hex: "#3498db" },
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
      <section className="py-3 md:py-6 sticky top-16 z-40 transition-all duration-300" style={{ backgroundColor: "rgba(21,31,45,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
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
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            {filteredFormations.length} formation
            {filteredFormations.length > 1 ? "s" : ""} trouvée
            {filteredFormations.length > 1 ? "s" : ""}
          </p>

          {filteredFormations.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Aucune formation ne correspond à votre recherche.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPole("all");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "#F8A991", color: "#151F2D" }}
              >
                Réinitialiser les filtres
              </button>
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
                          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                              <Tag className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                              <h3 className="text-base font-medium text-white">
                                {category?.name || "Autres formations"}
                              </h3>
                              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                                ({catFormations.length})
                              </span>
                            </div>

                            {/* Formations Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {catFormations.map((formation, index) => {
                                const accent = pole.hex || "#1F628E";
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
                                      <article
                                        className="rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(248,169,145,0.15)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                                        style={{ backgroundColor: `${accent}30`, border: `1.5px solid ${accent}55` }}
                                      >
                                        {/* Image */}
                                        <div className="relative aspect-[3/1] overflow-hidden">
                                          <Image
                                            src={getFormationImage(formation)}
                                            alt={formation.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ backgroundColor: accent }}>{formation.pole_name}</span>
                                            {formation.duration && (
                                              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formation.duration}
                                              </span>
                                            )}
                                          </div>
                                          {formation.popular && (
                                            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: accent }}>
                                              Populaire
                                            </span>
                                          )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                          <h3 className="text-[15px] font-bold text-white leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-[#F8A991] transition-colors">
                                            {formation.title}
                                          </h3>
                                          <p className="text-[13px] text-white/40 line-clamp-2 mb-3 min-h-[2.5rem]">
                                            {formation.subtitle || "\u00A0"}
                                          </p>

                                          {/* Session info */}
                                          {hasActiveSessions && (
                                            <div className="flex items-center gap-3 mb-3 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                                              <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" />
                                                {sessionInfo.count} session{sessionInfo.count > 1 ? "s" : ""}
                                              </span>
                                              {sessionInfo.total_places > 0 && (
                                                <span className="flex items-center gap-1">
                                                  <Users className="w-3 h-3" />
                                                  {sessionInfo.total_places} place{sessionInfo.total_places > 1 ? "s" : ""}
                                                </span>
                                              )}
                                            </div>
                                          )}

                                          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${accent}33` }}>
                                            <p className="text-lg font-extrabold text-white">{formation.price}</p>
                                            <span className="text-xs font-bold flex items-center gap-1" style={{ color: accent }}>
                                              Détails <ArrowRight className="w-3 h-3" />
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
      <section className="py-12" style={{ backgroundColor: "#151F2D", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Besoin d&apos;aide pour choisir votre formation ?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 font-bold text-[14px] transition-all hover:scale-[1.02]"
            style={{ color: "#F8A991" }}
          >
            Contactez nos conseillers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
