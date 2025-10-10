# Aide contextuelle pour le champ "Dormant"

## Fonctionnalité

Une icône d'aide (point d'interrogation) s'affiche à côté du champ "Dormant" dans le formulaire de prise de côtes.

### Comportement

- **Si le type de pose contient "tunnel"** : Affiche le PDF `/public/docs/dormant-tunnel.pdf`
- **Sinon** : Affiche le PDF `/public/docs/dormant-applique.pdf`

### Interface utilisateur

1. Icône ronde avec un point d'interrogation (🔵 ?)
2. Au clic : Ouverture d'un dialog modal avec le PDF correspondant
3. Le PDF est affiché dans un iframe responsive
4. Bouton de fermeture disponible

## Implémentation technique

### Composants créés

#### HelpIcon
- **Fichier** : [src/components/forms/HelpIcon.tsx](../../src/components/forms/HelpIcon.tsx)
- **Props** :
  - `pdfUrl: string` - URL du PDF à afficher
  - `className?: string` - Classes CSS optionnelles
- **Comportement** :
  - Bouton ghost avec icône `HelpCircle` de lucide-react
  - Dialog shadcn/ui pour afficher le PDF
  - iframe pour le rendu du PDF

### Modifications apportées

#### TextFieldWithDiff
- **Fichier** : [src/components/forms/TextFieldWithDiff.tsx](../../src/components/forms/TextFieldWithDiff.tsx:14)
- **Ajout** : Prop optionnelle `helpIcon?: React.ReactNode`
- **Rendu** : L'icône d'aide s'affiche à côté du label

#### Formulaire de prise de côtes
- **Fichier** : [src/app/menuiserie/[id]/page.tsx](../../src/app/menuiserie/[id]/page.tsx:504-523)
- **Logique** :
```typescript
const isDormantField = key === "dormant";
const typePose = formData.pose || menuiserie.donneesOriginales.pose;
const dormantHelpPdf = typePose?.toLowerCase().includes("tunnel")
  ? "/docs/dormant-tunnel.pdf"
  : "/docs/dormant-applique.pdf";

<TextFieldWithDiff
  // ... autres props
  helpIcon={
    isDormantField ? <HelpIcon pdfUrl={dormantHelpPdf} /> : undefined
  }
/>
```

## Tests

### Tests unitaires
- **HelpIcon** : [src/components/forms/__tests__/HelpIcon.test.tsx](../../src/components/forms/__tests__/HelpIcon.test.tsx)
  - ✅ Rendu du bouton d'aide
  - ✅ Ouverture du dialog
  - ✅ Affichage du PDF dans l'iframe
  - ✅ Fermeture du dialog
  - ✅ Support className personnalisé

- **TextFieldWithDiff avec helpIcon** : [src/components/forms/__tests__/TextFieldWithHelpIcon.test.tsx](../../src/components/forms/__tests__/TextFieldWithHelpIcon.test.tsx)
  - ✅ Rendu de l'icône quand fournie
  - ✅ Pas d'icône si non fournie
  - ✅ Action au clic

### Tests d'intégration
- **DormantHelpIcon** : [src/components/forms/__tests__/DormantHelpIcon.integration.test.tsx](../../src/components/forms/__tests__/DormantHelpIcon.integration.test.tsx)
  - ✅ PDF tunnel si pose "tunnel"
  - ✅ PDF applique si pose "applique"
  - ✅ PDF applique par défaut si pose undefined

## 📱 Responsive

Le composant est entièrement responsive :

### Mobile (320px - 640px)
- Icône 20x20px (h-5 w-5)
- Bouton 32x32px (h-8 w-8)
- Dialog en plein écran (max-w-4xl h-[90vh])
- Touch target respectant les 44x44px minimum

### Tablet et Desktop
- Même comportement
- Dialog plus centré
- Meilleure lisibilité du PDF

## Évolutions possibles

1. **Tooltip au survol** : Afficher un message d'aide avant le clic
2. **Preview PDF** : Miniature avant ouverture complète
3. **Navigation** : Si plusieurs pages dans le PDF
4. **Téléchargement** : Bouton pour télécharger le PDF
5. **Généralisation** : Étendre à d'autres champs (vitrage, fermeture, etc.)

## Ressources

- PDFs : [public/docs/dormant-tunnel.pdf](../../public/docs/dormant-tunnel.pdf)
- PDFs : [public/docs/dormant-applique.pdf](../../public/docs/dormant-applique.pdf)
