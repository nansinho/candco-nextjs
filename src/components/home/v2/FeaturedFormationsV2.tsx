"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Formation { id: string; title: string; subtitle: string; slug: string; duration: string; price: string; pole: string; pole_name: string; image_url: string | null; }

const colors: Record<string, string> = {
  "securite-prevention": "#e74c3c",
  "petite-enfance": "#1abc9c",
  sante: "#3498db",
};

const defaultImages: Record<string, string> = {
  "securite-prevention": "/images/poles/pole-security.jpg",
  "petite-enfance": "/images/poles/pole-childhood.jpg",
  sante: "/images/poles/pole-health.jpg",
};

function FormationCard({ f }: { f: Formation }) {
  const accent = colors[f.pole] || "#1F628E";
  return (
    <Link href={`/formations/${f.pole}/${f.slug || f.id}`} className="group block h-full">
      <article
        className="rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(248,169,145,0.15)] hover:brightness-110 transition-all duration-300 h-full flex flex-col"
        style={{ backgroundColor: `${accent}30`, border: `1.5px solid ${accent}55` }}
      >
        <div className="relative aspect-[3/1] overflow-hidden">
          <Image
            src={f.image_url || defaultImages[f.pole] || "/images/poles/pole-security.jpg"}
            alt={f.title}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ backgroundColor: accent }}>{f.pole_name}</span>
            {f.duration && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center gap-1">
                <Clock className="w-3 h-3" /> {f.duration}
              </span>
            )}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-[15px] font-bold text-white leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-[#F8A991] transition-colors">{f.title}</h3>
          <p className="text-[13px] text-white/40 line-clamp-2 mb-3 min-h-[2.5rem]">{f.subtitle || "\u00A0"}</p>
          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${accent}33` }}>
            <p className="text-lg font-extrabold text-white">{f.price}</p>
            <span className="text-xs font-bold transition-colors flex items-center gap-1" style={{ color: accent }}>
              Détails <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

const PER_PAGE = 6;

export default function FeaturedFormationsV2({ formations }: { formations: Formation[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", slidesToScroll: 1 },
    [Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })]
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

  if (!formations?.length) return null;

  const pages: Formation[][] = [];
  for (let i = 0; i < formations.length; i += PER_PAGE) {
    pages.push(formations.slice(i, i + PER_PAGE));
  }

  return (
    <section
      className="py-20 sm:py-24"
      style={{ backgroundColor: "#141F2D" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F8A991] mb-4">
              Catalogue
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-extrabold tracking-tight text-white mb-2">
              Formations populaires
            </h2>
            <p className="text-base text-white/60 max-w-xl">
              Découvrez nos formations les plus demandées par les professionnels.
            </p>
          </div>

          {pages.length > 1 && (
            <div className="flex items-center gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Page ${i + 1}`}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === selectedIndex ? 40 : 16,
                    backgroundColor: i === selectedIndex ? "#F8A991" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Embla carousel */}
        <div ref={emblaRef} style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 40 }}>
            {pages.map((pageFormations, pageIdx) => (
              <div
                key={pageIdx}
                style={{ flex: "0 0 100%", minWidth: 0 }}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pageFormations.map(f => (
                    <FormationCard key={f.id} f={f} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 bg-[#F8A991] text-[#141F2D] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#f9b8a5] transition-all shadow-lg"
          >
            Voir toutes les formations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
