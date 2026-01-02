# Feature: Redesign SVG Editor avec Habillages Intégrés

## Contexte

L'éditeur SVG actuel affiche les habillages (Int/Ext) dans une section séparée sous le schéma. Cette approche manque d'intuitivité spatiale. L'objectif est de repositionner les champs directement autour du SVG pour une correspondance visuelle immédiate.

## Objectif UX

- Comprendre visuellement chaque cote sans ambiguïté
- Saisir rapidement : Largeur, Hauteur, Habillages Int/Ext pour chaque côté
- Réduire les erreurs de saisie grâce au positionnement contextuel
- Garder une interface lisible malgré le nombre de champs (10 au total)

## Design Validé

### Layout Desktop/Tablet

```
                      ┌───────────────────┐
                      │  🔵 [Hab Int H ▼] │
                      │  🟠 [Hab Ext H ▼] │
                      └───────────────────┘

┌─────────────┐       ╔═══════════════════╗       ┌───────────────────┐
│  Hauteur    │       ║                   ║       │  🔵 [Hab Int D ▼] │
│  ┌───────┐  │       ║     FENÊTRE       ║       │  🟠 [Hab Ext D ▼] │
│  │ 1200  │  │       ║       SVG         ║       └───────────────────┘
│  └───────┘  │       ║                   ║
│             │       ║    ┌───┬───┐      ║
│  🔵 [Int G] │       ║    │   │   │      ║
│  🟠 [Ext G] │       ║    └───┴───┘      ║
└─────────────┘       ╚═══════════════════╝

              ┌─────────────────────────────────────────────┐
              │  Largeur         │  🔵 [Hab Int B ▼]        │
              │  ┌───────────┐   │  🟠 [Hab Ext B ▼]        │
              │  │   1400    │   └──────────────────────────│
              │  └───────────┘                              │
              │                                             │
              │        [ 🔄 Appliquer à tous ]              │
              └─────────────────────────────────────────────┘
```

### Layout Mobile (< 640px)

Layout vertical empilé :
1. Habillages Haut (Int + Ext)
2. SVG centré
3. Hauteur + Habillages Gauche
4. Habillages Droite
5. Largeur + Habillages Bas
6. Bouton "Appliquer à tous"

## Spécifications Techniques

### Composants Pills/Chips

| Propriété | Hab Intérieur | Hab Extérieur |
|-----------|---------------|---------------|
| Bordure | `border-blue-500` | `border-orange-500` |
| Fond | `bg-blue-50` | `bg-orange-50` |
| Indicateur | Pastille 🔵 ou icône 🏠 | Pastille 🟠 ou icône ☀️ |
| Hauteur min | `min-h-[40px]` | `min-h-[40px]` |
| Texte | `text-sm` | `text-sm` |

### Dimensions

| Champ | Position | Style |
|-------|----------|-------|
| Hauteur | Côté gauche, au-dessus des Hab G | Input classique avec unité "mm" |
| Largeur | Côté bas, à gauche des Hab B | Input classique avec unité "mm" |

### Retrait de l'Allège

- L'allège est **retirée** de l'éditeur SVG
- Elle reste disponible dans le formulaire classique (section "Détails additionnels")

## Comportement de Propagation (Hybride)

### Règle 1 : Auto-propagation sur première sélection

```
État initial : tous les champs Hab Int vides
→ Utilisateur sélectionne "Standard" sur Hab Int Haut
→ AUTOMATIQUEMENT : tous les Hab Int (Bas, Gauche, Droite) passent à "Standard"
→ Animation highlight (ring bleu) sur les 3 autres champs pendant 300ms
```

Idem pour Hab Ext (propagation indépendante).

### Règle 2 : Pas de propagation sur modifications ultérieures

```
État : tous les Hab Int = "Standard"
→ Utilisateur change Hab Int Gauche en "Sans"
→ Seul ce champ change, pas de propagation
```

### Règle 3 : Bouton "Appliquer à tous" explicite

```
Bouton visible en bas de la zone SVG
→ Dropdown ou action : "Appliquer Hab Int à tous" / "Appliquer Hab Ext à tous"
→ Prend la valeur du premier côté non-null et l'applique aux 4 côtés
```

**Alternative simplifiée :** Deux boutons distincts
- "🔵 Appliquer Int à tous"
- "🟠 Appliquer Ext à tous"

## Structure des Fichiers à Modifier

```
src/components/menuiseries/
├── MenuiserieSVGEditor.tsx    # Refonte complète du layout
├── HabillageSelect.tsx        # Déjà OK (style Pills)
├── HabillageSection.tsx       # À supprimer ou adapter
├── HabillageGroup.tsx         # NOUVEAU : groupe Int+Ext empilé
├── ApplyToAllButton.tsx       # NOUVEAU : bouton propagation
└── DimensionInput.tsx         # Déjà OK

src/hooks/
└── useHabillagesPropagation.ts  # Adapter logique hybride
```

## Critères d'Acceptation

### Must Have
- [ ] Habillages positionnés autour du SVG selon le layout défini
- [ ] Distinction visuelle claire Int (bleu) / Ext (orange)
- [ ] Hauteur à gauche, Largeur en bas
- [ ] Allège retirée de l'éditeur SVG
- [ ] Auto-propagation sur première sélection uniquement
- [ ] Bouton "Appliquer à tous" fonctionnel
- [ ] Responsive mobile (layout empilé)
- [ ] Touch-friendly (min 40px de hauteur)

### Should Have
- [ ] Animation highlight lors de la propagation
- [ ] Feedback visuel au survol des Pills

### Nice to Have
- [ ] Survol SVG ↔ highlight du groupe de champs correspondant
- [ ] Tooltips illustrés pour onboarding

## Contraintes Techniques

- Les valeurs d'habillage sont **dynamiques** selon le matériau (PVC/ALU) et le type de pose (NEUF/RENO)
- Utiliser `getHabillageConfig(materiau, pose)` pour obtenir les options
- Garder la compatibilité avec le hook `useHabillagesPropagation` existant

## Références

- Design actuel : `src/components/menuiseries/MenuiserieSVGEditor.tsx`
- Options habillages : `src/lib/validations/habillage.ts`
- Configs par matériau : `docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_*.md`
