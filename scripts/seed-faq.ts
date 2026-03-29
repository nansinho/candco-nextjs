/**
 * Seed FAQ data — run with: npx tsx scripts/seed-faq.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Parse .env.local manually (no dotenv dependency)
const envFile = readFileSync(".env.local", "utf-8");
envFile.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  { name: "Formations", slug: "formations", icon: "GraduationCap", description: "Questions sur nos formations et programmes", display_order: 1, active: true },
  { name: "Financement", slug: "financement", icon: "Wallet", description: "Questions sur le financement et la prise en charge", display_order: 2, active: true },
  { name: "Inscription", slug: "inscription", icon: "ClipboardList", description: "Questions sur le processus d'inscription", display_order: 3, active: true },
  { name: "Certification", slug: "certification", icon: "Award", description: "Questions sur les certifications et diplômes", display_order: 4, active: true },
  { name: "Entreprise", slug: "entreprise", icon: "Building2", description: "Questions pour les entreprises et employeurs", display_order: 5, active: true },
  { name: "Accessibilité", slug: "accessibilite", icon: "Accessibility", description: "Questions sur l'accès aux personnes en situation de handicap", display_order: 6, active: true },
];

async function seed() {
  console.log("🌱 Seeding FAQ categories...");

  // Upsert categories
  const { data: cats, error: catError } = await supabase
    .from("faq_categories")
    .upsert(categories, { onConflict: "slug" })
    .select();

  if (catError) {
    console.error("❌ Error seeding categories:", JSON.stringify(catError, null, 2));
    return;
  }

  console.log(`✅ ${cats.length} categories created/updated`);

  // Build category ID map
  const catMap: Record<string, string> = {};
  cats.forEach((c: any) => { catMap[c.slug] = c.id; });

  const items = [
    // Formations
    { category_id: catMap["formations"], question: "Quelles formations proposez-vous ?", answer: "C&Co Formation propose des formations dans 4 pôles : Sécurité & Prévention (SST, incendie, habilitation), Petite Enfance (CAP AEPE, éveil, pédagogies alternatives), Santé (AFGSU, gestes d'urgence) et Entrepreneuriat. Toutes nos formations sont certifiantes et reconnues par l'État.", keywords: ["formations", "catalogue", "pôles"], display_order: 1, active: true, view_count: 45 },
    { category_id: catMap["formations"], question: "Quelle est la durée des formations ?", answer: "La durée varie selon la formation choisie : de 1 jour (7h) pour les formations courtes comme le SST, jusqu'à plusieurs semaines pour les formations diplômantes comme le CAP AEPE. Chaque fiche formation précise la durée exacte.", keywords: ["durée", "heures", "jours"], display_order: 2, active: true, view_count: 38 },
    { category_id: catMap["formations"], question: "Les formations sont-elles en présentiel ou à distance ?", answer: "La majorité de nos formations se déroulent en présentiel dans nos locaux à Bouc-bel-air (13320), pour garantir une pédagogie pratique et interactive. Certaines formations théoriques peuvent inclure des modules à distance. Contactez-nous pour connaître les modalités de chaque formation.", keywords: ["présentiel", "distance", "modalités"], display_order: 3, active: true, view_count: 32 },
    { category_id: catMap["formations"], question: "Y a-t-il des prérequis pour s'inscrire ?", answer: "Les prérequis varient selon la formation. Certaines formations comme le SST sont ouvertes à tous sans prérequis. D'autres, comme le CAP AEPE, nécessitent un niveau minimum (généralement niveau 3ème). Les prérequis sont indiqués sur chaque fiche formation.", keywords: ["prérequis", "conditions", "niveau"], display_order: 4, active: true, view_count: 28 },

    // Financement
    { category_id: catMap["financement"], question: "Comment financer ma formation ?", answer: "Plusieurs solutions de financement existent :\n\n• **OPCO** : Votre employeur peut faire une demande de prise en charge auprès de son OPCO (100% dans la plupart des cas)\n• **CPF** : Certaines formations sont éligibles au Compte Personnel de Formation\n• **Pôle Emploi / France Travail** : Aide individuelle à la formation (AIF)\n• **Plan de formation entreprise** : Votre employeur finance directement\n• **Financement personnel** : Possibilité de paiement en plusieurs fois\n\nNotre équipe vous accompagne dans toutes vos démarches.", keywords: ["financement", "OPCO", "CPF", "pôle emploi"], display_order: 1, active: true, view_count: 67 },
    { category_id: catMap["financement"], question: "Qu'est-ce qu'un OPCO et comment ça marche ?", answer: "Un OPCO (Opérateur de Compétences) est un organisme qui finance la formation professionnelle des salariés. Chaque entreprise cotise auprès d'un OPCO en fonction de son secteur d'activité. L'OPCO peut prendre en charge tout ou partie du coût de la formation. Nous vous aidons à identifier votre OPCO et à constituer le dossier de prise en charge.", keywords: ["OPCO", "opérateur", "compétences", "prise en charge"], display_order: 2, active: true, view_count: 52 },
    { category_id: catMap["financement"], question: "Mes formations sont-elles éligibles au CPF ?", answer: "Certaines de nos formations certifiantes sont éligibles au Compte Personnel de Formation (CPF). C'est notamment le cas du CAP AEPE et de certaines formations en sécurité. Pour vérifier l'éligibilité d'une formation spécifique, consultez notre catalogue ou contactez-nous directement.", keywords: ["CPF", "éligible", "compte personnel"], display_order: 3, active: true, view_count: 41 },
    { category_id: catMap["financement"], question: "La formation est-elle gratuite pour les salariés ?", answer: "Dans la grande majorité des cas, oui. Lorsque la formation est prise en charge par l'OPCO de votre entreprise ou dans le cadre du plan de formation, le coût est intégralement financé. Il n'y a aucun reste à charge pour le salarié. Nous nous occupons de toutes les formalités administratives avec votre employeur et l'OPCO.", keywords: ["gratuit", "salarié", "prise en charge", "coût"], display_order: 4, active: true, view_count: 44 },

    // Inscription
    { category_id: catMap["inscription"], question: "Comment m'inscrire à une formation ?", answer: "L'inscription se fait en 3 étapes simples :\n\n1. **Choisissez votre formation** sur notre site ou contactez-nous\n2. **Envoyez-nous votre demande** via le formulaire de contact ou par téléphone au 07 62 59 66 53\n3. **Nous validons votre inscription** et vous envoyons la convocation avec tous les détails pratiques\n\nDélai moyen : 48h pour confirmer votre inscription.", keywords: ["inscription", "s'inscrire", "étapes"], display_order: 1, active: true, view_count: 55 },
    { category_id: catMap["inscription"], question: "Quel est le délai d'inscription ?", answer: "Nous recommandons de vous inscrire au minimum 2 semaines avant le début de la formation pour les formations courtes, et 1 mois pour les formations longues. Cependant, sous réserve de places disponibles, des inscriptions de dernière minute sont parfois possibles. Contactez-nous pour vérifier la disponibilité.", keywords: ["délai", "inscription", "quand"], display_order: 2, active: true, view_count: 33 },
    { category_id: catMap["inscription"], question: "Puis-je annuler mon inscription ?", answer: "Oui, vous pouvez annuler votre inscription. Les conditions d'annulation sont les suivantes :\n\n• Plus de 15 jours avant : annulation gratuite\n• Entre 7 et 15 jours : 50% du montant\n• Moins de 7 jours : montant intégral dû\n\nEn cas de force majeure (maladie, etc.), des solutions de report sont proposées.", keywords: ["annulation", "annuler", "report"], display_order: 3, active: true, view_count: 22 },

    // Certification
    { category_id: catMap["certification"], question: "Qu'est-ce que la certification Qualiopi ?", answer: "Qualiopi est la certification qualité des organismes de formation, délivrée par un organisme certificateur accrédité. Elle atteste de la qualité du processus de formation et est obligatoire pour bénéficier des financements publics ou mutualisés (OPCO, CPF, etc.). C&Co Formation est certifié Qualiopi depuis sa création.", keywords: ["Qualiopi", "certification", "qualité"], display_order: 1, active: true, view_count: 48 },
    { category_id: catMap["certification"], question: "Les formations délivrent-elles un diplôme ?", answer: "Selon la formation suivie, vous obtenez :\n\n• **Un diplôme d'État** : CAP AEPE, certains titres professionnels\n• **Un certificat de compétences** : SST, AFGSU, habilitations\n• **Une attestation de formation** : pour les formations courtes non certifiantes\n\nChaque fiche formation précise le type de validation obtenue.", keywords: ["diplôme", "certificat", "attestation"], display_order: 2, active: true, view_count: 39 },
    { category_id: catMap["certification"], question: "Mon certificat SST est-il valable partout en France ?", answer: "Oui, le certificat SST (Sauveteur Secouriste du Travail) délivré par C&Co Formation est reconnu sur tout le territoire national. Il est valable 2 ans et nécessite un recyclage (MAC SST) pour être maintenu. Notre formation SST respecte le référentiel de l'INRS.", keywords: ["SST", "certificat", "valable", "recyclage"], display_order: 3, active: true, view_count: 35 },

    // Entreprise
    { category_id: catMap["entreprise"], question: "Proposez-vous des formations intra-entreprise ?", answer: "Oui, nous proposons des formations intra-entreprise directement dans vos locaux ou dans nos centres. Les avantages :\n\n• Programme adapté à vos besoins spécifiques\n• Planning flexible selon vos contraintes\n• Tarifs dégressifs selon le nombre de participants\n• Pas de déplacement pour vos équipes\n\nContactez-nous pour un devis personnalisé.", keywords: ["intra", "entreprise", "sur mesure"], display_order: 1, active: true, view_count: 36 },
    { category_id: catMap["entreprise"], question: "Comment organiser une formation pour mes salariés ?", answer: "C'est simple :\n\n1. Contactez-nous avec votre besoin (nombre de salariés, formation souhaitée, dates)\n2. Nous vous envoyons un devis et un programme personnalisé\n3. Vous validez et nous gérons l'organisation complète\n4. Nous pouvons également gérer les démarches OPCO à votre place\n\nTéléphone : 07 62 59 66 53 | Email : contact@candco.fr", keywords: ["organiser", "salariés", "entreprise"], display_order: 2, active: true, view_count: 29 },

    // Accessibilité
    { category_id: catMap["accessibilite"], question: "Vos formations sont-elles accessibles aux personnes en situation de handicap ?", answer: "Oui, C&Co Formation s'engage à rendre ses formations accessibles à tous. Nos locaux sont adaptés aux personnes à mobilité réduite. Pour les autres situations de handicap (visuel, auditif, cognitif...), notre référent handicap étudie chaque situation individuellement pour mettre en place les aménagements nécessaires. N'hésitez pas à nous contacter en amont pour que nous puissions vous accueillir dans les meilleures conditions.", keywords: ["handicap", "accessibilité", "PMR"], display_order: 1, active: true, view_count: 18 },
    { category_id: catMap["accessibilite"], question: "Qui est le référent handicap ?", answer: "Notre référent handicap est disponible pour vous accompagner dans votre parcours de formation. Il peut :\n\n• Évaluer vos besoins d'aménagement\n• Adapter les supports pédagogiques\n• Organiser un accueil personnalisé\n• Vous orienter vers les structures d'aide adaptées\n\nContactez-le à contact@candco.fr ou au 07 62 59 66 53.", keywords: ["référent", "handicap", "contact"], display_order: 2, active: true, view_count: 12 },
  ];

  console.log("🌱 Seeding FAQ items...");

  const { data: insertedItems, error: itemError } = await supabase
    .from("faq_items")
    .upsert(items.map((item, idx) => ({
      ...item,
      helpful_count: Math.floor(Math.random() * 20) + 5,
      not_helpful_count: Math.floor(Math.random() * 3),
    })))
    .select();

  if (itemError) {
    console.error("❌ Error seeding items:", itemError.message);
    return;
  }

  console.log(`✅ ${insertedItems.length} FAQ items created/updated`);
  console.log("\n🎉 FAQ seed complete!");
}

seed().catch(console.error);
