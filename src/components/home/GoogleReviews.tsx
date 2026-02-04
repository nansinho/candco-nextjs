"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

export function GoogleReviews() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Éviter de charger le script plusieurs fois
    if (scriptLoadedRef.current) return;

    const loadTrustindex = () => {
      if (typeof window !== "undefined" && containerRef.current) {
        // Supprimer tout script existant pour éviter les doublons
        const existingScript = document.querySelector('script[src*="trustindex.io"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Créer et insérer le script dans notre conteneur
        const script = document.createElement("script");
        script.src = "https://cdn.trustindex.io/loader.js?4c6f9f463da979114096634798b";
        script.async = true;
        script.defer = true;

        // Insérer le script DANS notre conteneur pour que le widget apparaisse ici
        containerRef.current.appendChild(script);
        scriptLoadedRef.current = true;
      }
    };

    // Petit délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(loadTrustindex, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="google-reviews" className="section-padding bg-card border-y border-border">
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

        {/* Trustindex Widget Container - Le widget s'injectera ici */}
        <div
          ref={containerRef}
          className="min-h-[200px] trustindex-widget-container"
        />
      </div>
    </section>
  );
}
