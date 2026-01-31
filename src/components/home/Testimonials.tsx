import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marie Dupont",
    role: "Agent de sécurité",
    content: "La formation Sécurité Incendie a été excellente. Les formateurs sont de vrais professionnels du terrain. J'ai obtenu mon diplôme du premier coup.",
  },
  {
    id: 2,
    name: "Thomas Martin",
    role: "Aide-soignant",
    content: "Grâce à C&Co Formation, j'ai validé ma formation Gestes d'Urgence. L'équipe est très à l'écoute et les locaux sont modernes. Je recommande.",
  },
  {
    id: 3,
    name: "Sophie Bernard",
    role: "Auxiliaire de puériculture",
    content: "La formation sur les pédagogies alternatives m'a permis d'enrichir ma pratique. Approche très concrète et applicable au quotidien.",
  },
];

const stats = [
  { value: "4.9/5", label: "Note moyenne" },
  { value: "25K+", label: "Stagiaires formés" },
  { value: "98%", label: "Recommandent" },
  { value: "1200+", label: "Avis positifs" },
];

export default function Testimonials() {
  return (
    <section className="section-padding border-t border-border/50">
      <div className="container-custom">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">
            Témoignages
          </p>
          <h2 className="heading-section">
            Ce que disent nos stagiaires.
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-card rounded-xl border border-border/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <Quote className="w-5 h-5 text-primary mb-4" />
              <p className="text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div>
                <p className="font-medium text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-border/50">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl lg:text-3xl font-light mb-1 text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
