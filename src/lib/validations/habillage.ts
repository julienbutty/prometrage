/**
 * Validation Zod pour les habillages de menuiseries
 * Les valeurs dépendent du matériau (PVC vs ALU) et du type de pose (NEUF vs RENO)
 * @see specs/003-habillages-svg-integration/data-model.md
 * @see docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_*.md
 */
import { z } from 'zod';

/**
 * Type pour une option d'habillage
 */
export interface HabillageOption {
  value: string;
  label: string;
}

/**
 * Configuration des habillages par matériau et type
 */
export interface HabillageConfig {
  interieurs: HabillageOption[];
  exterieurs: HabillageOption[];
}

/**
 * Valeurs d'habillage pour PVC (Neuf et Rénovation)
 * Source: docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_PVC_FORM_NEUF.md
 */
export const HABILLAGES_PVC: HabillageConfig = {
  interieurs: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Sans', label: 'Sans habillage' },
    { value: 'Haut', label: 'Haut uniquement' },
    { value: 'Bas', label: 'Bas uniquement' },
    { value: 'Montants', label: 'Montants (G+D)' },
  ],
  exterieurs: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Sans', label: 'Sans habillage' },
    { value: 'Haut', label: 'Haut uniquement' },
    { value: 'Bas', label: 'Bas uniquement' },
    { value: 'Montants', label: 'Montants (G+D)' },
  ],
};

/**
 * Valeurs d'habillage pour ALU Neuf
 * Source: docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_ALU_FORM_NEUF.md
 */
export const HABILLAGES_ALU_NEUF: HabillageConfig = {
  interieurs: [
    { value: 'Couvre-joint 25mm', label: 'Couvre-joint 25mm' },
    { value: 'Couvre-joint 45mm', label: 'Couvre-joint 45mm' },
    { value: 'Couvre-joint 65mm', label: 'Couvre-joint 65mm' },
    { value: 'Couvre-joint 80mm', label: 'Couvre-joint 80mm' },
    { value: '25mm déport 15mm', label: '25mm déport 15mm' },
    { value: '49mm déport 15mm', label: '49mm déport 15mm' },
    { value: 'A clipper 4 côtés', label: 'A clipper 4 côtés' },
    { value: 'A clipper 3 côtés', label: 'A clipper 3 côtés' },
  ],
  exterieurs: [
    { value: 'Bavette 40mm', label: 'Bavette 40mm' },
    { value: 'Appui 80mm', label: 'Appui 80mm' },
    { value: 'Haut', label: 'Haut' },
    { value: 'Bas', label: 'Bas' },
    { value: 'Montants', label: 'Montants' },
  ],
};

/**
 * Valeurs d'habillage pour ALU Rénovation
 * Source: docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_ALU_FORM_RENO.md
 */
export const HABILLAGES_ALU_RENO: HabillageConfig = {
  interieurs: [
    { value: 'A clipper 4 côtés', label: 'A clipper 4 côtés' },
    { value: 'A clipper 3 côtés', label: 'A clipper 3 côtés' },
    { value: 'Haut', label: 'Haut' },
    { value: 'Bas', label: 'Bas' },
    { value: 'Gauche', label: 'Gauche' },
    { value: 'Droite', label: 'Droite' },
  ],
  exterieurs: [
    { value: 'Standard', label: 'Standard' },
    { value: 'Sans', label: 'Sans habillage' },
    { value: 'Haut', label: 'Haut' },
    { value: 'Bas', label: 'Bas' },
    { value: 'Montants', label: 'Montants' },
  ],
};

/**
 * Récupère la configuration des habillages selon le matériau et le type de pose
 * @param materiau "ALU" ou "PVC"
 * @param pose "NEUF" ou "RENO"
 */
export function getHabillageConfig(materiau: string, pose: string): HabillageConfig {
  if (materiau === 'ALU') {
    return pose === 'RENO' ? HABILLAGES_ALU_RENO : HABILLAGES_ALU_NEUF;
  }
  return HABILLAGES_PVC;
}

/**
 * Type pour une valeur d'habillage (string libre pour supporter toutes les configs)
 */
export type HabillageValue = string;

/**
 * Identifiants des 4 côtés
 */
export type Side = 'haut' | 'bas' | 'gauche' | 'droite';

export const SIDES: Side[] = ['haut', 'bas', 'gauche', 'droite'];

/**
 * Labels pour les côtés
 */
export const SIDE_LABELS: Record<Side, string> = {
  haut: 'Haut',
  bas: 'Bas',
  gauche: 'Gauche',
  droite: 'Droite',
};

/**
 * Schema pour les 4 côtés d'habillage (strings libres)
 */
export const habillagesSideSchema = z.object({
  haut: z.string().nullable(),
  bas: z.string().nullable(),
  gauche: z.string().nullable(),
  droite: z.string().nullable(),
});

export type HabillagesSideData = z.infer<typeof habillagesSideSchema>;

/**
 * Schema pour la validation des données modifiées (API PUT)
 */
export const donneesModifieesHabillagesSchema = z.object({
  habillageInt: habillagesSideSchema.optional(),
  habillageExt: habillagesSideSchema.optional(),
});

/**
 * Valeurs initiales vides pour les 4 côtés
 */
export const EMPTY_HABILLAGES: HabillagesSideData = {
  haut: null,
  bas: null,
  gauche: null,
  droite: null,
};

// Exports de compatibilité pour les anciens composants
// @deprecated Utiliser getHabillageConfig à la place
export const HABILLAGE_VALUES = HABILLAGES_PVC.interieurs.map(o => o.value);
export const HABILLAGE_LABELS: Record<string, string> = Object.fromEntries(
  HABILLAGES_PVC.interieurs.map(o => [o.value, o.label])
);
