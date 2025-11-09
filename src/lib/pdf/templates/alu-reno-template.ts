/**
 * Template HTML pour bon de commande ALU RÉNOVATION
 * Version avec VRAIS noms de champs des données
 */

import type { MenuiserieData, ProjetMetadata } from '../bon-commande-generator';

/**
 * Extrait les données finales (modifiées ou originales)
 */
function getData(menuiserie: MenuiserieData): Record<string, unknown> {
  return menuiserie.donneesModifiees || menuiserie.donneesOriginales;
}

/**
 * Formatte une valeur booléenne en checkbox HTML
 */
function checkbox(checked: boolean): string {
  return checked ? '☑' : '☐';
}

/**
 * Helper pour vérifier si une chaîne contient un mot-clé (case insensitive)
 */
function contains(value: unknown, keyword: string): boolean {
  if (!value) return false;
  return String(value).toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Génère le bloc HTML pour une menuiserie
 */
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
        <div class="field-group">
          <span class="label">Ouvrant principal</span>
          <span class="value">${data.ouvrantPrincipal || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>COTES</h3>
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
          <span>${checkbox(data.dimensions === 'ailes comprises')} Ailes comprises</span>
          <span>${checkbox(data.dimensions === 'tableau fini')} Tableau fini</span>
        </div>
      </div>

      <div class="section">
        <h3>TYPE DE CHÂSSIS</h3>
        <div class="field-row">
          <span class="label">Intitulé:</span>
          <span class="value">${data.intitule || ''}</span>
        </div>
        ${data.rails ? `
        <div class="field-row">
          <span class="label">Rails:</span>
          <span class="value">${data.rails}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h3>DORMANT</h3>
        <div class="field-group">
          <span class="label">Type:</span>
          <span class="value">${data.dormant || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>POSE</h3>
        <div class="field-row">
          <span>${checkbox(data.pose === 'feuillure')} en feuillure</span>
          <span>${checkbox(data.pose === 'applique')} en applique</span>
          <span>${checkbox(data.pose === 'tunnel')} en tunnel</span>
          <span>${checkbox(data.pose === 'sous coffre tunnel')} sous coffre tunnel</span>
        </div>
      </div>

      <div class="section">
        <h3>HABILLAGES</h3>
        <div class="field-row">
          <span class="label">Intérieurs:</span>
          <span class="value small">${data.habillageInt || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Extérieurs:</span>
          <span class="value small">${data.habillageExt || ''}</span>
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
        ${data.petitsBoisType ? `
        <div class="field-row">
          <span class="label">Petits bois:</span>
          <span class="value small">${data.petitsBoisType}</span>
        </div>
        ` : ''}
        ${data.petitsBoisCouleur ? `
        <div class="field-row">
          <span class="label">Couleur PB:</span>
          <span class="value">${data.petitsBoisCouleur}</span>
        </div>
        ` : ''}
        ${data.petitsBoisConfiguration ? `
        <div class="field-row">
          <span class="label">Config PB:</span>
          <span class="value small">${data.petitsBoisConfiguration}</span>
        </div>
        ` : ''}
      </div>

      ${data.poignee ? `
      <div class="section">
        <h3>POIGNÉE</h3>
        <p class="value small">${data.poignee}</p>
      </div>
      ` : ''}

      ${data.fermeture ? `
      <div class="section">
        <h3>FERMETURE</h3>
        <p class="value small">${data.fermeture}</p>
      </div>
      ` : ''}

      ${data.ventilation ? `
      <div class="section">
        <h3>VENTILATION</h3>
        <p class="value small">${data.ventilation}</p>
      </div>
      ` : ''}

      ${data.hauteurAllege ? `
      <div class="section">
        <h3>HAUTEURS</h3>
        <div class="field-row">
          <span class="label">Ht allège</span>
          <span class="value">${data.hauteurAllege} mm</span>
        </div>
      </div>
      ` : ''}

      ${data.observations ? `
      <div class="section">
        <h3>OBSERVATIONS</h3>
        <p class="comments">${data.observations}</p>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Génère le HTML complet du bon de commande ALU RÉNOVATION
 */
export function renderBonCommandeAluReno(
  menuiseries: MenuiserieData[],
  metadata: ProjetMetadata
): string {
  const date = metadata.date || new Date().toLocaleDateString('fr-FR');

  // Récupérer les données de la première menuiserie pour les infos globales
  const firstData = getData(menuiseries[0]);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bon de Commande - ${metadata.reference}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
    }

    .page {
      width: 210mm;
      padding: 8mm;
    }

    .header {
      border: 2px solid #000;
      padding: 8px;
      margin-bottom: 10px;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
    }

    .company-info {
      flex: 1;
    }

    .company-info h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .company-info p {
      font-size: 9pt;
      margin: 2px 0;
    }

    .order-info {
      text-align: right;
    }

    .order-info h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .order-field {
      margin: 4px 0;
      font-size: 10pt;
    }

    .order-field label {
      font-weight: bold;
      margin-right: 4px;
    }

    .color-section {
      background: #f0f0f0;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #999;
    }

    .color-section h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 6px;
    }

    .field-row {
      display: flex;
      gap: 15px;
      margin: 4px 0;
      flex-wrap: wrap;
    }

    .field-group {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .label {
      font-weight: bold;
      font-size: 9pt;
    }

    .value {
      border-bottom: 1px solid #000;
      min-width: 60px;
      padding: 0 4px;
    }

    .value.large {
      min-width: 100px;
      font-size: 11pt;
      font-weight: bold;
    }

    .value.small {
      font-size: 9pt;
    }

    .menuiserie-bloc {
      border: 2px solid #000;
      padding: 8px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }

    .bloc-header {
      display: flex;
      justify-content: space-between;
      padding-bottom: 6px;
      margin-bottom: 8px;
      border-bottom: 2px solid #000;
      background: #f5f5f5;
      padding: 6px;
    }

    .section {
      margin: 8px 0;
      padding: 6px 0;
      border-bottom: 1px solid #ddd;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h3 {
      font-size: 10pt;
      font-weight: bold;
      margin-bottom: 4px;
      text-decoration: underline;
    }

    .dimensions {
      display: flex;
      gap: 30px;
      margin: 6px 0;
    }

    .comments {
      font-size: 9pt;
      font-style: italic;
      margin-top: 4px;
    }

    .footer {
      margin-top: 15px;
      font-size: 8pt;
      color: #666;
      border-top: 1px solid #999;
      padding-top: 8px;
    }

    .footer p {
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- En-tête -->
    <div class="header">
      <div class="header-top">
        <div class="company-info">
          <h1>NORMABAIE</h1>
          <p>Z.A. du moulin à vent</p>
          <p>27210 BOULLEVILLE</p>
          <p>Tel : 02.32.20.24.70</p>
          <p>Fax : 02.32.42.07.15</p>
          <p>Email : commandes@normabaie.fr</p>
        </div>
        <div class="order-info">
          <h2>BON DE COMMANDE</h2>
          <h3>ALUMINIUM - RÉNOVATION</h3>
          <div class="order-field">
            <label>Date :</label>
            <span>${date}</span>
          </div>
          <div class="order-field">
            <label>Référence :</label>
            <span>${metadata.reference}</span>
          </div>
          ${metadata.semaine ? `
          <div class="order-field">
            <label>Sem :</label>
            <span>${metadata.semaine}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Section Couleur (globale) -->
      <div class="color-section">
        <h3>COULEUR</h3>
        <div class="field-row">
          <span class="label">Gamme:</span>
          <span class="value">${firstData.gamme || ''}</span>
        </div>
        ${firstData.pack ? `
        <div class="field-row">
          <span class="label">Pack:</span>
          <span class="value">${firstData.pack}</span>
        </div>
        ` : ''}
        <div class="field-row">
          <span class="label">Int:</span>
          <span class="value">${firstData.couleurInt || ''}</span>
        </div>
        <div class="field-row">
          <span class="label">Ext:</span>
          <span class="value">${firstData.couleurExt || ''}</span>
        </div>
        ${firstData.couleurQuincaillerie ? `
        <div class="field-row">
          <span class="label">Quincaillerie:</span>
          <span class="value">${firstData.couleurQuincaillerie}</span>
        </div>
        ` : ''}
        ${firstData.couleurJoints ? `
        <div class="field-row">
          <span class="label">Joints:</span>
          <span class="value">${firstData.couleurJoints}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Blocs menuiseries (3 maximum) -->
    ${menuiseries.map((m, i) => renderMenuiserieBloc(m, i)).join('\n')}

    <!-- Footer -->
    <div class="footer">
      <p><strong>CLIENT:</strong> ${metadata.clientNom} ${metadata.adresse ? `- ${metadata.adresse}` : ''}</p>
      <p><em>Bon de commande généré automatiquement par Prometrage - ${new Date().toLocaleString('fr-FR')}</em></p>
      <p><small>Pour un meilleur traitement de vos commandes, il est impératif de renseigner un maximum de cases.</small></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
