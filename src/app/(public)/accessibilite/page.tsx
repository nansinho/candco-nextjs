import { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility, Eye, MousePointer, Keyboard, Volume2, Type,
  Contrast, ZoomIn, Settings, CheckCircle, Award, Shield,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "Accessibilité Numérique | Notre Engagement",
  description: "C&Co Formation s'engage pour l'accessibilité numérique. Conformité RGAA et WCAG, fonctionnalités d'accessibilité, démarche d'amélioration continue.",
  openGraph: { title: "Accessibilité Numérique | C&Co Formation", description: "Notre engagement pour un site web accessible à tous." },
};

const fonctionnalites = [
  { icon: Type, title: "Taille du texte", desc: "Agrandissez ou réduisez la taille des textes selon vos besoins." },
  { icon: Contrast, title: "Contraste élevé", desc: "Activez un mode à contraste renforcé pour une meilleure lisibilité." },
  { icon: Eye, title: "Mode dyslexie", desc: "Une police adaptée pour faciliter la lecture." },
  { icon: MousePointer, title: "Curseur agrandi", desc: "Augmentez la taille du curseur pour une meilleure visibilité." },
  { icon: Keyboard, title: "Navigation clavier", desc: "Naviguez sur le site uniquement avec votre clavier." },
  { icon: Volume2, title: "Lecteur d'écran", desc: "Compatible avec JAWS, NVDA et VoiceOver." },
  { icon: ZoomIn, title: "Zoom", desc: "Zoomez jusqu'à 200% sans perte de fonctionnalité." },
  { icon: Settings, title: "Personnalisation", desc: "Sauvegardez vos préférences pour vos prochaines visites." },
];

const normes = [
  { title: "RGAA 4.1", desc: "Référentiel Général d'Amélioration de l'Accessibilité, version française du standard.", status: "En cours d'audit" },
  { title: "WCAG 2.1", desc: "Web Content Accessibility Guidelines, normes internationales niveau AA.", status: "Objectif visé" },
  { title: "Loi du 11 février 2005", desc: "Pour l'égalité des droits et des chances des personnes handicapées.", status: "Conforme" },
];

const faqItems = [
  { q: "Comment activer les options d'accessibilité ?", a: "Cliquez sur le bouton d'accessibilité (icône en forme de personnage) situé en bas à droite de l'écran. Un panneau s'ouvrira avec toutes les options disponibles." },
  { q: "Le site est-il compatible avec les lecteurs d'écran ?", a: "Oui, notre site est développé en suivant les standards ARIA et testé avec les principaux lecteurs d'écran : JAWS, NVDA sur Windows et VoiceOver sur Mac/iOS." },
  { q: "Puis-je naviguer uniquement au clavier ?", a: "Absolument. Toutes les fonctionnalités sont accessibles au clavier. Utilisez Tab pour naviguer, Entrée pour activer, et Échap pour fermer les modales." },
  { q: "Que faire si je rencontre un problème d'accessibilité ?", a: "Contactez-nous via le formulaire de contact en précisant la page concernée. Nous nous engageons à répondre sous 48h." },
];

export default function AccessibilitePage() {
  return (
    <>
      {/* ═══ 1. HERO ═══ */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20 sm:pb-28 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Accessibilité</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <Accessibility className="w-4 h-4 text-[#F8A991]" />
            <span className="text-[13px] font-medium text-white/80">Accessibilité Numérique</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-3xl mx-auto mb-6">
            Un site <span style={{ color: "#F8A991" }}>accessible</span> à tous.
          </h1>
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            C&amp;Co Formation s&apos;engage à rendre son site web accessible à toutes les personnes, quelles que soient leurs capacités.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#fonctionnalites" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: "#F8A991", color: "#151F2D" }}>
              Découvrir les fonctionnalités
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all hover:bg-white/10" style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
              Signaler un problème
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 2. FONCTIONNALITÉS — 2 rangées de 4 ═══ */}
      <section id="fonctionnalites" className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>Fonctionnalités</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white">
                Des outils pour personnaliser votre <span style={{ color: "#F8A991" }}>expérience.</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-[16px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.55)" }}>
                Notre widget d&apos;accessibilité vous permet d&apos;adapter le site à vos besoins en quelques clics, depuis toutes les pages.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fonctionnalites.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl p-6 hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <h3 className="text-[14px] font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 3. ENGAGEMENTS + WIDGET — 50/50 bleu ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#1F628E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Engagements */}
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Notre engagement</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-10">
                L&apos;accessibilité au coeur de notre <span style={{ color: "#F8A991" }}>démarche.</span>
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Design inclusif", desc: "Nos interfaces sont conçues dès le départ pour être accessibles à tous." },
                  { title: "Tests réguliers", desc: "Audits automatisés et tests manuels réguliers." },
                  { title: "Formation continue", desc: "Nos équipes sont formées aux bonnes pratiques." },
                  { title: "Amélioration continue", desc: "Correction rapide des problèmes identifiés." },
                ].map((e) => (
                  <div key={e.title} className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-[15px] font-bold text-white">{e.title}</h3>
                      <p className="text-[13px] text-white/60">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget card */}
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <Accessibility className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Activez le widget</h3>
              <p className="text-[14px] text-white/60 mb-6">
                Cliquez sur l&apos;icône d&apos;accessibilité en bas à droite de l&apos;écran pour ouvrir le panneau.
              </p>
              <ul className="space-y-2 text-left max-w-xs mx-auto">
                {["Taille des textes", "Contraste élevé", "Police dyslexie", "Espacement", "Mode lecture"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-white/70">
                    <CheckCircle className="w-3 h-3 text-[#F8A991]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center gap-2 text-[12px] mt-6" style={{ color: "#F8A991" }}>
                <Settings className="w-3.5 h-3.5" />
                Préférences sauvegardées automatiquement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. NORMES — cards horizontales ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Conformité</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Les normes que nous <span style={{ color: "#F8A991" }}>respectons.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {normes.map((n) => (
              <div key={n.title} className="rounded-2xl p-7" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <Award className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <h3 className="text-base font-bold text-white">{n.title}</h3>
                </div>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>{n.desc}</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: "rgba(248,169,145,0.1)", color: "#F8A991" }}>
                  <Shield className="w-3 h-3" /> {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. FAQ — layout 1/3 + 2/3 ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-16">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>FAQ</span>
              <h2 className="text-3xl font-normal tracking-tight text-white mb-4">
                Vos questions, nos <span style={{ color: "#F8A991" }}>réponses.</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline group text-left">
                    <span className="font-medium text-[15px] pr-4 group-hover:text-[#F8A991] transition-colors text-white/90">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <div className="h-px mb-4" style={{ background: "linear-gradient(to right, rgba(248,169,145,0.2), transparent)" }} />
                    <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.5)" }}>{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══ 6. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
