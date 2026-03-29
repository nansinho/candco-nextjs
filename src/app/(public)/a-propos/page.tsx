import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Award, Target, Heart, ShieldCheck, Lightbulb, Handshake,
  Star, Users, CheckCircle, BookOpen, MessageCircle, Smile,
  Monitor,
} from "lucide-react";
import AboutClient from "./AboutClient";
import ParallaxLogo from "./ParallaxLogo";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "À Propos de C&Co Formation | Organisme Certifié Qualiopi",
  description: "Découvrez C&Co Formation, organisme certifié Qualiopi fondé par Nicolas Devaux. 15 ans d'expérience terrain.",
  openGraph: { title: "À Propos | C&Co Formation", description: "Organisme certifié Qualiopi. 15 ans d'expérience terrain." },
};

export default async function AboutPage() {
  const supabase = await createClient();

  const [formationsRes, inscriptionsRes, formateursRes] = await Promise.all([
    supabase.from("formations").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("inscriptions").select("id", { count: "exact", head: true }),
    supabase.from("formateurs").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  const stats = [
    { value: String(formationsRes.count || 69), label: "Formations" },
    { value: String(inscriptionsRes.count || 336) + "+", label: "Apprenants" },
    { value: "98%", label: "Satisfaction" },
    { value: String(formateursRes.count || 6), label: "Formateurs" },
  ];

  return (
    <>
      {/* ═══ 1. HERO — gradient bleu, comme accueil V2 ═══ */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 60%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">À propos</span>
          </nav>

          {/* Rating pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[13px] font-medium text-white/80">4.9 · Plus de 50 avis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-5xl mx-auto mb-6">
            <span style={{ color: "#F8A991" }}>C&amp;Co Formation</span> — Former ceux qui protègent.
          </h1>
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Organisme certifié Qualiopi, 15 ans d&apos;expérience, +25 000 professionnels formés en Sécurité, Petite Enfance et Santé.
          </p>

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

        {/* Hero image — comme accueil V2 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-[12px] ring-[#151F2D]">
            <div className="absolute inset-0 animate-[kenBurnsLoop_15s_ease-in-out_infinite]">
              <Image src="/hero-training.jpg" alt="C&Co Formation" fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
              <div className="space-y-2 sm:space-y-3">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "#1F628E" }}>
                  Depuis 2009
                </span>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  Un organisme de formation de référence
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12" />
      </section>

      {/* ═══ 2. NOTRE HISTOIRE — dark #151F2D ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>Notre histoire</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] text-white">
                La formation professionnelle, <span style={{ color: "#F8A991" }}>repensée.</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-[16px] leading-[1.9] mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
                Ce qui a commencé comme la vision d&apos;un ancien Marin-Pompier est devenu un organisme de formation de référence. De nos débuts à Marseille, notre parcours est guidé par la passion de transmettre et l&apos;excellence pédagogique.
              </p>
              <p className="text-[16px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.55)" }}>
                Notre objectif : rendre chaque professionnel plus compétent et confiant. En combinant expertise terrain et innovation, nous redéfinissons la formation continue.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, idx) => (
              <div key={s.label} className="py-8 text-center" style={idx > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.08)" } : undefined}>
                <p className="text-5xl sm:text-6xl font-normal text-white tracking-tight">{s.value}</p>
                <p className="text-[13px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. MOT DU FONDATEUR — 50/50 ═══ */}
      <section style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 min-h-[80vh]">
            {/* Texte — 50% gauche */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-20 lg:py-28">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest mb-6" style={{ color: "#F8A991" }}>Mot du fondateur</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] text-white mb-10">
                Nicolas Devaux, une <span style={{ color: "#F8A991" }}>expertise de terrain.</span>
              </h2>
              <div className="space-y-5 mb-10">
                <p className="text-[16px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Quand j&apos;ai fondé C&Co Formation, ma vision était simple : créer quelque chose qui apporte une vraie valeur, qui fait la différence dans la vie des professionnels.
                </p>
                <p className="text-[16px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Ce n&apos;est pas juste un organisme. C&apos;est un espace où les compétences se développent, où les défis sont relevés avec méthode. Rien de tout cela ne serait possible sans votre confiance.
                </p>
              </div>
              <div className="mb-8">
                <p className="text-[15px] font-extrabold text-white">Nicolas Devaux</p>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>Fondateur & Directeur</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Award className="w-3.5 h-3.5" /> RNCP 36215
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Target className="w-3.5 h-3.5" /> Marins-Pompiers de Marseille
                </span>
              </div>
            </div>
            {/* Photo — 50% droite */}
            <div className="relative min-h-[400px] lg:min-h-0 overflow-hidden">
              <Image src="/images/fondateur/nicolas-devaux.jpg" alt="Nicolas Devaux" fill sizes="50vw" className="object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#151F2D] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#151F2D]/50 to-transparent h-[20%]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. PHOTO FULL-WIDTH — parallax + logo scroll ═══ */}
      <ParallaxLogo />

      {/* ═══ 5. VALEURS — bleu ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#1F628E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Nos valeurs</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Nos valeurs <span style={{ color: "#F8A991" }}>fondamentales</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Ce qui nous guide au quotidien dans chacune de nos formations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Handshake, title: "Collaboration", desc: "Travailler ensemble, créer de la valeur avec chaque apprenant." },
              { icon: Lightbulb, title: "Innovation", desc: "Continuellement évoluer pour répondre aux défis et opportunités." },
              { icon: ShieldCheck, title: "Excellence", desc: "S'engager aux plus hauts standards dans nos formations." },
              { icon: Heart, title: "Bienveillance", desc: "Favoriser un impact positif durable pour chaque participant." },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 6. NOTRE APPROCHE — dark ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Notre approche</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Les clés de notre <span style={{ color: "#F8A991" }}>réussite.</span>
            </h2>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
              Nous avons développé une méthodologie pédagogique unique, alliant expertise terrain et innovation, pour garantir votre réussite.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Pédagogie sur mesure", desc: "Chaque formation est adaptée aux besoins spécifiques de nos apprenants et aux réalités du terrain." },
              { icon: Lightbulb, title: "Apprentissage actif", desc: "Nos méthodes innovantes, notamment la simulation immersive, permettent une acquisition rapide des compétences." },
              { icon: MessageCircle, title: "Suivi personnalisé", desc: "Un accompagnement individualisé tout au long de votre parcours, assuré par des formateurs expérimentés." },
              { icon: Smile, title: "Ambiance conviviale", desc: "Un environnement bienveillant qui favorise l'apprentissage et les échanges entre participants." },
              { icon: Monitor, title: "Outils pédagogiques variés", desc: "Supports numériques, mises en situation, études de cas : une diversité de méthodes pour mieux apprendre." },
              { icon: ShieldCheck, title: "Expertise terrain", desc: "Des formateurs issus du terrain, apportant leur expérience opérationnelle à chaque session." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 7. QUALIOPI — dark ═══ */}
      <AboutClient />

      {/* ═══ 8. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
