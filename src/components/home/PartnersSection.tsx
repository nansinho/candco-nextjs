import Image from "next/image";

const partners = [
  { name: "Qualiopi", logo: "/logo-qualiopi.png", alt: "Certification Qualiopi" },
  { name: "France Travail", logo: "/logo-france-travail.svg", alt: "France Travail" },
  { name: "Pôle Emploi", logo: "/logo-pole-emploi.svg", alt: "Pôle Emploi" },
  { name: "Région PACA", logo: "/logo-region-paca.svg", alt: "Région Provence-Alpes-Côte d'Azur" },
  { name: "Région Occitanie", logo: "/logo-region-occitanie.svg", alt: "Région Occitanie" },
  { name: "Île-de-France", logo: "/logo-region-idf.svg", alt: "Région Île-de-France" },
];

export default function PartnersSection() {
  return (
    <section
      className="py-12 md:py-16 border-y border-border/50 bg-muted/10 overflow-hidden"
      aria-label="Nos partenaires et certifications"
    >
      <div className="container-custom">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
            Nos partenaires & certifications
          </p>
        </div>
      </div>

      {/* Infinite scroll carousel */}
      <div className="relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" aria-hidden="true" />

        <div className="partners-carousel">
          <div className="partners-track">
            {/* Quadruple logos for smooth infinite scroll */}
            {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm shrink-0 mx-3 md:mx-6"
              >
                <Image
                  src={partner.logo}
                  alt={partner.alt}
                  width={120}
                  height={56}
                  className="h-10 md:h-14 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Screen reader list */}
        <ul className="sr-only">
          {partners.map((partner) => (
            <li key={partner.name}>{partner.alt}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
