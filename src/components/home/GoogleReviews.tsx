"use client";

import Script from "next/script";
import { Star } from "lucide-react";

export function GoogleReviews() {
  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Avis Google
            </span>
            <h2 className="heading-section mt-2">Ils nous font confiance.</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-lg">Google</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-1">
                4.9 · Basé sur 50+ avis
              </span>
            </div>
          </div>
        </div>

        {/* Trustindex Widget Container */}
        <div className="min-h-[200px]">
          <Script
            src="https://cdn.trustindex.io/loader.js?4c6f9f463da979114096634798b"
            strategy="lazyOnload"
          />
        </div>
      </div>
    </section>
  );
}
