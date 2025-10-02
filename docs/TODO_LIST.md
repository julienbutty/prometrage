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

- [ ] **TDD** : Test liste des projets
- [ ] Composant `ProjectList` responsive
- [ ] **TDD** : Test bouton upload PDF
- [ ] Composant `UploadButton` avec zone drop
- [ ] Navigation mobile (bottom tabs ou burger)
- [ ] Loading states avec skeletons

#### Upload & Parsing PDF (fichier référence dans /docs/fm.pdf)

- [ ] **TDD** : Tests parsing patterns (repère, dimensions, etc.)
- [ ] Fonction `parsePDF` avec pdf.js
- [ ] **TDD** : Test extraction menuiseries
- [ ] API Route `/api/upload/pdf`
- [ ] Progress bar upload
- [ ] Gestion erreurs parsing

#### Modèle de données

- [ ] **TDD** : Tests validation Zod schemas
- [ ] Schema `ProjetSchema` avec validation
- [ ] Schema `MenuiserieSchema` avec validation
- [ ] Migration Prisma initiale
- [ ] Seed data pour tests

### 📝 Phase 3 : Formulaire Prise de Côtes (Semaine 3)

#### Formulaire Mobile

- [ ] **TDD** : Test formulaire dimensions
- [ ] Composant `DimensionsForm` avec gros inputs
- [ ] **TDD** : Test calcul écarts
- [ ] Fonction `calculateEcart` avec niveaux d'alerte
- [ ] **TDD** : Test sauvegarde données
- [ ] Hook `useAutoSave` avec debounce

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
