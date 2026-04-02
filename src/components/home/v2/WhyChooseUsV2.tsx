import Image from "next/image";
import { Users, Award, Headphones, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Formateurs experts",
    desc: "Nos formateurs sont des professionnels en activité qui partagent leur expertise concrète du terrain.",
    bg: "#151F2D",
    iconBg: "rgba(255,255,255,0.15)",
    iconColor: "#ffffff",
    titleColor: "#ffffff",
    descColor: "rgba(255,255,255,0.7)",
  },
  {
    icon: Award,
    title: "Formations certifiantes",
    desc: "Obtenez des certifications reconnues par l'État. Éligibles aux financements OPCO et CPF.",
    bg: "#1F628E",
    iconBg: "rgba(255,255,255,0.15)",
    iconColor: "#ffffff",
    titleColor: "#ffffff",
    descColor: "rgba(255,255,255,0.7)",
  },
  {
    icon: Headphones,
    title: "Accompagnement personnalisé",
    desc: "Un conseiller dédié vous guide de A à Z : choix de formation, financement et suivi.",
    bg: "#F8A991",
    iconBg: "rgba(255,255,255,0.3)",
    iconColor: "#151F2D",
    titleColor: "#151F2D",
    descColor: "rgba(21,31,45,0.7)",
  },
  {
    icon: TrendingUp,
    title: "Financement facilité",
    desc: "OPCO, Pôle Emploi, plan de formation — nous trouvons la solution adaptée à votre situation.",
    bg: "#F1F5F9",
    iconBg: "rgba(31,98,142,0.1)",
    iconColor: "#1F628E",
    titleColor: "#151F2D",
    descColor: "#64748b",
  },
];

function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const Icon = f.icon;
  return (
    <div
      className="rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-start"
      style={{ backgroundColor: f.bg }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: f.iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: f.iconColor }} />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: f.titleColor }}>{f.title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: f.descColor }}>{f.desc}</p>
    </div>
  );
}

export default function WhyChooseUsV2() {
  return (
    <section className="py-20 sm:py-24 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-[2.5rem] font-normal tracking-tight text-[#151F2D] mb-4">
          Pourquoi choisir <span style={{ color: "#1F628E" }}>C&amp;Co Formation</span>
        </h2>
        <p className="text-center text-base text-gray-500 max-w-xl mx-auto mb-14">
          Un organisme certifié Qualiopi qui place la qualité et l&apos;accompagnement au cœur de chaque formation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Row 1: 2 cards + 1 photo */}
          <div className="sm:col-span-1">
            <FeatureCard f={features[0]} />
          </div>
          <div className="sm:col-span-1">
            <FeatureCard f={features[1]} />
          </div>
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[250px]">
            <Image
              src="/images/poles/pole-security.jpg"
              alt="Formation sécurité incendie"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 640px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Nos formations</span>
              <p className="text-lg font-bold text-white mt-1">Sécurité & Prévention</p>
            </div>
          </div>

          {/* Row 2: photo enfance + photo santé + 2 cards */}
          <div className="sm:col-span-1 relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[250px]">
            <Image
              src="/images/poles/pole-childhood.jpg"
              alt="Formation petite enfance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Nos formations</span>
              <p className="text-sm font-bold text-white mt-1">Petite Enfance</p>
            </div>
          </div>
          <div className="sm:col-span-1 relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-[250px]">
            <Image
              src="/images/poles/pole-health.jpg"
              alt="Formation santé et paramédical"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Nos formations</span>
              <p className="text-sm font-bold text-white mt-1">Santé & Paramédical</p>
            </div>
          </div>
          <div className="sm:col-span-1">
            <FeatureCard f={features[2]} />
          </div>
          <div className="sm:col-span-1">
            <FeatureCard f={features[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}
