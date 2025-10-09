# Migration Client - Refactoring Architecture

## 🎯 Objectif

Séparer les données **Client** et **Projet** pour permettre à un client d'avoir plusieurs projets (chantiers différents).

## 📊 Architecture Avant/Après

### ❌ Avant (Architecture actuelle)

```prisma
model Projet {
  id            String
  reference     String
  clientNom     String   // ⚠️ Données dupliquées
  clientAdresse String?  // ⚠️ Adresse mélangée avec client
  clientTel     String?  // ⚠️ Données dupliquées
  clientEmail   String?  // ⚠️ Données dupliquées
  menuiseries   Menuiserie[]
}
```

**Problèmes** :
- Duplication des données client à chaque projet
- Impossible de voir tous les projets d'un client facilement
- Adresse mélangée (client vs chantier)
- Pas de gestion centralisée des clients

### ✅ Après (Architecture cible)

```prisma
model Client {
  id       String   @id @default(cuid())
  nom      String
  email    String?  @unique  // Clé unique pour détecter clients existants
  tel      String?
  projets  Projet[]

  @@index([nom])
  @@index([email])
}

model Projet {
  id          String
  reference   String
  clientId    String         // 🔗 Relation vers Client
  client      Client         // 🔗 Relation Prisma
  adresse     String?        // ✅ Adresse du chantier (pas du client)
  menuiseries Menuiserie[]

  @@index([clientId])
}
```

**Avantages** :
- ✅ Un client = une seule entrée en DB
- ✅ Vision consolidée : tous les projets d'un client
- ✅ Adresse rattachée au projet/chantier
- ✅ Détection automatique clients existants (via email)
- ✅ Navigation Client -> Projets -> Menuiseries

## 🔄 Workflow Upload PDF Modifié

### Avant
```
Upload PDF → Parse menuiseries + infos client inline → Créer Projet avec infos client dupliquées
```

### Après
```
Upload PDF
  → Parse menuiseries + extraction clientInfo + projetInfo
  → Chercher client existant par email (findOrCreateClient)
  → Si trouvé : récupérer Client existant
  → Si nouveau : créer nouveau Client
  → Créer Projet avec clientId + adresse chantier
```

## 📝 Extraction IA Modifiée

### Structure JSON retournée par Claude

```json
{
  "menuiseries": [
    {
      "repere": "Salon",
      "intitule": "Coulissant 2 vantaux",
      "largeur": 3000,
      "hauteur": 2250,
      // ... autres champs
    }
  ],
  "metadata": {
    "confidence": 0.95,
    "warnings": [],
    "clientInfo": {           // ✅ Séparé du projet
      "nom": "DUPONT",
      "email": "jean.dupont@example.com",
      "tel": "06 12 34 56 78"
    },
    "projetInfo": {           // ✅ Infos spécifiques au chantier
      "adresse": "15 Rue des Lilas"
    }
  }
}
```

### Prompt IA mis à jour

Ajout de la règle :
```
7. Extrais obligatoirement les infos client (nom, email, tel) dans metadata.clientInfo
8. Extrais l'adresse du chantier dans metadata.projetInfo.adresse
```

## 🛠️ Plan de Migration

### Phase 1 : Migration Base de Données

1. **Créer table Client**
```bash
# 1. Modifier prisma/schema.prisma (ajout model Client)
# 2. Créer migration
npm run db:migrate

# Migration générée automatiquement par Prisma
# Fichier : prisma/migrations/XXXXXX_create_client_table/migration.sql
```

2. **Migrer données existantes**
```sql
-- Script de migration des données Projet vers Client
INSERT INTO "Client" (id, nom, email, tel, "createdAt", "updatedAt")
SELECT
  gen_random_uuid() as id,
  "clientNom" as nom,
  "clientEmail" as email,
  "clientTel" as tel,
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "Projet"
WHERE "clientEmail" IS NOT NULL
GROUP BY "clientEmail", "clientNom", "clientTel";

-- Mettre à jour les Projets avec clientId
UPDATE "Projet" p
SET "clientId" = c.id
FROM "Client" c
WHERE p."clientEmail" = c.email;

-- Supprimer anciennes colonnes (après vérification)
ALTER TABLE "Projet" DROP COLUMN "clientNom";
ALTER TABLE "Projet" DROP COLUMN "clientAdresse";
ALTER TABLE "Projet" DROP COLUMN "clientTel";
ALTER TABLE "Projet" DROP COLUMN "clientEmail";
```

