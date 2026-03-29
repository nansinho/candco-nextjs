"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Users, Award, CheckCircle, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  title: string;
  category?: string;
  category_color?: string;
  date?: string;
  excerpt?: string;
  image_url: string;
  href: string;
}

const defaultSlides: HeroSlide[] = [
  {
    title: "Formation Sécurité Incendie",
    category: "Sécurité",
    category_color: "#e74c3c",
    date: "Avril 2026",
    image_url: "/images/poles/pole-security.jpg",
    href: "/formations",
  },
  {
    title: "CAP Accompagnant Éducatif",
    category: "Petite Enfance",
    category_color: "#1abc9c",
    date: "Mai 2026",
    image_url: "/images/poles/pole-childhood.jpg",
    href: "/formations",
  },
  {
    title: "Formation Gestes d'Urgence",
    category: "Santé",
    category_color: "#3498db",
    date: "Avril 2026",
    image_url: "/images/poles/pole-health.jpg",
    href: "/formations",
  },
];

const partners = [
  { name: "France Travail", logo: "/logo-france-travail.svg", alt: "France Travail" },
  { name: "Région Sud", logo: "/region-sud-provence-alpes-cote-d-azur-noir.svg", alt: "Région Sud" },
  { name: "Région Occitanie", logo: "/images/logos_regions/logo-region-occitanie.svg", alt: "Région Occitanie" },
  { name: "Île-de-France", logo: "/images/logos_regions/logo-region-idf.svg", alt: "Île-de-France" },
];

export default function HeroSectionV2({ slides }: { slides?: HeroSlide[] }) {
  const items = slides?.length ? slides : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [visibleLogo, setVisibleLogo] = useState(0);

  useEffect(() => {
    const logoTimer = setInterval(() => {
      setVisibleLogo((prev) => (prev + 1) % partners.length);
    }, 2000);
    return () => clearInterval(logoTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  const slide = items[current];

  return (
    /*
     * Wrapper div — contient le hero ET le carousel.
     * Le z-10 crée un stacking context : tout ce qui est dedans
     * (y compris le carousel qui déborde) sera au-dessus de la section suivante (z-[1]).
     */
    <section
      className="relative z-10 lg:h-svh"
      style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 60%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 text-center">
          {/* Rating pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[13px] font-medium text-white/80">4.9 · Plus de 50 avis</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-5xl mx-auto mb-6">
            Votre formation professionnelle, <span style={{ color: "#F8A991" }}>réinventée</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            C&Co Formation, organisme certifié Qualiopi. Des formations en Sécurité, Petite Enfance et Santé conçues pour développer vos compétences.
          </p>

          {/* CTA */}
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 bg-[#F8A991] text-[#151F2D] px-8 py-3 rounded-xl font-bold text-[15px] hover:bg-[#f69b80] transition-colors shadow-xl shadow-black/10 mb-10"
          >
            Explorer nos formations
          </Link>

          {/* Stamp badge — top right */}
          <div className="absolute top-28 right-8 lg:right-16 hidden lg:block rotate-12 animate-[float_5s_ease-in-out_infinite]">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Note de satisfaction 4.9 sur 5">
              <circle cx="55" cy="55" r="50" stroke="white" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
              <circle cx="55" cy="55" r="42" stroke="white" strokeWidth="1.5" opacity="0.3" />
              <text x="55" y="42" textAnchor="middle" fill="white" fontSize="24" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">4.9</text>
              <text x="55" y="57" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="'Plus Jakarta Sans',sans-serif" opacity="0.8" letterSpacing="1.5">SATISFACTION</text>
              <text x="55" y="72" textAnchor="middle" fill="#fbbf24" fontSize="14" fontFamily="'Plus Jakarta Sans',sans-serif">★★★★★</text>
            </svg>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            {[
              { icon: Users, text: "25 000+ Formés" },
              { icon: CheckCircle, text: "98% Réussite" },
              { icon: Award, text: "Certifié Qualiopi" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {`Slide ${current + 1} sur ${items.length}: ${slide.title}`}
            </div>
            {/* Main image container */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-[12px] ring-[#151F2D]">
              {items.map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{ opacity: i === current ? 1 : 0 }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      animation: i === current ? "heroKenBurns 8s ease-out forwards" : "none",
                      transform: i === current ? undefined : "scale(1)",
                    }}
                  >
                    <Image
                      src={s.image_url}
                      alt={s.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1100px"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </div>
              ))}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

              {/* Slide content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-5">
                  <div className="space-y-2 sm:space-y-3">
                    {slide.category && (
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white"
                        style={{ backgroundColor: slide.category_color || "#1F628E" }}
                      >
                        {slide.category}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                      {slide.title}
                    </h2>
                    {slide.date && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-4 h-4" />
                        {slide.date}
                      </div>
                    )}
                  </div>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 sm:gap-2.5 bg-white text-gray-900 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/90 transition-all shadow-lg shrink-0"
                  >
                    Découvrir <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>

              {/* Navigation arrows — visible on mobile, hover-reveal on desktop */}
              <button
                aria-label="Slide précédent"
                onClick={() => setCurrent((current - 1 + items.length) % items.length)}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 sm:bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-black/50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                aria-label="Slide suivant"
                onClick={() => setCurrent((current + 1) % items.length)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 sm:bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-black/50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {items.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Aller au slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer"
                  style={{ width: i === current ? 40 : 8, backgroundColor: i === current ? "transparent" : "rgba(255,255,255,0.3)" }}
                >
                  {i === current && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-white/20" />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          backgroundColor: items[current].category_color || "#ffffff",
                          animation: "slideProgress 4s linear forwards",
                        }}
                      />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Logos partenaires — dans la zone #151F2D du gradient */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12" aria-label="Partenaires institutionnels">
        <div className="flex items-center justify-center sm:justify-between gap-6 sm:gap-4 flex-wrap sm:flex-nowrap">
          {partners.map((partner, i) => (
            <div
              key={partner.name}
              className="flex items-center justify-center transition-all duration-700"
              style={{
                opacity: i === visibleLogo ? 1 : 0.4,
                transform: i === visibleLogo ? "scale(1.1)" : "scale(1)",
              }}
            >
              <div className="relative h-10 sm:h-12 md:h-16 w-[120px] sm:w-[160px] md:w-[200px]">
                <Image
                  src={partner.logo}
                  alt={partner.alt}
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
