/**
 * Configuration dynamique des formulaires de menuiserie
 * Charge les configurations JSON en fonction du type de menuiserie détecté
 */

/**
 * Types de champs supportés dans les formulaires
 */
export type FieldType = "text" | "number" | "select" | "combobox";

/**
 * Configuration d'un champ de formulaire
 */
export interface FieldConfig {
  /** Label affiché pour le champ */
  label: string;
  /** Type de champ (text, number, select, combobox) */
  type: FieldType;
  /** Options disponibles pour les select/combobox */
  options?: string[];
  /** Permet la saisie libre en plus des options (combobox uniquement) */
  allowCustom?: boolean;
  /** Texte de placeholder pour les champs avec saisie libre */
  placeholder?: string;
  /** Unité pour les champs numériques (ex: "mm", "°C") */
  unit?: string;
}

/**
 * Configuration complète d'un formulaire
 * Clés dynamiques correspondant aux noms de champs
 */
export interface FormConfig {
  [fieldKey: string]: FieldConfig;
}

/**
 * Configuration par défaut utilisée en fallback
 * Contient les champs de base présents dans tous les formulaires
 */
const DEFAULT_FORM_CONFIG: FormConfig = {
  gamme: {
    label: "Gamme",
    type: "select",
    options: [
      "OPTIMAX",
      "INNOVAX",
      "PERFORMAX",
      "SOFTLINE",
      "KIETISLINE",
      "WISIO",
    ],
  },
  pack: {
    label: "Pack",
    type: "select",
    options: ["Tradition", "Confort", "Initial", "Optimum"],
  },
  couleurInt: {
    label: "Couleur intérieure",
    type: "combobox",
    options: ["Blanc", "Noir", "Beige", "Gris", "F9"],
    allowCustom: true,
    placeholder: "Ex: RAL 7016",
  },
  couleurExt: {
    label: "Couleur extérieure",
    type: "combobox",
    options: ["Blanc", "Noir", "Beige", "Gris", "F9"],
    allowCustom: true,
    placeholder: "Ex: RAL 7016",
  },
  pose: {
    label: "Type de pose",
    type: "select",
    options: [
      "en feuillure",
      "en applique",
      "en tunnel (tableau)",
      "sous coffre tunnel",
    ],
  },
  epaisseurVitrage: {
    label: "Épaisseur vitrage",
    type: "select",
    options: ["18 mm", "26 mm", "45 mm"],
  },
  hauteurAllege: {
    label: "Hauteur d'allège",
    type: "number",
    unit: "mm",
  },
  hauteurPoignee: {
    label: "Hauteur poignée",
    type: "number",
    unit: "mm",
  },
  commentaires: {
    label: "Commentaires et options",
    type: "text",
  },
};

/**
 * Charge la configuration de formulaire dynamique
 *
 * @param configKey Clé de configuration (ex: "ALU_NEUF_FENETRE", "PVC_RENO_COULISSANT")
 * @returns Configuration du formulaire correspondant ou config par défaut si non trouvée
 *
 * @example
 * ```typescript
 * const config = loadFormConfig("ALU_NEUF_FENETRE");
 * console.log(config.pack.options); // ["Tradition", "Confort", "Initial", ...]
 * ```
 */
export function loadFormConfig(configKey: string): FormConfig {
  if (!configKey || configKey.trim() === "") {
    console.warn(
      "[config-loader] Empty configKey provided, using default config"
    );
    return DEFAULT_FORM_CONFIG;
  }

  try {
    // Import dynamique du fichier JSON de configuration
    const config = require(`./configs/${configKey}.json`) as FormConfig;
    return config;
  } catch (error) {
    console.warn(
      `[config-loader] Failed to load config for "${configKey}", using default config`,
      error
    );
    return DEFAULT_FORM_CONFIG;
  }
}

/**
 * Liste des clés de configuration valides
 * Utilisé pour la validation et l'autocomplétion
 */
export const VALID_CONFIG_KEYS = [
  "ALU_NEUF_FENETRE",
  "ALU_NEUF_PORTE",
  "ALU_NEUF_COULISSANT",
  "ALU_RENO_FENETRE",
  "ALU_RENO_PORTE",
  "ALU_RENO_COULISSANT",
  "PVC_NEUF_FENETRE",
  "PVC_NEUF_PORTE",
  "PVC_NEUF_COULISSANT",
  "PVC_RENO_FENETRE",
  "PVC_RENO_PORTE",
  "PVC_RENO_COULISSANT",
] as const;

/**
 * Type pour les clés de configuration valides
 */
export type ConfigKey = (typeof VALID_CONFIG_KEYS)[number];

/**
 * Vérifie si une clé de configuration est valide
 *
 * @param key Clé à vérifier
 * @returns true si la clé est valide
 */
export function isValidConfigKey(key: string): key is ConfigKey {
  return VALID_CONFIG_KEYS.includes(key as ConfigKey);
}
