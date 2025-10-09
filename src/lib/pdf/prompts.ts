/**
 * Structured prompts for AI PDF parsing
 * Using Anthropic Claude Sonnet 4.5
 */

export const EXTRACTION_PROMPT = `Tu es un expert en extraction de données de fiches métreur pour menuiseries.

Analyse ce PDF et extrais TOUTES les menuiseries présentes.
Pour chaque menuiserie, extrais les données suivantes au format JSON strict :

IMPORTANT : Chaque menuiserie dans le PDF a une image/schéma associé (vue technique de la fenêtre/porte).
Tu DOIS extraire cette image et la fournir en base64 dans le champ "imageBase64".

{
  "menuiseries": [
    {
      "repere": "Salon" | null,
      "intitule": "Coulissant 2 vantaux",
      "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
      "largeur": 3000,
      "hauteur": 2250,
      "hauteurAllege": 1000,
      "gamme": "OPTIMAX" | "PERFORMAX" | "INNOVAX",
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
      "fermeture": "Description",
      "poignee": "Description",
      "rails": "inox" | "alu",
      "couleurJoints": "RAL...",
      "couleurQuincaillerie": "Description",
      "couleurPareTempete": "RAL...",
      "petitsBoisType": "Petits-bois collés 2 faces plat de 30mm avec faux intercalaire",
      "petitsBoisConfiguration": "1 petit bois vertical par vitrage",
      "petitsBoisCouleur": "2 faces RAL hors standard : 8001",
      "ventilation": "Description ou vide"
    }
  ],
  "metadata": {
    "confidence": 0.95,
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
1. Toutes les dimensions DOIVENT être des nombres en millimètres (pas de string)
2. Si une valeur est illisible ou absente, utilise null et ajoute un warning dans metadata.warnings
3. Normalise les gammes en MAJUSCULES (OPTIMAX, PERFORMAX, INNOVAX)
4. Normalise les poses en minuscules (tunnel, applique, renovation)
5. Extrais TOUTES les menuiseries du document, même partiellement remplies
6. Conserve les descriptions exactes pour couleurs et options
7. Le score de confiance doit refléter la qualité globale de l'extraction (0-1)
8. **IMPORTANT REPÈRE** : Si l'intitulé contient deux points ":" (ex: "Variante coulissant : Coulissant 2 vantaux"), NE MODIFIE PAS l'intitulé, conserve-le tel quel. Le backend se chargera d'extraire le repère.
9. Si le repère est explicitement mentionné séparément du titre, extrais-le dans le champ "repere", sinon utilise null
10. Pour les champs optionnels absents, utilise null (ne les omets pas)
11. **EXTRACTION D'IMAGES** : Pour chaque menuiserie, extrais l'image/schéma technique associé et fournis-le en base64 avec le préfixe data URI complet (ex: "data:image/png;base64,...")

Réponds UNIQUEMENT avec le JSON, sans texte additionnel avant ou après.`;
