/**
 * Générateur de bons de commande Normabaie
 * Convertit les données de menuiseries en bons de commande PDF
 */

import { generatePDFFromHTML } from './pdf-generator';

// Ré-exporter les types et fonctions partagées
export type {
  MenuiserieData,
  ProjetMetadata,
  BonCommandeType,
} from './bon-commande-types';

export {
  getBonCommandeType,
  groupMenuiseriesByType,
} from './bon-commande-types';

import type { MenuiserieData, ProjetMetadata, BonCommandeType } from './bon-commande-types';
import { groupMenuiseriesByType } from './bon-commande-types';

/**
 * Génère un bon de commande PDF pour un groupe de menuiseries (max 3)
 *
 * @param menuiseries - 1 à 3 menuiseries du même type
 * @param projetMetadata - Métadonnées du projet
 * @param type - Type de bon de commande
 * @returns Buffer du PDF généré
 */
export async function generateBonCommande(
  menuiseries: MenuiserieData[],
  projetMetadata: ProjetMetadata,
  type: BonCommandeType
): Promise<Buffer> {
  if (menuiseries.length === 0 || menuiseries.length > 3) {
    throw new Error('Un bon de commande doit contenir 1 à 3 menuiseries');
  }

  // Générer le HTML selon le type
  const html = await generateHTMLForType(type, menuiseries, projetMetadata);

  // Convertir HTML → PDF
  return generatePDFFromHTML({
    html,
    width: '210mm', // A4
    height: '297mm',
    margins: {
      top: '8mm',
      right: '8mm',
      bottom: '8mm',
      left: '8mm',
    },
    printBackground: true,
  });
}

/**
 * Génère le HTML pour un bon de commande selon son type
 */
async function generateHTMLForType(
  type: BonCommandeType,
  menuiseries: MenuiserieData[],
  metadata: ProjetMetadata
): Promise<string> {
  switch (type) {
    case 'ALU_NEUF_FENETRE': {
      const { renderBonCommandeAluNeuf } = await import('./templates/alu-neuf-template');
      return renderBonCommandeAluNeuf(menuiseries, metadata);
    }
    case 'ALU_RENO_FENETRE': {
      const { renderBonCommandeAluReno } = await import('./templates/alu-reno-template');
      return renderBonCommandeAluReno(menuiseries, metadata);
    }
    case 'ALU_PORTE_ENTREE': {
      const { renderBonCommandeAluPorteEntree } = await import('./templates/alu-porte-entree-template');
      return renderBonCommandeAluPorteEntree(menuiseries, metadata);
    }
    case 'PVC_NEUF_FENETRE': {
      const { renderBonCommandePvcNeuf } = await import('./templates/pvc-neuf-template');
      return renderBonCommandePvcNeuf(menuiseries, metadata);
    }
    case 'PVC_RENO_FENETRE': {
      const { renderBonCommandePvcReno } = await import('./templates/pvc-reno-template');
      return renderBonCommandePvcReno(menuiseries, metadata);
    }
    case 'PVC_COULISSANT': {
      const { renderBonCommandePvcCoulissant } = await import('./templates/pvc-coulissant-template');
      return renderBonCommandePvcCoulissant(menuiseries, metadata);
    }
    case 'PVC_RENO_PORTE': {
      const { renderBonCommandePvcRenoPorte } = await import('./templates/pvc-reno-porte-template');
      return renderBonCommandePvcRenoPorte(menuiseries, metadata);
    }
    default:
      throw new Error(`Type de bon de commande non supporté : ${type}`);
  }
}

/**
 * Génère tous les bons de commande pour un projet
 *
 * @param menuiseries - Toutes les menuiseries validées du projet
 * @param projetMetadata - Métadonnées du projet
 * @returns Array de buffers PDF (1 par bon de commande)
 */
export async function generateAllBonsCommande(
  menuiseries: MenuiserieData[],
  projetMetadata: ProjetMetadata
): Promise<Array<{ type: BonCommandeType; pdf: Buffer; menuiserieIds: string[] }>> {
  const grouped = groupMenuiseriesByType(menuiseries);
  const results: Array<{ type: BonCommandeType; pdf: Buffer; menuiserieIds: string[] }> = [];

  for (const [type, chunks] of grouped.entries()) {
    for (const chunk of chunks) {
      const pdf = await generateBonCommande(chunk, projetMetadata, type);
      results.push({
        type,
        pdf,
        menuiserieIds: chunk.map(m => m.id),
      });
    }
  }

  return results;
}
