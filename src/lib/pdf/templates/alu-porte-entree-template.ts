/**
 * Template HTML pour bon de commande ALU PORTE D'ENTRÉE
 * Version MVP simplifiée (non pixel-perfect)
 */

import type { MenuiserieData, ProjetMetadata } from '../bon-commande-generator';

function getData(menuiserie: MenuiserieData): Record<string, unknown> {
  return menuiserie.donneesModifiees || menuiserie.donneesOriginales;
}

function checkbox(checked: boolean): string {
  return checked ? '☑' : '☐';
}

function renderMenuiserieBloc(menuiserie: MenuiserieData, index: number): string {
  const data = getData(menuiserie);
  const repere = menuiserie.repere || `M${index + 1}`;

  return `
    <div class="menuiserie-bloc">
      <div class="bloc-header">
        <div class="field-group">
          <span class="label">REP.</span>
          <span class="value">${repere}</span>
        </div>
        <div class="field-group">
          <span class="label">QTE.</span>
          <span class="value">1</span>
        </div>
      </div>

      <div class="section">
        <h3>TYPE DE PORTE</h3>
        <div class="field-row">
          <span>${checkbox(data.typeProduit === 'PE1 INT')} PE1 INT</span>
          <span>${checkbox(data.typeProduit === 'PE1 EXT')} PE1 EXT</span>
          <span>${checkbox(data.typeProduit === 'PE2 INT')} PE2 INT</span>
          <span>${checkbox(data.typeProduit === 'PE2 EXT')} PE2 EXT</span>
        </div>
      </div>

      <div class="section">
        <h3>DIMENSIONS</h3>
        <div class="dimensions">
          <div class="field-group">
            <span class="label">LARGEUR mm</span>
            <span class="value large">${data.largeur || ''}</span>
          </div>
          <div class="field-group">
            <span class="label">HAUTEUR mm</span>
            <span class="value large">${data.hauteur || ''}</span>
          </div>
        </div>
        <div class="field-row">
          <span>${checkbox(data.dimensions === 'exécution')} Exécution</span>
          <span>${checkbox(data.dimensions === 'clair de bois')} Clair de bois</span>
          <span>${checkbox(data.dimensions === 'tableau fini')} Tableau Fini</span>
        </div>
      </div>

      <div class="section">
        <h3>DORMANT</h3>
        <div class="field-group">
          <span class="label">Type:</span>
          <span class="value">${data.dormant || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Reprise doublage:</span>
          <span class="value">${data.repriseDoublage || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>POSE</h3>
        <div class="field-row">
          <span>${checkbox(data.pose === 'seuil PMR')} Seuil PMR</span>
          <span>${checkbox(data.pose === 'sans seuil')} Sans Seuil</span>
          <span>${checkbox(data.pose === 'rénovation')} En rénovation</span>
        </div>
      </div>

      <div class="section">
        <h3>PANNEAU DÉCORATIF</h3>
        <div class="field-group">
          <span class="label">Référence:</span>
          <span class="value">${data.panneauRef || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Type:</span>
          <span class="value">${data.typePanneau || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Épaisseur:</span>
          <span>${checkbox(data.epaisseurPanneau === '32 MM')} 32 MM</span>
          <span>${checkbox(data.epaisseurPanneau === '36 MM')} 36 MM</span>
        </div>
      </div>

      <div class="section">
        <h3>VITRAGE</h3>
        <div class="field-row">
          <span class="label">Double vitrage:</span>
          <span class="value small">${data.doubleVitrage || ''}</span>
        </div>
        <div class="field-row">
          <span>Intercalaire: ${checkbox(data.intercalaire === 'blanc')} blanc ${checkbox(data.intercalaire === 'noir')} noir</span>
        </div>
      </div>

      <div class="section">
        <h3>QUINCAILLERIE</h3>
        <div class="field-row">
          <span>${checkbox(data.serrure === 'T3')} Serrure 3 points T3</span>
          <span>${checkbox(data.serrure === 'T11')} Serrure 3 points T11</span>
        </div>
        <div class="field-group">
          <span class="label">Poignée/Barre:</span>
          <span class="value">${data.poignee || ''}</span>
        </div>
      </div>

      ${data.commentaires ? `
      <div class="section">
        <h3>COMMENTAIRES</h3>
        <p class="comments">${data.commentaires}</p>
      </div>
      ` : ''}
    </div>
  `;
}

