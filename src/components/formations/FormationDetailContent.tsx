"use client";

import {
  Clock,
  Users,
  MapPin,
  Award,
  CheckCircle2,
  GraduationCap,
  FileText,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { InscriptionButton } from "@/components/inscription/InscriptionButton";
import { getFormationImage } from "@/lib/formations-utils";

// ─── Shared type for formation detail data ───
export interface FormationDetailData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pole: string;
  pole_name: string;
  categorie: string | null;
  image_url: string | null;
  certification: string | null;
  duree_heures: number | null;
  duree_jours: number | null;
  format_lieu: string | null;
  nombre_participants_max: number | null;
  nombre_participants_min: number | null;
  price_ht: number | null;
  price_ttc: number | null;
  tarifs: { nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }[];
  objectifs: string[];
  prerequis: string[];
  programme: { titre: string; contenu: string; duree: string }[];
  public_vise: string[];
  competences: string[];
  modalites: { methodes?: string[]; moyens?: string[]; evaluation?: string[] } | null;
  encadrement_pedagogique: string | null;
  financement: string[] | null;
  accessibilite: string | null;
  sessions: { id: string; date_debut: string; date_fin: string; lieu: string; places_disponibles: number }[];
}

// ─── Pole accent colors ───
export const poleColors: Record<string, string> = {
  "securite-prevention": "#A82424",
  "petite-enfance": "#2D867E",
  sante: "#507395",
  entrepreneuriat: "#1F628E",
};

// ─── Sub-components ───
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-4">{children}</h2>;
}

// ─── Main shared template ───
interface FormationDetailContentProps {
  formation: FormationDetailData;
  /** Show image banner (hidden in modal since it has its own) */
  showBanner?: boolean;
  /** Use h1 for title (page) or h2 (modal) */
  titleAs?: "h1" | "h2";
}

