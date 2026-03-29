import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, Phone, Mail, MessageSquare, Settings,
  Clock, Users, Building, FileText, Laptop, Heart,
  ExternalLink, HeartHandshake,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "Personnes en situation de handicap | C&Co Formation",
  description: "C&Co Formation accompagne les personnes en situation de handicap. Référent handicap dédié, adaptations personnalisées, accessibilité des locaux et des formations.",
  openGraph: { title: "Handicap & Inclusion | C&Co Formation", description: "Accompagnement personnalisé des personnes en situation de handicap." },
};

const etapes = [
  { numero: "01", icon: MessageSquare, title: "Prise de contact", desc: "Nous échangeons sur vos besoins, contraintes et objectifs. Le référent handicap analyse votre situation." },
  { numero: "02", icon: Settings, title: "Adaptations", desc: "Supports pédagogiques, modalités d'évaluation, rythme de formation et environnement physique adaptés." },
  { numero: "03", icon: Clock, title: "Suivi continu", desc: "Un suivi régulier tout au long de votre formation pour ajuster et garantir votre réussite." },
];

const engagements = [
  { icon: Building, title: "Accessibilité des locaux", desc: "Rampes d'accès, ascenseurs, places de parking adaptées, sanitaires accessibles." },
  { icon: FileText, title: "Supports adaptés", desc: "Documents en grands caractères, formats numériques accessibles, sous-titrage des vidéos." },
  { icon: Clock, title: "Rythme personnalisé", desc: "Aménagement du temps de formation, pauses régulières, durée des évaluations adaptée." },
  { icon: Users, title: "Accompagnement individualisé", desc: "Un référent handicap dédié avant, pendant et après votre formation." },
  { icon: Laptop, title: "Technologies d'assistance", desc: "Logiciels de lecture d'écran, synthèse vocale, claviers adaptés, loupes électroniques." },
  { icon: Heart, title: "Communication inclusive", desc: "Une équipe formée et sensibilisée au handicap, à votre écoute." },
];

const typesHandicap = [
  { title: "Handicap moteur", adaptations: ["Locaux accessibles PMR", "Mobilier adapté", "Temps supplémentaire", "Pauses régulières"] },
  { title: "Handicap visuel", adaptations: ["Documents en grands caractères", "Synthèse vocale", "Loupes électroniques", "Format audio"] },
  { title: "Handicap auditif", adaptations: ["Sous-titrage", "Interprétation LSF", "Supports visuels", "Communication écrite"] },
  { title: "Handicap cognitif", adaptations: ["Documents simplifiés", "Consignes claires", "Rythme adapté", "Accompagnement renforcé"] },
  { title: "Troubles psychiques", adaptations: ["Environnement calme", "Pauses aménagées", "Soutien personnalisé", "Flexibilité horaire"] },
  { title: "Maladies invalidantes", adaptations: ["Aménagement du temps", "Possibilité de pauses", "Suivi médical facilité", "Formation à distance"] },
];

const organismes = [
  { nom: "AGEFIPH", desc: "Insertion professionnelle des personnes handicapées dans le secteur privé.", lien: "https://www.agefiph.fr" },
  { nom: "FIPHFP", desc: "Insertion des personnes handicapées dans la fonction publique.", lien: "https://www.fiphfp.fr" },
  { nom: "Cap Emploi", desc: "Accompagnement vers l'emploi des personnes en situation de handicap.", lien: "https://www.capemploi.info" },
  { nom: "MDPH", desc: "Guichet unique pour toutes vos démarches handicap.", lien: "https://www.monparcourshandicap.gouv.fr" },
];

const faqItems = [
  { q: "Comment puis-je signaler mon handicap avant une formation ?", a: "Contactez notre référent handicap dès votre inscription. Toutes les informations sont confidentielles. Nous échangerons ensemble pour identifier les adaptations nécessaires." },
  { q: "Les formations sont-elles éligibles aux aides AGEFIPH ou FIPHFP ?", a: "Oui, nos formations sont éligibles aux financements AGEFIPH (secteur privé) et FIPHFP (fonction publique). Notre équipe peut vous accompagner dans vos démarches." },
  { q: "La RQTH est-elle obligatoire pour bénéficier d'adaptations ?", a: "Non. Nous accueillons toute personne ayant besoin d'adaptations, avec ou sans reconnaissance administrative. La RQTH est cependant nécessaire pour certains financements spécifiques." },
];

