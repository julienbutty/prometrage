# TODO LIST - Application Métreur V2

## Checklist développement avec TDD obligatoire

### 🚀 Phase 1 : Setup & Infrastructure (Semaine 1)

#### Setup projet

- [x] `npx create-next-app@latest prometrage --typescript --tailwind --app`
- [x] Installer dépendances : `shadcn/ui`, `tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- [x] Setup Prisma + PostgreSQL (Neon ou Supabase)
- [x] Configuration ESLint + Prettier mobile-first
- [x] Setup tests avec Vitest
- [x] Créer structure de dossiers

#### Configuration de base

- [x] `.env.local` avec variables d'environnement
- [x] `prisma/schema.prisma` avec modèles Projet et Menuiserie
- [ ] Configuration Uploadthing ou Vercel Blob
- [x] Setup TanStack Query provider
- [x] Configuration Tailwind pour mobile-first

### 📱 Phase 2 : Core Features Mobile (Semaine 2)

#### Homepage Mobile

- [x] **TDD** : Test liste des projets
- [x] Composant `ProjectList` responsive
- [x] **TDD** : Test bouton upload PDF
- [x] Composant `UploadButton` avec zone drop
- [x] Navigation mobile (Header responsive)
- [x] Loading states avec skeletons
- [x] API Route `/api/projets` pour lister les projets
- [x] Intégration TanStack Query sur homepage
- [x] Navigation vers page détail projet

#### Upload & Parsing PDF via IA (fichier référence dans /docs/fm.pdf)

- [x] **Setup** : Installation du SDK Anthropic (`npm install @anthropic-ai/sdk`)
- [x] **Config** : Variable d'environnement `ANTHROPIC_API_KEY`
- [x] **TDD** : Tests parsing via IA avec mock responses
- [x] Fonction `parsePDFWithAI` avec retry automatique
- [x] **TDD** : Test validation Zod des réponses IA
- [x] Prompt structuré pour extraction JSON
- [x] API Route `/api/upload/pdf` avec appel Anthropic
- [x] Gestion des erreurs IA (low confidence, rate limit, parsing error)
- [x] Stockage métadonnées IA (confidence, warnings, tokens)
- [x] **TEST RÉUSSI** : Parsing de fm.pdf avec 90% de confiance ✅
- [x] Intégration frontend pour upload PDF (avec TanStack Query mutation)
- [x] Toast notifications (Sonner) pour feedback upload
- [x] Redirection automatique vers projet après upload
- [ ] Progress bar upload avec statut parsing IA
- [ ] Upload fichier vers storage cloud (Uploadthing/Vercel Blob)

#### Modèle de données

- [x] **TDD** : Tests validation Zod schemas
- [x] Schema `ProjetSchema` avec validation
- [x] Schema `MenuiserieSchema` avec validation
- [x] Migration Prisma initiale
- [x] Seed data pour tests

#### Page Détail Projet

- [x] **TDD** : Test API GET `/api/projets/[id]`
- [x] Page `/projet/[id]` responsive mobile-first
- [x] Affichage infos client (adresse, téléphone, PDF)
- [x] Liste des menuiseries avec badges
- [x] Navigation vers menuiserie individuelle
- [x] Bouton CTA fixe en bas "Commencer la prise de côtes"

### 📝 Phase 3 : Formulaire Prise de Côtes (Semaine 3) - COMPLÉTÉE ✅

#### API Menuiseries

- [x] **TDD** : Tests API GET /api/menuiseries/[id]
- [x] **TDD** : Tests API PUT /api/menuiseries/[id]
- [x] API route GET /api/menuiseries/[id] avec infos projet
- [x] API route PUT /api/menuiseries/[id] avec validation
- [x] Fonction `calculateEcarts` avec niveaux d'alerte (faible/moyen/élevé)

#### Formulaire Mobile

- [x] Page `/menuiserie/[id]` mobile-first responsive
- [x] Formulaire dynamique pour TOUS les champs du PDF
- [x] Inputs numériques optimisés mobile (h-14, inputMode)
- [x] Labels français automatiques pour tous les champs
- [x] Badges d'écarts colorés selon niveau (vert/orange/rouge)
- [x] Alerte visuelle si écarts détectés
- [x] Sauvegarde avec TanStack Query mutation
- [x] Toast notifications succès/erreur
- [ ] Hook `useAutoSave` avec debounce (optionnel)

#### Composants formulaire

- [ ] Input numérique mobile-optimisé
- [ ] Select avec grandes options tactiles
- [ ] Switch/Toggle pour options binaires
- [ ] Composant `EcartAlert` avec couleurs
- [ ] Boutons fixes en bas (mobile pattern)

#### Navigation menuiseries

- [ ] Swipe entre menuiseries (mobile)
- [ ] Progress indicator (1/5, 2/5, etc.)
- [ ] Boutons Précédent/Suivant
- [ ] Marquage menuiseries complétées
- [ ] Retour au projet avec confirmation si modifications

### 🎨 Phase 4 : UI/UX Mobile (Semaine 4)

#### Composants visuels

- [ ] Badge pour repères
- [ ] Cards menuiseries avec preview
- [ ] Alertes contextuelles (écarts)
- [ ] Toast notifications succès/erreur
- [ ] Loading spinners optimisés

#### Optimisations mobile

- [ ] Touch targets 44x44px minimum
- [ ] Haptic feedback sur actions
- [ ] Pull-to-refresh sur listes
- [ ] Optimistic updates avec TanStack
- [ ] Mode paysage pour formulaires

### ⚡ Phase 5 : Performance & Polish (Semaine 5)

#### Optimisations

- [ ] Lazy loading des projets (Virtuoso)
- [ ] Image optimization (Next/Image)
- [ ] Bundle splitting par route
- [ ] Service Worker pour cache
- [ ] Compression gzip/brotli

#### Tests réels

- [ ] Tests sur iPhone Safari
- [ ] Tests sur Android Chrome
- [ ] Tests réseau lent (3G)
- [ ] Tests mode avion (offline)
- [ ] Tests avec gants de chantier

### 🚀 Phase 6 : Déploiement (Semaine 6)

#### Production

- [ ] Build production `npm run build`
- [ ] Tests E2E avec Playwright
- [ ] Déploiement Vercel
- [ ] Configuration domaine
