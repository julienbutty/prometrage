# API_SPECS.md - Spécifications API Application Métreur V2

## 📚 Vue d'ensemble

Base URL: `https://prometrage.com/api`
Format: JSON
Auth: JWT Bearer Token (future)

## 🔐 Headers standards

```http
Content-Type: application/json
Accept: application/json
```

## 📋 Endpoints

### Upload & Parsing

#### POST `/api/upload/pdf`

Upload et parse un fichier PDF de fiche métreur via IA (Anthropic Claude Vision).
fichier référence dans /docs/fm.pdf

**Request:**

```http
POST /api/upload/pdf
Content-Type: multipart/form-data

{
  "file": <PDF file>
}

Note: Les infos client et adresse sont extraites automatiquement du PDF par l'IA
```

**Response Success (201):**

```json
{
  "success": true,
  "data": {
    "client": {
      "id": "clxyz000...",
      "nom": "DUPONT",
      "email": "jean.dupont@example.com",
      "tel": "06 12 34 56 78",
      "isNew": false  // true si créé, false si existant (détecté par email)
    },
    "projet": {
      "id": "clxyz123...",
      "reference": "DUPO-2024-001",
      "clientId": "clxyz000...",
      "adresse": "15 Rue des Lilas",
      "pdfUrl": "https://storage.../file.pdf"
    },
    "menuiseries": [
      {
        "id": "clxyz456...",
        "repere": "Salon",
        "intitule": "Coulissant 2 vantaux",
        "donneesOriginales": {
          "largeur": 3000,
          "hauteur": 2250,
          "gamme": "PERFORMAX",
          "pose": "tunnel"
          // ...autres données
        }
      }
    ],
    "parseStatus": {
      "total": 3,
      "success": 3,
      "errors": [],
      "aiMetadata": {
        "model": "claude-sonnet-4-20250514",
        "confidence": 0.95,
        "tokensUsed": 1250,
        "warnings": [],
        "retryCount": 0
      }
    }
  }
}

**Note** : Le champ `imageBase64` est présent dans les menuiseries mais reste `null` car l'extraction d'images n'est pas encore implémentée (infrastructure prête).
```

**Response Error (400):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PDF",
    "message": "Le fichier PDF n'a pas pu être lu",
    "details": {
      "format": "Le fichier n'est pas un PDF valide"
    }
  }
}
```

---

### Clients

#### GET `/api/clients`

Liste tous les clients avec nombre de projets.

**Query Parameters:**

- `page` (number): Page courante (défaut: 1)
- `limit` (number): Nombre par page (défaut: 20)
- `search` (string): Recherche dans nom ou email

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz000...",
      "nom": "DUPONT",
      "email": "jean.dupont@example.com",
      "tel": "06 12 34 56 78",
      "projetsCount": 3,
      "lastProjet": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### GET `/api/clients/[id]`

Détail d'un client avec tous ses projets.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz000...",
    "nom": "DUPONT",
    "email": "jean.dupont@example.com",
    "tel": "06 12 34 56 78",
    "projets": [
      {
        "id": "clxyz123...",
        "reference": "DUPO-2024-001",
        "adresse": "15 Rue des Lilas",
        "statut": "EN_COURS",
        "menuiseriesCount": 3,
        "dateUpload": "2024-01-15T10:00:00Z"
      },
      {
        "id": "clxyz789...",
        "reference": "DUPO-2024-002",
        "adresse": "42 Avenue des Fleurs",
        "statut": "VALIDE",
        "menuiseriesCount": 5,
        "dateUpload": "2024-02-10T14:30:00Z"
      }
    ],
    "stats": {
      "totalProjets": 2,
      "projetsEnCours": 1,
      "projetsValides": 1
    }
  }
}
```

#### PUT `/api/clients/[id]`

Mise à jour des infos client.

**Request:**

```json
{
  "nom": "DUPONT Jean",
  "email": "jean.dupont@example.com",
  "tel": "06 12 34 56 78"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz000...",
    "nom": "DUPONT Jean",
    "email": "jean.dupont@example.com",
    "tel": "06 12 34 56 78"
  }
}
```

---

### Projets

#### GET `/api/projets`

Liste tous les projets avec pagination.

**Query Parameters:**

- `page` (number): Page courante (défaut: 1)
- `limit` (number): Nombre par page (défaut: 10)
- `status` (string): Filtrer par statut (EN_COURS|VALIDE|ARCHIVE)
- `search` (string): Recherche dans référence ou client

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123...",
      "reference": "DUPO-2024-001",
      "adresse": "15 Rue des Lilas",
      "client": {
        "id": "clxyz000...",
        "nom": "DUPONT",
        "email": "jean.dupont@example.com"
      },
      "statut": "EN_COURS",
      "menuiseriesCount": 3,
      "menuiseriesValidees": 1,
      "dateUpload": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

#### GET `/api/projets/[id]`

