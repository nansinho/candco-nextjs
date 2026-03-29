"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CiviliteSelect } from "@/components/ui/CiviliteSelect";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Calendar, MapPin, Users } from "lucide-react";

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
}

export function InscriptionWizard({ open, onOpenChange, formation }: InscriptionWizardProps) {
  const [step, setStep] = useState<"session" | "form" | "success">("session");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    civilite: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    notes: "",
  });

  // Load sessions when dialog opens
  useEffect(() => {
    if (!open) {
      setStep("session");
      setSelectedSession(null);
      setFormData({ civilite: "", prenom: "", nom: "", email: "", telephone: "", entreprise: "", notes: "" });
      return;
    }

    async function loadSessions() {
      setLoadingSessions(true);
      try {
        const res = await fetch(`/api/formations/${formation.id}/sessions`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch {
        // Fallback: no sessions available
        setSessions([]);
      }
      setLoadingSessions(false);
    }
    loadSessions();
  }, [open, formation.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: selectedSession,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription");
        return;
      }

      setStep("success");
      toast.success("Demande d'inscription envoyée !");
    } catch {
      toast.error("Erreur de connexion, veuillez réessayer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Inscription confirmée" : `S'inscrire - ${formation.title}`}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Session Selection */}
        {step === "session" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisissez une session :
            </p>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Aucune session programmée pour le moment.
                </p>
                <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
                  <a href={`/contact?sujet=inscription&formation=${encodeURIComponent(formation.title)}`}>
                    Contactez-nous pour les prochaines dates
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      setSelectedSession(session.id);
                      setStep("form");
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      selectedSession === session.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(session.date_debut)}
                      {session.date_fin && ` - ${formatDate(session.date_fin)}`}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.lieu_nom || session.lieu_ville || "À définir"}
                      </span>
                      <span className={`flex items-center gap-1 ${
                        session.places_disponibles <= 2 ? "text-red-500" : session.places_disponibles <= 5 ? "text-orange-500" : "text-green-600"
                      }`}>
                        <Users className="h-3 w-3" />
                        {session.places_disponibles} place{session.places_disponibles > 1 ? "s" : ""} restante{session.places_disponibles > 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Info Form */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setStep("session")} className="mb-2">
              ← Changer de session
            </Button>

            <CiviliteSelect
              value={formData.civilite}
              onChange={(val) => setFormData({ ...formData, civilite: val })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entreprise">Entreprise</Label>
              <Input
                id="entreprise"
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Message (optionnel)</Label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande d'inscription"}
            </Button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Demande envoyée !</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Votre demande d'inscription a été enregistrée. Notre équipe vous contactera dans les plus brefs délais pour confirmer votre inscription.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