export default function FormationDetailContent({
  formation: f,
  showBanner = true,
  titleAs = "h1",
}: FormationDetailContentProps) {
  const accent = poleColors[f.pole] || "#1F628E";
  const TitleTag = titleAs;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      {/* Image Banner */}
      {showBanner && (() => {
        const bannerImage = getFormationImage({ id: f.id, pole: f.pole, image_url: f.image_url });
        return (
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden mb-8">
            {bannerImage ? (
              <>
                <Image src={bannerImage} alt={f.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="C&Co Formation"
                  width={200}
                  height={80}
                  className="h-16 w-auto opacity-90"
                  priority
                />
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-white rounded-xl px-3 py-2 shadow-lg">
              <Image
                src="/logo-qualiopi.png"
                alt="Certification Qualiopi"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </div>
          </div>
        );
      })()}

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-10 pb-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title + Badges */}
          <TitleTag className="text-2xl sm:text-[26px] font-bold text-gray-900 leading-tight">
            {f.title}
          </TitleTag>
          {f.subtitle && (
            <p className="mt-1 text-[15px] text-gray-400">{f.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3 mb-8">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {f.pole_name}
            </span>
            {f.categorie && (
              <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                {f.categorie}
              </span>
            )}
            {f.certification && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                Certifiante
              </span>
            )}
          </div>

          {/* Description */}
          {f.description && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Description</SectionTitle>
              <p className="text-[15px] text-gray-600 leading-relaxed">{f.description}</p>
            </section>
          )}

          {/* Objectifs */}
          {f.objectifs.length > 0 && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Objectifs de la formation</SectionTitle>
              <ul className="space-y-3">
                {f.objectifs.map((o, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: accent }} />
                    <span className="text-[15px] text-gray-600">{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Competences */}
          {f.competences.length > 0 && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Compétences visées</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-3">
                {f.competences.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                    <Award className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <span className="text-sm text-gray-600">{c}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pour qui / Prérequis */}
          {(f.public_vise.length > 0 || f.prerequis.length > 0) && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <div className="grid sm:grid-cols-2 gap-8">
                {f.public_vise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: accent }} /> Pour qui ?
                    </h3>
                    <ul className="space-y-2">
                      {f.public_vise.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {f.prerequis.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: accent }} /> Prérequis
                    </h3>
                    <ul className="space-y-2">
                      {f.prerequis.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Programme */}
          {f.programme.length > 0 && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Programme détaillé</SectionTitle>
              <div className="space-y-3">
                {f.programme.map((mod, i) => (
                  <div key={i} className="p-5 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
                        style={{ backgroundColor: accent }}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-semibold text-[15px] text-gray-900">{mod.titre}</h3>
                    </div>
                    {mod.contenu && (
                      <p className="ml-10 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{mod.contenu}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Approche pédagogique */}
          {f.modalites && (() => {
            const m = f.modalites!;
            const has = (m.methodes?.length || 0) + (m.moyens?.length || 0) + (m.evaluation?.length || 0) > 0;
            if (!has) return null;
            return (
              <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                <SectionTitle>Approche pédagogique</SectionTitle>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { title: "Méthodes", items: m.methodes },
                    { title: "Moyens", items: m.moyens },
                    { title: "Évaluation", items: m.evaluation },
                  ].filter((s) => s.items && s.items.length > 0).map((s) => (
                    <div key={s.title} className="p-4 rounded-xl bg-gray-50">
                      <h3 className="font-semibold text-sm text-gray-900 mb-2">{s.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{s.items!.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Équipe pédagogique */}
          {f.encadrement_pedagogique && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Équipe pédagogique</SectionTitle>
              <p className="text-[15px] text-gray-600 leading-relaxed">{f.encadrement_pedagogique}</p>
            </section>
          )}

          {/* Accessibilité */}
          {f.accessibilite && (
            <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
              <SectionTitle>Accessibilité</SectionTitle>
              <p className="text-[15px] text-gray-600 leading-relaxed">{f.accessibilite}</p>
            </section>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              Organisme certifié <span className="font-semibold text-gray-600">Qualiopi</span> — Actions de formation
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[300px] shrink-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* CTA card */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <div className="text-center mb-5">
                {f.price_ht ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">{f.price_ht} €</p>
                    <p className="text-sm text-gray-400 mt-1">
                      HT / stagiaire{f.price_ttc ? ` · ${f.price_ttc} € TTC` : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-900">Sur devis</p>
                )}
              </div>
              <div className="space-y-3">
                <InscriptionButton
                  formation={{ id: f.id, title: f.title, price: f.price_ht ? `${f.price_ht}€ HT` : undefined }}
                />
                <InscriptionButton
                  formation={{ id: f.id, title: f.title, price: f.price_ht ? `${f.price_ht}€ HT` : undefined }}
                  mode="devis"
                  variant="secondary"
                />
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Infos pratiques</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-gray-600">
                    {f.duree_heures ? `${f.duree_heures}h` : ""}
                    {f.duree_jours ? ` (${f.duree_jours}j)` : ""}
                    {!f.duree_heures && !f.duree_jours && "—"}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: accent }} />
                  <span className="text-sm text-gray-600">{f.format_lieu || "Présentiel"}</span>
                </li>
                {(f.nombre_participants_min || f.nombre_participants_max) && (
                  <li className="flex items-center gap-3">
                    <Users className="w-4 h-4 shrink-0" style={{ color: accent }} />
                    <span className="text-sm text-gray-600">
                      {f.nombre_participants_min && f.nombre_participants_max
                        ? `${f.nombre_participants_min} à ${f.nombre_participants_max} participants`
                        : f.nombre_participants_max
                          ? `Max. ${f.nombre_participants_max} participants`
                          : `Min. ${f.nombre_participants_min} participants`}
                    </span>
                  </li>
                )}
                {f.certification && (
                  <li className="flex items-start gap-3">
                    <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <span className="text-sm text-gray-600">{f.certification}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Prochaines sessions */}
            {f.sessions.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Prochaines sessions</h3>
                <div className="space-y-3">
                  {f.sessions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">
                          {new Date(s.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.lieu} · {s.places_disponibles} place{s.places_disponibles > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarifs détaillés — uniquement Intra et Inter */}
            {(() => {
              const publicTarifs = f.tarifs.filter((t) => {
                const nom = (t.nom || "").toLowerCase();
                return nom.includes("intra") || nom.includes("inter");
              });
              return publicTarifs.length > 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Tarifs</h3>
                  <div className="space-y-3">
                    {publicTarifs.map((t, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{t.nom}</p>
                          <p className="text-xs text-gray-400">{t.unite || (t.nom.toLowerCase().includes("intra") ? "groupe" : "stagiaire")}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{t.prix_ht} € HT</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Financement */}
            {f.financement && f.financement.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Financement</h3>
                <div className="flex flex-wrap gap-2">
                  {f.financement.map((fin, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600">
                      {fin}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
