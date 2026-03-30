"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CiviliteSelect } from "@/components/ui/CiviliteSelect";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Calendar, MapPin, Users, ArrowLeft, Send } from "lucide-react";

interface Session {
  id: string;
  date_debut: string;
  date_fin: string | null;
  lieu_nom: string;
  lieu_ville: string;
  places_disponibles: number;
  format_type: string;
}

interface InscriptionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation: {
    id: string;
    title: string;
    price?: string | null;
  };
  mode?: "inscription" | "devis";
}

export function InscriptionWizard({ open, onOpenChange, formation, mode = "inscription" }: InscriptionWizardProps) {
  const [step, setStep] = useState<"session" | "form" | "success">("session");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noSessions, setNoSessions] = useState(false);

  const [formData, setFormData] = useState({
    civilite: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    nombre_participants: "",
    notes: "",
  });

  const isDevis = mode === "devis";

  useEffect(() => {
    if (!open) {
      setStep("session");
      setSelectedSession(null);
      setNoSessions(false);
      setFormData({ civilite: "", prenom: "", nom: "", email: "", telephone: "", entreprise: "", nombre_participants: "", notes: "" });
      return;
    }

    if (isDevis) {
      setStep("form");
      setLoadingSessions(false);
      return;
    }

    async function loadSessions() {
      setLoadingSessions(true);
      try {
        const res = await fetch(`/api/formations/${formation.id}/sessions`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
          if (data.length === 0) {
            setNoSessions(true);
            setStep("form");
          }
        }
      } catch {
        setSessions([]);
        setNoSessions(true);
        setStep("form");
      }
      setLoadingSessions(false);
    }
    loadSessions();
  }, [open, formation.id, isDevis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedSession) {
        const res = await fetch("/api/inscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: selectedSession,
            civilite: formData.civilite,
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            entreprise: formData.entreprise,
            notes: formData.notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Erreur lors de l'inscription");
          return;
        }
      } else {
        const res = await fetch("/api/contact-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formation_id: formation.id,
            formation_title: formation.title,
            type: isDevis ? "devis" : "inscription",
            civilite: formData.civilite,
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            telephone: formData.telephone,
            entreprise: formData.entreprise,
            nombre_participants: formData.nombre_participants ? parseInt(formData.nombre_participants) : undefined,
            message: formData.notes,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Erreur lors de l'envoi");
          return;
        }
      }

      setStep("success");
    } catch {
      toast.error("Erreur de connexion, veuillez réessayer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const dialogTitle = step === "success"
    ? "Demande envoyée"
    : isDevis
      ? "Demander un devis"
      : "S'inscrire à cette formation";

  const inputClasses = "w-full h-11 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F8A991]/50 bg-white/[0.06] border border-white/[0.08]";
  const labelClasses = "text-sm text-white/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="default"
        className="!bg-[#151F2D] !border-white/10 !text-white !shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-white">{dialogTitle}</DialogTitle>
          {step !== "success" && (
            <DialogDescription className="text-sm text-white/40">
              {formation.title}
              {formation.price && <span className="ml-2 font-medium text-[#F8A991]">· {formation.price}</span>}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step 1: Session Selection */}
        {step === "session" && !isDevis && (
          <div className="space-y-4">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
              </div>
            ) : (
              <>
                <p className="text-sm text-white/60">
                  Choisissez une session pour vous inscrire :
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => {
                        setSelectedSession(session.id);
                        setStep("form");
                      }}
                      className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.03] transition-all hover:border-[#F8A991]/40 hover:bg-white/[0.06] group"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-white mb-1">
                        <Calendar className="h-4 w-4 text-[#F8A991]" />
                        {formatDate(session.date_debut)}
                        {session.date_fin && session.date_fin !== session.date_debut && (
                          <span className="text-white/40">→ {formatDate(session.date_fin)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.lieu_nom || session.lieu_ville || "À définir"}
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${
                          session.places_disponibles <= 2 ? "text-red-400" : session.places_disponibles <= 5 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          <Users className="h-3 w-3" />
                          {session.places_disponibles} place{session.places_disponibles > 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* No sessions message */}
            {noSessions && !isDevis && (
              <div className="rounded-xl bg-[#F8A991]/10 border border-[#F8A991]/20 p-4">
                <p className="text-sm text-[#F8A991]">
                  Aucune session n'est programmée pour le moment. Laissez-nous vos coordonnées, nous vous recontacterons dès qu'une date sera planifiée.
                </p>
              </div>
            )}

            {/* Back to sessions */}
            {selectedSession && (
              <button
                type="button"
                onClick={() => setStep("session")}
                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Changer de session
              </button>
            )}

            <CiviliteSelect
              value={formData.civilite}
              onChange={(val) => setFormData({ ...formData, civilite: val })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prenom" className={labelClasses}>Prénom *</label>
                <input
                  id="prenom"
                  required
                  className={inputClasses}
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="nom" className={labelClasses}>Nom *</label>
                <input
                  id="nom"
                  required
                  className={inputClasses}
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className={labelClasses}>Email *</label>
              <input
                id="email"
                type="email"
                required
                className={inputClasses}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="telephone" className={labelClasses}>Téléphone</label>
                <input
                  id="telephone"
                  type="tel"
                  className={inputClasses}
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="entreprise" className={labelClasses}>Entreprise</label>
                <input
                  id="entreprise"
                  className={inputClasses}
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                />
              </div>
            </div>

            {isDevis && (
              <div className="space-y-1.5">
                <label htmlFor="nombre_participants" className={labelClasses}>Nombre de participants</label>
                <input
                  id="nombre_participants"
                  type="number"
                  min="1"
                  placeholder="Ex: 5"
                  className={inputClasses}
                  value={formData.nombre_participants}
                  onChange={(e) => setFormData({ ...formData, nombre_participants: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="notes" className={labelClasses}>Message (optionnel)</label>
              <textarea
                id="notes"
                rows={3}
                placeholder={isDevis ? "Précisez vos besoins, dates souhaitées..." : "Informations complémentaires..."}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F8A991]/50 bg-white/[0.06] border border-white/[0.08] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-[#F8A991] text-[#151F2D] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#F8A991]/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting
                ? "Envoi en cours..."
                : isDevis
                  ? "Envoyer ma demande de devis"
                  : selectedSession
                    ? "Confirmer mon inscription"
                    : "Envoyer ma demande"
              }
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDevis ? "Demande de devis envoyée" : "Demande envoyée"}
            </h3>
            <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
              {isDevis
                ? "Notre équipe reviendra vers vous avec un devis personnalisé dans les meilleurs délais."
                : selectedSession
                  ? "Votre demande d'inscription a été enregistrée. Notre équipe vous contactera pour confirmer votre place."
                  : "Nous avons bien noté votre intérêt. Nous vous recontacterons dès qu'une session sera planifiée."
              }
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="h-11 px-8 rounded-full bg-white/10 text-white font-semibold text-sm transition-all hover:bg-white/15"
            >
              Fermer
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
