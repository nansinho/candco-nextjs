"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Baby, HeartPulse, Briefcase, type LucideIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface PoleConfig { id: string; title: string; description: string; image: string; icon: string; color: string; }

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Baby,
  HeartPulse,
  Briefcase,
};

const accents: Record<string, string> = {
  "pole-securite": "#A82424",
  "pole-petite-enfance": "#2D867E",
  "pole-sante": "#507395",
  "primary": "#1F628E",
};

function PoleCard({ pole, count }: { pole: PoleConfig; count: number }) {
  const accent = accents[pole.color] || "#1F628E";
  const Icon = iconMap[pole.icon] || Shield;
  return (
    <Link href={`/pole/${pole.id}`} className="group block h-full">
      <article className="relative rounded-3xl h-full transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 overflow-hidden">
        <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden rounded-3xl">
          <Image
            src={pole.image}
            alt={pole.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D] via-[#151F2D]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
          <div className="absolute inset-0 mix-blend-multiply opacity-20" style={{ backgroundColor: accent }} />

          <div className="absolute top-5 right-5">
            <div
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white backdrop-blur-md border border-white/20"
              style={{ backgroundColor: accent + "99" }}
            >
              {count} formation{count > 1 ? "s" : ""}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-7">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
              style={{ backgroundColor: accent }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{pole.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-5 line-clamp-2">
              {pole.description}
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 group-hover:gap-3 group-hover:shadow-lg"
              style={{ backgroundColor: accent }}
            >
              Découvrir le pôle
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function PolesSectionV2({ polesConfig, counts }: { polesConfig: PoleConfig[]; counts: Record<string, number> }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const needsCarousel = polesConfig.length > 3;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 3, active: needsCarousel },
    needsCarousel ? [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })] : []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const totalSnaps = emblaApi?.scrollSnapList().length || 1;

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#1F628E] mb-4">
            Nos pôles
          </span>
          <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-[#151F2D] mb-4">
            Nos domaines d&apos;<span style={{ color: "#1F628E" }}>expertise</span>
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            {polesConfig.length} pôles de formation pour accompagner votre évolution professionnelle.
          </p>
        </div>

        {/* Grid on mobile, Embla carousel on desktop if needed */}
        <div ref={emblaRef} style={{ overflow: "hidden" }}>
          <div className={needsCarousel ? "" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"} style={needsCarousel ? { display: "flex", gap: 24 } : undefined}>
            {polesConfig.map(pole => {
              const count = counts[pole.id] || 0;
              return (
                <div
                  key={pole.id}
                  className={needsCarousel ? "" : "min-w-0"}
                  style={needsCarousel ? { flex: "0 0 calc(33.333% - 16px)", minWidth: 0 } : undefined}
                >
                  <PoleCard pole={pole} count={count} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators */}
        {needsCarousel && totalSnaps > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {Array.from({ length: totalSnaps }).map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Page ${i + 1}`}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === selectedIndex ? 40 : 16,
                  backgroundColor: i === selectedIndex ? "#1F628E" : "rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
