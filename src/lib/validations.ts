import { z } from "zod";

export const contactRequestSchema = z.object({
  formation_id: z.string().uuid().optional(),
  formation_title: z.string().min(1).max(300),
  type: z.enum(["inscription", "devis"]),
  civilite: z.string().max(20).optional(),
  prenom: z.string().min(1, "Prenom requis").max(100),
  nom: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(254),
  telephone: z.string().max(20).optional(),
  entreprise: z.string().max(200).optional(),
  nombre_participants: z.number().int().min(1).max(500).optional(),
  message: z.string().max(5000).optional(),
});

export const inscriptionSchema = z.object({
  session_id: z.string().uuid("Session invalide"),
  civilite: z.string().max(20).optional().default(""),
  prenom: z.string().min(1, "Prenom requis").max(100),
  nom: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(254),
  telephone: z.string().max(20).optional(),
  entreprise: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
export type InscriptionInput = z.infer<typeof inscriptionSchema>;
