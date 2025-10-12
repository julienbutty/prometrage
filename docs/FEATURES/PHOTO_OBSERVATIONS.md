# Photos d'observation - Documentation complète

## 📸 Vue d'ensemble

Fonctionnalité permettant d'ajouter jusqu'à 3 photos dans la section "Observations" lors d'un entretien technique sur chantier. Les photos sont compressées automatiquement côté client et stockées en base64 dans la base de données PostgreSQL.

## ✅ Fonctionnalités implémentées

### 🎯 Support multi-plateforme
- **Desktop** : Sélection de fichiers via explorateur
- **Mobile/Tablette** : Choix entre caméra ET galerie
- **Compression automatique** : Réduction de ~80-90% de la taille originale

### 🔒 Contraintes de sécurité
- Maximum 3 photos par menuiserie
- Taille max 1MB par photo (après compression)
- Formats acceptés : JPEG, JPG, PNG, WebP
- Validation Zod côté client ET serveur

### 🎨 Interface utilisateur
- Grid responsive (2 cols mobile, 3-4 desktop)
- Preview des photos avec miniatures
- Suppression individuelle au hover
- Badge de compteur de photos
- Alerte si limite atteinte
- **Lightbox pour agrandir les photos au clic** ✨
  - Affichage plein écran responsive
  - Navigation entre photos (flèches gauche/droite)
  - Compteur de position (1/3, 2/3...)
  - Affichage date et taille en footer
  - Bouton fermer avec Dialog shadcn/ui
  - Keyboard navigation supportée

## 🏗️ Architecture technique

### 1. Validation (Zod)

**Fichier** : [src/lib/validations/photo-observation.ts](../../src/lib/validations/photo-observation.ts)

```typescript
// Constantes
MAX_SIZE_MB: 1              // 1MB max après compression
MAX_PHOTOS: 3               // Maximum 3 photos
MAX_DIMENSION: 1200         // 1200px largeur max
COMPRESSION_QUALITY: 0.8    // 80% qualité
ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Schema d'une photo
PhotoObservationSchema {
  id: string (UUID)
  base64: string (data URL)
  nom: string (filename)
  taille: number (bytes)
  dateAjout: string (ISO datetime)
  compressed: boolean
}

// Schema pour tableau de photos
PhotosObservationsSchema: array max 3 photos
```

**Tests** : 26 tests ✅ - [src/__tests__/unit/validations/photo-observation.test.ts](../../src/__tests__/unit/validations/photo-observation.test.ts)

### 2. Composant PhotoUpload

**Fichier** : [src/components/forms/PhotoUpload.tsx](../../src/components/forms/PhotoUpload.tsx)

**Props** :
```typescript
interface PhotoUploadProps {
  photos: PhotoObservation[];
  onChange: (photos: PhotoObservation[]) => void;
  maxPhotos?: number; // Default: 3
}
```

**Fonctionnalités** :
- Upload avec input file (accept="image/*")
- Compression via `browser-image-compression`
- Conversion en base64
- Validation taille/format
- Preview avec grid responsive
- Suppression avec confirmation visuelle
- Toast notifications (succès/erreur)
- **Lightbox au clic sur photo** ✨
  - Navigation avec boutons Précédent/Suivant
  - Keyboard shortcuts (Esc pour fermer)
  - Footer avec infos détaillées

**Compression** :
```typescript
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  initialQuality: 0.8,
};
const compressedFile = await imageCompression(file, options);
```

**Tests** :
- Upload & Preview : 11 tests ✅ - [src/components/forms/__tests__/PhotoUpload.test.tsx](../../src/components/forms/__tests__/PhotoUpload.test.tsx)
- Lightbox : 9 tests ✅ - [src/components/forms/__tests__/PhotoLightbox.test.tsx](../../src/components/forms/__tests__/PhotoLightbox.test.tsx)

### 3. Intégration formulaire

**Fichier** : [src/app/menuiserie/[id]/page.tsx](../../src/app/menuiserie/[id]/page.tsx:168)

**State management** :
```typescript
const [photosObservations, setPhotosObservations] = useState<PhotoObservation[]>([]);

// Chargement depuis donneesModifiees
if (modified?.photosObservations) {
  setPhotosObservations(modified.photosObservations);
}

// Sauvegarde
const donneesModifiees = {
  ...formData,
  observations,
  photosObservations: photosObservations.length > 0 ? photosObservations : undefined,
};
```

### 4. API et validation serveur

**Fichier** : [src/app/api/menuiseries/[id]/route.ts](../../src/app/api/menuiseries/[id]/route.ts:139-156)

**Validation** :
```typescript
// Après validation du schema principal
if (validated.donneesModifiees.photosObservations) {
  try {
    PhotosObservationsSchema.parse(validated.donneesModifiees.photosObservations);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid photos format",
        details: error.issues,
      },
    }, { status: 400 });
  }
}
```