export default function HandicapPage() {
  return (
    <>
      {/* ═══ 1. HERO ═══ */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 60%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Handicap</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <HeartHandshake className="w-4 h-4 text-[#F8A991]" />
            <span className="text-[13px] font-medium text-white/80">Référent handicap dédié</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-3xl mx-auto mb-6">
            Un accompagnement <span style={{ color: "#F8A991" }}>sur mesure.</span>
          </h1>
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Référent handicap dédié, locaux PMR, aménagements personnalisés. Votre réussite est notre priorité.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            {[
              { icon: HeartHandshake, text: "Référent dédié" },
              { icon: CheckCircle, text: "Locaux PMR" },
              { icon: Users, text: "25 000+ formés" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-[12px] ring-[#151F2D]">
            <div className="absolute inset-0" style={{ animation: "heroSlide1 12s ease-in-out infinite" }}>
              <Image src="/images/fonds_sections/fond_handicap1.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover" priority />
            </div>
            <div className="absolute inset-0" style={{ animation: "heroSlide2 12s ease-in-out infinite" }}>
              <Image src="/images/fonds_sections/fond_handicap2.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12" />
      </section>

      {/* ═══ 2. ACCOMPAGNEMENT — timeline horizontale ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>Notre démarche</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white">
                Un accompagnement en <span style={{ color: "#F8A991" }}>3 étapes.</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-[16px] leading-[1.9]" style={{ color: "rgba(255,255,255,0.55)" }}>
                De votre premier contact jusqu&apos;à la fin de votre formation, nous vous accompagnons à chaque étape pour garantir une expérience adaptée à vos besoins.
              </p>
            </div>
          </div>

          {/* Steps — large numbers */}
          <div className="grid md:grid-cols-3 gap-0">
            {etapes.map((e, idx) => {
              const Icon = e.icon;
              return (
                <div key={e.numero} className="relative p-8" style={idx > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.06)" } : undefined}>
                  <span className="block text-[5rem] font-bold leading-none mb-4" style={{ color: "rgba(248,169,145,0.08)" }}>{e.numero}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{e.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{e.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 3. ENGAGEMENTS — fond bleu ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#1F628E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Nos engagements</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Des adaptations concrètes pour votre <span style={{ color: "#F8A991" }}>réussite.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {engagements.map((eng) => {
              const Icon = eng.icon;
              return (
                <div key={eng.title} className="rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{eng.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/60">{eng.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. RÉFÉRENT — 50/50 avec photo ═══ */}
      <section id="contact-referent" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 min-h-[70vh]">
            {/* Texte */}
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-20 lg:py-28">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest mb-6" style={{ color: "#F8A991" }}>Votre interlocuteur</span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] text-white mb-8">
                Le référent handicap : à votre <span style={{ color: "#F8A991" }}>écoute.</span>
              </h2>
              <p className="text-[16px] leading-[1.9] mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
                Notre référent handicap est votre interlocuteur privilégié. Il vous accompagne tout au long de votre parcours pour identifier vos besoins et mettre en place les adaptations nécessaires.
              </p>

              {/* Checklist */}
              <div className="space-y-3 mb-10">
                {["Écoute et confidentialité", "Analyse personnalisée", "Suivi tout au long de la formation", "Lien avec les organismes partenaires"].map((t) => (
                  <div key={t} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4" style={{ color: "#F8A991" }} />
                    <span className="text-[14px] text-white/70">{t}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="tel:+33762596653" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[14px] transition-all hover:scale-[1.02]" style={{ backgroundColor: "#F8A991", color: "#151F2D" }}>
                  <Phone className="w-4 h-4" /> 07 62 59 66 53
                </a>
                <a href="mailto:handicap@candco.fr" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[14px] text-white transition-all hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Mail className="w-4 h-4" /> handicap@candco.fr
                </a>
              </div>
            </div>
            {/* Photo */}
            <div className="relative min-h-[400px] lg:min-h-0 overflow-hidden">
              <Image src="/images/fondateur/nicolas-devaux.jpg" alt="Référent handicap" fill sizes="50vw" className="object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#151F2D] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. TYPES DE HANDICAP — grille compacte ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Adaptations possibles</span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Comprendre le handicap en <span style={{ color: "#F8A991" }}>formation.</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
              Nous adaptons nos formations à tous les types de handicap.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {typesHandicap.map((t) => (
              <div key={t.title} className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-[15px] font-bold text-white mb-3">{t.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {t.adaptations.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: "rgba(248,169,145,0.08)", color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle className="w-3 h-3" style={{ color: "#F8A991" }} />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. ORGANISMES — horizontal compact ═══ */}
      <section className="py-16" style={{ backgroundColor: "#151F2D", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#F8A991" }}>Ressources utiles</span>
              <h2 className="text-2xl font-normal tracking-tight text-white">Organismes <span style={{ color: "#F8A991" }}>partenaires.</span></h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {organismes.map((o) => (
              <a key={o.nom} href={o.lien} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-xl p-5 transition-all duration-300 hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="shrink-0 mt-0.5">
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#F8A991] transition-colors" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white mb-1">{o.nom}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{o.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. FAQ ═══ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-16">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>FAQ</span>
              <h2 className="text-3xl font-normal tracking-tight text-white mb-4">
                Vos questions, nos <span style={{ color: "#F8A991" }}>réponses.</span>
              </h2>
              <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Les réponses aux questions les plus fréquentes sur le handicap en formation.
              </p>
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

      {/* ═══ 8. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
