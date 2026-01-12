/**
 * Structured prompts for AI PDF parsing
 * Using Anthropic Claude Sonnet 4.5
 */

export const EXTRACTION_PROMPT = `Tu es un expert en extraction de données de fiches métreur pour menuiseries.

**VALIDATION PRÉLIMINAIRE** :
Avant toute extraction, vérifie que le document est bien une fiche métreur de menuiseries (bon de commande avec dimensions, gammes, types de menuiseries).
Si le document n'est PAS une fiche métreur (ex: facture générique, catalogue, CV, contrat, etc.), retourne immédiatement :
{
  "menuiseries": [],
  "metadata": {
    "isValidDocument": false,
    "invalidReason": "Le document n'est pas une fiche métreur de menuiseries. Type détecté : [type du document]",
    "confidence": 0,
    "warnings": [],
    "clientInfo": null
  }
}

Si c'est bien une fiche métreur, analyse le PDF et extrais TOUTES les menuiseries présentes.
Pour chaque menuiserie, extrais les données suivantes au format JSON strict :

{
  "menuiseries": [
    {
      "repere": "Salon" | null,
      "intitule": "Coulissant 2 vantaux",
      "largeur": 3000,
      "hauteur": 2250,
      "hauteurAllege": 1000,
      "gamme": "OPTIMAX" | "INNOVAX" | "PERFORMAX" | "SOFTLINE" | "KIETISLINE" | "WISIO",  // ALU: OPTIMAX, INNOVAX, PERFORMAX | PVC: SOFTLINE, KIETISLINE, WISIO
      "couleurInt": "RAL 9016",
      "couleurExt": "RAL 7016",
      "pose": "tunnel" | "applique" | "renovation",
      "dimensions": "clair de bois" | "execution",
      "dormant": "avec aile" | "sans aile",
      "habillageInt": "Plat 30x2",
      "habillageExt": "Cornière 20x20",
      "doubleVitrage": "44.2.16w Argon.4 PTR+",
      "intercalaire": "blanc" | "noir",
      "ouvrantPrincipal": "droite" | "gauche",
      "ouvertureInterieure": "droite tirant" | "gauche tirant" | null,  // Sens d'ouverture vue de l'intérieur (battant, oscillo-battant, porte-fenêtre)
      "fermeture": "Description",
      "poignee": "Description",
      "rails": "inox" | "alu",
      "couleurJoints": "RAL...",
      "couleurQuincaillerie": "Description",
      "couleurPareTempete": "RAL...",
      "petitsBoisType": "Petits-bois collés 2 faces plat de 30mm avec faux intercalaire",
      "petitsBoisConfiguration": "1 petit bois vertical par vitrage",
      "petitsBoisCouleur": "2 faces RAL hors standard : 8001",
      "ventilation": "oui" | "non",
      "soubassement": "sans" | "lisse" | "rainuré",
      "soubassementHauteur": 400
    }
  ],
  "metadata": {
    "isValidDocument": true,
    "invalidReason": null,
    "confidence": 0.95,
    "warnings": ["Dimension hauteur peu lisible pour menuiserie #2"],
    "clientInfo": {
      "nom": "DUPONT",
      "adresse": "15 Rue des Lilas",
      "tel": "06 12 34 56 78",
      "email": "jean.dupont@example.com"
    }
  }
}

**IMPORTANT pour clientInfo.nom** :
- Extrais UNIQUEMENT le NOM DE FAMILLE en MAJUSCULES
- Exemples : "Jean DUPONT" → "DUPONT", "Marie Martin" → "MARTIN", "M. Paul DURAND" → "DURAND"
- Ne jamais inclure le prénom, civilité (M., Mme), ou titre
- Si plusieurs noms de famille (ex: "DUPONT-MARTIN"), conserve-les tous avec le tiret

RÈGLES STRICTES:
1. **VALIDATION** : Le champ "isValidDocument" DOIT toujours être présent (true si fiche métreur, false sinon)
2. Toutes les dimensions DOIVENT être des nombres en millimètres (pas de string)
3. Si une valeur est illisible ou absente, utilise null et ajoute un warning dans metadata.warnings
4. Normalise les gammes en MAJUSCULES. Gammes supportées :
   - ALU (Aluminium) : OPTIMAX, INNOVAX, PERFORMAX
   - PVC : SOFTLINE, KIETISLINE, WISIO
   Si une gamme inconnue est détectée, extrais-la telle quelle et ajoute un warning
5. Normalise les poses en minuscules (tunnel, applique, renovation)
6. Extrais TOUTES les menuiseries du document, même partiellement remplies
7. Conserve les descriptions exactes pour couleurs et options
8. Le score de confiance doit refléter la qualité globale de l'extraction (0-1)
9. **IMPORTANT REPÈRE** : Si l'intitulé contient deux points ":" (ex: "Variante coulissant : Coulissant 2 vantaux"), NE MODIFIE PAS l'intitulé, conserve-le tel quel. Le backend se chargera d'extraire le repère.
10. Si le repère est explicitement mentionné séparément du titre, extrais-le dans le champ "repere", sinon utilise null
11. Pour les champs optionnels absents, utilise null (ne les omets pas)
12. **SOUBASSEMENT** : Extrais le type de soubassement et sa hauteur.
    - Si "Soubassement lisse (haut XXX)" → soubassement: "lisse", soubassementHauteur: XXX
    - Si "Soubassement rainuré (haut XXX)" → soubassement: "rainuré", soubassementHauteur: XXX
    - Si aucun soubassement mentionné → soubassement: "sans", soubassementHauteur: null
13. **VENTILATION** : Indique si une ventilation est présente.
    - Si une entrée d'air ou ventilation est mentionnée → ventilation: "oui"
    - Si aucune ventilation n'est mentionnée → ventilation: "non"

Réponds UNIQUEMENT avec le JSON, sans texte additionnel avant ou après.`;
