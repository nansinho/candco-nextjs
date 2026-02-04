import {
  Coffee,
  Sun,
  Home,
  Heart,
  Star,
  BookOpen,
  Clock,
  Music,
  Plane,
  Gift,
  Cloud,
  Moon,
  Key,
  Crown,
  Umbrella,
  Camera,
  Phone,
  Flower2,
  Car,
  Bike,
  Ship,
  Train,
  Lightbulb,
  Lamp,
  type LucideIcon,
} from "lucide-react";
import type { CaptchaChallenge, GeneratedChallenge } from "./types";

/**
 * Liste des challenges disponibles avec leurs icônes correspondantes
 */
export const CAPTCHA_CHALLENGES: CaptchaChallenge[] = [
  { word: "café", icon: Coffee },
  { word: "soleil", icon: Sun },
  { word: "maison", icon: Home },
  { word: "coeur", icon: Heart },
  { word: "étoile", icon: Star },
  { word: "livre", icon: BookOpen },
  { word: "horloge", icon: Clock },
  { word: "musique", icon: Music },
  { word: "avion", icon: Plane },
  { word: "cadeau", icon: Gift },
  { word: "nuage", icon: Cloud },
  { word: "lune", icon: Moon },
  { word: "clé", icon: Key },
  { word: "couronne", icon: Crown },
  { word: "parapluie", icon: Umbrella },
  { word: "appareil photo", icon: Camera },
  { word: "téléphone", icon: Phone },
  { word: "fleur", icon: Flower2 },
  { word: "voiture", icon: Car },
  { word: "vélo", icon: Bike },
  { word: "bateau", icon: Ship },
  { word: "train", icon: Train },
  { word: "ampoule", icon: Lightbulb },
  { word: "lampe", icon: Lamp },
];

/**
 * Mélange un tableau de manière aléatoire (Fisher-Yates shuffle)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Génère un nouveau challenge CAPTCHA
 * @returns Un challenge avec un mot, l'index correct, et 9 icônes mélangées
 */
export function generateChallenge(): GeneratedChallenge {
  // Mélanger tous les challenges et en prendre 9
  const shuffledChallenges = shuffle(CAPTCHA_CHALLENGES);
  const selectedChallenges = shuffledChallenges.slice(0, 9);

  // Le premier est la bonne réponse
  const correctChallenge = selectedChallenges[0];

  // Mélanger les 9 pour obtenir la grille
  const gridChallenges = shuffle(selectedChallenges);

  // Trouver l'index de la bonne réponse dans la grille mélangée
  const correctIndex = gridChallenges.findIndex(
    (c) => c.icon === correctChallenge.icon
  );

  return {
    word: correctChallenge.word,
    correctIndex,
    icons: gridChallenges.map((c) => c.icon),
  };
}

/**
 * Vérifie si l'index cliqué est correct
 */
export function verifyAnswer(
  challenge: GeneratedChallenge,
  clickedIndex: number
): boolean {
  return clickedIndex === challenge.correctIndex;
}
