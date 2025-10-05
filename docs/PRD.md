# Product Requirements Document (PRD)

## Application ProMétrage - Workflow PDF & Mobile

### 1. Vue d'ensemble

#### 1.1 Résumé exécutif

Application web **mobile-first** permettant aux artisans de faire des prises de côtes chez les clients en se basant sur des fiches métreur PDF uploadées et parsées. L'application extrait automatiquement les données du PDF et permet de valider/modifier les valeurs sur site.

#### 1.2 Objectifs

- **Simplicité** : Interface intuitive pour artisans peu familiers avec le digital
- **Mobilité** : Utilisable principalement sur téléphone en situation de chantier
- **Fiabilité** : Réduction des erreurs de prise de côtes
- **Évolutivité** : Architecture prête pour règles métier dynamiques

#### 1.3 Workflow principal

1. **Upload PDF** → Parsing automatique des données
2. **Création projet** → Association client/menuiseries
3. **Prise de côtes** → Validation/modification sur site
4. **Alertes visuelles** → Signalement des écarts
5. **Sauvegarde** → Possibilité d'édition ultérieure

### 2. Stack technique

#### 2.1 Core Stack

- **Framework** : Next.js 15+ (App Router)
- **UI** : Shadcn/ui + Tailwind CSS
- **State** : TanStack Query + Zustand
- **Forms** : React Hook Form + Zod
- **PDF** : Anthropic Claude Sonnet 4.5 (Vision API) pour parsing intelligent via IA
- **Base de données** : PostgreSQL + Prisma
- **Hébergement** : Vercel
- **Storage** : Uploadthing ou Vercel Blob

#### 2.2 Architecture mobile-first

```typescript
// Breakpoints Tailwind priorité mobile
const breakpoints = {
  'sm': '640px',   // Tablettes portrait
  'md': '768px',   // Tablettes paysage
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
}

// Composants adaptatifs
<div className="
  w-full                    // Mobile: pleine largeur
  sm:max-w-lg sm:mx-auto   // Tablette: centré
  lg:max-w-4xl              // Desktop: plus large
">
```

### 3. Modèle de données

```prisma
model Projet {
  id          String      @id @default(cuid())
  reference   String      @unique
  client      Json        // {nom, adresse, tel, email}
  pdfUrl      String      // URL du PDF uploadé
  dateUpload  DateTime    @default(now())
  statut      Status      @default(EN_COURS)
  menuiseries Menuiserie[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Menuiserie {
  id            String   @id @default(cuid())
  projetId      String
  projet        Projet   @relation(fields: [projetId], references: [id])

  // Identification
  repere        String?  // Ex: "Salon"
  intitule      String   // Ex: "Coulissant 2 vantaux"

  // Données extraites du PDF (valeurs originales)
  donneesOriginales Json

  // Données modifiées par l'artisan
  donneesModifiees  Json?

  // Analyse des écarts
  ecarts        Json?    // Liste des champs modifiés

  validee       Boolean  @default(false)
  dateValidation DateTime?
}

// Structure JSON pour les données
interface DonneesMenuiserie {
  // Dimensions
  largeur: number;
  hauteur: number;
  hauteurAllege?: number;

  // Caractéristiques
  gamme: string;           // OPTIMAX, PERFORMAX, INNOVAX
  couleurInt: string;
  couleurExt: string;
  pose: string;            // tunnel, applique, renovation
  dimensions: string;      // clair de bois, execution
  dormant: string;         // avec/sans aile

  // Habillages
  habillageInt: string;
  habillageExt: string;

  // Vitrage
  doubleVitrage: string;
  intercalaire: string;    // blanc, noir

  // Options coulissant
  ouvrantPrincipal?: string;  // droite, gauche
  fermeture?: string;
  poignee?: string;
  rails?: string;          // inox, alu

  // Couleurs complémentaires
  couleurJoints?: string;
  couleurQuincaillerie?: string;
  couleurPareTempete?: string;
  couleurPetitsBois?: string;
}

enum Status {
  EN_COURS
  VALIDE
  ARCHIVE
}
```

### 4. Parsing PDF via IA - Approche intelligente

#### 4.1 Workflow d'extraction par IA

```typescript
// 1. Upload et préparation du PDF
const processPDF = async (file: File) => {
  // Conversion PDF → Images (ou extraction texte enrichi)
  const pdfData = await convertPDFToBase64(file);

  // 2. Envoi à l'API Anthropic Claude avec prompt structuré
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: pdfData
          }
        },
        {
          type: "text",
          text: EXTRACTION_PROMPT
        }
      ]
    }]
  });

  // 3. Validation de la réponse avec Zod
  const extractedData = JSON.parse(response.content[0].text);
  const validated = menuiseriesArraySchema.parse(extractedData);

  return validated;
};
```

#### 4.2 Prompt structuré pour extraction

```typescript
const EXTRACTION_PROMPT = `
Tu es un expert en extraction de données de fiches métreur pour menuiseries.

Analyse ce PDF et extrais TOUTES les menuiseries présentes.
Pour chaque menuiserie, extrais les données suivantes au format JSON strict :