Détail d'un projet avec ses menuiseries.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz123...",
    "reference": "DUPO-2024-001",
    "adresse": "15 Rue des Lilas",
    "client": {
      "id": "clxyz000...",
      "nom": "DUPONT",
      "email": "jean.dupont@example.com",
      "tel": "06 12 34 56 78"
    },
    "pdfUrl": "https://storage.../file.pdf",
    "statut": "EN_COURS",
    "menuiseries": [
      {
        "id": "clxyz456...",
        "repere": "Salon",
        "intitule": "Coulissant 2 vantaux",
        "validee": false,
        "hasEcarts": true,
        "ecartsCount": 2
      }
    ],
    "progress": {
      "total": 3,
      "validees": 1,
      "pourcentage": 33
    }
  }
}
```

#### PUT `/api/projets/[id]`

Mise à jour du statut d'un projet.

**Request:**

```json
{
  "statut": "VALIDE",
  "adresse": "15 Rue des Lilas (modifiée)"  // Optionnel - mise à jour adresse chantier
}
```

---

### Menuiseries

#### GET `/api/menuiseries/[id]`

Détail complet d'une menuiserie avec analyse des écarts et métadonnées de navigation.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz456...",
    "projetId": "clxyz123...",
    "repere": "Salon",
    "intitule": "Coulissant 2 vantaux",
    "imageBase64": null,  // EN ATTENTE - Infrastructure prête mais extraction non implémentée
    "donneesOriginales": {
      "largeur": 3000,
      "hauteur": 2250,
      "gamme": "PERFORMAX",
      "pose": "tunnel",
      "dormant": "sans aile",
      "habillageInt": "Plat 30x2",
      "habillageExt": "Cornière 20x20",
      "intercalaire": "noir",
      "ouvrantPrincipal": "droite",
      "rails": "inox"
    },
    "donneesModifiees": {
      "largeur": 3050,
      "hauteur": 2250
      // ...autres modifications
    },
    "ecarts": [
      {
        "champ": "largeur",
        "valeurOriginale": 3000,
        "valeurModifiee": 3050,
        "pourcentage": 1.67,
        "niveau": "faible"  // "faible" < 5%, "moyen" 5-10%, "élevé" > 10%
      }
    ],
    "validee": false,
    "dateModification": "2024-01-15T14:30:00Z",
    "navigation": {
      "currentPosition": 2,
      "total": 5,
      "hasNext": true,
      "hasPrevious": true,
      "nextId": "clxyz789...",
      "previousId": "clxyz123...",
      "menuiseriesStatus": [
        {
          "id": "clxyz123...",
          "repere": "Entrée",
          "intitule": "Porte-fenêtre",
          "statut": "VALIDEE",
          "isCompleted": true
        },
        {
          "id": "clxyz456...",
          "repere": "Salon",
          "intitule": "Coulissant 2 vantaux",
          "statut": "EN_COURS",
          "isCompleted": false
        },
        {
          "id": "clxyz789...",
          "repere": null,
          "intitule": "Châssis fixe",
          "statut": "IMPORTEE",
          "isCompleted": false
        }
      ]
    }
  }
}
```

**Métadonnées de navigation** :
- `currentPosition` : Position actuelle (1-indexed)
- `total` : Nombre total de menuiseries du projet
- `hasNext` / `hasPrevious` : Booléens pour états des boutons
- `nextId` / `previousId` : IDs pour navigation (null si pas de suivant/précédent)
- `menuiseriesStatus` : Liste complète avec statuts de complétion
  - `statut` : Enum `"IMPORTEE" | "EN_COURS" | "VALIDEE"`
    - `IMPORTEE` : Importée du PDF, jamais modifiée (`donneesModifiees === null`)
    - `EN_COURS` : Modifiée mais pas validée (`donneesModifiees !== null && validee === false`)
    - `VALIDEE` : Validée et terminée (`validee === true`)
  - `isCompleted` : `true` uniquement si `statut === "VALIDEE"` (compatibilité legacy)

#### PUT `/api/menuiseries/[id]`

Sauvegarde des modifications d'une menuiserie.

**Request:**

```json
{
  "largeur": 3050,
  "hauteur": 2250,
  "pose": "renovation",
  "habillageInt": "Sans habillage"
  // ...autres champs
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "clxyz456...",
    "ecarts": [
      {
        "champ": "largeur",
        "valeurOriginale": 3000,
        "valeurModifiee": 3050,
        "pourcentage": 1.67,
        "niveau": "info"
      },
      {
        "champ": "pose",
        "valeurOriginale": "tunnel",
        "valeurModifiee": "renovation",
        "niveau": "warning"
      }
    ],
    "validee": false
  }
}
```

#### POST `/api/menuiseries/[id]/valider`

Valide définitivement une menuiserie (marque comme terminée).

**Comportement** :
- Requiert que `donneesModifiees` existe (impossible de valider une menuiserie jamais modifiée)
- Met `validee` à `true`
- Enregistre `dateValidation` à l'instant actuel
- Change le statut de `EN_COURS` → `VALIDEE`

