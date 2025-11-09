/**
 * Service de génération de bons de commande PDF
 * Utilise Puppeteer pour convertir HTML → PDF
 * Adapté pour fonctionner sur Vercel avec @sparticuz/chromium
 */

import puppeteer, { Browser, Page } from 'puppeteer';

let browserInstance: Browser | null = null;

/**
 * Détecte si on est en environnement Vercel serverless
 */
const isVercelProduction = process.env.VERCEL === '1';

/**
 * Obtient ou crée une instance du navigateur Puppeteer
 * Réutilise l'instance pour optimiser les performances
 *
 * Sur Vercel: utilise @sparticuz/chromium (version serverless optimisée)
 * En local/dev: utilise Chromium standard de Puppeteer
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    if (isVercelProduction) {
      // Environnement Vercel: utiliser @sparticuz/chromium
      const chromium = await import('@sparticuz/chromium');

      browserInstance = await puppeteer.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    } else {
      // Environnement local: utiliser Chromium standard
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }
  }
  return browserInstance;
}

/**
 * Ferme le navigateur Puppeteer
 * À appeler lors du shutdown de l'application
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export interface PDFGenerationOptions {
  /**
   * Contenu HTML à convertir en PDF
   */
  html: string;

  /**
   * Largeur de la page (défaut: A4)
   */
  width?: string;

  /**
   * Hauteur de la page (défaut: A4)
   */
  height?: string;

  /**
   * Marges du PDF
   */
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  /**
   * Afficher les arrière-plans (couleurs, images)
   */
  printBackground?: boolean;

  /**
   * Orientation
   */
  landscape?: boolean;
}

/**
 * Génère un PDF à partir de contenu HTML
 *
 * @param options - Options de génération
 * @returns Buffer du PDF généré
 */
export async function generatePDFFromHTML(
  options: PDFGenerationOptions
): Promise<Buffer> {
  const {
    html,
    width = '210mm', // A4
    height = '297mm', // A4
    margins = {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
    printBackground = true,
    landscape = false,
  } = options;

  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Définir le contenu HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0', // Attendre que toutes les ressources soient chargées
    });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      width,
      height,
      margin: margins,
      printBackground,
      landscape,
      preferCSSPageSize: false, // Utiliser nos dimensions
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw new Error(
      `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Fermer la page (mais garder le navigateur ouvert pour réutilisation)
    if (page) {
      await page.close();
    }
  }
}

/**
 * Timeout pour cleanup automatique du navigateur (5 minutes d'inactivité)
 */
let cleanupTimeout: NodeJS.Timeout | null = null;

function scheduleCleanup() {
  if (cleanupTimeout) {
    clearTimeout(cleanupTimeout);
  }

  cleanupTimeout = setTimeout(async () => {
    console.log('[PDF Generator] Closing browser due to inactivity');
    await closeBrowser();
  }, 5 * 60 * 1000); // 5 minutes
}

// Hook process exit pour cleanup
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await closeBrowser();
  });
}
