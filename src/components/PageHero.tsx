"use client";

import Link from "next/link";
import Image from "next/image";
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

  // Background
  backgroundImage?: string;

  // Layout
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";

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
  backgroundImage,
  align = "left",
  size = "md",
  stats,
  ctas,
  children,
}: PageHeroProps) {
  // Split title to highlight word
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
        <span className="text-primary">{highlightedWord}</span>
        {parts[1]}
      </>
    );
  };

  // Size variants
  const sizeClasses = {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "min-h-[60vh] py-20 md:py-32 flex items-center",
  };

  const hasBackground = !!backgroundImage;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/50",
        sizeClasses[size]
      )}
    >
      {/* Background Image */}
      {hasBackground && (
        <>
          <div className="absolute inset-0">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        </>
      )}

      {/* Subtle glow effect (no bg image) */}
      {!hasBackground && (
        <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />
      )}

      <div className="container-custom relative z-10">
        <div
          className={cn(
            align === "center" ? "max-w-3xl mx-auto text-center" : "max-w-2xl"
          )}
        >
          {/* Badge */}
          {badge && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground mb-4 tracking-widest uppercase"
            >
              {badge}
            </motion.p>
          )}

          {/* Title - font-light for thin titles */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-5"
          >
            {renderTitle()}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
            >
              {description}
            </motion.p>
          )}

          {/* Stats - inline */}
          {stats && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={cn(
                "flex gap-8 mt-8",
                align === "center" && "justify-center"
              )}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl lg:text-4xl font-light text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Custom children (search bars, etc.) */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}

          {/* CTAs */}
          {ctas && ctas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={cn(
                "flex flex-wrap gap-3 mt-8",
                align === "center" && "justify-center"
              )}
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
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      cta.variant === "secondary" &&
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      cta.variant === "outline" &&
                        "border border-border text-foreground hover:bg-secondary/50"
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
