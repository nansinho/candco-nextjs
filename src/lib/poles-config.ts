import { Shield, Baby, HeartPulse, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PoleConfig {
  id: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  /** Nom de variable CSS Tailwind (ex: "pole-securite") */
  color: string;
  /** Hex pour les styles inline */
  hex: string;
  description: string;
}

export const POLES: PoleConfig[] = [
  {
    id: "securite-prevention",
    name: "Sécurité & Prévention",
    shortName: "Sécurité",
    icon: Shield,
    color: "pole-securite",
    hex: "#A82424",
    description: "SST, Incendie, habilitations électriques",
  },
  {
    id: "petite-enfance",
    name: "Petite Enfance",
    shortName: "Petite Enfance",
    icon: Baby,
    color: "pole-petite-enfance",
    hex: "#2D867E",
    description: "Éveil, pédagogies alternatives, formations continues",
  },
  {
    id: "sante",
    name: "Santé & Paramédical",
    shortName: "Santé",
    icon: HeartPulse,
    color: "pole-sante",
    hex: "#507395",
    description: "Gestes d'urgence, soins, accompagnement",
  },
  {
    id: "entrepreneuriat",
    name: "Entrepreneuriat",
    shortName: "Entrepreneuriat",
    icon: Briefcase,
    color: "primary",
    hex: "#1F628E",
    description: "Création et développement d'activité",
  },
];

/** Récupère la config d'un pôle par slug/id */
export function getPoleById(id: string): PoleConfig | undefined {
  return POLES.find((p) => p.id === id);
}
