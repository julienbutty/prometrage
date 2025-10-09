# Résumé Refactoring Client - Architecture 3 Tables

## 🎯 Objectif

Ajouter une table **Client** séparée pour permettre à un client d'avoir plusieurs projets (différents chantiers).

## 📊 Nouvelle Architecture

```
┌─────────────┐
│   Client    │
│             │
│ - id        │
│ - nom       │
│ - email 🔑  │ (unique - clé de détection)
│ - tel       │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────┐
│   Projet    │
│             │
│ - id        │
│ - reference │
│ - clientId  │ 🔗 FK vers Client
│ - adresse   │ (adresse du chantier, pas du client)
│ - pdfUrl    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────┐
│   Menuiserie    │
│                 │
│ - id            │
│ - projetId      │ 🔗 FK vers Projet
│ - repere        │
│ - intitule      │
│ - donneesOrig.  │
│ - donneesMod.   │
└─────────────────┘
```

## 🔑 Règles Métier

1. **Client → Projet** : Un client peut avoir plusieurs projets (1-N)
2. **Adresse rattachée au Projet** : Car un client peut avoir plusieurs domiciles
3. **Email comme clé unique** : Permet la détection automatique de clients existants lors de l'upload PDF
4. **Cascade delete** : Supprimer un client → supprime tous ses projets (et leurs menuiseries)

## 🔄 Workflow Upload PDF Modifié

### Avant (actuel)
```
Upload PDF → Parse → Créer Projet (avec infos client inline)
```

### Après (nouveau)
```
Upload PDF
  ↓
Parse IA (extraction menuiseries + clientInfo + projetInfo)
  ↓
findOrCreateClient(email) → Cherche client existant
  ↓
Si email trouvé → Utiliser Client existant (isNew: false)
Si nouveau → Créer nouveau Client (isNew: true)
  ↓
Créer Projet avec clientId + adresse chantier
  ↓
Créer Menuiseries
```

## 📝 Modifications Extraction IA

### Structure JSON retournée

```json
{
  "menuiseries": [ /* ... */ ],
  "metadata": {
    "confidence": 0.95,
    "warnings": [],
    "clientInfo": {           // ✅ NOUVEAU : Infos client séparées
      "nom": "DUPONT",
      "email": "jean.dupont@example.com",
      "tel": "06 12 34 56 78"
    },
    "projetInfo": {           // ✅ NOUVEAU : Infos projet séparées
      "adresse": "15 Rue des Lilas"
    }
  }
}
```

### Prompt IA - Ajout 2 règles

```
7. Extrais obligatoirement les infos client (nom, email, tel) dans metadata.clientInfo
8. Extrais l'adresse du chantier dans metadata.projetInfo.adresse
```

## 🆕 Nouvelles API Routes

### Clients

```
GET    /api/clients           Liste des clients (avec pagination)
GET    /api/clients/[id]      Détail client + tous ses projets
PUT    /api/clients/[id]      Mise à jour infos client
DELETE /api/clients/[id]      Suppression client (cascade projets)
```

### Projets (modifiés)

```
GET /api/projets              Liste avec infos client (client.nom, client.email)
GET /api/projets/[id]         Détail avec objet client complet
PUT /api/projets/[id]         Peut mettre à jour l'adresse du chantier
```

## 🎨 Nouvelles Pages Frontend

### 1. Liste des clients (`/clients`)

```tsx
- Card par client
- Nom, email, tel
- Badge: X projets
- Click → Détail client
```

### 2. Détail client (`/clients/[id]`)

```tsx
- Header: Nom, email, tel client
- Bouton "Modifier infos client"
- Section "Projets de ce client"
  - Liste de tous ses projets
  - Pour chaque projet: référence, adresse, statut, nombre menuiseries
  - Click → Détail projet
```

### 3. Modifications existantes

**Page Projets** :
- Afficher `client.nom` au lieu de `clientNom`
- Click sur nom client → `/clients/[id]`

