# Guide de Migration - C&Co Formation

Ce document contient les informations nécessaires pour compléter la migration de Lovable vers Next.js.

## Variables d'Environnement

### Secrets Supabase (Edge Functions)

À configurer dans **Supabase Dashboard → Project Settings → Edge Functions → Secrets** :

```bash
# Email Service (Resend)
RESEND_API_KEY=re_VPcE8Q6V_5R2xxuSwJq4m9jCCmXh2eH21

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=BC_A_qw6nWYoveBhIK_FUgVka4sFuk-l729VGEYHe2U7hx46d63Wr9mMIWbyym1NHU-b1zgj-oi4cCuWtC8X17c
VAPID_PRIVATE_KEY=gyLQ1nFxSN-3SFzwfHpL0brAZLUxUwUssh32U2l5Mkc
VAPID_SUBJECT=mailto:contact@harua-ds.com

# INSEE API (Recherche SIRET/SIREN)
INSEE_API_KEY=18240804-54b8-4407-a408-0454b8c40719
```

**Note** : Toutes les clés sont configurées pour le domaine `candco`.

### Variables Next.js (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sxadbvezilpcldmncjrk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_anon_key>

# Site URL (à mettre à jour une fois le domaine configuré)
NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr
```

---

## Système de Messagerie

### Composants Migrés

Les composants suivants ont été ajoutés dans `src/components/messaging/` :

| Composant | Description |
|-----------|-------------|
| `types.ts` | Interfaces TypeScript (Message, Conversation, ViewMode) |
| `EmojiPicker.tsx` | Sélecteur d'emojis pour les messages |
| `MessageBubble.tsx` | Bulle de message avec badges et modération |
| `MessageInput.tsx` | Zone de saisie avec auto-resize |
| `ConversationList.tsx` | Liste des conversations (admin/formateur) |
| `MobileMessagingView.tsx` | Vue mobile style WhatsApp |
| `UnifiedMessaging.tsx` | Composant principal multi-rôle |

### Utilisation

```tsx
import { UnifiedMessaging } from "@/components/messaging";

// Mode Admin
<UnifiedMessaging
  viewMode="admin"
  sessionId={sessionId}
  formateur={formateur}
  inscriptions={inscriptions}
  onNewMessage={handleNewConversation}
/>

// Mode Formateur
<UnifiedMessaging
  viewMode="formateur"
  sessionId={sessionId}
  formateurId={formateurId}
  singleConversation={conversation}
/>
```

### Tables de Base de Données

Les tables suivantes doivent exister (déjà présentes dans Supabase) :

- `session_conversations` - Conteneur de conversations
- `session_messages` - Messages individuels

---

## Système de Planning

### Tables Principales

| Table | Description |
|-------|-------------|
| `sessions` | Sessions de formation avec dates, lieu, formateur |
| `inscriptions` | Inscriptions aux sessions |
| `session_formateurs` | Association multi-formateurs par session |
| `session_clients` | Association multi-clients par session |
| `session_documents` | Documents liés aux sessions |
| `formation_requests` | Demandes de formation clients |

### Workflow des Sessions

1. **Création** : Admin crée une session depuis une formation
2. **Attribution** : Assignation du formateur et du lieu
3. **Inscriptions** : Gestion des participants
4. **Communication** : Messagerie admin ↔ formateur ↔ participants
5. **Documents** : Partage de supports, émargements
6. **Clôture** : Génération des attestations

---

## Système Clients/Agences

### Hiérarchie

```
Client (Siège)
├── Client (Agence 1) [parent_client_id → Siège]
├── Client (Agence 2) [parent_client_id → Siège]
└── Client (Agence N)
```

### Rôles Client (6 niveaux)

1. `directeur_general` - Accès complet
2. `responsable_formation` - Gestion des formations
3. `directeur_agence` - Accès agence uniquement
4. `responsable_pole` - Accès à son pôle
5. `manager` - Gestion d'équipe
6. `collaborateur` - Accès basique

### Tables

- `clients` - Table principale avec `parent_client_id` et `client_type`
- `client_users` - Employés avec rôles
- `client_departments` - Départements internes
- `client_sites` - Sites multiples
- `organization_invitations` - Invitations organisation
- `employee_invitations` - Invitations employés

---

## APIs Tierces

### Resend (Email)

**Service** : https://resend.com
**Documentation** : https://resend.com/docs

Utilisé pour :
- Emails de confirmation d'inscription
- Rappels de session
- Notifications formateur
- Emails de bienvenue

### VAPID (Push Notifications)

**Technologie** : Web Push API
**Librairie** : `web-push@3.6.7`

Utilisé pour :
- Notifications temps réel admin
- Alertes formateur (nouveau message, nouvelle inscription)
- Rappels session (J-7, J-1)

### INSEE API

**Service** : https://api.insee.fr
**API** : API Sirene v3

Utilisé pour :
- Recherche par SIRET (14 chiffres)
- Recherche par SIREN (9 chiffres)
- Auto-complétion des données entreprise

---

## Fonctionnalités Manquantes à Implémenter

### Portail Formateur (Priorité Haute)

- [ ] `/formateur/dashboard` - Tableau de bord
- [ ] `/formateur/messages` - Messagerie (utiliser UnifiedMessaging)
- [ ] `/formateur/sessions` - Liste des sessions
- [ ] `/formateur/planning` - Vue calendrier
- [ ] `/formateur/documents` - Documents de session

### Notifications In-App

- [ ] Hook `useNotifications` pour le temps réel
- [ ] Composant `NotificationDropdown` pour l'interface
- [ ] Intégration push notifications navigateur

### Planning UI

- [ ] Composant calendrier mobile
- [ ] Vue agenda formateur
- [ ] Gestion des disponibilités

---

## Contact

Pour toute question sur la migration :
- Email : contact@harua-ds.com
- Projet Supabase : sxadbvezilpcldmncjrk