### Phase 2 : Code Backend

#### A. Validation Zod

**Fichier** : `src/lib/validations/ai-response.ts`

```typescript
// Nouveau schema pour réponse IA
export const aiClientInfoSchema = z.object({
  nom: z.string().min(1),
  email: z.string().email().optional(),
  tel: z.string().optional(),
});

export const aiProjetInfoSchema = z.object({
  adresse: z.string().optional(),
});

export const aiResponseSchema = z.object({
  menuiseries: z.array(menuiserieSchema),
  metadata: z.object({
    confidence: z.number().min(0).max(1),
    warnings: z.array(z.string()),
    clientInfo: aiClientInfoSchema,
    projetInfo: aiProjetInfoSchema,
  }),
});
```

#### B. Fonction findOrCreateClient

**Fichier** : `src/lib/clients.ts`

```typescript
import { prisma } from "@/lib/prisma";

export async function findOrCreateClient(data: {
  nom: string;
  email?: string;
  tel?: string;
}) {
  // Si email fourni, chercher client existant
  if (data.email) {
    const existing = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      // Client trouvé - optionnel : mettre à jour tel si différent
      if (data.tel && existing.tel !== data.tel) {
        return await prisma.client.update({
          where: { id: existing.id },
          data: { tel: data.tel },
        });
      }
      return { client: existing, isNew: false };
    }
  }

  // Client non trouvé ou pas d'email - créer nouveau
  const newClient = await prisma.client.create({
    data: {
      nom: data.nom,
      email: data.email,
      tel: data.tel,
    },
  });

  return { client: newClient, isNew: true };
}

// Exemple d'utilisation
const { client, isNew } = await findOrCreateClient({
  nom: "DUPONT",
  email: "jean.dupont@example.com",
  tel: "06 12 34 56 78"
});
```

#### C. Mise à jour API Upload

**Fichier** : `src/app/api/upload/pdf/route.ts`

```typescript
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // 1. Parser PDF avec IA
  const parsed = await parsePDFWithAI(file);

  // 2. Trouver ou créer client
  const { client, isNew } = await findOrCreateClient(
    parsed.metadata.clientInfo
  );

  // 3. Créer projet avec relation client
  const projet = await prisma.projet.create({
    data: {
      reference: generateReference(client.nom),
      clientId: client.id,
      adresse: parsed.metadata.projetInfo.adresse,
      pdfUrl: uploadedFileUrl,
      menuiseries: {
        create: parsed.menuiseries.map((m, index) => ({
          repere: m.repere,
          intitule: m.intitule,
          donneesOriginales: m,
          ordre: index,
        })),
      },
    },
    include: {
      menuiseries: true,
      client: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      client: { ...client, isNew },
      projet,
      menuiseries: projet.menuiseries,
    },
  });
}
```

### Phase 3 : API Clients

**Fichiers à créer** :

1. `src/app/api/clients/route.ts` - GET (liste) / POST (création manuelle)
2. `src/app/api/clients/[id]/route.ts` - GET (détail) / PUT (update) / DELETE (suppr)