**Page Upload** :
- Toast "Nouveau client détecté : X" si `isNew: true`
- Toast "Client existant : X" si `isNew: false`

## 🛠️ Fichiers Modifiés/Créés

### Base de données
- [x] `prisma/schema.prisma` - Ajout model Client, refactoring Projet
- [ ] Migration Prisma à créer
- [ ] Script migration données existantes

### Backend
- [ ] `src/lib/clients.ts` - Fonction `findOrCreateClient`
- [ ] `src/lib/validations/ai-response.ts` - Schemas clientInfo/projetInfo
- [ ] `src/app/api/clients/route.ts` - GET list / POST create
- [ ] `src/app/api/clients/[id]/route.ts` - GET / PUT / DELETE
- [ ] `src/app/api/upload/pdf/route.ts` - Refactoring avec findOrCreateClient
- [ ] `src/app/api/projets/route.ts` - Include client dans query
- [ ] `src/app/api/projets/[id]/route.ts` - Include client

### Frontend
- [ ] `src/app/clients/page.tsx` - Liste clients
- [ ] `src/app/clients/[id]/page.tsx` - Détail client
- [ ] `src/app/clients/[id]/edit/page.tsx` - Edition client (optionnel)
- [ ] `src/app/page.tsx` - Ajouter lien "Mes Clients" dans navigation
- [ ] `src/app/projet/[id]/page.tsx` - Afficher client.nom avec lien

### Tests
- [ ] `src/__tests__/lib/clients.test.ts` - Tests findOrCreateClient
- [ ] `src/__tests__/api/clients.test.ts` - Tests API clients

### Documentation
- [x] `docs/PRD.md` - Mise à jour modèle données + workflow
- [x] `docs/CONTEXT.md` - Mise à jour schéma + workflow
- [x] `docs/API_SPEC.md` - Ajout endpoints clients + modifs projets
- [x] `docs/TODO_LIST.md` - Ajout Phase 2.5 Gestion Clients
- [x] `docs/MIGRATION_CLIENT.md` - Guide complet de migration
- [x] `docs/SUMMARY_REFACTORING_CLIENT.md` - Ce fichier
- [x] `CLAUDE.md` - Ajout section Architecture Client-Projet

## ✅ Avantages du Refactoring

1. **Pas de duplication** : Un client = une seule ligne en DB
2. **Vision consolidée** : Voir tous les projets d'un client sur une page
3. **Détection automatique** : Upload PDF détecte clients existants (via email)
4. **Séparation claire** : Adresse du chantier ≠ Adresse du client
5. **Navigation améliorée** : Client → Projets → Menuiseries
6. **Gestion centralisée** : Modifier infos client une seule fois
7. **Statistiques client** : Nombre de projets, projets en cours, etc.

## 📋 Next Steps

1. ✅ **Documentation complète** (terminé)
2. 🔄 **Migration DB** : Créer migration + migrer données existantes
3. 🔄 **Backend** : Implémenter findOrCreateClient + API clients
4. 🔄 **Tests** : TDD pour nouvelle logique
5. 🔄 **Frontend** : Pages clients + modifications projets
6. 🔄 **Validation** : Tests manuels complets
7. 🔄 **Déploiement** : Staging puis production

## 💡 Points d'Attention

- **Backup DB obligatoire** avant migration
- **Email unique important** : C'est la clé de détection
- **Tests edge cases** : Email null, email dupliqué manuel, etc.
- **UI responsive** : Pages clients mobile-first
- **Navigation claire** : Fil d'Ariane Client → Projet → Menuiserie

## 🎉 Résultat Final

Un client pourra :
1. **Uploader un PDF** → IA détecte s'il est déjà client (via email)
2. **Voir tous ses projets** sur sa page client
3. **Avoir plusieurs chantiers** (adresses différentes) sans duplication de données
4. **Naviguer facilement** : Clients → Projets → Menuiseries
