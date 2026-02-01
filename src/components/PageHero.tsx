"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import {
  ArrowRight,
  Newspaper,
  HelpCircle,
  Info,
  GraduationCap,
  Mail,
  Accessibility,
  Shield,
  Baby,
  HeartPulse,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for badge icons - passed as strings from Server Components
const iconMap: Record<string, LucideIcon> = {
  newspaper: Newspaper,
  "help-circle": HelpCircle,
  info: Info,
  "graduation-cap": GraduationCap,
  mail: Mail,
  accessibility: Accessibility,
  shield: Shield,
  baby: Baby,
  "heart-pulse": HeartPulse,
};

interface Breadcrumb {
  label: string;
  href?: string;
}

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
  badgeIcon?: string; // Icon name as string
  title: string;
  highlightedWord?: string; // Word to highlight in orange
  subtitle?: string;
  description?: string;

  // Visual
  backgroundImage?: string;
  overlayOpacity?: "light" | "medium" | "heavy";
  minHeight?: "small" | "medium" | "large";
  align?: "center" | "left";

  // Navigation
  breadcrumbs?: Breadcrumb[];

  // Optional elements
  stats?: Stat[];
  ctas?: CTA[];
  children?: ReactNode; // For custom content like search bars
}

export function PageHero({
  badge,
  badgeIcon,
  title,
  highlightedWord,
  subtitle,
  description,
  backgroundImage = "/hero-default.jpg",
  overlayOpacity = "medium",
  minHeight = "medium",
  align = "center",
  breadcrumbs,
  stats,
  ctas,
  children,
}: PageHeroProps) {
  // Get icon component from name
  const BadgeIcon = badgeIcon ? iconMap[badgeIcon] : null;

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

  const overlayClasses = {
    light: "from-background/70 via-background/60 to-background",
    medium: "from-background/90 via-background/80 to-background",
    heavy: "from-background/95 via-background/90 to-background",
  };

  const heightClasses = {
    small: "min-h-[40vh]",
    medium: "min-h-[50vh]",
    large: "min-h-[70vh]",
  };

  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden",
        heightClasses[minHeight],
        align === "center" ? "justify-center" : "justify-start"
      )}
    >
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover animate-kenburns"
          priority
          sizes="100vw"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            overlayClasses[overlayOpacity]
          )}
        />
      </div>

      <div
        className={cn(
          "container-custom relative z-10 py-16 md:py-20",
          align === "center" ? "text-center" : "text-left"
        )}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground mb-6",
              align === "center" && "justify-center"
            )}
            aria-label="Fil d'Ariane"
          >
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Badge */}
        {badge && (
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium tracking-widest uppercase text-primary mb-6",
              align === "center" && "mx-auto"
            )}
          >
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            {badge}
          </div>
        )}

        {/* Title */}
        <h1
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4",
            align === "center" && "max-w-4xl mx-auto"
          )}
        >
          {renderTitle()}
        </h1>

        {/* Subtitle (colored) */}
        {subtitle && (
          <p className="text-lg md:text-xl text-primary font-medium mb-4">
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-base md:text-lg text-muted-foreground mb-8",
              align === "center" && "max-w-2xl mx-auto"
            )}
          >
            {description}
          </p>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-8 mb-8",
              align === "center" && "justify-center"
            )}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "flex items-center gap-4",
                  index > 0 && "border-l border-border/50 pl-8"
                )}
              >
                <span className="text-2xl md:text-3xl font-light text-primary">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Custom children (search bars, etc.) */}
        {children}

        {/* CTAs */}
        {ctas && ctas.length > 0 && (
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 mt-8",
              align === "center" && "items-center justify-center"
            )}
          >
            {ctas.map((cta) => {
              const isPrimary = cta.variant === "primary" || !cta.variant;
              return (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                    cta.variant === "primary" &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    cta.variant === "secondary" &&
                      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    cta.variant === "outline" &&
                      "border border-border text-foreground hover:bg-secondary",
                    !cta.variant &&
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {cta.label}
                  {isPrimary && <ArrowRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