**Stockage** :
Les photos sont stockées dans le champ JSON `donneesModifiees` :
```json
{
  "observations": "Problème constaté...",
  "photosObservations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "base64": "data:image/jpeg;base64,/9j/4AAQ...",
      "nom": "photo_chantier_1.jpg",
      "taille": 245678,
      "dateAjout": "2025-01-10T14:30:00.000Z",
      "compressed": true
    }
  ]
}
```

## 📱 Responsive Design

### Mobile (< 640px)
- Input file affiche **caméra + galerie** automatiquement
- Grid 2 colonnes pour miniatures
- Bouton upload pleine largeur (`flex-1`)
- Thumbnails taille `aspect-square`
- Info photo en overlay avec texte xs
- **Lightbox** : plein écran (95vh), boutons navigation adaptés tactile

### Tablet (640px - 1024px)
- Grid 3 colonnes
- Mêmes comportements que mobile

### Desktop (> 1024px)
- Grid 4 colonnes
- Meilleure lisibilité des infos
- Hover effects sur delete
- **Lightbox** : max 5xl, navigation avec flèches clavier

## 🔄 Flux utilisateur

1. **Ouvrir section Observations** (collapsed par défaut)
2. **Cliquer "Ajouter photo"**
   - Desktop → Explorateur fichiers
   - Mobile → Choix caméra/galerie
3. **Sélectionner image**
4. **Compression automatique** (toast "Compression...")
5. **Validation** (taille, format)
6. **Ajout à la liste** avec preview
7. **Clic sur une photo** → Ouvre lightbox plein écran ✨
   - Navigation entre photos avec flèches
   - Voir détails (date, taille)
   - Fermer avec X ou Esc
8. **Possibilité suppression** (hover → bouton X)
9. **Sauvegarde** avec le reste du formulaire

## 🧪 Tests

### Tests unitaires
- **Validation Zod** : 26 tests ✅
  - Formats valides/invalides
  - Tailles max
  - Nombre max photos
  - Helpers (calculateBase64Size, isAllowedImageType)

- **Composant PhotoUpload** : 11 tests ✅
  - Rendu bouton
  - Compteur photos
  - Limite max (disable)
  - Preview thumbnails
  - Suppression
  - Affichage taille
  - Attributs mobile

- **Lightbox** : 9 tests ✅ ✨
  - Ouverture au clic sur photo
  - Affichage plein écran
  - Nom de la photo
  - Fermeture avec bouton
  - Navigation suivant/précédent
  - Compteur de position
  - Disable boutons aux extrémités

### Lancer les tests
```bash
npm test -- photo --run
```

## 💾 Stockage et performance

### Taille estimée
- **Photo originale** : 2-8 MB
- **Après compression** : 200-500 KB
- **En base64** : +33% = ~250-650 KB
- **3 photos max** : ~750KB - 2MB par menuiserie

### Optimisations
✅ Compression côté client (économise bande passante)
✅ Conversion base64 après compression
✅ Validation taille stricte (max 1MB)
✅ Web Worker pour compression (non-bloquant)
✅ Stockage JSON flexible (pas de migration)

### Limites PostgreSQL
- Champ `donneesModifiees` : JSON (illimité théoriquement)
- En pratique : limité à ~1GB mais recommandé < 10MB
- Notre limite (3 photos × 1MB) : ~3MB max ✅ Acceptable

## 🚀 Améliorations futures

### Phase 6 (optionnel)
- [ ] Lightbox pour agrandir les photos
- [ ] Rotation d'image
- [ ] Crop avant upload
- [ ] Annotations sur photos (dessin, flèches)
- [ ] Export PDF avec photos intégrées
- [ ] Cloud storage (S3, Cloudinary) au lieu de base64
- [ ] Lazy loading des photos
- [ ] PWA : Upload offline avec sync

### Migration vers cloud storage
Si le nombre de photos augmente significativement, envisager :

```typescript
// Au lieu de base64
photosObservations: [
  {
    id: "uuid",
    url: "https://cdn.example.com/photos/abc123.jpg",
    thumbnail: "https://cdn.example.com/photos/abc123_thumb.jpg",
    nom: "photo.jpg",
    taille: 245678,
  }
]
```

**Avantages** :
- Réduction taille BDD
- CDN pour performance
- Moins de charge serveur
- Backup séparé

**Inconvénients** :
- Complexité accrue
- Coûts cloud
- Dépendance externe
- Latence réseau

## 📚 Dépendances

```json
{
  "browser-image-compression": "^2.0.2"
}
```

**Documentation** : https://www.npmjs.com/package/browser-image-compression

## 🎓 Références

- [MDN: HTML input file](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
- [MDN: capture attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
- [PostgreSQL JSON types](https://www.postgresql.org/docs/current/datatype-json.html)
- [Base64 encoding explained](https://en.wikipedia.org/wiki/Base64)
- [Image compression best practices](https://web.dev/fast/#optimize-your-images)

## ✨ Contributeurs

Implémenté en suivant strictement la méthodologie TDD (Test-Driven Development).

**Date** : Janvier 2025
**Version** : 1.0.0
