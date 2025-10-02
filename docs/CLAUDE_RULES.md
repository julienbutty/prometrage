# CLAUDE_RULES.md

## Règles et contexte pour Claude Code - ProMétrage

### 🎯 Contexte du projet

Application mobile-first pour artisans permettant la prise de côtes sur chantier basée sur des fiches métreur PDF. Les utilisateurs ne sont pas forcément à l'aise avec le digital, l'interface doit être extrêmement simple et intuitive.

### ⚙️ Stack technique OBLIGATOIRE

- **Framework** : Next.js 15+ avec App Router
- **UI** : Shadcn/ui + Tailwind CSS
- **State** : TanStack Query (cache) + Zustand (state global)
- **Forms** : React Hook Form + Zod
- **PDF** : pdf.js ou pdfjs-dist (en cas de difficulté de parsing et d'extraction nous pourrons envisager déleguer le parsing à de l'IA)
- **Database** : PostgreSQL + Prisma
- **TypeScript** : Mode strict obligatoire

### 📱 MOBILE FIRST - PRIORITÉ ABSOLUE

```css
/* Ordre de développement OBLIGATOIRE */
1. Mobile (320px - 640px) : TOUJOURS en premier
2. Tablet (640px - 1024px) : Ensuite si besoin
3. Desktop (>1024px) : En dernier, optionnel
```

### 🚨 RÈGLES DE DÉVELOPPEMENT STRICTES

#### 1. Test-Driven Development (TDD) - NON NÉGOCIABLE

```typescript
// WORKFLOW OBLIGATOIRE
// 1️⃣ RED : Écrire le test qui échoue
describe("parseMenuiserie", () => {
  it("should extract repere from text", () => {
    const text = "Salon : Coulissant 2 vantaux";
    const result = parseMenuiserie(text);
    expect(result.repere).toBe("Salon");
  });
});
// ❌ Erreur attendue : parseMenuiserie is not defined

// 2️⃣ GREEN : Code minimal pour passer le test
function parseMenuiserie(text: string) {
  const [repere, ...rest] = text.split(":");
  return { repere: repere.trim() };
}
// ✅ Test passe

// 3️⃣ REFACTOR : Améliorer si nécessaire
```

**SI TU NE SUIS PAS CE WORKFLOW, JE TE DEMANDERAI DE RECOMMENCER**

#### 2. Structure des fichiers

```
/app
  /api
    /upload
      /pdf
        route.ts         # Upload & parsing
    /projets
      route.ts          # CRUD projets
    /menuiseries
      [id]/
        route.ts        # API menuiserie

  page.tsx              # Homepage (responsive)
  /projet
    /[id]
      page.tsx          # Détail projet (responsive)
  /menuiserie
    /[id]
      page.tsx          # Formulaire côtes (responsive)

/components
  /ui                   # Composants Shadcn
  /forms               # Formulaires réutilisables
  /layout              # Header, Footer, Navigation

/lib
  /pdf                 # Logique parsing PDF
  /validations         # Schemas Zod
  /utils               # Helpers

/hooks                 # Custom hooks
/__tests__             # Tests
```

#### 3. Composants mobile-first

```tsx
// ✅ BON : Mobile d'abord
<div className="
  w-full p-4           // Mobile par défaut
  sm:max-w-lg sm:p-6   // Tablet
  lg:max-w-4xl lg:p-8  // Desktop
">

// ❌ MAUVAIS : Desktop d'abord
<div className="max-w-4xl p-8 mobile:w-full mobile:p-4">
```

#### 4. Inputs adaptés au mobile

```tsx
// TOUJOURS pour les champs numériques
<Input
  type="number"
  inputMode="numeric"  // Clavier numérique mobile
  pattern="[0-9]*"     // iOS compatibility
  className="h-14 text-lg" // Gros pour les doigts
/>

// Select avec grandes options
<SelectItem className="h-12 text-base">
  Option
</SelectItem>
```

#### 5. Gestion des états avec TanStack Query

```tsx
// TOUJOURS utiliser TanStack Query pour les API calls
const { data, isLoading, error } = useQuery({
  queryKey: ["projet", id],
  queryFn: () => fetchProjet(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations avec optimistic updates
const mutation = useMutation({
  mutationFn: updateMenuiserie,
  onMutate: async (newData) => {
    // Optimistic update
    await queryClient.cancelQueries(["menuiserie", id]);
    const previous = queryClient.getQueryData(["menuiserie", id]);
    queryClient.setQueryData(["menuiserie", id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback si erreur
    queryClient.setQueryData(["menuiserie", id], context.previous);
  },
});
```

