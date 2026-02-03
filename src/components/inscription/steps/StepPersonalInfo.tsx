"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Calendar, MapPin, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export interface PersonalInfoData {
  civilite: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  // Enterprise fields
  entreprise?: string;
  siret?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  // Additional
  nombre_participants?: number;
}

interface StepPersonalInfoProps {
  type: "particulier" | "entreprise";
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string | number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  formation: { title: string; price?: string | null };
  session: { start_date: string; lieu: string; format_type: string } | null;
}

export function StepPersonalInfo({
  type,
  data,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
  formation,
  session,
}: StepPersonalInfoProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);

  const isValid =
    data.civilite &&
    data.prenom &&
    data.nom &&
    data.email &&
    data.telephone &&
    (type === "particulier" || (data.entreprise && data.siret)) &&
    acceptTerms;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Vos coordonnées</h3>
        <p className="text-sm text-muted-foreground">
          Finalisez votre inscription en renseignant vos informations
        </p>
      </div>

      {/* Summary Card */}
      {session && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{formation.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(parseISO(session.start_date), "d MMMM yyyy", { locale: fr })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {session.lieu || "À définir"}
                </span>
              </div>
              {formation.price && (
                <p className="text-primary font-semibold mt-2">{formation.price}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-4">
          {/* Civilité */}
          <div className="space-y-2">
            <Label>
              Civilité <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.civilite}
              onValueChange={(v) => onChange("civilite", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.">Monsieur</SelectItem>
                <SelectItem value="Mme">Madame</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                value={data.prenom}
                onChange={(e) => onChange("prenom", e.target.value)}
                placeholder="Jean"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                value={data.nom}
                onChange={(e) => onChange("nom", e.target.value)}
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Email / Téléphone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="jean.dupont@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                type="tel"
                value={data.telephone}
                onChange={(e) => onChange("telephone", e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          {/* Enterprise Fields */}
          {type === "entreprise" && (
            <>
              <Separator className="my-4" />
              <p className="text-sm font-medium text-muted-foreground">
                Informations entreprise
              </p>

              <div className="space-y-2">
                <Label>
                  Nom de l'entreprise <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={data.entreprise || ""}
                  onChange={(e) => onChange("entreprise", e.target.value)}
                  placeholder="Société ABC"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  SIRET <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={data.siret || ""}
                  onChange={(e) => onChange("siret", e.target.value)}
                  placeholder="123 456 789 00012"
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={data.adresse || ""}
                  onChange={(e) => onChange("adresse", e.target.value)}
                  placeholder="123 rue de la Formation"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={data.ville || ""}
                    onChange={(e) => onChange("ville", e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    value={data.code_postal || ""}
                    onChange={(e) => onChange("code_postal", e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre de participants</Label>
                <Input
                  type="number"
                  min={1}
                  value={data.nombre_participants || 1}
                  onChange={(e) => onChange("nombre_participants", parseInt(e.target.value) || 1)}
                />
              </div>
            </>
          )}

          {/* Terms */}
          <div className="flex items-start gap-3 pt-4">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(!!checked)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed font-normal cursor-pointer">
              J'accepte les{" "}
              <Link href="/cgv" className="text-primary hover:underline" target="_blank">
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="text-primary hover:underline" target="_blank">
                politique de confidentialité
              </Link>
            </Label>
          </div>
        </div>
      </ScrollArea>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription...
            </>
          ) : (
            "Confirmer l'inscription"
          )}
        </Button>
      </div>
    </div>
  );
}