{
  "menuiseries": [
    {
      "repere": "Salon" | null,  // Texte avant ":" si présent
      "intitule": "Coulissant 2 vantaux",  // Titre de la menuiserie
      "largeur": 3000,  // En millimètres (nombre)
      "hauteur": 2250,  // En millimètres (nombre)
      "hauteurAllege": 1000,  // Optionnel
      "gamme": "OPTIMAX" | "PERFORMAX" | "INNOVAX",
      "couleurInt": "RAL 9016",
      "couleurExt": "RAL 7016",
      "pose": "tunnel" | "applique" | "renovation",
      "dimensions": "clair de bois" | "execution",
      "dormant": "avec aile" | "sans aile",
      "habillageInt": "Plat 30x2" | "Sans habillage",
      "habillageExt": "Cornière 20x20" | "Sans habillage",
      "doubleVitrage": "44.2.16w Argon.4 PTR+",
      "intercalaire": "blanc" | "noir",
      "ouvrantPrincipal": "droite" | "gauche",  // Pour coulissants
      "fermeture": "Description",
      "poignee": "Description",
      "rails": "inox" | "alu",
      "couleurJoints": "RAL...",
      "couleurQuincaillerie": "Description",
      "couleurPareTempete": "RAL...",
      "couleurPetitsBois": "Description"
    }
  ],
  "metadata": {
    "confidence": 0.95,  // Score de confiance global (0-1)
    "warnings": ["Dimension hauteur peu lisible pour menuiserie #2"],
    "clientInfo": {
      "nom": "KOMPANIETZ",
      "adresse": "37 Chemin du Cuvier",
      "tel": "06 25 91 01 48",
      "email": "paul.kompanietz@gmail.com"
    }
  }
}

RÈGLES STRICTES:
1. Toutes les dimensions DOIVENT être des nombres en millimètres
2. Si une valeur est illisible, utilise null et ajoute un warning
3. Normalise les gammes en MAJUSCULES (OPTIMAX, PERFORMAX, INNOVAX)
4. Normalise les poses en minuscules (tunnel, applique, renovation)
5. Extrais TOUTES les menuiseries, même partiellement remplies
6. Conserve les descriptions exactes pour couleurs et options

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.
`;
```

#### 4.3 Stratégie d'extraction avec IA

1. **Upload PDF** → Conversion en base64 ou images
2. **Envoi à Claude Vision** avec prompt structuré JSON
3. **Parsing réponse** et extraction du JSON
4. **Validation Zod stricte** des données extraites
5. **Gestion des erreurs** :
   - Retry automatique si parsing échoue (max 3 tentatives)
   - Fallback vers extraction manuelle si confiance < 70%
   - Stockage des warnings pour revue utilisateur
6. **Stockage** en JSON flexible avec métadonnées IA

#### 4.4 Avantages de l'approche IA

- ✅ **Robustesse** : Gère les variations de format automatiquement
- ✅ **Contexte** : Comprend la mise en page et les tableaux complexes
- ✅ **Maintenance** : Pas de regex fragiles à maintenir
- ✅ **Évolutivité** : Adaptation naturelle aux nouveaux formats
- ✅ **Confiance** : Score de confiance pour chaque extraction
- ✅ **Warnings** : Signalement automatique des zones ambiguës

### 5. Interface utilisateur

#### 5.1 Écrans principaux

##### Page d'accueil (Mobile)

```tsx
// Simplicité maximale
<div className="p-4 min-h-screen">
  <h1 className="text-2xl font-bold mb-6">Mes Projets</h1>

  {/* Gros bouton upload visible */}
  <Button className="w-full h-16 text-lg mb-6">
    <Upload className="mr-2" />
    Nouveau projet (PDF)
  </Button>

  {/* Liste des projets en cours */}
  <div className="space-y-3">
    {projets.map((p) => (
      <Card className="p-4" onClick={() => router.push(`/projet/${p.id}`)}>
        <div className="font-semibold">{p.reference}</div>
        <div className="text-sm text-gray-600">{p.client.nom}</div>
        <Badge>{p.menuiseries.length} menuiseries</Badge>
      </Card>
    ))}
  </div>
</div>
```

##### Formulaire de prise de côtes

```tsx
// Interface adaptée au pouce
<div className="p-4 pb-20">
  {" "}
  {/* Padding bottom pour bouton fixe */}
  {/* Header fixe avec navigation */}
  <div className="sticky top-0 bg-white z-10 pb-4">
    <Button variant="ghost" onClick={back}>
      <ChevronLeft /> Retour
    </Button>
    <h2 className="text-lg font-bold">{menuiserie.intitule}</h2>
    {menuiserie.repere && <Badge variant="outline">{menuiserie.repere}</Badge>}
  </div>
  {/* Formulaire avec gros inputs */}
  <Form {...form}>
    {/* Dimensions - Les plus importantes en premier */}
    <div className="space-y-4">
      <FormField
        name="largeur"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Largeur (mm)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="numeric"
                className="h-14 text-lg"
              />
            </FormControl>
            {/* Alerte si écart */}
            {ecart > 50 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Écart de {ecart}mm avec le PDF
                </AlertDescription>
              </Alert>
            )}
          </FormItem>
        )}
      />

      {/* Select avec grandes options */}
      <FormField
        name="pose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de pose</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-14 text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renovation" className="h-12">
                  Rénovation (plus courant)
                </SelectItem>
                <SelectItem value="tunnel" className="h-12">
                  Pose en tunnel
                </SelectItem>
                <SelectItem value="applique" className="h-12">
                  Pose en applique
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>
  </Form>
  {/* Bouton save fixe en bas */}
  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
    <Button className="w-full h-14 text-lg" onClick={handleSave}>
      Enregistrer
    </Button>
  </div>
</div>
```