export function renderBonCommandeAluPorteEntree(
  menuiseries: MenuiserieData[],
  metadata: ProjetMetadata
): string {
  const date = metadata.date || new Date().toLocaleDateString('fr-FR');
  const firstData = getData(menuiseries[0]);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bon de Commande - ${metadata.reference}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; color: #000; }
    .page { width: 210mm; padding: 8mm; }
    .header { border: 2px solid #000; padding: 8px; margin-bottom: 10px; }
    .header-top { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #000; }
    .company-info { flex: 1; }
    .company-info h1 { font-size: 16pt; font-weight: bold; margin-bottom: 4px; }
    .company-info p { font-size: 9pt; margin: 2px 0; }
    .order-info { text-align: right; }
    .order-info h2 { font-size: 14pt; font-weight: bold; margin-bottom: 8px; }
    .order-field { margin: 4px 0; font-size: 10pt; }
    .order-field label { font-weight: bold; margin-right: 4px; }
    .color-section { background: #f0f0f0; padding: 8px; margin-bottom: 10px; border: 1px solid #999; }
    .color-section h3 { font-size: 11pt; font-weight: bold; margin-bottom: 6px; }
    .field-row { display: flex; gap: 15px; margin: 4px 0; flex-wrap: wrap; }
    .field-group { display: inline-flex; align-items: center; gap: 4px; }
    .label { font-weight: bold; font-size: 9pt; }
    .value { border-bottom: 1px solid #000; min-width: 60px; padding: 0 4px; }
    .value.large { min-width: 100px; font-size: 11pt; font-weight: bold; }
    .menuiserie-bloc { border: 2px solid #000; padding: 8px; margin-bottom: 15px; page-break-inside: avoid; }
    .bloc-header { display: flex; justify-content: space-between; padding: 6px; margin-bottom: 8px; border-bottom: 2px solid #000; background: #f5f5f5; }
    .section { margin: 8px 0; padding: 6px 0; border-bottom: 1px solid #ddd; }
    .section:last-child { border-bottom: none; }
    .section h3 { font-size: 10pt; font-weight: bold; margin-bottom: 4px; text-decoration: underline; }
    .dimensions { display: flex; gap: 30px; margin: 6px 0; }
    .comments { font-size: 9pt; font-style: italic; margin-top: 4px; }
    .footer { margin-top: 15px; font-size: 8pt; color: #666; border-top: 1px solid #999; padding-top: 8px; }
    .footer p { margin: 3px 0; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="company-info">
          <h1>NORMABAIE</h1>
          <p>Z.A. du moulin à vent</p>
          <p>27210 BOULLEVILLE</p>
          <p>Tel : 02.32.20.24.70</p>
          <p>Email : commandes@normabaie.fr</p>
        </div>
        <div class="order-info">
          <h2>BON DE COMMANDE</h2>
          <h3>ALUMINIUM - PORTE D'ENTRÉE</h3>
          <div class="order-field"><label>Date :</label><span>${date}</span></div>
          <div class="order-field"><label>Référence :</label><span>${metadata.reference}</span></div>
          ${metadata.semaine ? `<div class="order-field"><label>Sem :</label><span>${metadata.semaine}</span></div>` : ''}
        </div>
      </div>

      <div class="color-section">
        <h3>COULEUR</h3>
        <div class="field-row">
          <span class="label">Gamme:</span>
          <span class="value">${firstData.gamme || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Pack:</span>
          <span class="value">${firstData.pack || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Couleur quincaillerie:</span>
          <span class="value">${firstData.couleurQuincaillerie || ''}</span>
        </div>
      </div>
    </div>

    ${menuiseries.map((m, i) => renderMenuiserieBloc(m, i)).join('\n')}

    <div class="footer">
      <p><strong>CLIENT:</strong> ${metadata.clientNom} ${metadata.adresse ? `- ${metadata.adresse}` : ''}</p>
      <p><em>Bon de commande généré automatiquement par Prometrage - ${new Date().toLocaleString('fr-FR')}</em></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