#### 6. Parsing PDF - Patterns stricts

```typescript
// Extraction avec patterns spécifiques
const PATTERNS = {
  repere: /^([^:]+)\s*:\s*(.+)$/,
  dimensions: /Larg\s*(\d+)\s*mm\s*x\s*Haut\s*(\d+)\s*mm/i,
  gamme: /Gamme\s*(OPTIMAX|PERFORMAX|INNOVAX)/i,
  pose: /Pose\s+en\s+(tunnel|applique|rénovation)/i,
};

// TOUJOURS valider après extraction
const schema = z.object({
  largeur: z.number().min(100).max(10000),
  hauteur: z.number().min(100).max(10000),
  gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]),
});
```

### 📊 MODÈLE DE DONNÉES

```prisma
// FLEXIBLE pour évolutions futures
model Menuiserie {
  donneesOriginales Json  // Données du PDF
  donneesModifiees  Json  // Modifications artisan
  ecarts           Json   // Analyse des différences
}
```

**IMPORTANT** : Utiliser JSON pour flexibilité, mais avec validation Zod stricte

### 🎨 UI/UX Rules

#### Couleurs des alertes

- **Rouge** : Écart > 10% ou erreur critique
- **Orange** : Écart 5-10% ou attention requise
- **Bleu** : Information ou écart < 5%
- **Vert** : Validation ou succès

#### Tailles minimales (mobile)

- Boutons : `min-h-[44px]` (Apple HIG)
- Inputs : `h-14` minimum
- Touch targets : 44x44px minimum
- Padding : `p-4` minimum sur mobile

### ⚡ Performance

#### Images

```tsx
// TOUJOURS optimiser avec Next/Image
import Image from "next/image";

<Image
  src={url}
  alt={alt}
  width={width}
  height={height}
  loading="lazy"
  placeholder="blur"
/>;
```

#### Lazy loading

```tsx
// Pour les listes longues
import { Virtuoso } from "react-virtuoso";

<Virtuoso
  data={menuiseries}
  itemContent={(index, item) => <MenuiserieCard {...item} />}
/>;
```

### 🔒 Sécurité

#### Validation OBLIGATOIRE

```typescript
// TOUJOURS valider côté serveur
export async function POST(request: Request) {
  const body = await request.json();

  // Validation Zod
  const validated = schema.parse(body);

  // Jamais trust le client
  const sanitized = sanitizeInput(validated);

  // Puis traiter...
}
```

### 🚀 Commandes de développement

```bash
# TOUJOURS dans cet ordre
npm run test:watch  # D'abord écrire les tests
npm run dev        # Puis développer
npm run type-check # Vérifier les types
npm run lint       # Vérifier le code
npm run build      # Build final
```

### ❌ INTERDICTIONS FORMELLES

1. **JAMAIS** écrire le code avant le test
2. **JAMAIS** utiliser `any` en TypeScript
3. **JAMAIS** faire du desktop-first
4. **JAMAIS** ignorer les erreurs de validation
5. **JAMAIS** stocker des données sensibles côté client
6. **JAMAIS** faire confiance aux données client

### ✅ TOUJOURS

1. **TOUJOURS** mobile-first
2. **TOUJOURS** TDD (Red-Green-Refactor)
3. **TOUJOURS** valider avec Zod
4. **TOUJOURS** utiliser TanStack Query pour les API
5. **TOUJOURS** optimistic updates pour l'UX
6. **TOUJOURS** tester sur vrai mobile

### 📝 Format de réponse OBLIGATOIRE

Quand je demande une fonctionnalité, réponds TOUJOURS ainsi :

```
## 🔴 TEST (RED)
[Code du test qui échoue]

## 🟢 IMPLÉMENTATION (GREEN)
[Code minimal pour passer le test]

## 🔵 REFACTORING (optionnel)
[Code amélioré si nécessaire]

## 📱 RESPONSIVE
[Vérification mobile-first]
```

### 🎯 Priorités du MVP

1. **Upload PDF** et parsing des données
2. **Formulaire mobile** de prise de côtes
3. **Alertes visuelles** pour les écarts
4. **Sauvegarde** avec modification possible
5. **Navigation** intuitive entre menuiseries

**FOCUS** : Simplicité et utilisabilité sur téléphone de chantier
