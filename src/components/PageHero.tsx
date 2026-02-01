"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  value: string;
  label: string;
}

interface CTA {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
}

interface PageHeroProps {
  // Content
  badge?: string;
  title: string;
  highlightedWord?: string;
  description?: string;

  // Optional elements
  stats?: Stat[];
  ctas?: CTA[];
  children?: ReactNode;
}

export function PageHero({
  badge,
  title,
  highlightedWord,
  description,
  stats,
  ctas,
  children,
}: PageHeroProps) {
  // Split title to highlight word with gradient
  const renderTitle = () => {
    if (!highlightedWord) {
      return title;
    }

    const parts = title.split(highlightedWord);
    if (parts.length === 1) {
      return title;
    }

    return (
      <>
        {parts[0]}
        <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
          {highlightedWord}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />

      {/* Subtle glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.08] rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium tracking-widest uppercase text-primary mb-6"
            >
              {badge}
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-4"
          >
            {renderTitle()}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
            >
              {description}
            </motion.p>
          )}

          {/* Stats - inline compact */}
          {stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-8"
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    "flex items-center gap-2",
                    index > 0 && "border-l border-border/30 pl-6"
                  )}
                >
                  <span className="text-xl font-semibold text-primary">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Custom children (search bars, etc.) */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}

          {/* CTAs */}
          {ctas && ctas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
            >
              {ctas.map((cta) => {
                const isPrimary = cta.variant === "primary" || !cta.variant;
                return (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isPrimary &&
                        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
                      cta.variant === "secondary" &&
                        "bg-secondary/80 text-secondary-foreground hover:bg-secondary",
                      cta.variant === "outline" &&
                        "border border-border/50 text-foreground hover:bg-secondary/50 hover:border-border"
                    )}
                  >
                    {cta.label}
                    {isPrimary && <ArrowRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
