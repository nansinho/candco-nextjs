"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const partners = [
  { name: "France Travail", logo: "/logo-france-travail.svg", alt: "France Travail" },
  { name: "Région Sud", logo: "/region-sud-provence-alpes-cote-d-azur-noir.svg", alt: "Région Sud Provence-Alpes-Côte d'Azur" },
  { name: "Région Occitanie", logo: "/images/logos_regions/logo-region-occitanie.svg", alt: "Région Occitanie" },
  { name: "Île-de-France", logo: "/images/logos_regions/logo-region-idf.svg", alt: "Région Île-de-France" },
];

// Number of visible slots
const SLOTS = 4;

export default function PartnersSectionV2() {
  const [slots, setSlots] = useState(() => [...partners].slice(0, SLOTS));
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);
  const nextIdxRef = useRef(0);

  const swapNext = useCallback(() => {
    const idx = nextIdxRef.current;
    nextIdxRef.current = (idx + 1) % SLOTS;
    setFlippingIndex(idx);

    // After half the flip, swap the logo
    setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        let newPartner;
        do {
          newPartner = partners[Math.floor(Math.random() * partners.length)];
        } while (newPartner.name === next[idx].name && partners.length > 1);
        next[idx] = newPartner;
        return next;
      });
    }, 500);

    // Reset flip state after animation completes
    setTimeout(() => {
      setFlippingIndex(null);
    }, 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(swapNext, 2000);
    return () => clearInterval(interval);
  }, [swapNext]);

  return (
    <section className="relative z-[1] -mt-[500px] sm:-mt-[550px] pt-[540px] sm:pt-[600px] pb-16 sm:pb-20 bg-[#151F2D]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-10 md:gap-16 lg:gap-20">
          {slots.map((partner, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                perspective: "600px",
              }}
            >
              <div
                style={{
                  transform: flippingIndex === i ? "rotateX(-90deg) scale(0.95)" : "rotateX(0deg) scale(1)",
                  opacity: flippingIndex === i ? 0 : 1,
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative h-12 md:h-16 w-[160px] md:w-[200px]">
                  <Image
                    src={partner.logo}
                    alt={partner.alt}
                    fill
                    className="object-contain brightness-0 invert opacity-60"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
