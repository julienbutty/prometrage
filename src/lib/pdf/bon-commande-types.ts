/**
 * Types et utilitaires pour les bons de commande
 * Fichier partagé entre client et serveur (pas de dépendances Node.js)
 */

import { getFormConfigKey } from '../utils/menuiserie-type';

export interface MenuiserieData {
  id: string;
  repere: string | null;
  intitule: string;
  donneesOriginales: Record<string, unknown>;
  donneesModifiees: Record<string, unknown> | null;
  validee: boolean;
}

export interface ProjetMetadata {
  reference: string;
  adresse: string | null;
  clientNom: string;
  date?: string; // Format: "JJ/MM/AAAA"
  semaine?: string;
  delai?: string;
}

export type BonCommandeType =
  | 'ALU_NEUF_FENETRE'
  | 'ALU_RENO_FENETRE'
  | 'ALU_PORTE_ENTREE'
  | 'PVC_NEUF_FENETRE'
  | 'PVC_RENO_FENETRE'
  | 'PVC_COULISSANT'
  | 'PVC_RENO_PORTE';

/**
 * Détermine le type de bon de commande selon les données menuiserie
 */
export function getBonCommandeType(menuiserie: MenuiserieData): BonCommandeType {
  const data = menuiserie.donneesModifiees || menuiserie.donneesOriginales;
  const configKey = getFormConfigKey(data);

  // Mapping config → type bon de commande
  const typeMapping: Record<string, BonCommandeType> = {
    ALU_NEUF_FENETRE: 'ALU_NEUF_FENETRE',
    ALU_NEUF_COULISSANT: 'ALU_NEUF_FENETRE', // Même template
    ALU_RENO_FENETRE: 'ALU_RENO_FENETRE',
    ALU_RENO_COULISSANT: 'ALU_RENO_FENETRE', // Même template
    ALU_PORTE_ENTREE: 'ALU_PORTE_ENTREE',
    PVC_NEUF_FENETRE: 'PVC_NEUF_FENETRE',
    PVC_NEUF_COULISSANT: 'PVC_NEUF_FENETRE', // Même template
    PVC_RENO_FENETRE: 'PVC_RENO_FENETRE',
    PVC_RENO_COULISSANT: 'PVC_RENO_FENETRE', // Même template
    PVC_COULISSANT_WISIO: 'PVC_COULISSANT',
    PVC_RENO_PORTE: 'PVC_RENO_PORTE',
  };

  return typeMapping[configKey] || 'ALU_NEUF_FENETRE'; // Fallback
}

/**
 * Regroupe les menuiseries par type de bon de commande
 * Retourne des groupes de maximum 3 menuiseries (1 bon = 3 blocs)
 */
export function groupMenuiseriesByType(
  menuiseries: MenuiserieData[]
): Map<BonCommandeType, MenuiserieData[][]> {
  const groups = new Map<BonCommandeType, MenuiserieData[][]>();

  // Grouper par type
  const byType = new Map<BonCommandeType, MenuiserieData[]>();
  for (const menuiserie of menuiseries) {
    const type = getBonCommandeType(menuiserie);
    if (!byType.has(type)) {
      byType.set(type, []);
    }
    byType.get(type)!.push(menuiserie);
  }

  // Découper en groupes de 3
  for (const [type, items] of byType.entries()) {
    const chunks: MenuiserieData[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      chunks.push(items.slice(i, i + 3));
    }
    groups.set(type, chunks);
  }

  return groups;
}
