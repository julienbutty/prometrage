#!/usr/bin/env tsx

/**
 * Script de vérification des templates PDF de bons de commande
 *
 * Objectif : Déterminer si les PDFs Normabaie sont des AcroForms (formulaires remplissables)
 * ou des PDFs statiques (juste pour impression)
 *
 * Usage : npx tsx scripts/inspect-pdf-templates.ts
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Chemins des templates
const TEMPLATES_DIR = path.join(process.cwd(), 'docs/FEATURES/MENUISERIES');

const TEMPLATES = [
  'BON DE COMMANDE ALU 2022-10 NEUF.pdf',
  'BON DE COMMANDE ALU 2022-10 RENO.pdf',
  'BON DE COMMANDE ALU 2022-10 PE.pdf',
  'BON DE COMMANDE PVC NEUF.pdf',
  'BON DE COMMANDE PVC RENOVATION.pdf',
  'BON DE COMMANDE PVC COULISSANT WISIO.pdf',
  'BON DE COMMANDE PVC RENOVATION PE.pdf',
];

interface TemplateInspectionResult {
  filename: string;
  exists: boolean;
  isAcroForm: boolean;
  fieldCount: number;
  fields: Array<{
    name: string;
    type: string;
  }>;
  error?: string;
}

async function inspectPDF(filename: string): Promise<TemplateInspectionResult> {
  const result: TemplateInspectionResult = {
    filename,
    exists: false,
    isAcroForm: false,
    fieldCount: 0,
    fields: [],
  };

  try {
    const pdfPath = path.join(TEMPLATES_DIR, filename);

    // Vérifier si le fichier existe
    try {
      await fs.access(pdfPath);
      result.exists = true;
    } catch {
      result.error = 'Fichier non trouvé';
      return result;
    }

    // Charger le PDF
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Récupérer le formulaire
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    result.fieldCount = fields.length;
    result.isAcroForm = fields.length > 0;

    // Lister tous les champs avec leur type
    result.fields = fields.map((field) => {
      const name = field.getName();
      const type = field.constructor.name
        .replace('PDF', '')
        .replace('Field', '');

      return { name, type };
    });

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Erreur inconnue';
  }

  return result;
}

async function main() {
  console.log('🔍 Inspection des templates PDF de bons de commande\n');
  console.log('='.repeat(80));
  console.log('');

  const results: TemplateInspectionResult[] = [];

  // Inspecter chaque template
  for (const template of TEMPLATES) {
    console.log(`📄 Analyse de : ${template}`);
    const result = await inspectPDF(template);
    results.push(result);

    if (!result.exists) {
      console.log(`   ❌ ${result.error}`);
    } else if (result.error) {
      console.log(`   ⚠️  Erreur : ${result.error}`);
    } else if (result.isAcroForm) {
      console.log(`   ✅ C'est un AcroForm !`);
      console.log(`   📊 ${result.fieldCount} champs détectés`);

      // Afficher quelques exemples de champs
      if (result.fields.length > 0) {
        console.log(`   📝 Exemples de champs :`);
        const samples = result.fields.slice(0, 5);
        samples.forEach(field => {
          console.log(`      - ${field.name} (${field.type})`);
        });
        if (result.fields.length > 5) {
          console.log(`      ... et ${result.fields.length - 5} autres champs`);
        }
      }
    } else {
      console.log(`   ❌ PDF statique (aucun champ de formulaire détecté)`);
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('\n📊 RÉSUMÉ DE L\'ANALYSE\n');

  const acroFormCount = results.filter(r => r.isAcroForm).length;
  const staticCount = results.filter(r => !r.isAcroForm && r.exists).length;
  const errorCount = results.filter(r => !r.exists || r.error).length;

  console.log(`✅ AcroForms (remplissables) : ${acroFormCount}/${TEMPLATES.length}`);
  console.log(`❌ PDFs statiques          : ${staticCount}/${TEMPLATES.length}`);
  console.log(`⚠️  Erreurs/Non trouvés    : ${errorCount}/${TEMPLATES.length}`);
  console.log('');

  // Recommandation technique
  console.log('='.repeat(80));
  console.log('\n🎯 RECOMMANDATION TECHNIQUE\n');

  if (acroFormCount === TEMPLATES.length) {
    console.log('✅ TOUS les templates sont des AcroForms !');
    console.log('');
    console.log('📌 Approche recommandée : **pdf-lib**');
    console.log('   - Utiliser pdf-lib pour remplir directement les champs');
    console.log('   - Complexité : FAIBLE à MOYENNE');
    console.log('   - Temps estimé : 15-20h');
    console.log('   - Avantages :');
    console.log('     • Librairie déjà installée');
    console.log('     • Code simple et maintenable');
    console.log('     • Performance excellente');
    console.log('     • Pas de dépendances lourdes');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('   1. Créer les fichiers de mapping (noms de champs PDF → clés JSON)');
    console.log('   2. Implémenter le générateur avec pdf-lib');
    console.log('   3. Créer l\'API endpoint');
    console.log('   4. Ajouter le bouton UI');
  } else if (acroFormCount > 0) {
    console.log('⚠️  MIXTE : Certains templates sont des AcroForms, d\'autres non');
    console.log('');
    console.log('📌 Options :');
    console.log('   A. Utiliser pdf-lib pour les AcroForms + Puppeteer pour les autres');
    console.log('   B. Tout refaire en Puppeteer pour homogénéité');
    console.log('   C. Contacter Normabaie pour obtenir des versions AcroForm de tous');
    console.log('');
    console.log('📋 Recommandation : Option C (contacter fournisseur) puis Option A');
  } else {
    console.log('❌ AUCUN template n\'est un AcroForm');
    console.log('');
    console.log('📌 Approche requise : **Puppeteer + HTML templates**');
    console.log('   - Recréer les templates en HTML/CSS');
    console.log('   - Générer les PDFs avec Puppeteer (Chrome headless)');
    console.log('   - Complexité : ÉLEVÉE');
    console.log('   - Temps estimé : 25-30h');
    console.log('   - Inconvénients :');
    console.log('     • Dépendance lourde (Chrome)');
    console.log('     • Temps de développement élevé');
    console.log('     • Maintenance complexe si templates changent');
    console.log('');
    console.log('📋 Alternative recommandée :');
    console.log('   Contacter Normabaie pour obtenir des versions AcroForm des templates');
  }

  console.log('');
  console.log('='.repeat(80));

  // Sauvegarder le rapport détaillé en JSON
  const reportPath = path.join(process.cwd(), 'scripts/pdf-inspection-report.json');
  await fs.writeFile(
    reportPath,
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`\n💾 Rapport détaillé sauvegardé : ${reportPath}`);
}

// Exécuter le script
main().catch((error) => {
  console.error('❌ Erreur lors de l\'exécution :', error);
  process.exit(1);
});
