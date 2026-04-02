# C&Co Formation - Site vitrine & Admin

## Stack technique

- **Framework :** Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **BDD :** Supabase (PostgreSQL) - domaine custom : supabase.candco.fr
- **Styling :** Tailwind CSS 3 + Radix UI + CVA + Framer Motion
- **Auth :** Supabase Auth (email/password), gestion des rôles dans table `utilisateurs`
- **Formulaires :** React Hook Form + Zod
- **State serveur :** TanStack React Query
- **Email :** Resend
- **Icones :** Lucide React
- **Deploy :** Docker (Node 20-alpine, standalone)

## Commandes

```bash
npm run dev        # Dev avec Turbopack
npm run build      # Build production
npm run lint       # ESLint
```

## Structure du projet

```
src/
  app/
    (public)/      # Site vitrine (layout avec Header/Footer)
    (admin)/admin/ # Dashboard admin (protege par middleware)
    (auth)/auth/   # Pages connexion
    api/           # Routes API
    globals.css    # Variables CSS du theme
    sitemap.ts     # Sitemap dynamique
    robots.ts      # Robots.txt
  components/
    ui/            # Composants Radix UI wrappés (Button, Card, Dialog...)
    layout/        # Header, Footer, Navigation
    home/v2/       # Sections homepage
    formations/    # Composants formations
    blog/          # Composants blog
    admin/         # Composants admin
  lib/
    supabase/      # 3 clients : client.ts (browser), server.ts (RSC), service.ts (admin/bypass RLS)
    auth/          # getServerUser, getUserRole, requireAdminAccess
    poles-config.ts
    pole-colors.ts
  hooks/
    admin/         # Hooks admin (useArticles, useContacts...)
  types/
    database.ts    # Types auto-generés depuis Supabase
  contexts/
    AuthContext.tsx # Auth cote client (user, role, orgs)
```

## Design

### Couleurs
- **Primaire :** Coral #FF6D47
- **Pole Securite & Prevention :** Rouge #A82424
- **Pole Petite Enfance :** Teal #2D867E
- **Pole Sante :** Bleu #507395
- **Header/Footer :** Dark navy #121B2A
- Systeme HSL complet via CSS variables dans globals.css

### Typographie
- Font : **Plus Jakarta Sans** (Google Font via next/font)
- Classes : `heading-hero` (7xl), `heading-section` (5xl), `heading-card` (2xl), `text-body`, `text-body-lg`

### Composants & classes custom
- `container-custom` : container max-width avec padding responsive
- `section-padding` / `section-padding-sm` : espacement vertical des sections
- `card-minimal` / `card-minimal-hover` : cards avec bordures subtiles
- `text-gradient` : texte en degrade
- Boutons CTA : `rounded-full` (pill-shaped)
- Theme dark par defaut, light disponible via next-themes

### Accessibilite
- Widget accessibilite integre (large-text, high-contrast, wide-spacing, desaturated)
- Focus visible sur tous les elements interactifs
- Respect de `prefers-reduced-motion`

## Admin

### Acces
- Middleware sur `/admin` : verifie auth + role (superadmin ou admin)
- Redirection vers `/` si non autorise

### Roles utilisateur
superadmin > admin > org_manager > moderator > formateur > client_manager > user

### Pages admin
- `/admin/articles` : CRUD articles de blog
- `/admin/contacts` : Soumissions formulaire contact
- `/admin/cookies` : Suivi consentement cookies
- `/admin/faq` : Gestion FAQ
- `/admin/media` : Mediatheque
- `/admin/redirects` : Redirections URL
- `/admin/settings` : Parametres

### Client Supabase
- `client.ts` : navigateur (singleton)
- `server.ts` : Server Components (cookies)
- `service.ts` : operations admin (bypass RLS, jamais cote client)

## SEO

- Title template : `"%s | C&Co Formation"`
- JSON-LD : Organization + EducationalOrganization + WebSite (avec SearchAction)
- Sitemap dynamique : pages statiques + formations (`produits_formation`) + articles (`blog_articles`)
- robots.ts : bloque `/admin`, `/api`, `/auth`, `/formateur`
- Open Graph : image 1200x630, locale fr_FR
- Images optimisees : AVIF + WebP

## Conventions de code

- **Server Components par defaut**, `"use client"` uniquement quand necessaire
- Imports avec alias `@/*` (mappe vers `src/*`)
- Pas d'ORM : requetes directes via client Supabase type
- RLS active sur toutes les tables, service client pour bypass admin
- Organisation multi-tenant via `NEXT_PUBLIC_ORGANIZATION_ID`
- Nommage : PascalCase (composants), camelCase (fonctions/hooks), kebab-case (routes)
- Sanitization HTML avec DOMPurify
- Rate limiting sur les API publiques