**Exemple GET /api/clients/[id]** :

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      projets: {
        include: {
          _count: {
            select: { menuiseries: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    return NextResponse.json(
      { success: false, error: "Client non trouvé" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...client,
      stats: {
        totalProjets: client.projets.length,
        projetsEnCours: client.projets.filter((p) => p.statut === "EN_COURS")
          .length,
      },
    },
  });
}
```

### Phase 4 : UI Frontend

#### A. Liste des clients

**Fichier** : `src/app/clients/page.tsx`

```tsx
export default function ClientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetch("/api/clients").then((r) => r.json()),
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Mes Clients</h1>
      <div className="space-y-3">
        {data?.data.map((client) => (
          <Card key={client.id} className="p-4">
            <Link href={`/clients/${client.id}`}>
              <h3 className="font-semibold">{client.nom}</h3>
              <p className="text-sm text-gray-600">{client.email}</p>
              <Badge>{client.projetsCount} projets</Badge>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### B. Détail client

**Fichier** : `src/app/clients/[id]/page.tsx`

```tsx
export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const { data } = useQuery({
    queryKey: ["client", params.id],
    queryFn: () => fetch(`/api/clients/${params.id}`).then((r) => r.json()),
  });

  const client = data?.data;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">{client.nom}</h1>
      <div className="text-gray-600 space-y-1">
        <p>{client.email}</p>
        <p>{client.tel}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-4">Projets</h2>
      <div className="space-y-3">
        {client.projets.map((projet) => (
          <Card key={projet.id} className="p-4">
            <Link href={`/projet/${projet.id}`}>
              <h3 className="font-semibold">{projet.reference}</h3>
              <p className="text-sm text-gray-600">{projet.adresse}</p>
              <Badge>{projet.menuiseriesCount} menuiseries</Badge>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Phase 5 : Tests

#### Tests unitaires à ajouter

```typescript
// src/__tests__/lib/clients.test.ts
describe("findOrCreateClient", () => {
  it("should find existing client by email", async () => {
    // Arrange: créer client en DB
    const existing = await prisma.client.create({
      data: { nom: "DUPONT", email: "dupont@test.com" },
    });

    // Act
    const { client, isNew } = await findOrCreateClient({
      nom: "DUPONT Jean",
      email: "dupont@test.com",
    });

    // Assert
    expect(isNew).toBe(false);
    expect(client.id).toBe(existing.id);
  });

  it("should create new client if email not found", async () => {
    const { client, isNew } = await findOrCreateClient({
      nom: "MARTIN",
      email: "martin@test.com",
    });

    expect(isNew).toBe(true);
    expect(client.email).toBe("martin@test.com");
  });
});
```

## 🎯 Checklist Migration

### Base de données
- [ ] Modifier schema Prisma (ajout model Client)
- [ ] Créer migration avec `npm run db:migrate`
- [ ] Script de migration données existantes
- [ ] Vérifier données migrées avec Prisma Studio
- [ ] Supprimer anciennes colonnes Projet

### Backend
- [ ] Créer validations Zod (clientInfo, projetInfo)
- [ ] Implémenter `findOrCreateClient`
- [ ] Refactorer API upload/pdf
- [ ] Créer API routes clients (GET list, GET detail, PUT)
- [ ] Mettre à jour prompt IA
- [ ] Tests unitaires findOrCreateClient
- [ ] Tests API clients

### Frontend
- [ ] Page liste clients (`/clients`)
- [ ] Page détail client (`/clients/[id]`)
- [ ] Mise à jour page projets (afficher client.nom)
- [ ] Badge "Nouveau client" après upload
- [ ] Navigation client → projets

### Documentation
- [x] Mise à jour PRD.md
- [x] Mise à jour CONTEXT.md
- [x] Mise à jour API_SPEC.md
- [x] Mise à jour schema Prisma
- [x] Mise à jour TODO_LIST.md
- [x] Créer MIGRATION_CLIENT.md (ce fichier)

## 📌 Notes Importantes

1. **Migration données** : Prévoir un backup avant migration
2. **Email unique** : Clé de détection, important pour l'extraction PDF
3. **Cascade delete** : Si client supprimé → tous ses projets sont supprimés
4. **Tests** : Bien tester la logique findOrCreateClient (edge cases)
5. **UI** : Ajouter navigation "Mes Clients" dans le menu principal

## 🚀 Ordre d'exécution recommandé

1. ✅ Documenter la migration (ce fichier)
2. 🔄 Migration DB + data (avec backup)
3. 🔄 Backend (validations + API)
4. 🔄 Tests
5. 🔄 Frontend UI
6. 🔄 Tests E2E
7. 🔄 Déploiement staging
8. 🔄 Validation métier
9. 🔄 Déploiement production
