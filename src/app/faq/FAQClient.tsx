"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  HelpCircle,
  Building,
  Wallet,
  GraduationCap,
  ClipboardList,
  Award,
  Briefcase,
  Accessibility,
  User,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/PageHero";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  "building-2": Building,
  Building2: Building,
  wallet: Wallet,
  Wallet: Wallet,
  "graduation-cap": GraduationCap,
  GraduationCap: GraduationCap,
  "clipboard-list": ClipboardList,
  ClipboardList: ClipboardList,
  award: Award,
  Award: Award,
  briefcase: Briefcase,
  Briefcase: Briefcase,
  accessibility: Accessibility,
  Accessibility: Accessibility,
  "help-circle": HelpCircle,
  HelpCircle: HelpCircle,
  user: User,
  User: User,
  CreditCard: Wallet,
};

const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || HelpCircle;
};

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  keywords: string[];
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  display_order: number;
}

interface FAQClientProps {
  categories: FAQCategory[];
  items: FAQItem[];
}

export default function FAQClient({ categories, items }: FAQClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory) {
      result = result.filter((item) => item.category_id === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query) ||
          item.keywords?.some((k) => k.toLowerCase().includes(query))
      );
    }

    return result;
  }, [items, searchQuery, selectedCategory]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category_id]) {
        groups[item.category_id] = [];
      }
      groups[item.category_id].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Popular questions (most viewed)
  const popularQuestions = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);
  }, [items]);

  return (
    <>
      {/* Hero Section */}
      <PageHero
        badge="FAQ"
        title="Questions fréquentes"
        highlightedWord="fréquentes"
        description="Trouvez les réponses à vos questions."
      >
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-border/50 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </PageHero>

      {/* Categories Filter */}
      <section className="py-6 border-b border-border/50 sticky top-16 bg-background/95 backdrop-blur-xl z-40">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Toutes
            </button>
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Sidebar - Popular Questions */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-40">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Questions populaires
                </h3>
                <div className="space-y-3">
                  {popularQuestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery(item.question.split(" ").slice(0, 3).join(" "));
                      }}
                      className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <MessageCircle className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-medium mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Notre équipe est là pour répondre à toutes vos questions.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Nous contacter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>

            {/* FAQ Items */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    {searchQuery
                      ? `Aucun résultat pour "${searchQuery}"`
                      : "Aucune question dans cette catégorie"}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="space-y-12 max-w-3xl">
                  {categories
                    .filter(
                      (cat) => !selectedCategory || cat.id === selectedCategory
                    )
                    .filter((cat) => groupedItems[cat.id]?.length > 0)
                    .map((category) => {
                      const CategoryIcon = getIconComponent(category.icon);
                      return (
                        <div key={category.id}>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-medium">
                              {category.name}
                            </h2>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                              {groupedItems[category.id]?.length || 0}
                            </span>
                          </div>

                          <Accordion
                            type="single"
                            collapsible
                            className="space-y-3"
                          >
                            {groupedItems[category.id]?.map((item) => (
                              <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border border-border/50 rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-all data-[state=open]:border-primary/30"
                              >
                                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/30 transition-colors">
                                  <span className="font-medium text-left pr-4">
                                    {item.question}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-5">
                                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {item.answer}
                                  </p>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-sm border-t border-border/50">
        <div className="container-custom text-center">
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas trouvé votre réponse ?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            Contactez-nous
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
