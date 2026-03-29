"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

export default function GoogleReviewsV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    const script = document.createElement("script");
    script.src = "https://cdn.trustindex.io/loader.js?4c6f9f463da979114096634798b";
    script.async = true;
    script.defer = true;
    containerRef.current.appendChild(script);
    loaded.current = true;
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-wide text-[#F8A991]">
              Avis vérifiés
            </span>
            <h2 className="mt-2 text-3xl sm:text-[2.5rem] font-normal tracking-tight text-[#151F2D]">
              Avis <span style={{ color: "#1F628E" }}>Google</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-[#151F2D]">Google</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-gray-400">4.9 · 50+ avis</span>
          </div>
        </div>
        <div ref={containerRef} className="min-h-[200px]" />
      </div>
    </section>
  );
}