**Request:**

```http
POST /api/menuiseries/clxyz456/valider
```

**Response Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "clxyz456...",
    "validee": true,
    "dateValidation": "2025-01-12T11:06:00Z"
  }
}
```

**Response Error (400 - pas de modifications):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot validate menuiserie without modifications",
    "details": "Please save modifications before validating"
  }
}
```

**Response Error (404 - menuiserie introuvable):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Menuiserie not found"
  }
}
```

---

### Navigation

**Note** : Les métadonnées de navigation sont désormais incluses directement dans la réponse de `GET /api/menuiseries/[id]` (voir ci-dessus).

L'endpoint dédié `/api/projets/[projetId]/menuiseries/navigation` n'est plus nécessaire.

---

### Export

#### GET `/api/export/[projetId]/pdf`

Génère un PDF avec toutes les données du projet.

**Response:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="DUPO-2024-001.pdf"

[Binary PDF data]
```

#### GET `/api/export/[projetId]/excel`

Export Excel avec comparaison original/modifié.

**Response:**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="DUPO-2024-001.xlsx"

[Binary Excel data]
```

---

## 🔴 Codes d'erreur

| Code               | Status HTTP | Description                 | Action suggérée             |
| ------------------ | ----------- | --------------------------- | --------------------------- |
| `VALIDATION_ERROR` | 400         | Données invalides           | Vérifier les champs         |
| `INVALID_PDF`      | 400         | PDF non valide ou illisible | Réessayer avec un autre PDF |
| `PARSE_ERROR`      | 400         | Échec du parsing PDF        | Vérifier le format du PDF   |
| `AI_PARSE_ERROR`   | 500         | L'IA n'a pas pu parser le PDF | Retry automatique ou manuel |
| `AI_LOW_CONFIDENCE`| 422         | Confiance IA < 70%          | Vérification manuelle requise |
| `AI_RATE_LIMIT`    | 429         | Limite API IA atteinte      | Réessayer dans 1 minute     |
| `NOT_FOUND`        | 404         | Ressource introuvable       | Vérifier l'ID               |
| `UNAUTHORIZED`     | 401         | Non authentifié             | Se connecter                |
| `FORBIDDEN`        | 403         | Accès refusé                | Vérifier permissions        |
| `CONFLICT`         | 409         | Conflit (ex: déjà validé)   | Rafraîchir les données      |
| `SERVER_ERROR`     | 500         | Erreur serveur              | Réessayer plus tard         |

---

## 📝 Validation Schemas (Zod)

```typescript
// Schema pour création/update menuiserie
const menuiserieUpdateSchema = z.object({
  largeur: z.number().min(100).max(10000),
  hauteur: z.number().min(100).max(10000),
  hauteurAllege: z.number().optional(),
  gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]),
  pose: z.enum(["tunnel", "applique", "renovation"]),
  dormant: z.string(),
  habillageInt: z.string().optional(),
  habillageExt: z.string().optional(),
  intercalaire: z.enum(["blanc", "noir"]),
  ouvrantPrincipal: z.enum(["droite", "gauche"]).optional(),
  rails: z.enum(["inox", "alu"]).optional(),
  // ...autres champs
});

// Schema pour upload PDF
const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/pdf",
      "Le fichier doit être un PDF"
    ),
  client: z.object({
    nom: z.string().min(1),
    adresse: z.string().optional(),
    tel: z.string().optional(),
    email: z.string().email().optional(),
  }),
});
```

---

## 🔄 Patterns de requêtes avec TanStack Query

```typescript
// Queries
export const menuiserieKeys = {
  all: ["menuiseries"] as const,
  lists: () => [...menuiserieKeys.all, "list"] as const,
  list: (projetId: string) => [...menuiserieKeys.lists(), projetId] as const,
  details: () => [...menuiserieKeys.all, "detail"] as const,
  detail: (id: string) => [...menuiserieKeys.details(), id] as const,
};

// Hook personnalisé
export function useMenuiserie(id: string) {
  return useQuery({
    queryKey: menuiserieKeys.detail(id),
    queryFn: () => fetch(`/api/menuiseries/${id}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation avec optimistic update
export function useUpdateMenuiserie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetch(`/api/menuiseries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: menuiserieKeys.detail(id),
      });

      const previous = queryClient.getQueryData(menuiserieKeys.detail(id));

      queryClient.setQueryData(menuiserieKeys.detail(id), (old: any) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          menuiserieKeys.detail(variables.id),
          context.previous
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: menuiserieKeys.detail(variables.id),
      });
    },
  });
}
```

---

## 📱 Gestion des états de chargement

```typescript
// États possibles
type LoadingState = "idle" | "loading" | "success" | "error";

// Composant wrapper
function DataLoader<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
}) {
  if (query.isLoading) {
    return <Skeleton className="h-32" />;
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {query.error?.message || "Erreur de chargement"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!query.data) {
    return <EmptyState />;
  }

  return <>{children(query.data)}</>;
}
```
