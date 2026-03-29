"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, ArrowRight, HelpCircle, Building, Wallet,
  GraduationCap, ClipboardList, Award, Briefcase, Accessibility, User,
  Phone, ThumbsUp, ThumbsDown, X, Users, CheckCircle,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

const iconMap: Record<string, LucideIcon> = {
  "building-2": Building, Building2: Building, wallet: Wallet, Wallet: Wallet,
  "graduation-cap": GraduationCap, GraduationCap: GraduationCap,
  "clipboard-list": ClipboardList, ClipboardList: ClipboardList,
  award: Award, Award: Award, briefcase: Briefcase, Briefcase: Briefcase,
  accessibility: Accessibility, Accessibility: Accessibility,
  "help-circle": HelpCircle, HelpCircle: HelpCircle, user: User, User: User,
  CreditCard: Wallet,
};

const getIcon = (n: string): LucideIcon => iconMap[n] || HelpCircle;

interface FAQCategory { id: string; name: string; slug: string; icon: string; description: string; display_order: number; }
interface FAQItem { id: string; category_id: string; question: string; answer: string; keywords: string[]; view_count: number; helpful_count: number; not_helpful_count: number; display_order: number; }

export default function FAQClient({ categories, items }: { categories: FAQCategory[]; items: FAQItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    let r = items;
    if (selectedCategory) r = r.filter((i) => i.category_id === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((i) =>
        i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q) ||
        i.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }
    return r;
  }, [items, searchQuery, selectedCategory]);

  const grouped = useMemo(() => {
    const g: Record<string, FAQItem[]> = {};
    filteredItems.forEach((i) => { if (!g[i.category_id]) g[i.category_id] = []; g[i.category_id].push(i); });
    return g;
  }, [filteredItems]);

  const totalQuestions = items.length;

  const viewedRef = useRef<Set<string>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  const trackView = useCallback((itemId: string) => {
    if (viewedRef.current.has(itemId)) return;
    viewedRef.current.add(itemId);
    const supabase = createClient();
    supabase.rpc("increment_faq_view", { item_id: itemId }).then(() => {});
  }, []);

  const sendFeedback = useCallback((itemId: string, type: "up" | "down") => {
    if (feedbackGiven[itemId]) return;
    setFeedbackGiven((prev) => ({ ...prev, [itemId]: type }));
    const supabase = createClient();
    const col = type === "up" ? "helpful_count" : "not_helpful_count";
    supabase.rpc("increment_faq_feedback", { item_id: itemId, col_name: col }).then(() => {});
  }, [feedbackGiven]);

  return (
    <>
      {/* ═══ 1. HERO — identique à propos : gradient bleu + image band ═══ */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 60%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">FAQ</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-3xl mx-auto mb-6">
            Toutes vos <span style={{ color: "#F8A991" }}>questions,</span> nos réponses.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            Formations, financements, inscriptions — trouvez la réponse en quelques clics.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            {[
              { icon: HelpCircle, text: `${totalQuestions} questions` },
              { icon: Users, text: "25 000+ formés" },
              { icon: CheckCircle, text: "Réponse en 24h" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Hero image band — comme à propos */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-[12px] ring-[#151F2D]">
            <div className="absolute inset-0 animate-[kenBurnsLoop_15s_ease-in-out_infinite]">
              <Image
                src="/images/fonds_sections/fond_faq3.jpg"
                alt="FAQ C&Co Formation"
                fill
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover object-[center_20%]"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12" />
      </section>

      {/* ═══ 2. FAQ CONTENT — dark ═══ */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search bar — sticky inside section */}
          <div
            className="sticky top-16 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pb-6 mb-8"
            style={{ backgroundColor: "#151F2D" }}
            onClick={() => searchRef.current?.focus()}
          >
            <div
              className="relative flex items-center rounded-2xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: searchFocused ? "1px solid rgba(248,169,145,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="pl-6 flex items-center">
                <Search className="w-5 h-5 transition-all duration-300" style={{ color: searchFocused ? "#F8A991" : "rgba(255,255,255,0.35)" }} />
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 px-4 py-4 bg-transparent text-[15px] text-white placeholder:text-white/40 outline-none focus:outline-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                  className="pr-6 pl-2 flex items-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search results banner */}
          {(selectedCategory || searchQuery) && (
            <div className="flex items-center justify-between mb-8 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}
                {searchQuery && <> pour &quot;<span className="font-bold text-white">{searchQuery}</span>&quot;</>}
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="text-[13px] font-bold transition-colors"
                style={{ color: "#F8A991" }}
              >
                Tout afficher
              </button>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                <Search className="w-7 h-7" style={{ color: "#F8A991" }} />
              </div>
              <p className="text-lg font-semibold text-white mb-2">Aucun résultat</p>
              <p className="text-[14px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Essayez un autre terme ou consultez toutes les catégories.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "#F8A991", color: "#151F2D" }}
              >
                Voir toutes les questions
              </button>
            </div>
          ) : (
            <div className="space-y-14">
              {categories
                .filter((c) => !selectedCategory || c.id === selectedCategory)
                .filter((c) => grouped[c.id]?.length > 0)
                .map((cat) => {
                  const CatIcon = getIcon(cat.icon);
                  return (
                    <div key={cat.id}>
                      {/* Category header — left aligned, compact */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                          <CatIcon className="w-4 h-4" style={{ color: "#F8A991" }} />
                        </div>
                        <h2 className="text-lg font-normal text-white">{cat.name}</h2>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
                        <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{grouped[cat.id]?.length}</span>
                      </div>

                      {/* Accordion */}
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-2"
                        onValueChange={(val) => { if (val) trackView(val); }}
                      >
                        {grouped[cat.id]?.map((item) => (
                          <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="rounded-xl overflow-hidden transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:shadow-black/20 data-[state=open]:ring-1 data-[state=open]:ring-[rgba(248,169,145,0.15)]"
                            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline group text-left">
                              <span className="font-medium text-[15px] pr-4 group-hover:text-[#F8A991] transition-colors text-white/90">
                                {item.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-5">
                              <div className="h-px mb-4" style={{ background: "linear-gradient(to right, rgba(248,169,145,0.2), transparent)" }} />
                              <p className="text-[14px] leading-[1.8] whitespace-pre-line" style={{ color: "rgba(255,255,255,0.5)" }}>
                                {item.answer}
                              </p>
                              {/* Feedback */}
                              <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>Utile ?</span>
                                {feedbackGiven[item.id] ? (
                                  <span className="text-[12px] font-bold" style={{ color: "#F8A991" }}>Merci !</span>
                                ) : (
                                  <>
                                    <button onClick={() => sendFeedback(item.id, "up")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:scale-105" style={{ backgroundColor: "rgba(248,169,145,0.1)", color: "#F8A991" }}>
                                      <ThumbsUp className="w-3 h-3" /> Oui
                                    </button>
                                    <button onClick={() => sendFeedback(item.id, "down")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all hover:scale-105" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)" }}>
                                      <ThumbsDown className="w-3 h-3" /> Non
                                    </button>
                                  </>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Contact banner */}
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(31,98,142,0.2), rgba(248,169,145,0.1))", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-[15px] font-semibold text-white">Vous ne trouvez pas votre réponse ?</p>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>Notre équipe vous répond sous 24h.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] transition-all hover:scale-[1.02]" style={{ backgroundColor: "#F8A991", color: "#151F2D" }}>
                Nous contacter <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:+33762596653" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[14px] text-white/70 transition-all hover:text-white hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