#### 5.2 Système d'alertes visuelles

```typescript
// Calcul des écarts
const calculateEcart = (original: number, nouveau: number) => {
  const diff = Math.abs(original - nouveau);
  const percent = (diff / original) * 100;

  if (percent > 10) return { level: "error", color: "red" };
  if (percent > 5) return { level: "warning", color: "orange" };
  if (percent > 0) return { level: "info", color: "blue" };
  return null;
};

// Affichage contextuel
{
  ecart && (
    <div
      className={`
    p-3 rounded-lg border-l-4
    ${ecart.level === "error" ? "bg-red-50 border-red-500" : ""}
    ${ecart.level === "warning" ? "bg-orange-50 border-orange-500" : ""}
  `}
    >
      <div className="flex items-center">
        <AlertTriangle className="mr-2" />
        <span>
          Valeur PDF : {original}mm → Nouvelle : {nouveau}mm
        </span>
      </div>
    </div>
  );
}
```

### 6. Gestion des règles métier (Future)

#### 6.1 Architecture extensible

```typescript
// Système de règles dynamiques
interface RegleMetier {
  id: string;
  condition: (data: DonneesMenuiserie) => boolean;
  action: {
    type: "ADD_FIELD" | "MODIFY_VALUE" | "SHOW_ALERT";
    payload: any;
  };
}

// Exemple : Si gamme PERFORMAX → afficher options supplémentaires
const regles: RegleMetier[] = [
  {
    id: "performax-options",
    condition: (data) => data.gamme === "PERFORMAX",
    action: {
      type: "ADD_FIELD",
      payload: {
        field: "optionsPerformax",
        component: "PerformaxOptions",
      },
    },
  },
];

// Hook pour appliquer les règles
const useBusinessRules = (data: DonneesMenuiserie) => {
  const [additionalFields, setAdditionalFields] = useState([]);

  useEffect(() => {
    const applicable = regles.filter((r) => r.condition(data));
    // Appliquer les actions...
  }, [data]);

  return { additionalFields };
};
```

### 7. Responsive Design Guidelines

#### 7.1 Mobile First (< 640px)

- Navigation : Bottom tabs ou burger menu
- Forms : 1 colonne, gros boutons
- Cards : Stack vertical
- Modals : Fullscreen

#### 7.2 Tablet (640px - 1024px)

- Navigation : Sidebar collapsible
- Forms : 1-2 colonnes selon contenu
- Cards : Grid 2 colonnes
- Modals : Centered avec padding

#### 7.3 Desktop (> 1024px)

- Navigation : Sidebar fixe
- Forms : Multi-colonnes
- Cards : Grid 3-4 colonnes
- Modals : Standard size

### 8. API Endpoints

```typescript
// Upload & Parsing
POST   /api/upload/pdf       // Upload et parse PDF
GET    /api/parse/status/:id // Statut du parsing

// Projets
GET    /api/projets          // Liste des projets
POST   /api/projets          // Créer depuis PDF parsé
GET    /api/projets/:id      // Détail avec menuiseries
PUT    /api/projets/:id      // Mise à jour

// Menuiseries
PUT    /api/menuiseries/:id  // Sauvegarder modifications
POST   /api/menuiseries/:id/validate // Valider définitivement

// Export
GET    /api/export/:projetId // Export des données
```

### 9. Roadmap MVP

#### Sprint 1 (2 semaines)

- Setup Next.js + Shadcn + TanStack
- Configuration Anthropic Claude API
- Upload PDF + parsing via IA avec retry
- Modèle de données avec métadonnées IA
- UI mobile homepage

#### Sprint 2 (2 semaines)

- Formulaire prise de côtes responsive
- Calcul et affichage des écarts
- Sauvegarde modifications
- Navigation entre menuiseries

#### Sprint 3 (1 semaine)

- Optimisations mobile
- Tests sur vrais téléphones
- Déploiement Vercel
- Documentation

### 10. Points d'attention

#### 10.1 Performance mobile

- Lazy loading des projets
- Optimistic updates
- Cache aggressive avec TanStack Query
- Images optimisées

#### 10.2 UX terrain

- Mode offline partiel (consultation)
- Auto-save toutes les 30 secondes
- Confirmation avant écrasement
- Gros boutons pour utilisation avec gants

#### 10.3 Évolutivité

- JSON flexible pour nouvelles données
- Architecture prête pour règles métier
- API versionnée
- Migrations Prisma documentées
